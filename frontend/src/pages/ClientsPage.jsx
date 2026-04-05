import { useState, useEffect } from 'react'
import { Users, Plus, Edit3, Loader2, Phone, Mail, Building2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import Badge from '../components/ui/Badge'
import { EmptyState } from '../components/ui/Table'
import { useToast } from '../components/ui/Toast'

const emptyClient = {
  company_name: '', registration_number: '', phone: '', email: '', address: '',
  pic_name: '', pic_phone: '', pic_email: '', notes: '',
}

export default function ClientsPage() {
  const { profile, company, canEditData, canDeleteData } = useAuth()
  const toast = useToast()
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [editClient, setEditClient] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile && company) loadClients()
  }, [profile, company])

  const loadClients = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('company_id', company.id)
      .order('company_name')
    if (!error) setClients(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!editClient.company_name.trim()) {
      toast.error('Validation', 'Company name is required')
      return
    }
    setSaving(true)
    try {
      if (editClient.id) {
        const { error } = await supabase
          .from('clients')
          .update({ ...editClient, updated_at: new Date().toISOString() })
          .eq('id', editClient.id)
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('clients')
          .insert({ ...editClient, user_id: profile.id, company_id: company.id })
        if (error) throw error
      }
      toast.success('Saved', 'Client has been saved')
      setEditClient(null)
      loadClients()
    } catch (err) {
      toast.error('Failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Clients</h1>
          <p className="text-neutral-500 mt-1">Manage your client database</p>
        </div>
        {canEditData && (
          <Button icon={Plus} onClick={() => setEditClient({ ...emptyClient })}>
            Add Client
          </Button>
        )}
      </div>

      <Modal
        open={!!editClient}
        onClose={() => setEditClient(null)}
        title={editClient?.id ? 'Edit Client' : 'Add Client'}
        size="lg"
      >
        {editClient && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Company Name *"
                value={editClient.company_name}
                onChange={(e) => setEditClient({ ...editClient, company_name: e.target.value })}
                placeholder="Acme Sdn Bhd"
              />
              <Input
                label="Registration / License No"
                value={editClient.registration_number || ''}
                onChange={(e) => setEditClient({ ...editClient, registration_number: e.target.value })}
                placeholder="SSM-12345678"
              />
              <Input
                label="Phone"
                value={editClient.phone || ''}
                onChange={(e) => setEditClient({ ...editClient, phone: e.target.value })}
                placeholder="+60 12-345 6789"
              />
              <Input
                label="Email"
                type="email"
                value={editClient.email || ''}
                onChange={(e) => setEditClient({ ...editClient, email: e.target.value })}
                placeholder="accounts@acme.com"
              />
            </div>
            <Input
              label="Address"
              value={editClient.address || ''}
              onChange={(e) => setEditClient({ ...editClient, address: e.target.value })}
              placeholder="123 Jalan Bukit Bintang, KL"
            />
            <div className="border-t border-neutral-200 pt-4">
              <p className="text-sm font-medium text-neutral-600 mb-3">Person in Charge (PIC)</p>
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="PIC Name"
                  value={editClient.pic_name || ''}
                  onChange={(e) => setEditClient({ ...editClient, pic_name: e.target.value })}
                  placeholder="Ahmad bin Ali"
                />
                <Input
                  label="PIC Phone"
                  value={editClient.pic_phone || ''}
                  onChange={(e) => setEditClient({ ...editClient, pic_phone: e.target.value })}
                  placeholder="+60 12-345 6789"
                />
                <Input
                  label="PIC Email"
                  type="email"
                  value={editClient.pic_email || ''}
                  onChange={(e) => setEditClient({ ...editClient, pic_email: e.target.value })}
                  placeholder="ahmad@acme.com"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <Button variant="ghost" onClick={() => setEditClient(null)}>Cancel</Button>
              <Button onClick={handleSave} loading={saving}>Save Client</Button>
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : clients.length === 0 ? (
        <Card>
          <EmptyState
            icon={Users}
            title="No clients yet"
            description="Add clients manually or they'll be auto-created from uploaded invoices"
            action={canEditData ? <Button icon={Plus} onClick={() => setEditClient({ ...emptyClient })}>Add Client</Button> : undefined}
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => (
            <Card key={client.id} className="relative">
              {canEditData && (
                <button
                  onClick={() => setEditClient({ ...client })}
                  className="absolute top-4 right-4 p-1.5 rounded text-neutral-400 hover:text-primary-500 hover:bg-neutral-100"
                >
                  <Edit3 className="h-4 w-4" />
                </button>
              )}
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-accent-50 text-accent-500">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-neutral-700 truncate">{client.company_name}</h3>
                  {client.registration_number && (
                    <p className="text-xs text-neutral-400">{client.registration_number}</p>
                  )}
                </div>
              </div>
              <div className="mt-4 space-y-2">
                {client.email && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Mail className="h-3.5 w-3.5" />{client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Phone className="h-3.5 w-3.5" />{client.phone}
                  </div>
                )}
                {client.pic_name && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Users className="h-3.5 w-3.5" />PIC: {client.pic_name}
                  </div>
                )}
              </div>
              {client.is_recurring && (
                <div className="mt-3">
                  <Badge variant="info">Recurring Client</Badge>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
