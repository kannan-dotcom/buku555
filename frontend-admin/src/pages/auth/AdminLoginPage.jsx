import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shield } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { GOOGLE_CLIENT_ID } from '../../lib/supabase'
import { APP_NAME, APP_TAGLINE, ALLOWED_ADMIN_EMAILS } from '../../lib/constants'

export default function AdminLoginPage() {
  const { signInWithIdToken } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const buttonRef = useRef(null)

  const handleCredentialResponse = useCallback(async (response) => {
    setLoading(true)
    setError(null)
    try {
      await signInWithIdToken(response.credential)
      // Navigate explicitly after sign-in + profile are fully loaded
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Google sign-in failed')
      setLoading(false)
    }
  }, [signInWithIdToken, navigate])

  useEffect(() => {
    // Load the Google Identity Services script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleCredentialResponse,
        })
        if (buttonRef.current) {
          window.google.accounts.id.renderButton(buttonRef.current, {
            type: 'standard',
            theme: 'outline',
            size: 'large',
            width: buttonRef.current.offsetWidth,
            text: 'continue_with',
            shape: 'pill',
            logo_alignment: 'left',
          })
        }
      }
    }
    document.head.appendChild(script)
    return () => {
      document.head.removeChild(script)
      if (window.google?.accounts?.id) {
        window.google.accounts.id.cancel()
      }
    }
  }, [handleCredentialResponse])

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

          {/* Google Identity Services rendered button */}
          <div className="flex justify-center">
            <div ref={buttonRef} style={{ minHeight: 44 }}>
              {loading && (
                <div className="flex items-center justify-center h-11 text-sm text-neutral-500">
                  Signing in...
                </div>
              )}
            </div>
          </div>

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
