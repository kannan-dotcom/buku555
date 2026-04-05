import { Link } from 'react-router-dom'
import {
  ArrowRight,
  ScanLine,
  BrainCircuit,
  GitMerge,
  FileBarChart,
  Upload,
  Sparkles,
  RefreshCcw,
  BarChart3,
  HardDrive,
  Coins,
  BellRing,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Users,
  Zap,
  Shield,
} from 'lucide-react'

/* -------------------------------------------------------------------------- */
/*  DATA                                                                       */
/* -------------------------------------------------------------------------- */

const howItWorks = [
  {
    step: '01',
    icon: Upload,
    title: 'Upload or Snap',
    desc: 'Upload receipts, invoices, or bank statements. Our AI reads them instantly.',
    color: '#1978E5',
  },
  {
    step: '02',
    icon: Sparkles,
    title: 'AI Extracts Everything',
    desc: 'GPT-4o extracts merchant, amounts, tax info, and categorizes automatically.',
    color: '#7C3AED',
  },
  {
    step: '03',
    icon: RefreshCcw,
    title: 'Auto-Reconcile',
    desc: 'Bank transactions matched to your ledger entries with intelligent matching.',
    color: '#22C55E',
  },
  {
    step: '04',
    icon: BarChart3,
    title: 'Reports Ready',
    desc: 'Generate cashflow, P&L, and balance sheets with one click.',
    color: '#1978E5',
  },
]

const features = [
  {
    icon: ScanLine,
    title: 'Smart Receipt Scanning',
    desc: 'AI-powered extraction from receipts and invoices. Just snap a photo or upload a PDF -- Buku 555 handles the rest.',
    color: '#1978E5',
    bgLight: '#EBF5FF',
  },
  {
    icon: GitMerge,
    title: 'Bank Reconciliation',
    desc: 'Automatic matching of bank statements to ledger entries. No more hunting through spreadsheets.',
    color: '#7C3AED',
    bgLight: '#F5F3FF',
  },
  {
    icon: HardDrive,
    title: 'Google Drive Sync',
    desc: 'All documents organized automatically in your Google Drive. Every receipt, invoice and statement -- filed and searchable.',
    color: '#22C55E',
    bgLight: '#F0FDF4',
  },
  {
    icon: FileBarChart,
    title: 'Financial Statements',
    desc: 'Generate cashflow, income statement, P&L, and balance sheet reports with a single click.',
    color: '#1978E5',
    bgLight: '#EBF5FF',
  },
  {
    icon: Coins,
    title: 'Multi-Currency Support',
    desc: 'Handle MYR, USD, SGD, INR, AED and more. Automatic exchange rate tracking built in.',
    color: '#7C3AED',
    bgLight: '#F5F3FF',
  },
  {
    icon: BellRing,
    title: 'Weekly Reminders',
    desc: 'Never miss incomplete entries with smart email reminders. Stay on top of your books effortlessly.',
    color: '#22C55E',
    bgLight: '#F0FDF4',
  },
]

const stats = [
  { value: '90%', label: 'Time Saved', sub: 'on data entry', icon: Zap },
  { value: '< 2 min', label: 'Average', sub: 'receipt processing', icon: Clock },
  { value: '160+', label: 'Currencies', sub: 'supported', icon: DollarSign },
]

const comparisonRows = [
  { item: 'Monthly cost', old: 'RM 400 -- 600/mo', buku: 'From RM 0/mo' },
  { item: 'Receipt entry speed', old: '5 -- 10 min each', buku: 'Under 2 minutes' },
  { item: 'Bank reconciliation', old: 'Manual, error-prone', buku: 'AI-automated' },
  { item: 'Reports', old: 'Days to prepare', buku: 'One-click instant' },
  { item: 'Availability', old: 'Business hours only', buku: '24/7 always on' },
]

