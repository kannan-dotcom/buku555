import { useState, useEffect } from 'react'
import { Building2, Upload, FileText, Loader2, Eye } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Select from '../components/ui/Select'
import FileUpload from '../components/ui/FileUpload'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { EmptyState } from '../components/ui/Table'
import { COMPANY_DOC_TYPES } from '../lib/constants'
import { formatDate, formatFileSize } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

export default function CompanyDocsPage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [files, setFiles] = useState([])
  const [docType, setDocType] = useState('ssm')

  useEffect(() => {
    if (profile) loadDocs()
  }, [profile])

  const loadDocs = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('company_documents')
      .select('*, documents(*)')
      .eq('user_id', profile.id)
      .order('created_at', { ascending: false })
    if (!error) setDocs(data || [])
    setLoading(false)
  }

  const handleUpload = async () => {
    if (files.length === 0) return
    setUploading(true)
    try {
      for (const file of files) {
        const filePath = `${profile.id}/company_documents/${Date.now()}_${file.name}`
        const { error: uploadError } = await supabase.storage
          .from('documents')
          .upload(filePath, file)
        if (uploadError) throw uploadError

        const { data: doc, error: docError } = await supabase
          .from('documents')
          .insert({
            user_id: profile.id,
            folder_type: 'company_documents',
            file_name: file.name,
            file_type: file.type,
            file_size: file.size,
          })
          .select()
          .single()
        if (docError) throw docError

        const { error: compDocError } = await supabase
          .from('company_documents')
          .insert({
            user_id: profile.id,
            document_id: doc.id,
            doc_type: docType,
          })
        if (compDocError) throw compDocError
      }
      toast.success('Upload Complete', 'Document(s) uploaded successfully')
      setFiles([])
      setShowUpload(false)
      loadDocs()
    } catch (err) {
      toast.error('Upload Failed', err.message)
    } finally {
      setUploading(false)
    }
  }

  const getDocTypeLabel = (type) => {
    const found = COMPANY_DOC_TYPES.find((t) => t.value === type)
    return found ? found.label : type
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Company Documents</h1>
          <p className="text-neutral-500 mt-1">SSM, tax data, MOA, and director documents</p>
        </div>
        <Button icon={Upload} onClick={() => setShowUpload(true)}>
          Upload Document
        </Button>
      </div>

      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Company Document" size="lg">
        <div className="space-y-4">
          <Select
            label="Document Type"
            options={COMPANY_DOC_TYPES}
            value={docType}
            onChange={(e) => setDocType(e.target.value)}
          />
          <FileUpload onFilesSelected={setFiles} />
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowUpload(false)}>Cancel</Button>
            <Button onClick={handleUpload} loading={uploading} disabled={files.length === 0}>
              Upload
            </Button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : docs.length === 0 ? (
        <Card>
          <EmptyState
            icon={Building2}
            title="No company documents yet"
            description="Upload SSM, MOA, tax registration, and other company documents"
            action={<Button icon={Upload} onClick={() => setShowUpload(true)}>Upload Document</Button>}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {docs.map((doc) => (
            <Card key={doc.id}>
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-50 text-accent-500">
                  <FileText className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-neutral-700 truncate">
                    {doc.documents?.file_name || 'Document'}
                  </h3>
                  <Badge variant="neutral" className="mt-1">{getDocTypeLabel(doc.doc_type)}</Badge>
                </div>
              </div>
              <div className="mt-3 text-xs text-neutral-400 space-y-1">
                <p>Uploaded: {formatDate(doc.created_at)}</p>
                {doc.documents?.file_size && <p>Size: {formatFileSize(doc.documents.file_size)}</p>}
                {doc.expiry_date && <p>Expires: {formatDate(doc.expiry_date)}</p>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
