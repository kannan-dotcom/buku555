import { useState, useEffect } from 'react'
import { BookMarked, Upload, Plus, Loader2, Globe } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Modal from '../components/ui/Modal'
import FileUpload from '../components/ui/FileUpload'
import { EmptyState } from '../components/ui/Table'
import { formatDate } from '../lib/utils'
import { useToast } from '../components/ui/Toast'

export default function ReferencePage() {
  const { profile } = useAuth()
  const toast = useToast()
  const [guides, setGuides] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [newGuide, setNewGuide] = useState({ country_code: 'MY', title: '', content: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (profile) loadGuides()
  }, [profile])

  const loadGuides = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('reference_guides')
      .select('*')
      .eq('user_id', profile.id)
      .order('country_code')
    if (!error) setGuides(data || [])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!newGuide.title.trim()) return
    setSaving(true)
    try {
      const { error } = await supabase
        .from('reference_guides')
        .insert({ ...newGuide, user_id: profile.id })
      if (error) throw error
      toast.success('Saved', 'Reference guide added')
      setShowAdd(false)
      setNewGuide({ country_code: 'MY', title: '', content: '' })
      loadGuides()
    } catch (err) {
      toast.error('Failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  const grouped = guides.reduce((acc, g) => {
    if (!acc[g.country_code]) acc[g.country_code] = []
    acc[g.country_code].push(g)
    return acc
  }, {})

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-neutral-800">Reference Guides</h1>
          <p className="text-neutral-500 mt-1">Accounting guides by country</p>
        </div>
        <Button icon={Plus} onClick={() => setShowAdd(true)}>
          Add Guide
        </Button>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Reference Guide" size="lg">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Country Code"
              value={newGuide.country_code}
              onChange={(e) => setNewGuide({ ...newGuide, country_code: e.target.value.toUpperCase() })}
              placeholder="MY"
            />
            <Input
              label="Title"
              value={newGuide.title}
              onChange={(e) => setNewGuide({ ...newGuide, title: e.target.value })}
              placeholder="SST Guide Malaysia 2025"
            />
          </div>
          <div>
            <label className="label">Content (Markdown)</label>
            <textarea
              className="input min-h-[200px] resize-y"
              value={newGuide.content}
              onChange={(e) => setNewGuide({ ...newGuide, content: e.target.value })}
              placeholder="# Tax Guide&#10;&#10;Details here..."
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
            <Button onClick={handleSave} loading={saving}>Save Guide</Button>
          </div>
        </div>
      </Modal>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        </div>
      ) : guides.length === 0 ? (
        <Card>
          <EmptyState
            icon={BookMarked}
            title="No reference guides yet"
            description="Add accounting guides for different countries to help with compliance"
            action={<Button icon={Plus} onClick={() => setShowAdd(true)}>Add Guide</Button>}
          />
        </Card>
      ) : (
        Object.entries(grouped).map(([country, countryGuides]) => (
          <div key={country}>
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-4 w-4 text-neutral-400" />
              <h2 className="text-lg font-semibold text-neutral-700">{country}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {countryGuides.map((guide) => (
                <Card key={guide.id}>
                  <h3 className="text-sm font-semibold text-neutral-700">{guide.title}</h3>
                  <p className="text-xs text-neutral-400 mt-1">Updated: {formatDate(guide.updated_at)}</p>
                  {guide.content && (
                    <p className="text-sm text-neutral-500 mt-3 line-clamp-3">{guide.content}</p>
                  )}
                </Card>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
