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
    const { company_id, plan_id, billing_cycle } = await req.json()

    if (!company_id || !plan_id || !billing_cycle) {
      throw new Error("Missing required fields: company_id, plan_id, billing_cycle")
    }

    // Create service role client for database operations
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Verify caller is a platform admin
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) throw new Error("Missing authorization header")

    const token = authHeader.replace("Bearer ", "")
    const userClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    )
    const { data: { user }, error: authError } = await userClient.auth.getUser()
    if (authError || !user) throw new Error("Unauthorized")

    const { data: adminProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (adminProfile?.role !== "admin") throw new Error("Admin access required")

    // Fetch company details
    const { data: company, error: companyError } = await supabase
      .from("companies")
      .select("id, name")
      .eq("id", company_id)
      .single()
    if (companyError || !company) throw new Error("Company not found")

    // Fetch company owner for billing email
    const { data: ownerMember } = await supabase
      .from("company_members")
      .select("user_id, profiles(full_name, email)")
      .eq("company_id", company_id)
      .eq("role", "owner")
      .single()

    if (!ownerMember?.profiles) throw new Error("Company owner not found")

    const payerName = (ownerMember.profiles as any).full_name || company.name
    const payerEmail = (ownerMember.profiles as any).email
    if (!payerEmail) throw new Error("Company owner has no email address")

    // Fetch subscription plan for pricing
    const { data: plan, error: planError } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", plan_id)
      .single()
    if (planError || !plan) throw new Error("Subscription plan not found")

    // Calculate amount in cents
    const price = billing_cycle === "annual"
      ? (plan.price_annual || plan.annual_price || 0)
      : (plan.price_monthly || plan.monthly_price || 0)

    if (price <= 0) throw new Error("Plan has no price for the selected billing cycle")

    const amountCents = Math.round(price * 100)

    // Calculate billing period
    const periodStart = new Date()
    const periodEnd = new Date()
    if (billing_cycle === "annual") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1)
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1)
    }

    // Build description
    const cycleLabel = billing_cycle === "annual" ? "Annual" : "Monthly"
    const description = `Buku 555 ${plan.name} Plan - ${cycleLabel} Subscription`

    // Call Billplz API to create bill
    const billplzBase = Deno.env.get("BILLPLZ_SANDBOX") === "true"
      ? "https://www.billplz-sandbox.com/api"
      : "https://www.billplz.com/api"

    const apiKey = Deno.env.get("BILLPLZ_API_KEY")
    if (!apiKey) throw new Error("BILLPLZ_API_KEY not configured")

    const collectionId = Deno.env.get("BILLPLZ_COLLECTION_ID")
    if (!collectionId) throw new Error("BILLPLZ_COLLECTION_ID not configured")

    const callbackUrl = `${Deno.env.get("SUPABASE_URL")}/functions/v1/billplz-webhook`
    const redirectUrl = "https://buku555.online/settings"

    const billplzResponse = await fetch(`${billplzBase}/v3/bills`, {
      method: "POST",
      headers: {
        "Authorization": "Basic " + btoa(apiKey + ":"),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        collection_id: collectionId,
        email: payerEmail,
        name: payerName,
        amount: amountCents,
        description: description,
        callback_url: callbackUrl,
        redirect_url: redirectUrl,
        deliver: true,
      }),
    })

    if (!billplzResponse.ok) {
      const errText = await billplzResponse.text()
      throw new Error(`Billplz API error: ${errText}`)
    }

    const billplzBill = await billplzResponse.json()

    // Insert billing_payments record
    const { data: payment, error: paymentError } = await supabase
      .from("billing_payments")
      .insert({
        company_id: company_id,
        billplz_bill_id: billplzBill.id,
        billplz_collection_id: collectionId,
        billplz_url: billplzBill.url,
        amount_cents: amountCents,
        currency: "MYR",
        description: description,
        subscription_plan_id: plan_id,
        billing_cycle: billing_cycle,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
        payer_name: payerName,
        payer_email: payerEmail,
        status: "due",
        created_by: user.id,
      })
      .select()
      .single()

    if (paymentError) throw paymentError

    return new Response(
      JSON.stringify({
        success: true,
        bill_id: billplzBill.id,
        payment_url: billplzBill.url,
        amount: price,
        period_start: periodStart.toISOString(),
        period_end: periodEnd.toISOString(),
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
