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

    // Update status to processing
    await supabase
      .from("documents")
      .update({ ai_processing_status: "processing" })
      .eq("id", documentId)

    // Download file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath)
    if (downloadError) throw downloadError

    // Convert to base64
    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || "image/jpeg"

    // Call OpenAI GPT-4o
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
            content: `You are an expert receipt/invoice data extractor. Extract structured data from receipts and invoices.
Return a JSON object with these fields:
- merchant_name: string or null
- tax_registration_no: string or null (SST/GST/TIN/tax registration number)
- einvoice_number: string or null (e-invoice number if present)
- currency: string (ISO 4217 code, default "MYR")
- payment_type: string or null (cash, card, bank_transfer, ewallet, cheque)
- date: string (YYYY-MM-DD format)
- items: array of {description, quantity, unit_price, amount}
- amount: number (subtotal before tax)
- sst_vat_amount: number (tax amount, 0 if not visible)
- total_amount: number (final total)
- category: string or null (e.g., "food", "transport", "office supplies", "utilities")

For any field you cannot determine from the document, return null.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Extract all financial data from this receipt/invoice:" },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ],
        max_tokens: 2000,
      }),
    })

    if (!openaiResponse.ok) {
      const errText = await openaiResponse.text()
      throw new Error(`OpenAI API error: ${errText}`)
    }

    const aiResult = await openaiResponse.json()
    const extractedData = JSON.parse(aiResult.choices[0].message.content)

    // Determine status based on completeness
    const requiredFields = ["merchant_name", "tax_registration_no", "currency", "total_amount", "date"]
    const missingFields = requiredFields.filter(f => !extractedData[f])
    const status = missingFields.length > 0 ? "update_needed" : "complete"
    const statusNotes = missingFields.length > 0
      ? `Missing: ${missingFields.join(", ")}`
      : null

    // Get document's user_id
    const { data: doc } = await supabase
      .from("documents")
      .select("user_id")
      .eq("id", documentId)
      .single()

    // Create ledger entry
    await supabase.from("ledger_entries").insert({
      user_id: doc.user_id,
      document_id: documentId,
      entry_date: extractedData.date || new Date().toISOString().split("T")[0],
      merchant_name: extractedData.merchant_name,
      tax_registration_no: extractedData.tax_registration_no,
      einvoice_number: extractedData.einvoice_number,
      currency: extractedData.currency || "MYR",
      payment_type: extractedData.payment_type,
      amount: extractedData.amount || extractedData.total_amount || 0,
      sst_vat_amount: extractedData.sst_vat_amount || 0,
      total_amount: extractedData.total_amount || 0,
      category: extractedData.category,
      entry_type: "expense",
      status,
      status_notes: statusNotes,
    })

    // Update document with AI results
    await supabase
      .from("documents")
      .update({
        ai_processed: true,
        ai_processing_status: "completed",
        ai_raw_result: extractedData,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return new Response(
      JSON.stringify({ success: true, data: extractedData, status }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    // Mark as failed
    try {
      const { documentId } = await req.clone().json()
      const supabase = createClient(
        Deno.env.get("SUPABASE_URL") ?? "",
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
      )
      await supabase
        .from("documents")
        .update({ ai_processing_status: "failed" })
        .eq("id", documentId)
    } catch {}

    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
