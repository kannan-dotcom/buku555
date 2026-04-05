import { useState, useEffect } from 'react'
import { Landmark, Upload, Loader2 } from 'lucide-react'
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

export default function BankStatementsPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [files, setFiles] = useState([])

  useEffect(() => {
    if (profile) loadTransactions()
  }, [profile])

  const loadTransactions = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('bank_transactions')
      .select('*')
      .eq('user_id', profile.id)
      .order('transaction_date', { ascending: false })
    if (!error) setTransactions(data || [])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const filePath = `${profile.id}/bank_statements/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: profile.id,
            folder_type: 'bank_statements',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
            ai_processing_status: 'pending',
          })
          .select()
          .single()
        if (docError) throw docError

        await supabase.functions.invoke('process-bank-statement', {
          body: { documentId: doc.id, filePath },
        })
      }
      toast.success('Upload Complete', 'Bank statement(s) queued for AI processing')
      setFiles([])
      setShowUpload(false)
      loadTransactions()
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
          <h1 className="text-2xl font-bold text-neutral-800">Bank Statements</h1>
          <p className="text-neutral-500 mt-1">Upload and analyze bank statements</p>
        </div>
        <Button icon={Upload} onClick={() => setShowUpload(true)}>
          Upload Statement
        </Button>
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Bank Statement" size="lg">
        <FileUpload
          onFilesSelected={setFiles}
          accept={['application/pdf']}
          multiple={false}
        />
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
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={Landmark}
            title="No bank statements yet"
            description="Upload a bank statement PDF to extract and analyze transactions"
            action={<Button icon={Upload} onClick={() => setShowUpload(true)}>Upload Statement</Button>}
          />
        ) : (
          <Table>
            <TableHead>
              <tr>
                <TableHeaderCell>Date</TableHeaderCell>
                <TableHeaderCell>Description</TableHeaderCell>
                <TableHeaderCell>Reference</TableHeaderCell>
                <TableHeaderCell>Debit</TableHeaderCell>
                <TableHeaderCell>Credit</TableHeaderCell>
                <TableHeaderCell>Balance</TableHeaderCell>
                <TableHeaderCell>Status</TableHeaderCell>
              </tr>
            </TableHead>
            <TableBody>
              {transactions.map((txn) => (
                <TableRow key={txn.id}>
                  <TableCell>{formatDate(txn.transaction_date)}</TableCell>
                  <TableCell className="max-w-xs truncate">{txn.description || '—'}</TableCell>
                  <TableCell>{txn.reference_no || '—'}</TableCell>
                  <TableCell className="text-red-500">
                    {txn.debit_amount > 0 ? formatCurrency(txn.debit_amount) : '—'}
                  </TableCell>
                  <TableCell className="text-green-500">
                    {txn.credit_amount > 0 ? formatCurrency(txn.credit_amount) : '—'}
                  </TableCell>
                  <TableCell>{formatCurrency(txn.balance)}</TableCell>
                  <TableCell><StatusBadge status={txn.reconciliation_status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </div>
  )
}
