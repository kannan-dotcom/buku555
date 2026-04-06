import { Link } from 'react-router-dom'
import {
  ScanText,
  Languages,
  Tags,
  AlertCircle,
  Landmark,
  FileText,
  Globe,
  GitCompareArrows,
  CalendarCheck,
  DollarSign,
  ListChecks,
  Wallet,
  BrainCircuit,
  FolderOpen,
  Sheet,
  RefreshCcw,
  CloudCog,
  BarChart3,
  TrendingUp,
  PieChart,
  FileSpreadsheet,
  Receipt,
  Repeat,
  Users,
  Mail,
  CreditCard,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Scale,
} from 'lucide-react'

const features = [
  {
    id: 'ai-receipt',
    title: 'AI Receipt & Invoice Processing',
    subtitle: 'Let GPT-4o read your receipts so you never have to.',
    description:
      'Upload any receipt or invoice and our AI instantly extracts every detail. No manual data entry, no errors, no headaches.',
    points: [
      { icon: Sparkles, text: 'GPT-4o powered extraction with near-human accuracy' },
      { icon: ScanText, text: 'Reads merchant name, tax registration, e-invoice numbers, amounts, SST/VAT' },
      { icon: Languages, text: 'Handles receipts in multiple languages -- Malay, English, Hindi, Arabic, Indonesian' },
      { icon: Tags, text: 'Automatic categorization into expense types' },
      { icon: AlertCircle, text: 'Red "Update needed" markers flag incomplete data for review' },
    ],
    gradient: 'from-primary-500 to-accent-500',
    iconBg: 'bg-primary-100 text-primary-600',
    mainIcon: ScanText,
  },
  {
    id: 'bank-statement',
    title: 'Bank Statement Processing',
    subtitle: 'From PDF to structured data in seconds.',
    description:
      'Upload your PDF bank statements and let AI extract every single transaction with perfect accuracy. No more spreadsheet wrangling.',
    points: [
      { icon: FileText, text: 'Upload PDF bank statements from any bank' },
      { icon: Landmark, text: 'AI extracts every transaction: date, description, reference, debit/credit, balance' },
      { icon: Globe, text: 'Supports all major banks across MY, ID, IN, AE' },
    ],
    gradient: 'from-accent-500 to-primary-500',
    iconBg: 'bg-accent-100 text-accent-600',
    mainIcon: Landmark,
  },
  {
    id: 'reconciliation',
    title: 'Intelligent Reconciliation',
    subtitle: 'Your bank and your books, always in sync.',
    description:
      'Our AI matches bank transactions to ledger entries automatically, flagging discrepancies and giving you a confidence score for every match.',
    points: [
      { icon: GitCompareArrows, text: 'Automatic matching of bank transactions to ledger entries' },
      { icon: CalendarCheck, text: 'Date tolerance matching within +/-2 days' },
      { icon: DollarSign, text: 'Amount matching with partial match detection' },
      { icon: ListChecks, text: 'Suspense list for unresolved items' },
      { icon: Wallet, text: 'Cash-in-hand reconciliation' },
      { icon: BrainCircuit, text: 'AI confidence scoring for every match' },
    ],
    gradient: 'from-secondary-500 to-primary-500',
    iconBg: 'bg-secondary-100 text-secondary-600',
    mainIcon: GitCompareArrows,
  },
  {
    id: 'google-drive',
    title: 'Google Drive Integration',
    subtitle: 'Your files, organized and accessible -- always.',
    description:
      'Buku 555 auto-creates a clean folder structure in your Google Drive and uses Google Sheets as your live Account Ledger. Everything syncs in real time.',
    points: [
      { icon: FolderOpen, text: 'Auto-creates organized folders: Receipts, Bank Statements, Invoices, Company Docs, Financial Statements' },
      { icon: Sheet, text: 'Google Sheets as your live Account Ledger' },
      { icon: RefreshCcw, text: 'Real-time sync with push notifications' },
      { icon: CloudCog, text: 'All your files, always accessible from any device' },
    ],
    gradient: 'from-primary-500 to-secondary-500',
    iconBg: 'bg-primary-100 text-primary-600',
    mainIcon: FolderOpen,
  },
  {
    id: 'financial-statements',
    title: 'Financial Statement Generation',
    subtitle: 'Professional financials, generated from your actual data.',
    description:
      'Generate publication-ready financial statements directly from your ledger. No accountant needed for routine reporting.',
    points: [
      { icon: TrendingUp, text: 'Cashflow Statement' },
      { icon: BarChart3, text: 'Income Statement' },
      { icon: PieChart, text: 'Profit & Loss' },
      { icon: Scale, text: 'Balance Sheet' },
      { icon: FileSpreadsheet, text: 'Generated from your actual ledger data' },
      { icon: CheckCircle2, text: 'Professional formatting ready to share' },
    ],
    gradient: 'from-accent-500 to-secondary-500',
    iconBg: 'bg-accent-100 text-accent-600',
    mainIcon: BarChart3,
  },
  {
    id: 'invoice-crm',
    title: 'Invoice Management & Client CRM',
    subtitle: 'Track invoices and clients in one place.',
    description:
      'Send, track, and manage invoices effortlessly. Buku 555 auto-populates your client database and detects recurring invoice patterns.',
    points: [
      { icon: Receipt, text: 'Track sent invoices with real-time status' },
      { icon: Repeat, text: 'Auto-detect recurring invoice patterns' },
      { icon: Users, text: 'Client database auto-populated from invoices' },
      { icon: Mail, text: 'Email dispatch for invoice delivery' },
      { icon: CreditCard, text: 'Payment status tracking' },
    ],
    gradient: 'from-secondary-500 to-accent-500',
    iconBg: 'bg-secondary-100 text-secondary-600',
    mainIcon: Receipt,
  },
]

