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

    // Download file
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath)
    if (downloadError) throw downloadError

    const arrayBuffer = await fileData.arrayBuffer()
    const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)))
    const mimeType = fileData.type || "application/pdf"

    // Call GPT-4o to parse bank statement
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
            content: `You are an expert bank statement parser. Extract ALL transactions from the bank statement.
Return a JSON object with:
- bank_name: string
- account_number: string
- currency: string (ISO 4217 currency code, e.g., "MYR", "USD", "SGD". Detect from the statement header, currency symbols, or bank country)
- statement_period: string (e.g., "March 2025")
- statement_month: string (YYYY-MM format)
- opening_balance: number
- closing_balance: number
- transactions: array of objects, each with:
  - date: string (YYYY-MM-DD)
  - value_date: string or null (YYYY-MM-DD)
  - description: string
  - reference_no: string or null
  - debit_amount: number (0 if credit)
  - credit_amount: number (0 if debit)
  - balance: number (running balance after transaction)
  - transaction_type: "debit" or "credit"

Extract EVERY transaction visible. Do not skip any rows.
Detect the currency from the statement - look for currency symbols (RM, $, £, €, ¥, etc.), currency codes, or infer from the bank's country.`
          },
          {
            role: "user",
            content: [
              { type: "text", text: "Parse all transactions from this bank statement:" },
              { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } }
            ]
          }
        ],
        max_tokens: 4000,
      }),
    })

    if (!openaiResponse.ok) {
      throw new Error(`OpenAI API error: ${await openaiResponse.text()}`)
    }

    const aiResult = await openaiResponse.json()
    const parsed = JSON.parse(aiResult.choices[0].message.content)

    // Get user_id and company_id from document
    const { data: doc } = await supabase
      .from("documents")
      .select("user_id, company_id")
      .eq("id", documentId)
      .single()

    const statementCurrency = parsed.currency || "MYR"

    // Bulk insert transactions
    const transactions = (parsed.transactions || []).map((txn: any) => ({
      user_id: doc.user_id,
      company_id: doc.company_id,
      document_id: documentId,
      transaction_date: txn.date,
      value_date: txn.value_date,
      description: txn.description,
      reference_no: txn.reference_no,
      debit_amount: txn.debit_amount || 0,
      credit_amount: txn.credit_amount || 0,
      balance: txn.balance,
      transaction_type: txn.transaction_type,
      bank_name: parsed.bank_name,
      account_number: parsed.account_number,
      statement_month: parsed.statement_month,
      currency: statementCurrency,
      reconciliation_status: "unmatched",
    }))

    if (transactions.length > 0) {
      const { error: insertError } = await supabase
        .from("bank_transactions")
        .insert(transactions)
      if (insertError) throw insertError
    }

    // Update document
    await supabase
      .from("documents")
      .update({
        ai_processed: true,
        ai_processing_status: "completed",
        ai_raw_result: parsed,
        updated_at: new Date().toISOString(),
      })
      .eq("id", documentId)

    return new Response(
      JSON.stringify({
        success: true,
        transactionCount: transactions.length,
        bankName: parsed.bank_name,
        period: parsed.statement_period,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
