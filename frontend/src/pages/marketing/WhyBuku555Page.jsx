import { Link } from 'react-router-dom'
import {
  Clock,
  ShieldCheck,
  FolderOpen,
  BarChart3,
  Globe,
  GraduationCap,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  User,
  ShoppingBag,
  Briefcase,
  Rocket,
  ArrowRight,
  Quote,
  Zap,
} from 'lucide-react'

const comparisonData = [
  {
    feature: 'Annual Cost',
    bookkeeper: 'RM 5,000 - RM 12,000',
    buku555: 'From RM 0 (Free)',
    buku555Highlight: true,
  },
  {
    feature: 'Receipt Processing',
    bookkeeper: 'Manual, 5-10 min each',
    buku555: 'AI-powered, < 2 min',
    buku555Highlight: true,
  },
  {
    feature: 'Bank Reconciliation',
    bookkeeper: 'Weekly/Monthly, manual',
    buku555: 'Automatic, instant',
    buku555Highlight: true,
  },
  {
    feature: 'Financial Reports',
    bookkeeper: 'On request, days wait',
    buku555: 'Generated in seconds',
    buku555Highlight: true,
  },
  {
    feature: 'Data Entry Errors',
    bookkeeper: 'Human error rate ~5%',
    buku555: 'AI accuracy 95%+',
    buku555Highlight: true,
  },
  {
    feature: 'Availability',
    bookkeeper: 'Business hours only',
    buku555: '24/7, works while you sleep',
    buku555Highlight: true,
  },
  {
    feature: 'Scaling Cost',
    bookkeeper: 'Proportional to volume',
    buku555: 'Fixed monthly price',
    buku555Highlight: true,
  },
  {
    feature: 'Multi-Currency',
    bookkeeper: 'Extra charges',
    buku555: 'Built-in, 160+ currencies',
    buku555Highlight: true,
  },
]

const personas = [
  {
    icon: User,
    title: 'Solo Entrepreneurs',
    description: 'You wear every hat. Let AI handle the accounting one.',
    gradient: 'from-primary-500 to-primary-600',
  },
  {
    icon: ShoppingBag,
    title: 'Small Retail Businesses',
    description: 'Hundreds of receipts per month? We eat those for breakfast.',
    gradient: 'from-accent-500 to-accent-600',
  },
  {
    icon: Briefcase,
    title: 'Freelancers & Consultants',
    description: 'Track invoices, expenses, and taxes without the headache.',
    gradient: 'from-primary-500 to-accent-500',
  },
  {
    icon: Rocket,
    title: 'Growing Startups',
    description: 'From 2 to 20 employees, your books scale with you.',
    gradient: 'from-accent-500 to-primary-500',
  },
]

const benefits = [
  {
    icon: Clock,
    title: 'Save 90% of time on manual data entry',
    description:
      'AI extracts data from receipts, invoices, and bank statements automatically so you can focus on growing your business.',
  },
  {
    icon: ShieldCheck,
    title: 'Reduce errors with AI-powered extraction',
    description:
      'Our AI achieves 95%+ accuracy on data extraction, eliminating costly human mistakes in your books.',
  },
  {
    icon: FolderOpen,
    title: 'Always audit-ready with organized Google Drive',
    description:
      'Every document is automatically filed and indexed in your own Google Drive, ready for any audit or review.',
  },
  {
    icon: BarChart3,
    title: 'Real-time financial visibility',
    description:
      'Generate profit & loss statements, balance sheets, and cash flow reports at the click of a button.',
  },
  {
    icon: Globe,
    title: 'Multi-country compliance (MY, ID, IN, AE)',
    description:
      'Built-in support for tax regulations and reporting requirements across Malaysia, Indonesia, India, and the UAE.',
  },
  {
    icon: GraduationCap,
    title: 'No accounting degree required',
    description:
      'Buku 555 guides you through every step. If you can upload a photo, you can do your own bookkeeping.',
  },
]

