import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  TrendingUp,
  Sparkles,
  LayoutDashboard,
  User,
  Mail,
  Phone,
  Building2,
  Award,
  Globe,
  Clock,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  ShieldCheck,
  Send,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const REGISTRATION_BODIES = [
  'MIA (Malaysia)',
  'ACCA',
  'ISCA (Singapore)',
  'ICAI (India)',
  'AAT',
  'CPA Australia',
  'Other',
]

const COUNTRIES = [
  'Malaysia',
  'Indonesia',
  'India',
  'UAE',
  'Singapore',
  'Other',
]

const SPECIALIZATIONS = [
  'Tax Advisory',
  'Audit',
  'Bookkeeping',
  'Financial Reporting',
  'Payroll',
  'GST/SST/VAT',
  'Company Secretarial',
]

const INITIAL_FORM = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  registration_number: '',
  registration_body: '',
  country: '',
  years_of_experience: '',
  specializations: [],
  website_url: '',
}

export default function AccountantSignupPage() {
  const [form, setForm] = useState({ ...INITIAL_FORM })
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [submitError, setSubmitError] = useState(null)

  const validate = () => {
    const newErrors = {}

    if (!form.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }

    if (!form.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!form.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!form.registration_number.trim()) {
      newErrors.registration_number = 'Professional registration number is required'
    }

    if (!form.registration_body) {
      newErrors.registration_body = 'Registration body is required'
    }

    if (!form.country) {
      newErrors.country = 'Country is required'
    }

    return newErrors
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[name]
        return next
      })
    }
  }

  const handleSpecializationToggle = (spec) => {
    setForm((prev) => {
      const current = prev.specializations
      const updated = current.includes(spec)
        ? current.filter((s) => s !== spec)
        : [...current, spec]
      return { ...prev, specializations: updated }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError(null)

    const validationErrors = validate()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        company_name: form.company_name.trim() || null,
        registration_number: form.registration_number.trim(),
        registration_body: form.registration_body,
        country: form.country,
        years_of_experience: form.years_of_experience
          ? parseInt(form.years_of_experience, 10)
          : null,
        specializations: form.specializations,
        website_url: form.website_url.trim() || null,
      }

      const { error } = await supabase
        .from('accountant_applications')
        .insert(payload)

      if (error) throw error

      setSubmitted(true)
      setForm({ ...INITIAL_FORM })
      setErrors({})
    } catch (err) {
      setSubmitError(
        err.message || 'Something went wrong. Please try again later.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const inputClass = (field) =>
    `w-full rounded-xl border ${
      errors[field]
        ? 'border-red-400 ring-2 ring-red-100 focus:border-red-500 focus:ring-red-200'
        : 'border-neutral-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
    } bg-white px-4 py-3 text-neutral-800 text-sm placeholder-neutral-400 outline-none transition-all duration-200`

  const selectClass = (field) =>
    `${inputClass(field)} appearance-none cursor-pointer`

  const labelClass = 'block text-sm font-semibold text-neutral-700 mb-1.5'

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Grow Your Practice',
      description:
        'Access a pipeline of small businesses looking for accounting support. Get referrals directly from our platform.',
      gradient: 'from-primary-500 to-primary-600',
      iconBg: 'bg-primary-50',
      iconColor: 'text-primary-500',
    },
    {
      icon: Sparkles,
      title: 'AI-Powered Tools',
      description:
        'Let AI handle the data entry while you focus on advisory. Process receipts, reconcile banks, and generate statements in seconds.',
      gradient: 'from-accent-500 to-accent-600',
      iconBg: 'bg-accent-50',
      iconColor: 'text-accent-500',
    },
    {
      icon: LayoutDashboard,
      title: 'Manage Clients Easily',
      description:
        'One dashboard for all your clients. Switch between companies, track progress, and deliver reports faster.',
      gradient: 'from-secondary-500 to-secondary-600',
      iconBg: 'bg-secondary-50',
      iconColor: 'text-secondary-500',
    },
  ]

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/3 right-1/4 w-48 h-48 bg-primary-400/5 rounded-full blur-2xl" />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full px-4 py-1.5 mb-6">
            <ShieldCheck className="w-4 h-4 text-primary-400" />
            <span className="text-sm font-medium text-white/80">
              For Accountants &amp; Bookkeepers
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
            Partner With{' '}
            <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
              Buku 555
            </span>
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
            Join our network of trusted accounting professionals. Manage your
            clients' books with AI-powered tools.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {benefits.map((b) => (
            <div
              key={b.title}
              className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 hover:shadow-elevated transition-shadow duration-300"
            >
              <div
                className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${b.iconBg} mb-4`}
              >
                <b.icon className={`w-6 h-6 ${b.iconColor}`} />
              </div>
              <h3 className="text-lg font-bold text-neutral-800 mb-2">
                {b.title}
              </h3>
              <p className="text-sm text-neutral-500 leading-relaxed">
                {b.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Application Form */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-neutral-800">
            Apply as a Partner
          </h2>
          <p className="mt-3 text-neutral-500">
            Fill out the form below and our team will get in touch.
          </p>
        </div>

        {/* Success message */}
        {submitted && (
          <div className="mb-8 rounded-2xl border border-secondary-200 bg-secondary-50 p-6 text-center">
            <CheckCircle2 className="w-10 h-10 text-secondary-500 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-neutral-800 mb-1">
              Application Submitted!
            </h3>
            <p className="text-sm text-neutral-600 leading-relaxed">
              Our team will review your application and get back to you within
              3-5 business days.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="mt-4 text-sm font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Submit another application
            </button>
          </div>
        )}

        {/* Error banner */}
        {submitError && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{submitError}</p>
          </div>
        )}

        {!submitted && (
          <form
            onSubmit={handleSubmit}
            noValidate
            className="bg-white rounded-2xl border border-neutral-100 shadow-card p-6 sm:p-8 lg:p-10"
          >
            <div className="space-y-6">
              {/* Full Name */}
              <div>
                <label htmlFor="full_name" className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-neutral-400" />
                    Full Name <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="full_name"
                  name="full_name"
                  type="text"
                  value={form.full_name}
                  onChange={handleChange}
                  placeholder="John Doe"
                  className={inputClass('full_name')}
                />
                {errors.full_name && (
                  <p className="mt-1.5 text-xs text-red-500 font-medium">
                    {errors.full_name}
                  </p>
                )}
              </div>

              {/* Email & Phone row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-4 h-4 text-neutral-400" />
                      Email <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="john@example.com"
                    className={inputClass('email')}
                  />
                  {errors.email && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="phone" className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-neutral-400" />
                      Phone <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+60 12-345 6789"
                    className={inputClass('phone')}
                  />
                  {errors.phone && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>

              {/* Company Name */}
              <div>
                <label htmlFor="company_name" className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-neutral-400" />
                    Company / Firm Name{' '}
                    <span className="text-neutral-400 font-normal">
                      (optional)
                    </span>
                  </span>
                </label>
                <input
                  id="company_name"
                  name="company_name"
                  type="text"
                  value={form.company_name}
                  onChange={handleChange}
                  placeholder="ABC Accounting Sdn Bhd"
                  className={inputClass('company_name')}
                />
              </div>

              {/* Registration Number */}
              <div>
                <label htmlFor="registration_number" className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-neutral-400" />
                    Professional Registration Number{' '}
                    <span className="text-red-500">*</span>
                  </span>
                </label>
                <input
                  id="registration_number"
                  name="registration_number"
                  type="text"
                  value={form.registration_number}
                  onChange={handleChange}
                  placeholder="e.g. MIA-12345"
                  className={inputClass('registration_number')}
                />
                <p className="mt-1.5 text-xs text-neutral-400">
                  e.g. MIA membership number, ACCA number, CPA license
                </p>
                {errors.registration_number && (
                  <p className="mt-1 text-xs text-red-500 font-medium">
                    {errors.registration_number}
                  </p>
                )}
              </div>

              {/* Registration Body & Country row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registration_body" className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-neutral-400" />
                      Registration Body{' '}
                      <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="registration_body"
                      name="registration_body"
                      value={form.registration_body}
                      onChange={handleChange}
                      className={selectClass('registration_body')}
                    >
                      <option value="">Select registration body</option>
                      {REGISTRATION_BODIES.map((body) => (
                        <option key={body} value={body}>
                          {body}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                  {errors.registration_body && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.registration_body}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="country" className={labelClass}>
                    <span className="flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-neutral-400" />
                      Country <span className="text-red-500">*</span>
                    </span>
                  </label>
                  <div className="relative">
                    <select
                      id="country"
                      name="country"
                      value={form.country}
                      onChange={handleChange}
                      className={selectClass('country')}
                    >
                      <option value="">Select country</option>
                      {COUNTRIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                  {errors.country && (
                    <p className="mt-1.5 text-xs text-red-500 font-medium">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Years of Experience */}
              <div>
                <label htmlFor="years_of_experience" className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-neutral-400" />
                    Years of Experience{' '}
                    <span className="text-neutral-400 font-normal">
                      (optional)
                    </span>
                  </span>
                </label>
                <input
                  id="years_of_experience"
                  name="years_of_experience"
                  type="number"
                  min="0"
                  max="70"
                  value={form.years_of_experience}
                  onChange={handleChange}
                  placeholder="e.g. 5"
                  className={`${inputClass('years_of_experience')} max-w-[160px]`}
                />
              </div>

              {/* Specializations */}
              <div>
                <p className={labelClass}>Specializations</p>
                <div className="mt-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SPECIALIZATIONS.map((spec) => {
                    const isChecked = form.specializations.includes(spec)
                    return (
                      <label
                        key={spec}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 cursor-pointer transition-all duration-200 ${
                          isChecked
                            ? 'border-primary-300 bg-primary-50 ring-1 ring-primary-200'
                            : 'border-neutral-200 bg-white hover:border-neutral-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleSpecializationToggle(spec)}
                          className="sr-only"
                        />
                        <span
                          className={`flex items-center justify-center w-5 h-5 rounded-md border-2 flex-shrink-0 transition-colors duration-200 ${
                            isChecked
                              ? 'bg-primary-500 border-primary-500'
                              : 'border-neutral-300 bg-white'
                          }`}
                        >
                          {isChecked && (
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </span>
                        <span
                          className={`text-sm ${
                            isChecked
                              ? 'text-neutral-800 font-medium'
                              : 'text-neutral-600'
                          }`}
                        >
                          {spec}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Website URL */}
              <div>
                <label htmlFor="website_url" className={labelClass}>
                  <span className="flex items-center gap-1.5">
                    <LinkIcon className="w-4 h-4 text-neutral-400" />
                    Website URL{' '}
                    <span className="text-neutral-400 font-normal">
                      (optional)
                    </span>
                  </span>
                </label>
                <input
                  id="website_url"
                  name="website_url"
                  type="url"
                  value={form.website_url}
                  onChange={handleChange}
                  placeholder="https://www.yourfirm.com"
                  className={inputClass('website_url')}
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white font-semibold py-3.5 px-6 text-sm shadow-glow-blue transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg
                      className="animate-spin w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Submit Application
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* Below form links */}
        <div className="mt-8 text-center space-y-3">
          <p className="text-sm text-neutral-500">
            Already a partner?{' '}
            <Link
              to="/login"
              className="font-semibold text-primary-500 hover:text-primary-600 transition-colors"
            >
              Sign in here
            </Link>
          </p>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-md mx-auto">
            All applications are reviewed by our team. You will receive an email
            notification once your application is approved.
          </p>
        </div>
      </section>

      {/* Trust indicators */}
      <section className="border-t border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
          <p className="text-sm font-medium text-neutral-500">
            Trusted by accounting professionals across
          </p>
          <div className="mt-3 flex items-center justify-center gap-3 text-2xl">
            <span role="img" aria-label="Malaysia">
              &#x1F1F2;&#x1F1FE;
            </span>
            <span role="img" aria-label="Indonesia">
              &#x1F1EE;&#x1F1E9;
            </span>
            <span role="img" aria-label="India">
              &#x1F1EE;&#x1F1F3;
            </span>
            <span role="img" aria-label="UAE">
              &#x1F1E6;&#x1F1EA;
            </span>
            <span role="img" aria-label="Singapore">
              &#x1F1F8;&#x1F1EC;
            </span>
          </div>
          <p className="mt-4 text-xs text-neutral-400">
            &copy; {new Date().getFullYear()} Buku 555. All rights reserved.
          </p>
        </div>
      </section>
    </div>
  )
}
