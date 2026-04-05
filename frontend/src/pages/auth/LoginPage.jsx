import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import Button from '../../components/ui/Button'
import { APP_NAME } from '../../lib/constants'

export default function LoginPage() {
  const { signInWithGoogle } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)
    try {
      await signInWithGoogle()
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-surface-bg">
      {/* Left side - illustration */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden items-center justify-center bg-gradient-to-br from-primary-500 via-accent-500 to-primary-600 p-12">
        {/* Decorative background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-32 -right-20 w-96 h-96 bg-accent-400/20 rounded-full blur-3xl" />
          <div className="absolute top-1/4 right-10 w-40 h-40 bg-primary-300/15 rounded-full blur-2xl" />
          <div className="absolute bottom-1/3 left-8 w-24 h-24 border border-white/10 rounded-2xl rotate-12" />
          <div className="absolute top-16 right-1/4 w-16 h-16 border border-white/10 rounded-xl -rotate-12" />
        </div>

        <div className="relative text-center z-10">
          {/* Mascot with glow */}
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-2xl scale-75 translate-y-4" />
            <img
              src="/assets/mascot_nobg.png"
              alt="Buku 555 mascot"
              className="relative w-80 h-80 object-contain drop-shadow-[0_20px_40px_rgba(0,0,0,0.25)]"
            />
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight">Smart Accounting,</h2>
          <h2 className="text-4xl font-bold text-white leading-tight">Made Simple</h2>
          <p className="text-white/80 mt-4 text-lg max-w-md mx-auto leading-relaxed">
            AI-powered bookkeeping that handles receipts, reconciliation, and financial statements for you.
          </p>
        </div>
      </div>

      {/* Right side - Google sign-in */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <img src="/assets/logo_full.png" alt={APP_NAME} className="h-14 mx-auto mb-4" />
            <p className="text-neutral-500">Sign in to your account</p>
          </div>

          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            {/* Mobile mascot */}
            <div className="flex justify-center mb-6 lg:hidden">
              <img src="/assets/mascot_nobg.png" alt="Buku 555 mascot" className="w-28 h-28 object-contain" />
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-bold text-neutral-800">Welcome to {APP_NAME}</h2>
              <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
                Sign in with your Google account to get started.
                Google Drive access is required for file storage and sync.
              </p>
            </div>

            <Button
              onClick={handleGoogleLogin}
              loading={loading}
              variant="outline"
              className="w-full justify-center"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>

            <p className="text-center text-xs text-neutral-400 mt-6 leading-relaxed">
              By signing in, you agree to our{' '}
              <Link to="/terms" className="text-primary-500 hover:text-primary-600 underline">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-500 hover:text-primary-600 underline">
                Privacy Policy
              </Link>
              . You also grant access to Google Drive, Sheets, and Gmail
              for file storage and invoice delivery.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
