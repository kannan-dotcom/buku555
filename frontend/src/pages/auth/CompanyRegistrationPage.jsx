import { useState } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import { APP_NAME, COMPANY_TYPES, MOA_REQUIRED_TYPES } from '../../lib/constants'
import { LogOut, Building2, Plus, X, Upload, File, AlertCircle } from 'lucide-react'

export default function CompanyRegistrationPage() {
  const { user, profile, signOut } = useAuth()

  const [companyName, setCompanyName] = useState('')
  const [registrationNumber, setRegistrationNumber] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [ssmFile, setSsmFile] = useState(null)
  const [moaFile, setMoaFile] = useState(null)
  const [shareholders, setShareholders] = useState([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

  const requiresMoa = MOA_REQUIRED_TYPES.includes(companyType)

  const addShareholder = () => {
    setShareholders([...shareholders, { name: '', ic_number: '', percentage: '' }])
  }

  const removeShareholder = (index) => {
    setShareholders(shareholders.filter((_, i) => i !== index))
  }

  const updateShareholder = (index, field, value) => {
    const updated = [...shareholders]
    updated[index] = { ...updated[index], [field]: value }
    setShareholders(updated)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      // 1. Upload SSM cert to 'registrations' bucket
      const ssmPath = `${user.id}/ssm_${Date.now()}.${ssmFile.name.split('.').pop()}`
      const { error: ssmErr } = await supabase.storage.from('registrations').upload(ssmPath, ssmFile)
      if (ssmErr) throw ssmErr

      // 2. Upload MOA if required
      let moaPath = null
      if (['sdn_bhd', 'berhad'].includes(companyType) && moaFile) {
        moaPath = `${user.id}/moa_${Date.now()}.${moaFile.name.split('.').pop()}`
        const { error: moaErr } = await supabase.storage.from('registrations').upload(moaPath, moaFile)
        if (moaErr) throw moaErr
      }

      // 3. Insert registration record
      const { error: regErr } = await supabase.from('company_registrations').insert({
        user_id: user.id,
        company_name: companyName,
        registration_number: registrationNumber,
        company_type: companyType,
        ssm_certificate_path: ssmPath,
        moa_document_path: moaPath,
        shareholders: shareholders.length > 0 ? shareholders : null,
      })
      if (regErr) throw regErr

      // Redirect to pending page
      window.location.href = '/registration-pending'
    } catch (err) {
      setError(err.message || 'Failed to submit registration')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch {
      // Silently fail, page will redirect
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Top bar */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo_full.png" alt={APP_NAME} className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{profile?.email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Registration form */}
      <div className="flex items-start justify-center px-6 py-12">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-50 mb-4">
                <Building2 className="h-7 w-7 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold text-neutral-800">Register Your Company</h1>
              <p className="text-neutral-500 mt-2">
                Complete your company registration to start using {APP_NAME}.
                Your application will be reviewed by our team.
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600 font-medium">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company details */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">
                  Company Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Company Name"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g. Acme Sdn Bhd"
                    required
                  />
                  <Input
                    label="Registration Number"
                    value={registrationNumber}
                    onChange={(e) => setRegistrationNumber(e.target.value)}
                    placeholder="e.g. 202301012345"
                    required
                  />
                </div>

                <Select
                  label="Company Type"
                  options={COMPANY_TYPES}
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  placeholder="Select company type"
                  required
                />
              </div>

              {/* Document uploads */}
              <div className="space-y-4">
                <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">
                  Documents
                </h2>

                {/* SSM Certificate */}
                <div>
                  <label className="label">SSM Certificate <span className="text-red-400">*</span></label>
                  <div className="relative">
                    {ssmFile ? (
                      <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                            <File className="h-4 w-4 text-primary-500" />
                          </div>
                          <span className="text-sm text-neutral-700 font-medium truncate">
                            {ssmFile.name}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSsmFile(null)}
                          className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 hover:border-primary-300 bg-neutral-50 hover:bg-primary-50/50 p-6 cursor-pointer transition-all">
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={(e) => setSsmFile(e.target.files[0] || null)}
                          className="hidden"
                          required
                        />
                        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 mb-2">
                          <Upload className="h-5 w-5 text-primary-400" />
                        </div>
                        <p className="text-sm text-neutral-600 font-medium">Click to upload SSM certificate</p>
                        <p className="text-xs text-neutral-400 mt-1">PDF, JPEG, or PNG</p>
                      </label>
                    )}
                  </div>
                </div>

                {/* MOA Document (conditional) */}
                {requiresMoa && (
                  <div>
                    <label className="label">
                      Memorandum of Association (MOA) <span className="text-red-400">*</span>
                    </label>
                    <p className="text-xs text-neutral-400 mb-2">
                      Required for Sdn Bhd and Berhad companies
                    </p>
                    <div className="relative">
                      {moaFile ? (
                        <div className="flex items-center justify-between bg-neutral-50 rounded-xl px-4 py-3 border border-neutral-200">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary-100">
                              <File className="h-4 w-4 text-primary-500" />
                            </div>
                            <span className="text-sm text-neutral-700 font-medium truncate">
                              {moaFile.name}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => setMoaFile(null)}
                            className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <label className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-neutral-200 hover:border-primary-300 bg-neutral-50 hover:bg-primary-50/50 p-6 cursor-pointer transition-all">
                          <input
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setMoaFile(e.target.files[0] || null)}
                            className="hidden"
                            required={requiresMoa}
                          />
                          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-50 mb-2">
                            <Upload className="h-5 w-5 text-primary-400" />
                          </div>
                          <p className="text-sm text-neutral-600 font-medium">Click to upload MOA document</p>
                          <p className="text-xs text-neutral-400 mt-1">PDF, JPEG, or PNG</p>
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Shareholders */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-neutral-800 uppercase tracking-wider">
                    Shareholders
                  </h2>
                  <button
                    type="button"
                    onClick={addShareholder}
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    Add Shareholder
                  </button>
                </div>

                {shareholders.length === 0 && (
                  <p className="text-sm text-neutral-400 italic">
                    No shareholders added. Click "Add Shareholder" to add one.
                  </p>
                )}

                <div className="space-y-3">
                  {shareholders.map((sh, i) => (
                    <div
                      key={i}
                      className="bg-neutral-50 rounded-xl border border-neutral-200 p-4"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                          Shareholder {i + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() => removeShareholder(i)}
                          className="p-1 rounded-lg text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <Input
                          label="Name"
                          value={sh.name}
                          onChange={(e) => updateShareholder(i, 'name', e.target.value)}
                          placeholder="Full name"
                        />
                        <Input
                          label="IC Number"
                          value={sh.ic_number}
                          onChange={(e) => updateShareholder(i, 'ic_number', e.target.value)}
                          placeholder="e.g. 900101-01-1234"
                        />
                        <Input
                          label="Percentage (%)"
                          type="number"
                          min="0"
                          max="100"
                          step="0.01"
                          value={sh.percentage}
                          onChange={(e) => updateShareholder(i, 'percentage', e.target.value)}
                          placeholder="e.g. 50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="pt-4 border-t border-neutral-100">
                <Button
                  type="submit"
                  loading={submitting}
                  disabled={!companyName || !registrationNumber || !companyType || !ssmFile || (requiresMoa && !moaFile)}
                  className="w-full justify-center"
                >
                  Submit Registration
                </Button>
                <p className="text-center text-xs text-neutral-400 mt-3">
                  Your registration will be reviewed within 1-2 business days.
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