export default function WhyBuku555Page() {
  return (
    <div className="min-h-screen bg-white">
      {/* ============================================================ */}
      {/* HERO SECTION */}
      {/* ============================================================ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary-500/10 blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-accent-500/10 blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 lg:py-32">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 mb-8">
              <Zap className="w-4 h-4 text-primary-400" />
              <span className="text-sm font-medium text-primary-300">
                AI-Powered Accounting
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight">
              Why Smart Businesses Choose{' '}
              <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                Buku 555
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed">
              The smarter, faster, cheaper way to manage your books
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/signup"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/pricing"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl border border-neutral-600 text-neutral-200 font-semibold text-lg hover:bg-neutral-700/50 transition-all duration-200"
              >
                View Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* THE PROBLEM SECTION */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-50 border border-red-200 mb-6">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium text-red-700">
                The Problem
              </span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800">
              Traditional bookkeeping is broken
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Small businesses deserve better than expensive, error-prone, manual
              bookkeeping.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {[
              {
                text: 'Hiring a bookkeeper costs RM 5,000 \u2014 RM 12,000 per year',
                subtext: 'A huge overhead for micro and small businesses.',
              },
              {
                text: "Most small businesses can't justify the expense",
                subtext:
                  'So they either ignore their books or do it themselves, poorly.',
              },
              {
                text: 'Manual data entry is slow, error-prone, and soul-crushing',
                subtext:
                  'Hours spent keying in numbers that an AI can extract in seconds.',
              },
              {
                text: 'Receipts pile up, reconciliation is delayed, reports are always late',
                subtext:
                  'By the time you see your numbers, the damage is already done.',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex gap-4 p-6 rounded-2xl bg-white border border-neutral-200 shadow-soft hover:shadow-card transition-shadow duration-200"
              >
                <div className="flex-shrink-0 mt-0.5">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
                <div>
                  <p className="font-semibold text-neutral-800">{item.text}</p>
                  <p className="mt-1 text-sm text-neutral-500">
                    {item.subtext}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* COST COMPARISON TABLE */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800">
              See the difference
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Buku 555 delivers more for a fraction of the cost of a traditional
              bookkeeper.
            </p>
          </div>

          {/* Desktop table */}
          <div className="hidden md:block max-w-4xl mx-auto">
            <div className="rounded-2xl border border-neutral-200 overflow-hidden shadow-card">
              <table className="w-full">
                <thead>
                  <tr className="bg-neutral-50">
                    <th className="text-left px-6 py-5 text-sm font-semibold text-neutral-600 w-1/3">
                      Feature
                    </th>
                    <th className="text-left px-6 py-5 text-sm font-semibold text-neutral-600 w-1/3">
                      Traditional Bookkeeper
                    </th>
                    <th className="text-left px-6 py-5 w-1/3">
                      <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600">
                        <Zap className="w-4 h-4" />
                        Buku 555
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {comparisonData.map((row, idx) => (
                    <tr
                      key={idx}
                      className={`border-t border-neutral-100 ${
                        idx % 2 === 0 ? 'bg-white' : 'bg-neutral-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 text-sm font-medium text-neutral-700">
                        {row.feature}
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-500">
                        {row.bookkeeper}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 bg-primary-50 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4 text-primary-500" />
                          {row.buku555}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-4 max-w-lg mx-auto">
            {comparisonData.map((row, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-neutral-200 overflow-hidden shadow-soft"
              >
                <div className="px-4 py-3 bg-neutral-50 border-b border-neutral-100">
                  <p className="text-sm font-semibold text-neutral-700">
                    {row.feature}
                  </p>
                </div>
                <div className="px-4 py-3 space-y-2">
                  <div className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-neutral-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-neutral-500">
                      {row.bookkeeper}
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm font-medium text-primary-700">
                      {row.buku555}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* WHO IS BUKU 555 FOR? */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800">
              Who is Buku 555 for?
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Built for businesses that need professional bookkeeping without the
              professional price tag.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {personas.map((persona, idx) => {
              const IconComponent = persona.icon
              return (
                <div
                  key={idx}
                  className="group relative rounded-2xl bg-white border border-neutral-200 p-6 hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${persona.gradient} flex items-center justify-center mb-5 shadow-lg`}
                  >
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">
                    {persona.title}
                  </h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">
                    {persona.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* KEY BENEFITS */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800">
              Key benefits
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Everything you need to keep your books in order, powered by AI.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {benefits.map((benefit, idx) => {
              const IconComponent = benefit.icon
              return (
                <div key={idx} className="flex gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                      <IconComponent className="w-6 h-6 text-primary-500" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-neutral-800 mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* TESTIMONIAL */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-primary-500 to-accent-500">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative text-center">
            <Quote className="w-12 h-12 text-white/20 mx-auto mb-6" />
            <blockquote className="text-xl sm:text-2xl lg:text-3xl font-medium text-white leading-relaxed">
              &ldquo;We saved over 15 hours per month since switching to Buku
              555. Our receipts are organized, reconciliation happens
              automatically, and I can generate reports whenever the bank
              asks.&rdquo;
            </blockquote>
            <div className="mt-8">
              <div className="w-12 h-12 rounded-full bg-white/20 mx-auto flex items-center justify-center mb-3">
                <User className="w-6 h-6 text-white" />
              </div>
              <p className="text-white font-semibold">
                &mdash; Small Business Owner, Kuala Lumpur
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================ */}
      {/* BOTTOM CTA */}
      {/* ============================================================ */}
      <section className="py-16 sm:py-20 lg:py-24 bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Start saving time and money today
          </h2>
          <p className="text-lg text-neutral-400 mb-10 max-w-2xl mx-auto">
            Join thousands of smart businesses that trust Buku 555 to handle
            their books. No credit card required.
          </p>
          <Link
            to="/signup"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-primary-500 text-white font-semibold text-lg hover:bg-primary-600 transition-all duration-200 shadow-lg shadow-primary-500/25 hover:shadow-xl hover:shadow-primary-500/30"
          >
            Get Started Free &mdash; No credit card required
            <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="mt-6 text-sm text-neutral-500">
            Have questions?{' '}
            <Link
              to="/contact"
              className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
            >
              Contact us
            </Link>{' '}
            or check out our{' '}
            <Link
              to="/pricing"
              className="text-primary-400 hover:text-primary-300 underline underline-offset-2"
            >
              pricing plans
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  )
}
