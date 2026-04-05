import { useState, useEffect } from 'react'
import { FileText, Upload, Plus, Send, Loader2, RefreshCw } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import FileUpload from '../components/ui/FileUpload'
import Modal from '../components/ui/Modal'
import StatusBadge from '../components/ui/StatusBadge'
import Badge from '../components/ui/Badge'
import { Table, TableHead, TableBody, TableRow, TableCell, TableHeaderCell, EmptyState } from '../components/ui/Table'
import { formatCurrency, formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

export default function InvoicesPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [invoices, setInvoices] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (profile) loadInvoices()
  }, [profile])

  const loadInvoices = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('invoices_sent')
      .select('*, clients(*)')
      .eq('user_id', profile.id)
      .order('invoice_date', { ascending: false })
    if (!error) setInvoices(data || [])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const filePath = `${profile.id}/invoices_sent/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: profile.id,
            folder_type: 'invoices_sent',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            ai_processing_status: 'pending',
          })
          .select()
          .single()
        if (docError) throw docError

        await supabase.functions.invoke('process-invoice', {
          body: { documentId: doc.id, filePath },
        })
      }
      toast.success('Upload Complete', 'Invoice(s) queued for processing')
      setFiles([])
      setShowUpload(false)
      loadInvoices()
    } catch (err) {
      toast.error('Upload Failed', err.message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Invoices Sent</h1>
          <p className="text-neutral-500 mt-1">Manage invoices sent to clients</p>
        </div>
        <div className="flex gap-3">
          <Button variant="secondary" icon={Upload} onClick={() => setShowUpload(true)}>
            Upload Invoice
          </Button>
        </div>
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Invoices" size="lg">
        <FileUpload onFilesSelected={setFiles} />
        <div className="flex justify-end gap-3 mt-4">
          <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
          <Button onClick={handleUpload} loading={uploading} disabled={files.length === 0}>
            Upload & Process
          </Button>
        </div>
      </Modal>

      <Card className="p-0 overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : invoices.length === 0 ? (
          <EmptyState
            icon={FileText}
            title="No invoices yet"
            description="Upload invoices sent to your clients"
            action={<Button icon={Upload} onClick={() => setShowUpload(true)}>Upload Invoice</Button>}
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Invoice No</TableHeaderCell>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Client</TableHeaderCell>
                <TableHeaderCell>Amount</TableHeaderCell>
                <TableHeaderCell>Tax</TableHeaderCell>
                <TableHeaderCell>Total</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
                <TableHeaderCell>Recurring</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {invoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-mono text-sm">{inv.invoice_number || '—'}</TableCell>
                  <TableCell>{formatDate(inv.invoice_date)}</TableCell>
                  <TableCell>{inv.clients?.company_name || '—'}</TableCell>
                  <TableCell>{formatCurrency(inv.subtotal, inv.currency)}</TableCell>
                  <TableCell>{formatCurrency(inv.tax_amount, inv.currency)}</TableCell>
                  <TableCell className="font-medium">{formatCurrency(inv.total_amount, inv.currency)}</TableCell>
                  <TableCell><StatusBadge status={inv.status} /></TableCell>
                  <TableCell>
                    {inv.is_recurring ? (
                      <Badge variant="info"><RefreshCw className="h-3 w-3 mr-1" />Recurring</Badge>
                    ) : (
                      <span className="text-neutral-400">—</span>
                    )}
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
