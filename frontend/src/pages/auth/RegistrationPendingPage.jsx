import { useState, useEffect } from 'react'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import { APP_NAME } from '../../lib/constants'
import { Clock, AlertTriangle, LogOut } from 'lucide-react'

export default function RegistrationPendingPage() {
  const { user, profile, signOut } = useAuth()
  const [status, setStatus] = useState('pending')
  const [rejectionReason, setRejectionReason] = useState(null)

  // Poll for status change every 30 seconds
  useEffect(() => {
    const check = async () => {
      const { data } = await supabase
        .from('company_registrations')
        .select('status, rejection_reason')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      if (data?.status === 'approved') {
        // Refresh the whole page to re-trigger auth flow
        window.location.href = '/dashboard'
      } else if (data?.status === 'rejected') {
        setStatus('rejected')
        setRejectionReason(data.rejection_reason)
      }
    }
    check()
    const interval = setInterval(check, 30000)
    return () => clearInterval(interval)
  }, [user.id])

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch {
      // Silently fail, page will redirect
    }
  }

  return (
    <div className="min-h-screen bg-surface-bg">
      {/* Top bar */}
      <div className="border-b border-neutral-100 bg-white">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/logo_full.png" alt={APP_NAME} className="h-8" />
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-neutral-500">{profile?.email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-700 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      </div>

      {/* Status content */}
      <div className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 text-center">
            {status === 'pending' && (
              <>
                {/* Pulsing clock icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 mb-6">
                  <div className="animate-pulse">
                    <Clock className="h-10 w-10 text-amber-500" />
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-neutral-800 mb-3">
                  Registration Under Review
                </h1>
                <p className="text-neutral-500 leading-relaxed">
                  Your company registration is being reviewed by our team.
                  You'll be notified once approved.
                </p>

                <div className="mt-8 p-4 rounded-xl bg-neutral-50 border border-neutral-100">
                  <p className="text-xs text-neutral-400">
                    This page checks automatically every 30 seconds.
                    You can also close this page and come back later.
                  </p>
                </div>
              </>
            )}

            {status === 'rejected' && (
              <>
                {/* Alert icon */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-50 mb-6">
                  <AlertTriangle className="h-10 w-10 text-red-500" />
                </div>

                <h1 className="text-2xl font-bold text-neutral-800 mb-3">
                  Registration Rejected
                </h1>
                <p className="text-neutral-500 leading-relaxed mb-6">
                  Unfortunately, your registration could not be approved.
                  Please review the reason below and re-submit.
                </p>

                {/* Rejection reason */}
                {rejectionReason && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-left">
                    <p className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-1">
                      Reason
                    </p>
                    <p className="text-sm text-red-700 leading-relaxed">
                      {rejectionReason}
                    </p>
                  </div>
                )}

                <Button
                  onClick={() => { window.location.href = '/register-company' }}
                  className="w-full justify-center"
                >
                  Re-submit Registration
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
