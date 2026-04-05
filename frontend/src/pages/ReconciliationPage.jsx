import { useState, useEffect } from 'react'
import { ArrowLeftRight, Play, Loader2, AlertCircle, CheckCircle, DollarSign } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import StatusBadge from '../components/ui/StatusBadge'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, EmptyState } from '../components/ui/Table'
import { formatCurrency, formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

export default function ReconciliationPage() {
  const { profile, updateProfile } = useAuth()
  const toast = useToast()
  const [suspenseItems, setSuspenseItems] = useState([])
  const [matchedItems, setMatchedItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [reconciling, setReconciling] = useState(false)
  const [showCashModal, setShowCashModal] = useState(false)
  const [cashInHand, setCashInHand] = useState(profile?.cash_in_hand || 0)
  const [stats, setStats] = useState({ matched: 0, unmatched: 0, incomplete: 0 })

  useEffect(() => {
    if (profile) loadData()
  }, [profile])

  const loadData = async () => {
    setLoading(true)
    const [suspenseRes, matchedRes, statsRes] = await Promise.all([
      supabase
        .from('bank_transactions')
        .select('*')
        .eq('user_id', profile.id)
        .in('reconciliation_status', ['unmatched', 'incomplete'])
        .order('transaction_date', { ascending: false }),
      supabase
        .from('bank_transactions')
        .select('*, ledger_entries:matched_ledger_entry_id(*)')
        .eq('user_id', profile.id)
        .eq('reconciliation_status', 'matched')
        .order('transaction_date', { ascending: false })
        .limit(20),
      supabase
        .from('bank_transactions')
        .select('reconciliation_status')
        .eq('user_id', profile.id),
    ])

    setSuspenseItems(suspenseRes.data || [])
    setMatchedItems(matchedRes.data || [])

    const counts = { matched: 0, unmatched: 0, incomplete: 0 }
    for (const row of (statsRes.data || [])) {
      if (counts[row.reconciliation_status] !== undefined) counts[row.reconciliation_status]++
    }
    setStats(counts)
    setLoading(false)
  }

  const runReconciliation = async () => {
    setReconciling(true)
    try {
      const { error } = await supabase.functions.invoke('reconcile-transactions', {
        body: { userId: profile.id, cashInHand: cashInHand },
      })
      if (error) throw error
      toast.success('Reconciliation Complete', 'Transactions have been reconciled')
      loadData()
    } catch (err) {
      toast.error('Reconciliation Failed', err.message)
    } finally {
      setReconciling(false)
    }
  }

  const saveCashInHand = async () => {
    try {
      await updateProfile({ cash_in_hand: cashInHand })
      toast.success('Saved', 'Cash in hand updated')
      setShowCashModal(false)
    } catch (err) {
      toast.error('Failed', err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Reconciliation</h1>
          <p className="text-neutral-500 mt-1">Match bank transactions with ledger entries</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={DollarSign} onClick={() => setShowCashModal(true)}>
            Cash in Hand
          </Button>
          <Button icon={Play} onClick={runReconciliation} loading={reconciling}>
            Run Reconciliation
          </Button>
        </div>
      </div>

      {/* Cash in hand modal */}
      <Modal open={showCashModal} onClose={() => setShowCashModal(false)} title="Cash in Hand">
        <p className="text-sm text-neutral-500 mb-4">
          Enter the current cash in hand amount to help reconcile all funds.
        </p>
        <Input
          label="Cash in Hand"
          type="number"
          step="0.01"
          value={cashInHand}
          onChange={(e) => setCashInHand(parseFloat(e.target.value) || 0)}
        />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setShowCashModal(false)}>Cancel</Button>
          <Button onClick={saveCashInHand}>Save</Button>
        </div>
      </Modal>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-green-50">
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{stats.matched}</p>
              <p className="text-sm text-neutral-500">Matched</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50">
              <AlertCircle className="h-8 w-8 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{stats.unmatched}</p>
              <p className="text-sm text-neutral-500">Unmatched</p>
            </div>
          </div>
        </Card>
        <Card>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-neutral-800">{stats.incomplete}</p>
              <p className="text-sm text-neutral-500">Incomplete</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Suspense list */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-neutral-100">
          <CardTitle>Suspense List</CardTitle>
          <CardDescription>Transactions requiring attention</CardDescription>
        </div>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : suspenseItems.length === 0 ? (
          <EmptyState
            icon={ArrowLeftRight}
            title="All clear"
            description="No unreconciled transactions"
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Debit</TableHeaderCell>
                <TableHeaderCell>Credit</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Notes</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {suspenseItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{formatDate(item.transaction_date)}</TableCell>
                  <TableCell className="max-w-xs truncate">{item.description}</TableCell>
                  <TableCell className="text-red-500">
                    {item.debit_amount > 0 ? formatCurrency(item.debit_amount) : '—'}
                  </TableCell>
                  <TableCell className="text-green-500">
                    {item.credit_amount > 0 ? formatCurrency(item.credit_amount) : '—'}
                  </TableCell>
                  <TableCell><StatusBadge status={item.reconciliation_status} /></TableCell>
                  <TableCell className="text-xs text-neutral-400">{item.notes || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
