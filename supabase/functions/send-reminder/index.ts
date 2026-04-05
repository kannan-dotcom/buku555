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
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    const today = new Date()
    const dayOfWeek = today.getDay()

    // Find users who have reminders enabled for today
    const { data: users } = await supabase
      .from("profiles")
      .select("id, email, full_name, reminder_day_of_week")
      .eq("reminder_email_enabled", true)
      .eq("reminder_day_of_week", dayOfWeek)

    const results = []

    for (const user of users || []) {
      // Check for incomplete data
      const { count: pendingCount } = await supabase
        .from("ledger_entries")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("status", "update_needed")

      const { count: unreconciledCount } = await supabase
        .from("bank_transactions")
        .select("id", { count: "exact" })
        .eq("user_id", user.id)
        .eq("reconciliation_status", "unmatched")

      if ((pendingCount || 0) === 0 && (unreconciledCount || 0) === 0) continue

      // Build reminder email
      const subject = `Buku 555 Weekly Reminder — ${pendingCount || 0} items need attention`
      const body = [
        `Hi ${user.full_name || "there"},`,
        "",
        "Here's your weekly accounting summary:",
        "",
        pendingCount ? `• ${pendingCount} ledger entries need updates (missing information)` : null,
        unreconciledCount ? `• ${unreconciledCount} bank transactions are unreconciled` : null,
        "",
        "Please log in to Buku 555 to review and update these items.",
        "",
        "Best regards,",
        "Buku 555 AI Accounting",
      ].filter(Boolean).join("\n")

      // Send via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY")
      if (resendKey) {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: Deno.env.get("FROM_EMAIL") || "noreply@buku555.com",
            to: user.email,
            subject,
            text: body,
          }),
        })
      }

      // Save reminder record
      await supabase.from("reminders").insert({
        user_id: user.id,
        reminder_type: "missing_data",
        subject,
        body,
        is_sent: true,
        sent_at: new Date().toISOString(),
        scheduled_for: new Date().toISOString(),
      })

      results.push({ userId: user.id, email: user.email })
    }

    return new Response(
      JSON.stringify({ success: true, remindersSent: results.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
