import { useState, useEffect } from 'react'
import { BarChart3, Plus, FileText, Loader2, Download } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Badge from '../components/ui/Badge'
import { EmptyState } from '../components/ui/Table'
import { formatDate } from '../lib/utils'
import { STATEMENT_TYPES } from '../lib/constants'
import { useToast } from '../components/ui/Toast'

export default function FinancialStatementsPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [statements, setStatements] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(null)

  useEffect(() => {
    if (profile) loadStatements()
  }, [profile])

  const loadStatements = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('financial_statements')
      .select('*')
      .eq('user_id', profile.id)
      .order('period_end', { ascending: false })
    if (!error) setStatements(data || [])
    setLoading(false)
  }

  const generateStatement = async (type) => {
    setGenerating(type)
    try {
      const { error } = await supabase.functions.invoke('generate-financial-statement', {
        body: {
          userId: profile.id,
          statementType: type,
          periodStart: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
          periodEnd: new Date().toISOString().split('T')[0],
        },
      })
      if (error) throw error
      toast.success('Statement Generated', `${typeLabel(type)} has been created`)
      loadStatements()
    } catch (err) {
      toast.error('Generation Failed', err.message)
    } finally {
      setGenerating(null)
    }
  }

  const typeLabel = (type) => ({
    cashflow: 'Cash Flow Statement',
    income: 'Income Statement',
    profit_loss: 'Profit & Loss Statement',
    balance_sheet: 'Balance Sheet',
  }[type] || type)

  const typeColor = (type) => ({
    cashflow: 'info', income: 'success', profit_loss: 'warning', balance_sheet: 'neutral',
  }[type] || 'neutral')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Financial Statements</h1>
        <p className="text-neutral-500 mt-1">Generate and view financial reports</p>
      </div>

      {/* Generation cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(STATEMENT_TYPES).map(([key, value]) => (
          <Card key={value} className="text-center">
            <BarChart3 className="h-8 w-8 text-primary-500 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-neutral-700">{typeLabel(value)}</h3>
            <Button
              size="sm"
              variant="secondary"
              className="mt-3"
              loading={generating === value}
              onClick={() => generateStatement(value)}
            >
              Generate
            </Button>
          </Card>
        ))}
      </div>

      {/* Existing statements */}
      <Card>
        <CardTitle>Generated Statements</CardTitle>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : statements.length === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="No statements yet"
            description="Generate financial statements from your accounting data"
          />
        ) : (
          <div className="space-y-3 mt-4">
            {statements.map((stmt) => (
              <div
                key={stmt.id}
                className="flex items-center justify-between p-4 rounded-lg bg-neutral-50 border border-neutral-100"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-neutral-400" />
                  <div>
                    <p className="text-sm font-medium text-neutral-700">{typeLabel(stmt.statement_type)}</p>
                    <p className="text-xs text-neutral-400">
                      {formatDate(stmt.period_start)} — {formatDate(stmt.period_end)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={stmt.status === 'final' ? 'success' : 'warning'}>
                    {stmt.status}
                  </Badge>
                  <Badge variant={typeColor(stmt.statement_type)}>
                    {typeLabel(stmt.statement_type).split(' ')[0]}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
