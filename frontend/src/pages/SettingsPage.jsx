import { useState } from 'react'
import { Settings, User, Globe, Bell, Save, Building2, Pencil } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import Card, { CardTitle, CardDescription } from '../components/ui/Card'
import Button from '../components/ui/Button'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import { CURRENCIES } from '../lib/constants'
import { useToast } from '../components/ui/Toast'

const COMPANY_TYPE_LABELS = {
  sdn_bhd: 'Sdn Bhd',
  sole_proprietor: 'Sole Proprietor',
  partnership: 'Partnership',
  llp: 'LLP',
  plc: 'Public Limited Company',
  enterprise: 'Enterprise',
}

function formatCompanyType(type) {
  return COMPANY_TYPE_LABELS[type] || type || '-'
}

function formatRole(role) {
  if (!role) return '-'
  return role.charAt(0).toUpperCase() + role.slice(1)
}

export default function SettingsPage() {
  const { profile, company, companyRole, isOwner, updateProfile, fetchProfile, user } = useAuth()
  const toast = useToast()
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    phone: profile?.phone || '',
    preferred_currency: profile?.preferred_currency || 'MYR',
    country_code: profile?.country_code || 'MY',
    reminder_email_enabled: profile?.reminder_email_enabled ?? true,
    reminder_day_of_week: profile?.reminder_day_of_week ?? 1,
  })
  const [saving, setSaving] = useState(false)
  const [editingCompanyName, setEditingCompanyName] = useState(false)
  const [companyNameDraft, setCompanyNameDraft] = useState(company?.name || '')
  const [savingCompany, setSavingCompany] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await updateProfile(form)
      toast.success('Settings Saved', 'Your profile has been updated')
    } catch (err) {
      toast.error('Save Failed', err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleSaveCompanyName = async () => {
    if (!company?.id || !companyNameDraft.trim()) return
    setSavingCompany(true)
    try {
      const { error } = await supabase
        .from('companies')
        .update({ name: companyNameDraft.trim(), updated_at: new Date().toISOString() })
        .eq('id', company.id)
      if (error) throw error
      // Re-fetch profile to refresh company data
      await fetchProfile(user.id)
      setEditingCompanyName(false)
      toast.success('Company Updated', 'Company name has been updated')
    } catch (err) {
      toast.error('Update Failed', err.message)
    } finally {
      setSavingCompany(false)
    }
  }

  const dayOptions = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' },
  ]

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-neutral-800">Settings</h1>
        <p className="text-neutral-500 mt-1">Manage your account and preferences</p>
      </div>

      {/* Company Information */}
      {company && (
        <Card>
          <div className="flex items-center gap-3 mb-6">
            <Building2 className="h-5 w-5 text-primary-500" />
            <div>
              <CardTitle>Company Information</CardTitle>
              <CardDescription>Your company details and role</CardDescription>
            </div>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Name</label>
                {editingCompanyName && isOwner ? (
                  <div className="flex items-center gap-2">
                    <Input
                      value={companyNameDraft}
                      onChange={(e) => setCompanyNameDraft(e.target.value)}
                      className="flex-1"
                    />
                    <Button size="sm" onClick={handleSaveCompanyName} loading={savingCompany}>
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setEditingCompanyName(false)
                        setCompanyNameDraft(company?.name || '')
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-neutral-800 py-2">{company.name || '-'}</p>
                    {isOwner && (
                      <button
                        onClick={() => {
                          setCompanyNameDraft(company?.name || '')
                          setEditingCompanyName(true)
                        }}
                        className="text-neutral-400 hover:text-primary-500 transition-colors"
                        title="Edit company name"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Company Type</label>
                <p className="text-sm text-neutral-800 py-2">{formatCompanyType(company.company_type)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Registration Number</label>
                <p className="text-sm text-neutral-800 py-2">{company.registration_number || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">Your Role</label>
                <p className="text-sm text-neutral-800 py-2">{formatRole(companyRole)}</p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Profile */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <User className="h-5 w-5 text-primary-500" />
          <div>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </div>
        </div>
        <div className="space-y-4">
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
          />
          <Input
            label="Phone"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
        </div>
      </Card>

      {/* Preferences */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Globe className="h-5 w-5 text-primary-500" />
          <div>
            <CardTitle>Preferences</CardTitle>
            <CardDescription>Currency, country, and display settings</CardDescription>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Default Currency"
            options={CURRENCIES}
            value={form.preferred_currency}
            onChange={(e) => setForm({ ...form, preferred_currency: e.target.value })}
          />
          <Input
            label="Country Code"
            value={form.country_code}
            onChange={(e) => setForm({ ...form, country_code: e.target.value.toUpperCase() })}
            helper="ISO 3166 code (e.g., MY, SG, US)"
          />
        </div>
      </Card>

      {/* Reminders */}
      <Card>
        <div className="flex items-center gap-3 mb-6">
          <Bell className="h-5 w-5 text-primary-500" />
          <div>
            <CardTitle>Email Reminders</CardTitle>
            <CardDescription>Weekly reminders for incomplete data</CardDescription>
          </div>
        </div>
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={form.reminder_email_enabled}
              onChange={(e) => setForm({ ...form, reminder_email_enabled: e.target.checked })}
              className="w-4 h-4 rounded border-neutral-300 bg-white text-primary-500 focus:ring-primary-500"
            />
            <span className="text-sm text-neutral-600">Enable weekly email reminders</span>
          </label>
          {form.reminder_email_enabled && (
            <Select
              label="Reminder Day"
              options={dayOptions}
              value={form.reminder_day_of_week}
              onChange={(e) => setForm({ ...form, reminder_day_of_week: parseInt(e.target.value) })}
            />
          )}
        </div>
      </Card>

      <div className="flex justify-end">
        <Button icon={Save} onClick={handleSave} loading={saving}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}
