import { useState } from 'react'
import { Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { APP_NAME, APP_TAGLINE, ALLOWED_ADMIN_EMAILS } from '../../lib/constants'
import Button from '../../components/ui/Button'

export default function AdminLoginPage() {
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
    <div className="min-h-screen flex items-center justify-center bg-surface-bg px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src="/assets/logo_full.png" alt={APP_NAME} className="h-14 mx-auto mb-4" />
          <div className="inline-block px-3 py-1 rounded-full bg-primary-50 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-3">
            {APP_TAGLINE}
          </div>
          <p className="text-neutral-500">Internal admin access only</p>
        </div>

        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-neutral-800">Admin Sign In</h2>
            <p className="text-sm text-neutral-500 mt-2 leading-relaxed">
              Sign in with your authorized Google account to access the back office.
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

          {/* Authorized emails */}
          <div className="mt-6 p-3 rounded-xl bg-neutral-50 border border-neutral-100">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="h-3.5 w-3.5 text-neutral-400" />
              <span className="text-xs font-medium text-neutral-500 uppercase tracking-wide">Authorized accounts</span>
            </div>
            <div className="space-y-1">
              {ALLOWED_ADMIN_EMAILS.map((email) => (
                <p key={email} className="text-xs text-neutral-600 font-mono">{email}</p>
              ))}
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400 mt-5 leading-relaxed">
            Only the accounts listed above can access the back office.
            Contact your system administrator to request access.
          </p>
        </div>
      </div>
    </div>
  )
}
