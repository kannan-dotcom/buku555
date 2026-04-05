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
    const { userId, statementType, periodStart, periodEnd } = await req.json()

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    )

    // Fetch ledger entries for the period
    const { data: entries } = await supabase
      .from("ledger_entries")
      .select("*")
      .eq("user_id", userId)
      .gte("entry_date", periodStart)
      .lte("entry_date", periodEnd)
      .order("entry_date")

    // Fetch bank transactions for the period
    const { data: bankTxns } = await supabase
      .from("bank_transactions")
      .select("*")
      .eq("user_id", userId)
      .gte("transaction_date", periodStart)
      .lte("transaction_date", periodEnd)

    // Fetch profile for cash_in_hand
    const { data: profile } = await supabase
      .from("profiles")
      .select("cash_in_hand, preferred_currency, company_name")
      .eq("id", userId)
      .single()

    const allEntries = entries || []
    const expenses = allEntries.filter(e => e.entry_type === "expense")
    const income = allEntries.filter(e => e.entry_type === "income")

    const totalExpenses = expenses.reduce((s, e) => s + Number(e.total_amount), 0)
    const totalIncome = income.reduce((s, e) => s + Number(e.total_amount), 0)
    const totalTax = allEntries.reduce((s, e) => s + Number(e.sst_vat_amount || 0), 0)
    const netIncome = totalIncome - totalExpenses

    // Group by category
    const expenseByCategory: Record<string, number> = {}
    for (const e of expenses) {
      const cat = e.category || "Uncategorized"
      expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Number(e.total_amount)
    }

    // Bank balances
    const bankBalance = bankTxns?.length
      ? Number(bankTxns[bankTxns.length - 1].balance || 0)
      : 0

    let statementData: any = {}

    switch (statementType) {
      case "profit_loss":
        statementData = {
          revenue: { total: totalIncome, items: income.map(e => ({ date: e.entry_date, description: e.merchant_name, amount: e.total_amount })) },
          expenses: { total: totalExpenses, byCategory: expenseByCategory },
          grossProfit: totalIncome - totalExpenses,
          taxExpense: totalTax,
          netProfit: netIncome - totalTax,
        }
        break
      case "income":
        statementData = {
          operatingRevenue: totalIncome,
          operatingExpenses: totalExpenses,
          operatingIncome: netIncome,
          taxExpense: totalTax,
          netIncome: netIncome - totalTax,
          expenseBreakdown: expenseByCategory,
        }
        break
      case "cashflow":
        statementData = {
          operatingActivities: {
            cashFromCustomers: totalIncome,
            cashPaidToSuppliers: totalExpenses,
            netOperating: netIncome,
          },
          cashAtStart: bankTxns?.length ? Number(bankTxns[0].balance || 0) : 0,
          cashAtEnd: bankBalance,
          cashInHand: Number(profile?.cash_in_hand || 0),
          totalCash: bankBalance + Number(profile?.cash_in_hand || 0),
        }
        break
      case "balance_sheet":
        statementData = {
          assets: {
            cashInBank: bankBalance,
            cashInHand: Number(profile?.cash_in_hand || 0),
            totalCurrentAssets: bankBalance + Number(profile?.cash_in_hand || 0),
            totalAssets: bankBalance + Number(profile?.cash_in_hand || 0),
          },
          liabilities: {
            taxPayable: totalTax,
            totalLiabilities: totalTax,
          },
          equity: {
            retainedEarnings: netIncome - totalTax,
            totalEquity: netIncome - totalTax,
          },
        }
        break
    }

    // Save statement
    const { data: stmt, error: stmtError } = await supabase
      .from("financial_statements")
      .insert({
        user_id: userId,
        statement_type: statementType,
        period_start: periodStart,
        period_end: periodEnd,
        data: statementData,
        status: "draft",
      })
      .select()
      .single()
    if (stmtError) throw stmtError

    return new Response(
      JSON.stringify({ success: true, statementId: stmt.id, data: statementData }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    )
  }
})