/* -------------------------------------------------------------------------- */
/*  COMPONENT                                                                  */
/* -------------------------------------------------------------------------- */

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* ================================================================== */}
      {/*  HERO SECTION                                                       */}
      {/* ================================================================== */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(170deg, #F8FAFC 0%, #EBF5FF 40%, #F5F3FF 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-20 left-[-120px] w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: '#1978E5' }} />
        <div className="absolute bottom-10 right-[-80px] w-80 h-80 rounded-full opacity-15 blur-3xl" style={{ background: '#7C3AED' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.07] blur-3xl" style={{ background: '#22C55E' }} />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-20 pb-20 lg:pt-28 lg:pb-28">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left -- Copy */}
            <div className="max-w-xl">
              {/* Pill badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 backdrop-blur
                border border-neutral-200/60 text-sm font-medium text-neutral-600 mb-6 shadow-soft">
                <BrainCircuit className="w-4 h-4" style={{ color: '#7C3AED' }} />
                AI-Powered Accounting Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.1] tracking-tight text-neutral-800">
                AI-Powered Accounting That Works{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(135deg, #1978E5, #7C3AED)' }}
                >
                  While You Sleep
                </span>
              </h1>

              <p className="mt-6 text-lg text-neutral-500 leading-relaxed">
                Stop drowning in receipts and spreadsheets. Buku 555 automates receipt
                scanning, bank reconciliation, and financial reporting&nbsp;&mdash; so you
                can focus on growing your business.
              </p>

              {/* CTAs */}
              <div className="mt-8 flex flex-wrap gap-4">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold
                    text-white rounded-xl shadow-lg transition-all duration-200
                    hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]"
                  style={{ background: 'linear-gradient(135deg, #1978E5, #2563EB)' }}
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5" />
                </Link>
                <a
                  href="#features"
                  className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold
                    rounded-xl border-2 transition-all duration-200
                    hover:bg-neutral-50 active:scale-[0.98]"
                  style={{ color: '#1978E5', borderColor: '#1978E5' }}
                >
                  See How It Works
                  <ChevronRight className="w-5 h-5" />
                </a>
              </div>

              {/* Trust bar */}
              <div className="mt-10 flex items-center gap-3 text-sm text-neutral-500">
                <Shield className="w-4 h-4 text-neutral-400 shrink-0" />
                <span>
                  Trusted by small businesses across{' '}
                  <span className="inline-flex gap-1.5 ml-1 text-lg align-middle">
                    {'\u{1F1F2}\u{1F1FE}'} {'\u{1F1EE}\u{1F1E9}'} {'\u{1F1EE}\u{1F1F3}'} {'\u{1F1E6}\u{1F1EA}'}
                  </span>
                </span>
              </div>
            </div>

            {/* Right -- Product mockup / mascot area */}
            <div className="relative flex items-center justify-center lg:justify-end">
              {/* Decorative ring */}
              <div className="absolute w-[340px] h-[340px] sm:w-[420px] sm:h-[420px] rounded-full border-2 border-dashed opacity-20"
                style={{ borderColor: '#7C3AED' }} />
              <div className="absolute w-[280px] h-[280px] sm:w-[350px] sm:h-[350px] rounded-full opacity-10"
                style={{ background: 'linear-gradient(135deg, #1978E5, #7C3AED)' }} />

              {/* Floating cards */}
              <div className="absolute -top-2 right-4 sm:right-10 bg-white rounded-2xl shadow-card p-3 flex items-center gap-3 animate-float-slow">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#EBF5FF' }}>
                  <ScanLine className="w-5 h-5" style={{ color: '#1978E5' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Receipt scanned</p>
                  <p className="text-xs text-neutral-400">RM 142.50 -- Grab Food</p>
                </div>
              </div>

              <div className="absolute -bottom-2 left-0 sm:left-4 bg-white rounded-2xl shadow-card p-3 flex items-center gap-3 animate-float-slower">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: '#F0FDF4' }}>
                  <CheckCircle2 className="w-5 h-5" style={{ color: '#22C55E' }} />
                </div>
                <div>
                  <p className="text-xs font-semibold text-neutral-800">Auto-reconciled</p>
                  <p className="text-xs text-neutral-400">23 entries matched</p>
                </div>
              </div>

              {/* Mascot image */}
              <div className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 flex items-center justify-center">
                <img
                  src="/assets/mascot_nobg.png"
                  alt="Buku 555 mascot"
                  className="w-full h-full object-contain drop-shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 56" fill="none" className="w-full h-auto" preserveAspectRatio="none">
            <path d="M0 56V28C240 4 480 0 720 12C960 24 1200 48 1440 56V56H0Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  HOW IT WORKS                                                       */}
      {/* ================================================================== */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#1978E5' }}>
              How It Works
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 tracking-tight">
              From receipt to report in{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1978E5, #7C3AED)' }}>
                four simple steps
              </span>
            </h2>
            <p className="mt-4 text-neutral-500 text-lg">
              No accounting degree required. Just upload and let AI do the heavy lifting.
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {howItWorks.map((item, i) => {
              const Icon = item.icon
              return (
                <div key={i} className="relative group">
                  {/* Connector line (desktop) */}
                  {i < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-10 left-[calc(50%+40px)] w-[calc(100%-40px)] h-px bg-neutral-200" />
                  )}
                  <div className="relative bg-white rounded-2xl p-6 border border-neutral-100
                    hover:border-transparent hover:shadow-elevated transition-all duration-300 text-center">
                    {/* Step number */}
                    <span
                      className="inline-block text-xs font-bold tracking-wider mb-4 px-3 py-1 rounded-full"
                      style={{ color: item.color, background: `${item.color}12` }}
                    >
                      STEP {item.step}
                    </span>
                    {/* Icon */}
                    <div
                      className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: `${item.color}14` }}
                    >
                      <Icon className="w-7 h-7" style={{ color: item.color }} />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  KEY FEATURES GRID                                                   */}
      {/* ================================================================== */}
      <section id="features" className="py-20 lg:py-28" style={{ background: '#F8FAFC' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7C3AED' }}>
              Features
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 tracking-tight">
              Everything you need to{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #1978E5)' }}>
                automate your books
              </span>
            </h2>
            <p className="mt-4 text-neutral-500 text-lg">
              Powerful AI tools designed for small business owners, freelancers, and accountants.
            </p>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, i) => {
              const Icon = feat.icon
              return (
                <div
                  key={i}
                  className="group relative bg-white rounded-2xl p-7 border border-neutral-100
                    hover:border-transparent hover:shadow-elevated transition-all duration-300"
                >
                  {/* Icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-5
                      transition-transform duration-300 group-hover:scale-110"
                    style={{ background: feat.bgLight }}
                  >
                    <Icon className="w-6 h-6" style={{ color: feat.color }} />
                  </div>
                  <h3 className="text-lg font-bold text-neutral-800 mb-2">{feat.title}</h3>
                  <p className="text-sm text-neutral-500 leading-relaxed">{feat.desc}</p>
                  {/* Bottom accent bar on hover */}
                  <div
                    className="absolute bottom-0 left-6 right-6 h-0.5 rounded-full scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"
                    style={{ background: feat.color }}
                  />
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  SOCIAL PROOF / STATS                                                */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 tracking-tight">
              Built for businesses that are{' '}
              <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1978E5, #22C55E)' }}>
                tired of manual bookkeeping
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, i) => {
              const Icon = stat.icon
              const colors = ['#1978E5', '#7C3AED', '#22C55E']
              const bgs = ['#EBF5FF', '#F5F3FF', '#F0FDF4']
              return (
                <div
                  key={i}
                  className="relative rounded-2xl p-8 text-center border border-neutral-100
                    hover:shadow-elevated transition-all duration-300 bg-white overflow-hidden"
                >
                  {/* Top accent */}
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl" style={{ background: colors[i] }} />
                  <div
                    className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center mb-5"
                    style={{ background: bgs[i] }}
                  >
                    <Icon className="w-7 h-7" style={{ color: colors[i] }} />
                  </div>
                  <p className="text-4xl font-extrabold tracking-tight mb-1" style={{ color: colors[i] }}>
                    {stat.value}
                  </p>
                  <p className="text-base font-semibold text-neutral-800">{stat.label}</p>
                  <p className="text-sm text-neutral-500">{stat.sub}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  COST COMPARISON TEASER                                              */}
      {/* ================================================================== */}
      <section className="py-20 lg:py-28" style={{ background: 'linear-gradient(170deg, #F8FAFC 0%, #F5F3FF 100%)' }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <p className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: '#7C3AED' }}>
                Cost Comparison
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold text-neutral-800 tracking-tight">
                Why pay RM5,000+/year{' '}
                <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #1978E5)' }}>
                  for a bookkeeper?
                </span>
              </h2>
              <p className="mt-4 text-neutral-500 text-lg">
                See how Buku 555 stacks up against traditional bookkeeping.
              </p>
            </div>

            {/* Comparison table */}
            <div className="bg-white rounded-2xl shadow-card overflow-hidden border border-neutral-100">
              {/* Table header */}
              <div className="grid grid-cols-3 bg-neutral-50 border-b border-neutral-100">
                <div className="p-4 sm:p-5 text-sm font-semibold text-neutral-500" />
                <div className="p-4 sm:p-5 text-sm font-semibold text-neutral-500 text-center">
                  Traditional Bookkeeper
                </div>
                <div className="p-4 sm:p-5 text-center">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold px-3 py-1 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #1978E5, #7C3AED)' }}>
                    Buku 555
                  </span>
                </div>
              </div>

              {/* Rows */}
              {comparisonRows.map((row, i) => (
                <div
                  key={i}
                  className={`grid grid-cols-3 ${i < comparisonRows.length - 1 ? 'border-b border-neutral-50' : ''}`}
                >
                  <div className="p-4 sm:p-5 text-sm font-medium text-neutral-700">
                    {row.item}
                  </div>
                  <div className="p-4 sm:p-5 text-sm text-neutral-400 text-center">
                    {row.old}
                  </div>
                  <div className="p-4 sm:p-5 text-sm font-semibold text-center flex items-center justify-center gap-1.5"
                    style={{ color: '#1978E5' }}>
                    <CheckCircle2 className="w-4 h-4 shrink-0" style={{ color: '#22C55E' }} />
                    {row.buku}
                  </div>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="mt-8 text-center">
              <Link
                to="/why-buku555"
                className="inline-flex items-center gap-2 px-6 py-3 text-base font-semibold
                  rounded-xl border-2 transition-all duration-200
                  hover:bg-neutral-50 active:scale-[0.98]"
                style={{ color: '#7C3AED', borderColor: '#7C3AED' }}
              >
                See Full Comparison
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FINAL CTA                                                           */}
      {/* ================================================================== */}
      <section className="relative py-20 lg:py-28 overflow-hidden" style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)' }}>
        {/* Decorative glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-15 blur-3xl" style={{ background: '#1978E5' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: '#7C3AED' }} />

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />

        <div className="relative mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10
            text-sm font-medium text-white/70 mb-6 backdrop-blur">
            <Zap className="w-4 h-4" style={{ color: '#22C55E' }} />
            Start in under 2 minutes
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Ready to automate{' '}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'linear-gradient(135deg, #1978E5, #7C3AED, #22C55E)' }}>
              your accounting?
            </span>
          </h2>

          <p className="mt-5 text-lg text-neutral-400 max-w-xl mx-auto">
            Join businesses across Southeast Asia and the Middle East that have switched
            to smarter, AI-powered bookkeeping.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-8 py-4 text-base font-bold
                text-white rounded-xl shadow-lg transition-all duration-200
                hover:shadow-xl hover:scale-[1.03] active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #1978E5, #2563EB)' }}
            >
              Get Started Free
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <p className="mt-5 text-sm text-neutral-500 flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            No credit card required. Free for up to 2 users.
          </p>

          {/* Country flags */}
          <div className="mt-8 flex items-center justify-center gap-3 text-2xl">
            {'\u{1F1F2}\u{1F1FE}'} {'\u{1F1EE}\u{1F1E9}'} {'\u{1F1EE}\u{1F1F3}'} {'\u{1F1E6}\u{1F1EA}'}
          </div>
        </div>
      </section>

      {/* ================================================================== */}
      {/*  FLOATING ANIMATION KEYFRAMES (injected via style tag)               */}
      {/* ================================================================== */}
      <style>{`
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes float-slower {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-float-slow {
          animation: float-slow 4s ease-in-out infinite;
        }
        .animate-float-slower {
          animation: float-slower 5s ease-in-out infinite 0.5s;
        }
      `}</style>
    </div>
  )
}
