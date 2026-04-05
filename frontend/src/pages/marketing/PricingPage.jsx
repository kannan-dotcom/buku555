import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Check,
  Star,
  ArrowRight,
  ChevronDown,
  ScanText,
  Landmark,
  GitCompareArrows,
  BarChart3,
  FolderOpen,
  BookOpen,
  Globe,
  Mail,
  Users,
  Activity,
  UserCheck,
  FileSpreadsheet,
  Code,
  Headphones,
  HelpCircle,
  Zap,
} from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    badge: 'Perfect for solo entrepreneurs',
    badgeColor: 'bg-secondary-50 text-secondary-700 border-secondary-200',
    price: { monthly: 0, annual: 0 },
    annualTotal: null,
    users: 'Up to 2 users',
    cta: 'Get Started Free',
    ctaLink: '/login',
    ctaStyle: 'outline',
    highlighted: false,
    features: [
      { icon: ScanText, text: 'AI Receipt Scanning' },
      { icon: Landmark, text: 'Bank Statement Processing' },
      { icon: GitCompareArrows, text: 'Auto-Reconciliation' },
      { icon: BarChart3, text: 'Financial Statements' },
      { icon: FolderOpen, text: 'Google Drive Sync' },
      { icon: BookOpen, text: 'Account Ledger' },
      { icon: Globe, text: 'Multi-Currency' },
    ],
  },
  {
    name: 'Team',
    badge: 'Most Popular',
    badgeColor: 'bg-accent-50 text-accent-700 border-accent-200',
    price: { monthly: 39, annual: 35.10 },
    annualTotal: 421.20,
    users: 'Up to 5 users',
    cta: 'Start Free Trial',
    ctaLink: '/login',
    ctaStyle: 'primary',
    highlighted: true,
    features: [
      { icon: null, text: 'Everything in Starter, plus:' },
      { icon: Mail, text: 'Priority Email Support' },
      { icon: Users, text: 'Multi-User Collaboration' },
      { icon: Activity, text: 'Team Activity Dashboard' },
    ],
  },
  {
    name: 'Business',
    badge: 'For growing businesses',
    badgeColor: 'bg-primary-50 text-primary-700 border-primary-200',
    price: { monthly: 99, annual: 89.10 },
    annualTotal: 1069.20,
    users: '6+ users (unlimited)',
    cta: 'Contact Sales',
    ctaLink: 'mailto:sales@buku555.online',
    ctaStyle: 'outline',
    highlighted: false,
    features: [
      { icon: null, text: 'Everything in Team, plus:' },
      { icon: UserCheck, text: 'Dedicated Account Manager' },
      { icon: FileSpreadsheet, text: 'Custom Reports' },
      { icon: Code, text: 'API Access' },
      { icon: Headphones, text: 'Priority Support' },
    ],
  },
]

const faqs = [
  {
    question: 'Is there a free trial?',
    answer:
      'Yes! The Starter plan is free forever for up to 2 users. Team and Business plans include a 14-day free trial with full access to all features -- no credit card required.',
  },
  {
    question: 'Can I switch plans?',
    answer:
      'Absolutely. You can upgrade or downgrade your plan at any time from your account settings. Changes take effect on your next billing cycle. If you upgrade mid-cycle, you will only be charged the prorated difference.',
  },
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit and debit cards (Visa, Mastercard, American Express) and bank transfers. For Business plans, we also support invoiced billing.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Absolutely. All data is encrypted at rest and in transit. We use Supabase with row-level security, and your financial documents are stored in your own Google Drive account, giving you full control over your data.',
  },
  {
    question: 'What currencies are supported?',
    answer:
      'Buku 555 supports 10 currencies: MYR, USD, SGD, EUR, GBP, IDR, THB, PHP, INR, and AED. You can process receipts, invoices, and bank statements in any of these currencies.',
  },
  {
    question: 'Do I need a Google account?',
    answer:
      'Yes. Buku 555 uses Google OAuth for secure authentication and Google Drive for file storage and syncing. This means your files are always accessible and backed up in your own Google account.',
  },
]

