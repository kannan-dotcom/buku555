import { useEffect, useState } from 'react'
import {
  Receipt, Landmark, ArrowLeftRight, FileText,
  Users, AlertCircle, TrendingUp, TrendingDown,
  DollarSign, Clock,
} from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Badge from '../components/ui/Badge'
import Button from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import { useNavigate } from 'react-router-dom'

function StatCard({ icon: Icon, label, value, subValue, trend, color = 'primary' }) {
  const colorMap = {
    primary: 'bg-blue-50 text-blue-500',
    success: 'bg-green-50 text-green-500',
    warning: 'bg-amber-50 text-amber-500',
    error: 'bg-red-50 text-red-500',
    secondary: 'bg-accent-50 text-accent-500',
  }
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-neutral-500">{label}</p>
          <p className="text-2xl font-bold text-neutral-800 mt-1">{value}</p>
          {subValue && <p className="text-xs text-neutral-400 mt-1">{subValue}</p>}
        </div>
        <div className={`p-3 rounded-xl ${colorMap[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      {trend !== undefined && (
        <div className="flex items-center gap-1 mt-3">
          {trend >= 0 ? (
            <TrendingUp className="h-4 w-4 text-green-500" />
          ) : (
            <TrendingDown className="h-4 w-4 text-red-500" />
          )}
          <span className={`text-xs font-medium ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {Math.abs(trend)}%
          </span>
          <span className="text-xs text-neutral-400">vs last month</span>
        </div>
      )}
    </Card>
  )
}

