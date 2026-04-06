import { useState, useEffect } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Menu, X, ArrowRight, Linkedin, Twitter, Facebook, Instagram } from 'lucide-react'

const navLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Why Buku 555', href: '/why-buku555' },
  { label: 'For Accountants', href: '/for-accountants' },
  { label: 'Contact', href: '/contact' },
]

const footerColumns = [
  {
    title: 'Product',
    links: [
      { label: 'Features', href: '/#features' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'Why Buku 555', href: '/why-buku555' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Careers', href: '/careers' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Service', href: '/terms' },
    ],
  },
]

const countries = [
  { flag: '\u{1F1F2}\u{1F1FE}', name: 'Malaysia' },
  { flag: '\u{1F1EE}\u{1F1E9}', name: 'Indonesia' },
  { flag: '\u{1F1EE}\u{1F1F3}', name: 'India' },
  { flag: '\u{1F1E6}\u{1F1EA}', name: 'UAE' },
]

export default function MarketingLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ===== NAVBAR ===== */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-md shadow-soft'
            : 'bg-white/80 backdrop-blur-sm'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 shrink-0">
              <img
                src="/assets/logo_full.png"
                alt="Buku 555"
                className="h-8 sm:h-9 w-auto"
              />
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.href}
                  className="px-3 py-2 text-sm font-medium text-neutral-600 rounded-lg
                    hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Desktop actions */}
            <div className="hidden lg:flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-neutral-700
                  hover:text-neutral-900 transition-colors duration-200"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold
                  text-white rounded-xl transition-all duration-200
                  hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #1978E5, #2563EB)' }}
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100
                transition-colors duration-200"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="fixed inset-0 top-16 z-40 lg:hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-neutral-900/20 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Menu panel */}
            <div className="relative bg-white border-t border-neutral-100 shadow-elevated
              max-h-[calc(100vh-4rem)] overflow-y-auto">
              <div className="px-4 py-4 space-y-1">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="block px-4 py-3 text-base font-medium text-neutral-700
                      rounded-xl hover:bg-neutral-50 hover:text-neutral-900
                      transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-4 mt-4 border-t border-neutral-100 space-y-3 px-4">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-2.5 text-sm font-medium
                      text-neutral-700 rounded-xl border border-neutral-200
                      hover:bg-neutral-50 transition-colors duration-200"
                  >
                    Login
                  </Link>
                  <Link
                    to="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="block w-full text-center py-3 text-sm font-semibold
                      text-white rounded-xl transition-all duration-200 hover:shadow-lg"
                    style={{ background: 'linear-gradient(135deg, #1978E5, #2563EB)' }}
                  >
                    Get Started Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 pt-16 lg:pt-18">
        <Outlet />
      </main>

      {/* ===== FOOTER ===== */}
      <footer className="bg-neutral-900 text-white">
        {/* Top gradient border */}
        <div className="h-1" style={{ background: 'linear-gradient(90deg, #1978E5, #7C3AED, #22C55E)' }} />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
          {/* Upper footer */}
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
            {/* Brand column */}
            <div className="lg:col-span-2 space-y-5">
              <Link to="/" className="inline-block">
                <img
                  src="/assets/logo_full.png"
                  alt="Buku 555"
                  className="h-8 w-auto brightness-0 invert opacity-90"
                />
              </Link>
              <p className="text-neutral-400 text-sm leading-relaxed max-w-sm">
                AI-powered accounting that automates receipt scanning, bank reconciliation,
                and financial reporting for growing businesses.
              </p>
              <p className="text-neutral-500 text-sm">
                A product by{' '}
                <span className="text-neutral-300 font-medium">Synergy Tap</span>
              </p>

              {/* Social icons */}
              <div className="flex items-center gap-3 pt-2">
                {[Linkedin, Twitter, Facebook, Instagram].map((Icon, i) => (
                  <a
                    key={i}
                    href="#"
                    className="flex items-center justify-center w-9 h-9 rounded-lg
                      bg-neutral-800 text-neutral-400 hover:bg-neutral-700
                      hover:text-white transition-all duration-200"
                    aria-label="Social link"
                  >
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>

            {/* Link columns */}
            {footerColumns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                  {col.title}
                </h4>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.href}
                        className="text-sm text-neutral-400 hover:text-white
                          transition-colors duration-200"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>

                {/* Countries section under the last column */}
                {col.title === 'Legal' && (
                  <div className="mt-8">
                    <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 mb-4">
                      Countries
                    </h4>
                    <div className="flex items-center gap-3 flex-wrap">
                      {countries.map((c) => (
                        <span
                          key={c.name}
                          className="text-2xl cursor-default"
                          title={c.name}
                          role="img"
                          aria-label={c.name}
                        >
                          {c.flag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Divider */}
          <div className="mt-14 pt-8 border-t border-neutral-800">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-neutral-500">
                &copy; 2026 Synergy Tap. All rights reserved.
              </p>
              <div className="flex items-center gap-6">
                <Link
                  to="/privacy"
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                >
                  Privacy
                </Link>
                <Link
                  to="/terms"
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                >
                  Terms
                </Link>
                <a
                  href="https://buku555.online"
                  className="text-sm text-neutral-500 hover:text-neutral-300 transition-colors duration-200"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  buku555.online
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