function FeatureIllustration({ feature }) {
  const MainIcon = feature.mainIcon
  return (
    <div className="relative flex items-center justify-center">
      {/* Background glow */}
      <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-10 rounded-3xl blur-2xl`} />

      {/* Illustration container */}
      <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
        {/* Decorative rings */}
        <div className={`absolute inset-8 border-2 border-dashed rounded-full opacity-10 bg-gradient-to-br ${feature.gradient}`} style={{ borderColor: 'currentColor' }} />
        <div className={`absolute inset-16 border border-dashed rounded-full opacity-[0.07]`} />

        {/* Floating dots */}
        <div className="absolute top-12 right-16 w-3 h-3 rounded-full bg-primary-400 opacity-40 animate-pulse" />
        <div className="absolute bottom-20 left-12 w-2 h-2 rounded-full bg-accent-400 opacity-40 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/3 left-8 w-2.5 h-2.5 rounded-full bg-secondary-400 opacity-30 animate-pulse" style={{ animationDelay: '0.5s' }} />

        {/* Center icon */}
        <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center shadow-elevated`}>
          <MainIcon className="w-14 h-14 text-white" strokeWidth={1.5} />
        </div>

        {/* Orbiting mini icons */}
        {feature.points.slice(0, 4).map((point, idx) => {
          const angle = (idx * 90 + 45) * (Math.PI / 180)
          const radius = 140
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius
          const PointIcon = point.icon
          return (
            <div
              key={idx}
              className="absolute w-10 h-10 rounded-xl bg-white shadow-card border border-neutral-100 flex items-center justify-center"
              style={{
                transform: `translate(${x}px, ${y}px)`,
              }}
            >
              <PointIcon className="w-5 h-5 text-neutral-500" strokeWidth={1.5} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

function FeatureSection({ feature, index }) {
  const isReversed = index % 2 === 1

  return (
    <section id={feature.id} className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isReversed ? 'lg:flex-row-reverse' : ''}`}>
          {/* Text content */}
          <div className={`${isReversed ? 'lg:order-2' : 'lg:order-1'}`}>
            {/* Section badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium mb-6">
              <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${feature.gradient}`} />
              Feature {String(index + 1).padStart(2, '0')}
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4 leading-tight">
              {feature.title}
            </h2>
            <p className="text-lg text-accent-600 font-medium mb-4">
              {feature.subtitle}
            </p>
            <p className="text-neutral-500 text-base leading-relaxed mb-8">
              {feature.description}
            </p>

            {/* Feature points */}
            <ul className="space-y-4">
              {feature.points.map((point, idx) => {
                const PointIcon = point.icon
                return (
                  <li key={idx} className="flex items-start gap-3">
                    <span className={`flex-shrink-0 w-8 h-8 rounded-lg ${feature.iconBg} flex items-center justify-center mt-0.5`}>
                      <PointIcon className="w-4 h-4" strokeWidth={2} />
                    </span>
                    <span className="text-neutral-700 text-sm leading-relaxed pt-1">
                      {point.text}
                    </span>
                  </li>
                )
              })}
            </ul>
          </div>

          {/* Illustration */}
          <div className={`${isReversed ? 'lg:order-1' : 'lg:order-2'}`}>
            <FeatureIllustration feature={feature} />
          </div>
        </div>
      </div>
    </section>
  )
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800">
        {/* Decorative background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary-500/5 rounded-full blur-3xl" />
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-8">
            <Sparkles className="w-4 h-4 text-accent-400" />
            Powered by AI
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Everything You Need to
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              Manage Your Books
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            From receipt scanning to financial statements — all powered by AI.
            Buku 555 handles the tedious work so you can focus on your business.
          </p>

          {/* Quick nav pills */}
          <div className="flex flex-wrap justify-center gap-3">
            {features.map((feature) => {
              const Icon = feature.mainIcon
              return (
                <a
                  key={feature.id}
                  href={`#${feature.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all duration-200"
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="hidden sm:inline">{feature.title.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="sm:hidden">{feature.title.split(' ')[0]}</span>
                </a>
              )
            })}
          </div>
        </div>
      </section>

      {/* Feature Sections */}
      <div className="divide-y divide-neutral-200">
        {features.map((feature, index) => (
          <FeatureSection key={feature.id} feature={feature} index={index} />
        ))}
      </div>

      {/* Bottom CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to simplify your accounting?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Join thousands of businesses that trust Buku 555 to handle their books. Start free today.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-600 font-semibold text-base hover:bg-neutral-50 transition-colors shadow-elevated"
            >
              Start Free
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/pricing"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