function FAQItem({ faq }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border border-neutral-200 rounded-xl bg-white overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-neutral-50 transition-colors"
      >
        <span className="text-base font-medium text-neutral-800 pr-4">{faq.question}</span>
        <ChevronDown
          className={`w-5 h-5 text-neutral-400 flex-shrink-0 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="px-6 pb-5 text-neutral-500 text-sm leading-relaxed border-t border-neutral-100 pt-4">
          {faq.answer}
        </div>
      </div>
    </div>
  )
}

function PricingCard({ plan, isAnnual }) {
  const price = isAnnual ? plan.price.annual : plan.price.monthly
  const isFree = plan.price.monthly === 0

  return (
    <div
      className={`relative flex flex-col rounded-2xl border p-8 transition-all duration-300 ${
        plan.highlighted
          ? 'bg-white border-accent-300 shadow-elevated ring-2 ring-accent-200 scale-[1.02] lg:scale-105 z-10'
          : 'bg-white border-neutral-200 shadow-card hover:shadow-elevated'
      }`}
    >
      {/* Badge */}
      <div className="mb-6">
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${plan.badgeColor}`}
        >
          {plan.highlighted && <Star className="w-3 h-3" />}
          {plan.badge}
        </span>
      </div>

      {/* Plan name */}
      <h3 className="text-2xl font-bold text-neutral-800 mb-2">{plan.name}</h3>
      <p className="text-sm text-neutral-500 mb-6">{plan.users}</p>

      {/* Price */}
      <div className="mb-8">
        <div className="flex items-baseline gap-1">
          <span className="text-sm font-medium text-neutral-500">RM</span>
          <span className="text-5xl font-bold text-neutral-800 tracking-tight">
            {isFree ? '0' : price.toFixed(price % 1 === 0 ? 0 : 2)}
          </span>
          <span className="text-neutral-400 text-sm font-medium">/ month</span>
        </div>
        {!isFree && isAnnual && plan.annualTotal && (
          <p className="mt-2 text-xs text-secondary-600 font-medium">
            RM {plan.annualTotal.toLocaleString('en-MY', { minimumFractionDigits: 2 })} billed annually
            <span className="ml-1.5 inline-flex items-center px-1.5 py-0.5 rounded-md bg-secondary-50 text-secondary-700 text-[10px] font-bold">
              SAVE 10%
            </span>
          </p>
        )}
        {isFree && (
          <p className="mt-2 text-xs text-secondary-600 font-medium">Free forever</p>
        )}
        {!isFree && !isAnnual && (
          <p className="mt-2 text-xs text-neutral-400">
            Switch to annual to save 10%
          </p>
        )}
      </div>

      {/* CTA */}
      {plan.ctaStyle === 'primary' ? (
        <Link
          to={plan.ctaLink}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-accent-500 to-accent-600 text-white font-semibold text-sm hover:from-accent-600 hover:to-accent-700 transition-all shadow-glow-purple mb-8"
        >
          {plan.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      ) : (
        <Link
          to={plan.ctaLink}
          className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-neutral-200 text-neutral-700 font-semibold text-sm hover:border-primary-300 hover:text-primary-600 hover:bg-primary-50 transition-all mb-8"
        >
          {plan.cta}
          <ArrowRight className="w-4 h-4" />
        </Link>
      )}

      {/* Features list */}
      <div className="flex-1">
        <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-4">
          What's included
        </p>
        <ul className="space-y-3">
          {plan.features.map((feature, idx) => {
            const Icon = feature.icon
            if (!Icon) {
              return (
                <li key={idx} className="text-sm font-semibold text-neutral-600 pt-1">
                  {feature.text}
                </li>
              )
            }
            return (
              <li key={idx} className="flex items-center gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-secondary-50 flex items-center justify-center">
                  <Check className="w-3 h-3 text-secondary-600" strokeWidth={3} />
                </span>
                <span className="text-sm text-neutral-600">{feature.text}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false)

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800">
        {/* Decorative background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-accent-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-[400px] h-[400px] bg-primary-500/10 rounded-full blur-3xl" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
              backgroundSize: '60px 60px',
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-sm text-white/80 mb-8">
            <Zap className="w-4 h-4 text-secondary-400" />
            No hidden fees
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6">
            Simple, Transparent
            <br />
            <span className="bg-gradient-to-r from-primary-400 via-accent-400 to-secondary-400 bg-clip-text text-transparent">
              Pricing
            </span>
          </h1>

          <p className="text-lg md:text-xl text-neutral-300 max-w-xl mx-auto leading-relaxed">
            Start free. Scale as you grow. No surprise charges, ever.
          </p>
        </div>
      </section>

      {/* Billing Toggle + Pricing Cards */}
      <section className="relative -mt-8 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center mb-12">
            <div className="inline-flex items-center gap-3 bg-white rounded-full shadow-card border border-neutral-200 px-2 py-2">
              <button
                onClick={() => setIsAnnual(false)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                  !isAnnual
                    ? 'bg-neutral-800 text-white shadow-soft'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setIsAnnual(true)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isAnnual
                    ? 'bg-neutral-800 text-white shadow-soft'
                    : 'text-neutral-500 hover:text-neutral-700'
                }`}
              >
                Annual
                <span className="px-2 py-0.5 rounded-full bg-secondary-100 text-secondary-700 text-[10px] font-bold">
                  -10%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-start">
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Note */}
      <section className="py-12 border-t border-neutral-200">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-neutral-500 text-sm leading-relaxed">
            All plans include unlimited receipts, bank statements, and financial statement generation.
            The Starter plan supports up to 2 users and is free forever.
            Need a custom plan for your enterprise? <Link to="mailto:sales@buku555.online" className="text-primary-500 hover:text-primary-600 font-medium">Talk to our sales team</Link>.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 text-neutral-600 text-xs font-medium mb-4">
              <HelpCircle className="w-3.5 h-3.5" />
              FAQ
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-800 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-neutral-500 text-base">
              Got questions? We have answers.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQItem key={index} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600">
        {/* Decorative shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-60 h-60 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-accent-400/20 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Still have questions?
          </h2>
          <p className="text-white/80 text-lg mb-10 max-w-xl mx-auto">
            Our team is here to help you find the perfect plan for your business.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="mailto:support@buku555.online"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-600 font-semibold text-base hover:bg-neutral-50 transition-colors shadow-elevated"
            >
              <Mail className="w-5 h-5" />
              Contact Us
            </a>
            <Link
              to="/features"
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white/10 border border-white/20 text-white font-semibold text-base hover:bg-white/20 transition-colors"
            >
              Explore Features
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
