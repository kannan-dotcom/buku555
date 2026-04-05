import { useState, useEffect } from 'react'
import { BookOpen, Download, ExternalLink, Loader2, Filter } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import StatusBadge from '../components/ui/StatusBadge'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, EmptyState } from '../components/ui/Table'
import { formatCurrency, formatDate } from '../lib/utils'
import { ENTRY_TYPES, LEDGER_STATUS } from '../lib/constants'

export default function LedgerPage() {
  const { profile, company, canEditData, canDeleteData } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState({ type: 'all', status: 'all' })

  useEffect(() => {
    if (profile && company) loadEntries()
  }, [profile, company, filter])

  const loadEntries = async () => {
    setLoading(true)
    let query = supabase
      .from('ledger_entries')
      .select('*')
      .eq('company_id', company.id)
      .order('entry_date', { ascending: false })

    if (filter.type !== 'all') query = query.eq('entry_type', filter.type)
    if (filter.status !== 'all') query = query.eq('status', filter.status)

    const { data, error } = await query.limit(100)
    if (!error) setEntries(data || [])
    setLoading(false)
  }

  const openGoogleSheet = () => {
    if (profile?.gsheet_ledger_id) {
      window.open(`https://docs.google.com/spreadsheets/d/${profile.gsheet_ledger_id}`, '_blank')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Account Ledger</h1>
          <p className="text-neutral-500 mt-1">Complete view of all financial entries</p>
        </div>
        <div className="flex gap-3">
          {profile?.gsheet_ledger_id && (
            <Button variant="secondary" icon={ExternalLink} onClick={openGoogleSheet}>
              Open in Google Sheets
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex items-center gap-4 flex-wrap">
          <Filter className="h-4 w-4 text-neutral-400" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Type:</span>
            <select
              className="select w-auto"
              value={filter.type}
              onChange={(e) => setFilter({ ...filter, type: e.target.value })}
            >
              <option value="all">All</option>
              <option value="expense">Expenses</option>
              <option value="income">Income</option>
              <option value="transfer">Transfers</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">Status:</span>
            <select
              className="select w-auto"
              value={filter.status}
              onChange={(e) => setFilter({ ...filter, status: e.target.value })}
            >
              <option value="all">All</option>
              <option value="complete">Complete</option>
              <option value="update_needed">Update Needed</option>
              <option value="suspense">Suspense</option>
            </select>
          </div>
          <span className="text-sm text-neutral-400">{entries.length} entries</span>
        </div>
      </Card>

      {/* Entries table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No ledger entries"
            description="Upload receipts or bank statements to populate your ledger"
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Type</TableHeaderCell>
                <TableHeaderCell>Merchant / Description</TableHeaderCell>
                <TableHeaderCell>Currency</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>SST/VAT</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.entry_date)}</TableCell>
                  <TableCell>
                    <span className={`text-xs font-medium uppercase ${
                      entry.entry_type === 'expense' ? 'text-red-500' :
                      entry.entry_type === 'income' ? 'text-green-500' : 'text-blue-500'
                    }`}>
                      {entry.entry_type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={!entry.merchant_name ? 'status-update-needed' : ''}>
                      {entry.merchant_name || entry.description || 'Update Needed'}
                    </span>
                  </TableCell>
                  <TableCell>{entry.currency}</TableCell>
                  <TableCell>{formatCurrency(entry.amount, entry.currency)}</TableCell>
                  <TableCell>{formatCurrency(entry.sst_vat_amount, entry.currency)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(entry.total_amount, entry.currency)}</TableCell>
                  <TableCell><StatusBadge status={entry.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
