import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const { documentId, filePath } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    await supabase
      .from("documents")
      .update({ ai_processing_status: "processing" })
      .eq("id", documentId)

    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath)
    if (downloadError) throw downloadError

    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || "application/pdf"

    // Extract invoice data + client info
    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o",
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: `You are an invoice data extractor. Extract invoice details AND client information.
Return JSON with:
- invoice_number: string or null
- invoice_date: string (YYYY-MM-DD)
- due_date: string or null (YYYY-MM-DD)
- subtotal: number
- tax_amount: number (0 if none)
- total_amount: number
- currency: string (ISO 4217, default "MYR")
- client: object with:
  - company_name: string
  - registration_number: string or null
  - phone: string or null
  - email: string or null
  - address: string or null
  - pic_name: string or null (person in charge / attention to)`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract invoice and client data from this document:" },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI error: ${await openaiResponse.text()}`)
    }

    const aiResult = await openaiResponse.json()
    const parsed = JSON.parse(aiResult.choices[0].message.content)

    const { data: doc } = await supabase
      .from("documents")
      .select("user_id")
      .eq("id", documentId)
      .single()

    // Find or create client
    let clientId = null
    if (parsed.client?.company_name) {
      const { data: existingClient } = await supabase
        .from("clients")
        .select("id")
        .eq("user_id", doc.user_id)
        .ilike("company_name", parsed.client.company_name)
        .single()

      if (existingClient) {
        clientId = existingClient.id
      } else {
        const { data: newClient } = await supabase
          .from("clients")
          .insert({
            user_id: doc.user_id,
            company_name: parsed.client.company_name,
            registration_number: parsed.client.registration_number,
            phone: parsed.client.phone,
            email: parsed.client.email,
            address: parsed.client.address,
            pic_name: parsed.client.pic_name,
          })
          .select("id")
          .single()
        clientId = newClient?.id
      }
    }

    // Create invoice record
    await supabase.from("invoices_sent").insert({
      user_id: doc.user_id,
      client_id: clientId,
      document_id: documentId,
      invoice_number: parsed.invoice_number,
      invoice_date: parsed.invoice_date || new Date().toISOString().split("T")[0],
      due_date: parsed.due_date,
      subtotal: parsed.subtotal || parsed.total_amount || 0,
      tax_amount: parsed.tax_amount || 0,
      total_amount: parsed.total_amount || 0,
      currency: parsed.currency || "MYR",
      status: "sent",
    })

    // Create income ledger entry
    await supabase.from("ledger_entries").insert({
      user_id: doc.user_id,
      document_id: documentId,
      entry_date: parsed.invoice_date || new Date().toISOString().split("T")[0],
      merchant_name: parsed.client?.company_name,
      description: `Invoice ${parsed.invoice_number || ""}`.trim(),
      currency: parsed.currency || "MYR",
      amount: parsed.subtotal || parsed.total_amount || 0,
      sst_vat_amount: parsed.tax_amount || 0,
      total_amount: parsed.total_amount || 0,
      entry_type: "income",
      status: "complete",
    })

    // Update document
    await supabase
      .from("documents")
      .update({
        ai_processed: true,
        ai_processing_status: "completed",
        ai_raw_result: parsed,
      })
      .eq("id", documentId)

    return new Response(
      JSON.stringify({ success: true, data: parsed, clientId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
