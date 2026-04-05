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
    const { userId, cashInHand } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Fetch unmatched bank transactions
    const { data: bankTxns } = await supabase
      .from("bank_transactions")
      .select("*")
      .eq("user_id", userId)
      .eq("reconciliation_status", "unmatched")
      .order("transaction_date")

    // Fetch unreconciled ledger entries
    const { data: ledgerEntries } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("user_id", userId)
      .eq("is_reconciled", false)
      .order("entry_date")

    let matchCount = 0
    let incompleteCount = 0
    const matchedBankIds: string[] = []
    const matchedLedgerIds: string[] = []

    for (const txn of bankTxns || []) {
      const txnAmount = txn.debit_amount > 0 ? txn.debit_amount : txn.credit_amount
      const txnDate = new Date(txn.transaction_date)

      // Find matching ledger entry: same amount, date within ±2 days
      let bestMatch = null
      let bestDateDiff = Infinity

      for (const entry of ledgerEntries || []) {
        if (matchedLedgerIds.includes(entry.id)) continue

        const entryDate = new Date(entry.entry_date)
        const dateDiff = Math.abs(txnDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)

        if (dateDiff > 2) continue

        const entryAmount = Number(entry.total_amount)
        const amountMatch = Math.abs(txnAmount - entryAmount) < 0.01

        if (amountMatch && dateDiff < bestDateDiff) {
          bestMatch = entry
          bestDateDiff = dateDiff
        }
      }

      if (bestMatch) {
        // Exact match
        await supabase
          .from("bank_transactions")
          .update({
            reconciliation_status: "matched",
            matched_ledger_entry_id: bestMatch.id,
            ai_match_confidence: 1.0 - (bestDateDiff * 0.1),
          })
          .eq("id", txn.id)

        await supabase
          .from("ledger_entries")
          .update({
            is_reconciled: true,
            reconciled_with: txn.id,
          })
          .eq("id", bestMatch.id)

        matchedBankIds.push(txn.id)
        matchedLedgerIds.push(bestMatch.id)
        matchCount++
      } else {
        // Check for partial match (date matches but amount differs - cash withdrawal case)
        const dateMatches = (ledgerEntries || []).filter(entry => {
          if (matchedLedgerIds.includes(entry.id)) return false
          const entryDate = new Date(entry.entry_date)
          const diff = Math.abs(txnDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
          return diff <= 2
        })

        if (dateMatches.length > 0) {
          await supabase
            .from("bank_transactions")
            .update({
              reconciliation_status: "incomplete",
              notes: `Amount mismatch. Bank: ${txnAmount}. Possible matches on similar dates.`,
            })
            .eq("id", txn.id)
          incompleteCount++
        }
        // Otherwise stays as 'unmatched'
      }
    }

    // Update cash_in_hand on profile
    if (cashInHand !== undefined) {
      await supabase
        .from("profiles")
        .update({ cash_in_hand: cashInHand })
        .eq("id", userId)
    }

    // Mark remaining unreconciled ledger entries as suspense
    const unreconciled = (ledgerEntries || []).filter(e => !matchedLedgerIds.includes(e.id))
    for (const entry of unreconciled) {
      await supabase
        .from("ledger_entries")
        .update({ status: "suspense", status_notes: "No matching bank transaction found" })
        .eq("id", entry.id)
    }

    return new Response(
      JSON.stringify({
        success: true,
        matched: matchCount,
        incomplete: incompleteCount,
        unmatched: (bankTxns?.length || 0) - matchCount - incompleteCount,
        suspense: unreconciled.length,
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
