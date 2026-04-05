import { useState, useEffect } from 'react'
import { Receipt, Upload, Eye, Edit3, Trash2, Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import FileUpload from '../components/ui/FileUpload'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, EmptyState } from '../components/ui/Table'
import { formatCurrency, formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

export default function ReceiptsPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [editEntry, setEditEntry] = useState(null)
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (profile) loadEntries()
  }, [profile])

  const loadEntries = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('ledger_entries')
      .select('*, documents(*)')
      .eq('user_id', profile.id)
      .eq('entry_type', 'expense')
      .order('entry_date', { ascending: false })
    if (!error) setEntries(data || [])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        // 1. Upload to Supabase Storage
        const filePath = `${profile.id}/receipts/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        // 2. Create document record
        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: profile.id,
            folder_type: 'receipts',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            ai_processing_status: 'pending',
          })
          .select()
          .single()
        if (docError) throw docError

        // 3. Trigger AI processing via edge function
        const { error: fnError } = await supabase.functions.invoke('process-receipt', {
          body: { documentId: doc.id, filePath },
        })
        if (fnError) console.error('AI processing queued but may have errors:', fnError)
      }

      toast.success('Upload Complete', `${files.length} receipt(s) uploaded and queued for AI processing`)
      setFiles([])
      setShowUpload(false)
      loadEntries()
    } catch (err) {
      toast.error('Upload Failed', err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSaveEdit = async () => {
    if (!editEntry) return
    try {
      const { error } = await supabase
        .from('ledger_entries')
        .update({
          merchant_name: editEntry.merchant_name,
          tax_registration_no: editEntry.tax_registration_no,
          einvoice_number: editEntry.einvoice_number,
          currency: editEntry.currency,
          payment_type: editEntry.payment_type,
          amount: editEntry.amount,
          sst_vat_amount: editEntry.sst_vat_amount,
          total_amount: editEntry.total_amount,
          category: editEntry.category,
          status: 'complete',
          status_notes: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', editEntry.id)
      if (error) throw error
      toast.success('Entry Updated', 'Ledger entry has been updated successfully')
      setEditEntry(null)
      loadEntries()
    } catch (err) {
      toast.error('Update Failed', err.message)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Receipts</h1>
          <p className="text-neutral-500 mt-1">Upload and manage expense receipts</p>
        </div>
        <Button icon={Upload} onClick={() => setShowUpload(true)}>
          Upload Receipts
        </Button>
      </div>

      {/* Upload modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Receipts" size="lg">
        <FileUpload onFilesSelected={setFiles} />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button onClick={handleUpload} loading={uploading} disabled={files.length === 0}>
            Upload & Process ({files.length})
          </Button>
        </div>
      </Modal>

      {/* Edit modal */}
      <Modal open={!!editEntry} onClose={() => setEditEntry(null)} title="Edit Ledger Entry" size="lg">
        {editEntry && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Merchant Name</label>
                <input
                  className={`input ${!editEntry.merchant_name ? 'border-status-error' : ''}`}
                  value={editEntry.merchant_name || ''}
                  onChange={(e) => setEditEntry({ ...editEntry, merchant_name: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Tax Registration No</label>
                <input
                  className={`input ${!editEntry.tax_registration_no ? 'border-status-error' : ''}`}
                  value={editEntry.tax_registration_no || ''}
                  onChange={(e) => setEditEntry({ ...editEntry, tax_registration_no: e.target.value })}
                />
              </div>
              <div>
                <label className="label">E-Invoice Number</label>
                <input
                  className="input"
                  value={editEntry.einvoice_number || ''}
                  onChange={(e) => setEditEntry({ ...editEntry, einvoice_number: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Currency</label>
                <input
                  className="input"
                  value={editEntry.currency || 'MYR'}
                  onChange={(e) => setEditEntry({ ...editEntry, currency: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Payment Type</label>
                <input
                  className="input"
                  value={editEntry.payment_type || ''}
                  onChange={(e) => setEditEntry({ ...editEntry, payment_type: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Category</label>
                <input
                  className="input"
                  value={editEntry.category || ''}
                  onChange={(e) => setEditEntry({ ...editEntry, category: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Amount (excl. tax)</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={editEntry.amount || 0}
                  onChange={(e) => setEditEntry({ ...editEntry, amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="label">SST/VAT Amount</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={editEntry.sst_vat_amount || 0}
                  onChange={(e) => setEditEntry({ ...editEntry, sst_vat_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div>
                <label className="label">Total Amount</label>
                <input
                  className="input"
                  type="number"
                  step="0.01"
                  value={editEntry.total_amount || 0}
                  onChange={(e) => setEditEntry({ ...editEntry, total_amount: parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="ghost" onClick={() => setEditEntry(null)}>Cancel</Button>
              <Button onClick={handleSaveEdit}>Save Changes</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Entries table */}
      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Receipt}
            title="No receipts yet"
            description="Upload your first receipt to get started with AI-powered extraction"
            action={<Button icon={Upload} onClick={() => setShowUpload(true)}>Upload Receipt</Button>}
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Merchant</TableHeaderCell>
                <TableHeaderCell>Tax Reg No</TableHeaderCell>
                <TableHeaderCell>Payment</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>SST/VAT</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Actions</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.entry_date)}</TableCell>
                  <TableCell>
                    <span className={!entry.merchant_name ? 'status-update-needed' : ''}>
                      {entry.merchant_name || 'Update Needed'}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={!entry.tax_registration_no ? 'status-update-needed' : ''}>
                      {entry.tax_registration_no || 'Update Needed'}
                    </span>
                  </TableCell>
                  <TableCell>{entry.payment_type || '—'}</TableCell>
                  <TableCell>{formatCurrency(entry.amount, entry.currency)}</TableCell>
                  <TableCell>{formatCurrency(entry.sst_vat_amount, entry.currency)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(entry.total_amount, entry.currency)}</TableCell>
                  <TableCell><StatusBadge status={entry.status} /></TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditEntry({ ...entry })}
                        className="p-1.5 rounded text-neutral-400 hover:text-primary-500 hover:bg-neutral-100"
                        title="Edit"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
