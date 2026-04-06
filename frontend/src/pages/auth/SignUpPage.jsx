import { useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { APP_NAME } from '../../lib/constants'
import Input from '../../components/ui/Input'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import { Building2, CheckCircle2, AlertCircle } from 'lucide-react'

const COMPANY_CATEGORIES = [
  { value: 'sole_proprietor', label: 'Sole Proprietor' },
  { value: 'partnership', label: 'Partnership' },
  { value: 'sdn_bhd', label: 'Sdn Bhd' },
  { value: 'berhad', label: 'Berhad' },
  { value: 'llp', label: 'LLP (Limited Liability Partnership)' },
  { value: 'enterprise', label: 'Enterprise' },
  { value: 'freelancer', label: 'Freelancer' },
  { value: 'other', label: 'Other' },
]

export default function SignUpPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [companyCategory, setCompanyCategory] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const { error: insertErr } = await supabase.from('leads').insert({
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim() || null,
        company_name: companyName.trim() || null,
        company_category: companyCategory || null,
        source: 'signup',
        status: 'new',
      })
      if (insertErr) throw insertErr
      setSubmitted(true)
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-bg px-6">
        <div className="w-full max-w-md text-center">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 mb-5">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-neutral-800 mb-2">Application Submitted</h2>
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
              Thank you for signing up! Our team will review your application
              and get back to you within 1–2 business days.
            </p>
            <div className="space-y-3">
              <Link
                to="/"
                className="block w-full text-center px-5 py-2.5 text-sm font-medium text-primary-600 bg-primary-50 rounded-xl hover:bg-primary-100 transition-colors"
              >
                Back to Home
              </Link>
              <Link
                to="/login"
                className="block w-full text-center px-5 py-2.5 text-sm font-medium text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/">
            <img src="/assets/logo_full.png" alt={APP_NAME} className="h-12 mx-auto mb-4" />
          </Link>
          <h1 className="text-2xl font-bold text-neutral-800">Get Started with {APP_NAME}</h1>
          <p className="text-neutral-500 mt-2 text-sm leading-relaxed">
            Fill in your details and our team will set up your account.
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Personal Details */}
            <div className="space-y-4">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Your Details
              </h2>
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Ahmad Bin Abdullah"
                required
              />
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. ahmad@company.com"
                required
              />
              <Input
                label="Phone Number"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +60 12-345 6789"
              />
            </div>

            {/* Company Details */}
            <div className="space-y-4 pt-2">
              <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5" />
                Company Details
              </h2>
              <Input
                label="Company Name"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Acme Sdn Bhd"
                required
              />
              <Select
                label="Company Category"
                options={COMPANY_CATEGORIES}
                value={companyCategory}
                onChange={(e) => setCompanyCategory(e.target.value)}
                placeholder="Select category"
                required
              />
            </div>

            {/* Submit */}
            <div className="pt-3">
              <Button
                type="submit"
                loading={submitting}
                disabled={!fullName.trim() || !email.trim() || !companyName.trim() || !companyCategory}
                className="w-full justify-center"
                size="lg"
              >
                Submit Application
              </Button>
              <p className="text-center text-xs text-neutral-400 mt-4 leading-relaxed">
                Your application will be reviewed within 1–2 business days.
                We'll contact you via email once approved.
              </p>
            </div>
          </form>

          {/* Sign in link */}
          <div className="mt-6 pt-5 border-t border-neutral-100 text-center">
            <p className="text-sm text-neutral-500">
              Already have an account?{' '}
              <Link to="/login" className="font-medium text-primary-600 hover:text-primary-700 transition-colors">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
