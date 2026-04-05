import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1"

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

async function verifySignature(
  params: Record<string, string>,
  xSignature: string
): Promise<boolean> {
  const key = Deno.env.get("BILLPLZ_X_SIGNATURE_KEY") ?? ""
  if (!key) return false

  const encoder = new TextEncoder()

  // Billplz callback signature covers these fields in alphabetical order
  const sourceFields = [
    "amount", "collection_id", "due_at", "email", "id",
    "name", "paid", "paid_amount", "paid_at", "state", "url"
  ]

  const sourceString = sourceFields
    .filter((k) => params[k] !== undefined && params[k] !== null)
    .map((k) => `${k}${params[k]}`)
    .join("|")

  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    encoder.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  )

  const signature = await crypto.subtle.sign(
    "HMAC",
    cryptoKey,
    encoder.encode(sourceString)
  )

  const hex = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")

  return hex === xSignature
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Parse the request body (Billplz sends URL-encoded form data for callbacks)
    const contentType = req.headers.get("content-type") || ""
    let params: Record<string, string>

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const body = await req.text()
      params = Object.fromEntries(new URLSearchParams(body))
    } else {
      // Also handle JSON just in case
      params = await req.json()
    }

    const xSignature = params.x_signature || req.headers.get("x-signature") || ""

    // Remove x_signature from params before verification
    const verifyParams = { ...params }
    delete verifyParams.x_signature

    // Verify X-Signature
    const signatureKey = Deno.env.get("BILLPLZ_X_SIGNATURE_KEY")
    if (signatureKey) {
      const isValid = await verifySignature(verifyParams, xSignature)
      if (!isValid) {
        console.error("Invalid X-Signature for bill:", params.id)
        return new Response(
          JSON.stringify({ error: "Invalid signature" }),
          { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        )
      }
    }

    const billId = params.id
    const billState = params.state // "due" | "paid" | "overdue" | "deleted"
    const isPaid = params.paid === "true" || params.paid === true as any

    if (!billId) {
      throw new Error("Missing bill ID in callback")
    }

    // Look up the billing_payments record
    const { data: payment, error: lookupError } = await supabase
      .from("billing_payments")
      .select("*, subscription_plan_id, billing_cycle, period_start, period_end, company_id")
      .eq("billplz_bill_id", billId)
      .single()

    if (lookupError || !payment) {
      console.error("Payment record not found for bill:", billId)
      // Return 200 to prevent Billplz from retrying
      return new Response(
        JSON.stringify({ success: false, reason: "Payment record not found" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Check idempotency — if already paid, skip processing
    if (payment.status === "paid") {
      return new Response(
        JSON.stringify({ success: true, message: "Already processed" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      )
    }

    // Map Billplz state to our status
    let newStatus = billState
    if (isPaid) newStatus = "paid"

    // Update billing_payments record
    const updateData: Record<string, any> = {
      status: newStatus,
      callback_data: verifyParams,
      updated_at: new Date().toISOString(),
    }

    if (isPaid) {
      updateData.paid_at = new Date().toISOString()
      updateData.billplz_paid_at = params.paid_at || new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from("billing_payments")
      .update(updateData)
      .eq("id", payment.id)

    if (updateError) {
      console.error("Failed to update payment:", updateError)
    }

    // If paid, update company subscription
    if (isPaid && payment.company_id) {
      const companyUpdate: Record<string, any> = {
        subscription_status: "active",
        subscription_plan_id: payment.subscription_plan_id,
        billing_cycle: payment.billing_cycle,
        subscription_period_start: payment.period_start,
        subscription_period_end: payment.period_end,
        updated_at: new Date().toISOString(),
      }

      const { error: companyError } = await supabase
        .from("companies")
        .update(companyUpdate)
        .eq("id", payment.company_id)

      if (companyError) {
        console.error("Failed to update company subscription:", companyError)
      }
    }

    // If overdue, mark company as past_due
    if (billState === "overdue" && payment.company_id) {
      await supabase
        .from("companies")
        .update({
          subscription_status: "past_due",
          updated_at: new Date().toISOString(),
        })
        .eq("id", payment.company_id)
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    console.error("Webhook error:", error.message)
    // Return 200 even on error to prevent Billplz retries for bad data
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
