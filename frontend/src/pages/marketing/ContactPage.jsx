import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Mail,
  Globe,
  Clock,
  Calendar,
  Send,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  MessageSquare,
  HelpCircle,
  Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const COUNTRIES = [
  { value: '', label: 'Select your country' },
  { value: 'Malaysia', label: 'Malaysia' },
  { value: 'Indonesia', label: 'Indonesia' },
  { value: 'India', label: 'India' },
  { value: 'UAE', label: 'UAE' },
  { value: 'Other', label: 'Other' },
]

const initialFormState = {
  full_name: '',
  email: '',
  phone: '',
  company_name: '',
  country: '',
  message: '',
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export default function ContactPage() {
  const [formData, setFormData] = useState(initialFormState)
  const [errors, setErrors] = useState({})
  const [touched, setTouched] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitSuccess, setSubmitSuccess] = useState(false)
  const [submitError, setSubmitError] = useState('')

  function validate(data) {
    const newErrors = {}

    if (!data.full_name.trim()) {
      newErrors.full_name = 'Full name is required.'
    }

    if (!data.email.trim()) {
      newErrors.email = 'Email address is required.'
    } else if (!validateEmail(data.email.trim())) {
      newErrors.email = 'Please enter a valid email address.'
    }

    return newErrors
  }

  function handleChange(e) {
    const { name, value } = e.target
    const updated = { ...formData, [name]: value }
    setFormData(updated)

    // Clear error for this field on change if it was touched
    if (touched[name]) {
      const fieldErrors = validate(updated)
      setErrors((prev) => {
        const next = { ...prev }
        if (fieldErrors[name]) {
          next[name] = fieldErrors[name]
        } else {
          delete next[name]
        }
        return next
      })
    }
  }

  function handleBlur(e) {
    const { name } = e.target
    setTouched((prev) => ({ ...prev, [name]: true }))
    const fieldErrors = validate(formData)
    setErrors((prev) => {
      const next = { ...prev }
      if (fieldErrors[name]) {
        next[name] = fieldErrors[name]
      } else {
        delete next[name]
      }
      return next
    })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setSubmitError('')

    // Validate all fields
    const allTouched = {}
    Object.keys(formData).forEach((k) => (allTouched[k] = true))
    setTouched(allTouched)

    const validationErrors = validate(formData)
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length > 0) {
      return
    }

    setSubmitting(true)

    try {
      const { error } = await supabase.from('leads').insert({
        full_name: formData.full_name.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim() || null,
        company_name: formData.company_name.trim() || null,
        country: formData.country || null,
        message: formData.message.trim() || null,
      })

      if (error) throw error

      setSubmitSuccess(true)
      setFormData(initialFormState)
      setTouched({})
      setErrors({})

      // Auto-hide success message after 8 seconds
      setTimeout(() => setSubmitSuccess(false), 8000)
    } catch (err) {
      console.error('Lead submission error:', err)
      setSubmitError(
        'Something went wrong. Please try again or email us directly at hello@buku555.online.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  const hasError = (field) => touched[field] && errors[field]

  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <MessageSquare className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">
                Get in Touch
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Let&apos;s Talk
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              Whether you&apos;re curious about features, pricing, or just want
              to say hello &mdash; we&apos;d love to hear from you.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* CONTACT FORM + INFO */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            {/* LEFT COLUMN — Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-card p-6 sm:p-8">
                <h2 className="text-2xl font-bold text-neutral-800 mb-1">
                  Send us a message
                </h2>
                <p className="text-neutral-500 mb-8">
                  Fill in the form below and we will get back to you within 24
                  hours.
                </p>

                {/* Success message */}
                {submitSuccess && (
                  <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-green-800">
                        Message sent successfully!
                      </p>
                      <p className="text-sm text-green-700 mt-0.5">
                        Thanks! We&apos;ll get back to you within 24 hours.
                      </p>
                    </div>
                  </div>
                )}

                {/* Error message */}
                {submitError && (
                  <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-200">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-red-800">
                        Submission failed
                      </p>
                      <p className="text-sm text-red-700 mt-0.5">
                        {submitError}
                      </p>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} noValidate>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Full Name */}
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="full_name"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Full Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="full_name"
                        name="full_name"
                        value={formData.full_name}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-200 outline-none ${
                          hasError('full_name')
                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                        }`}
                      />
                      {hasError('full_name') && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.full_name}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="email"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        placeholder="john@company.com"
                        className={`w-full px-4 py-3 rounded-xl border text-sm transition-colors duration-200 outline-none ${
                          hasError('email')
                            ? 'border-red-400 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                            : 'border-neutral-300 bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-100'
                        }`}
                      />
                      {hasError('email') && (
                        <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5" />
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Phone */}
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="phone"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Phone{' '}
                        <span className="text-neutral-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+60 12-345 6789"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm transition-colors duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>

                    {/* Company Name */}
                    <div className="sm:col-span-1">
                      <label
                        htmlFor="company_name"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Company Name{' '}
                        <span className="text-neutral-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <input
                        type="text"
                        id="company_name"
                        name="company_name"
                        value={formData.company_name}
                        onChange={handleChange}
                        placeholder="Acme Sdn Bhd"
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm transition-colors duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                      />
                    </div>

                    {/* Country */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="country"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Country{' '}
                        <span className="text-neutral-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <select
                        id="country"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm transition-colors duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 appearance-none"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 0.75rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.25em 1.25em',
                        }}
                      >
                        {COUNTRIES.map((c) => (
                          <option key={c.value} value={c.value}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Message */}
                    <div className="sm:col-span-2">
                      <label
                        htmlFor="message"
                        className="block text-sm font-medium text-neutral-700 mb-1.5"
                      >
                        Message{' '}
                        <span className="text-neutral-400 font-normal">
                          (optional)
                        </span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Tell us how we can help..."
                        className="w-full px-4 py-3 rounded-xl border border-neutral-300 bg-white text-sm transition-colors duration-200 outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100 resize-y"
                      />
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="mt-6">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 rounded-xl bg-primary-500 text-white font-semibold text-sm hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/20 hover:shadow-xl hover:shadow-primary-500/25 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* RIGHT COLUMN — Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Email */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-primary-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      Email
                    </h3>
                    <a
                      href="mailto:hello@buku555.online"
                      className="text-sm text-primary-600 hover:text-primary-700 underline underline-offset-2"
                    >
                      hello@buku555.online
                    </a>
                  </div>
                </div>
              </div>

              {/* Operating Countries */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center flex-shrink-0">
                    <Globe className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-2">
                      Operating Countries
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { flag: '\uD83C\uDDF2\uD83C\uDDFE', name: 'Malaysia' },
                        { flag: '\uD83C\uDDEE\uD83C\uDDE9', name: 'Indonesia' },
                        { flag: '\uD83C\uDDEE\uD83C\uDDF3', name: 'India' },
                        { flag: '\uD83C\uDDE6\uD83C\uDDEA', name: 'UAE' },
                      ].map((c) => (
                        <span
                          key={c.name}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-neutral-50 border border-neutral-200 text-sm text-neutral-700"
                        >
                          <span className="text-base">{c.flag}</span>
                          {c.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Response Time */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      Response Time
                    </h3>
                    <p className="text-sm text-neutral-500">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>
              </div>

              {/* Office Hours */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-soft p-6">
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-5 h-5 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      Office Hours
                    </h3>
                    <p className="text-sm text-neutral-500">
                      Mon&ndash;Fri, 9AM&ndash;6PM (MYT, GMT+8)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* FAQ TEASER */}
      {/* ============================================================ */}
      <section className="py-12 sm:py-16 bg-white border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            <Link
              to="/pricing"
              className="group flex items-start gap-4 p-6 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-primary-50 hover:border-primary-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-200 transition-colors">
                <HelpCircle className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                  Looking for pricing?
                </p>
                <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1">
                  View our plans
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>

            <Link
              to="/for-accountants"
              className="group flex items-start gap-4 p-6 rounded-2xl border border-neutral-200 bg-neutral-50 hover:bg-accent-50 hover:border-accent-200 transition-all duration-200"
            >
              <div className="w-10 h-10 rounded-lg bg-accent-100 flex items-center justify-center flex-shrink-0 group-hover:bg-accent-200 transition-colors">
                <Users className="w-5 h-5 text-accent-600" />
              </div>
              <div>
                <p className="font-semibold text-neutral-800 group-hover:text-accent-700 transition-colors">
                  Want to partner as an accountant?
                </p>
                <p className="text-sm text-neutral-500 mt-0.5 flex items-center gap-1">
                  Learn about our partner program
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </p>
              </div>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