export default function DashboardPage() {
  const { profile, company, isGDriveConnected } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalExpenses: 0,
    totalIncome: 0,
    pendingItems: 0,
    unreconciledCount: 0,
    clientCount: 0,
    recentEntries: [],
    alerts: [],
  })

  useEffect(() => {
    if (!profile || !company) return
    loadDashboardData()
  }, [profile, company])

  const loadDashboardData = async () => {
    try {
      const [expensesRes, incomeRes, pendingRes, unreconciledRes, clientsRes, recentRes] = await Promise.all([
        supabase.from('ledger_entries').select('total_amount').eq('company_id', company.id).eq('entry_type', 'expense'),
        supabase.from('ledger_entries').select('total_amount').eq('company_id', company.id).eq('entry_type', 'income'),
        supabase.from('ledger_entries').select('id', { count: 'exact' }).eq('company_id', company.id).eq('status', 'update_needed'),
        supabase.from('bank_transactions').select('id', { count: 'exact' }).eq('company_id', company.id).eq('reconciliation_status', 'unmatched'),
        supabase.from('clients').select('id', { count: 'exact' }).eq('company_id', company.id),
        supabase.from('ledger_entries').select('*').eq('company_id', company.id).order('created_at', { ascending: false }).limit(5),
      ])

      const totalExpenses = (expensesRes.data || []).reduce((sum, e) => sum + Number(e.total_amount || 0), 0)
      const totalIncome = (incomeRes.data || []).reduce((sum, e) => sum + Number(e.total_amount || 0), 0)

      const alerts = []
      if (pendingRes.count > 0) {
        alerts.push({ type: 'warning', message: `${pendingRes.count} ledger entries need updates` })
      }
      if (unreconciledRes.count > 0) {
        alerts.push({ type: 'error', message: `${unreconciledRes.count} bank transactions are unreconciled` })
      }
      if (!isGDriveConnected) {
        alerts.push({ type: 'info', message: 'Connect Google Drive to enable file sync' })
      }

      setStats({
        totalExpenses,
        totalIncome,
        pendingItems: pendingRes.count || 0,
        unreconciledCount: unreconciledRes.count || 0,
        clientCount: clientsRes.count || 0,
        recentEntries: recentRes.data || [],
        alerts,
      })
    } catch (err) {
      console.error('Failed to load dashboard data:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex items-center gap-4">
        <img src="/assets/mascot.png" alt="Buku mascot" className="h-14 w-14" />
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">
            Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
          </h1>
          <p className="text-neutral-500 mt-1">
            {profile?.company_name || 'Your AI-powered accounting overview'}
          </p>
        </div>
      </div>

      {/* Alerts */}
      {stats.alerts.length > 0 && (
        <div className="space-y-2">
          {stats.alerts.map((alert, i) => (
            <div
              key={i}
              className={`flex items-center gap-3 p-3 rounded-lg border ${
                alert.type === 'error'
                  ? 'bg-red-50 border-red-200 text-red-600'
                  : alert.type === 'warning'
                  ? 'bg-amber-50 border-amber-200 text-amber-600'
                  : 'bg-blue-50 border-blue-200 text-blue-600'
              }`}
            >
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm">{alert.message}</span>
              {alert.type === 'info' && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/gdrive-setup')}
                  className="ml-auto"
                >
                  Connect
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={TrendingDown}
          label="Total Expenses"
          value={formatCurrency(stats.totalExpenses, profile?.preferred_currency)}
          color="error"
        />
        <StatCard
          icon={TrendingUp}
          label="Total Income"
          value={formatCurrency(stats.totalIncome, profile?.preferred_currency)}
          color="success"
        />
        <StatCard
          icon={Clock}
          label="Pending Updates"
          value={stats.pendingItems}
          subValue="Entries need attention"
          color="warning"
        />
        <StatCard
          icon={ArrowLeftRight}
          label="Unreconciled"
          value={stats.unreconciledCount}
          subValue="Bank transactions"
          color="secondary"
        />
      </div>

      {/* Quick actions + Recent entries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick actions */}
        <Card>
          <CardTitle>Quick Actions</CardTitle>
          <div className="space-y-2 mt-4">
            <Button
              variant="ghost"
              icon={Receipt}
              onClick={() => navigate('/receipts')}
              className="w-full justify-start"
            >
              Upload Receipt
            </Button>
            <Button
              variant="ghost"
              icon={Landmark}
              onClick={() => navigate('/bank-statements')}
              className="w-full justify-start"
            >
              Upload Bank Statement
            </Button>
            <Button
              variant="ghost"
              icon={FileText}
              onClick={() => navigate('/invoices')}
              className="w-full justify-start"
            >
              Create Invoice
            </Button>
            <Button
              variant="ghost"
              icon={Users}
              onClick={() => navigate('/clients')}
              className="w-full justify-start"
            >
              Manage Clients ({stats.clientCount})
            </Button>
            <Button
              variant="ghost"
              icon={ArrowLeftRight}
              onClick={() => navigate('/reconciliation')}
              className="w-full justify-start"
            >
              Run Reconciliation
            </Button>
          </div>
        </Card>

        {/* Recent ledger entries */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <CardTitle>Recent Ledger Entries</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => navigate('/ledger')}>
                View All
              </Button>
            </div>
            {stats.recentEntries.length === 0 ? (
              <p className="text-sm text-neutral-400 text-center py-8">
                No entries yet. Upload a receipt to get started.
              </p>
            ) : (
              <div className="space-y-3">
                {stats.recentEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-neutral-50 border border-neutral-100"
                  >
                    <div>
                      <p className="text-sm font-medium text-neutral-700">
                        {entry.merchant_name || entry.description || 'Unknown'}
                      </p>
                      <p className="text-xs text-neutral-400">{formatDate(entry.entry_date)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${entry.entry_type === 'expense' ? 'text-red-500' : 'text-green-500'}`}>
                        {entry.entry_type === 'expense' ? '-' : '+'}{formatCurrency(entry.total_amount, entry.currency)}
                      </p>
                      <Badge variant={entry.status === 'complete' ? 'success' : entry.status === 'update_needed' ? 'error' : 'warning'}>
                        {entry.status === 'update_needed' ? 'Update Needed' : entry.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
