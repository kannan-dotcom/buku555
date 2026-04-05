import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { supabase } from '../../lib/supabase'
import Button from '../../components/ui/Button'
import { APP_NAME } from '../../lib/constants'
import { LogOut, Users, Building2, AlertCircle, Mail } from 'lucide-react'

export default function AcceptInvitePage() {
  const { token } = useParams()
  const { user, profile, pendingInvitation, signOut } = useAuth()

  const [invitation, setInvitation] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accepting, setAccepting] = useState(false)
  const [declining, setDeclining] = useState(false)
  const [error, setError] = useState(null)
  const [notFound, setNotFound] = useState(false)

  // Load invitation from token or from useAuth's pendingInvitation
  useEffect(() => {
    const loadInvitation = async () => {
      setLoading(true)

      // If we already have a pending invitation from auth context, use it
      if (pendingInvitation) {
        setInvitation(pendingInvitation)
        setLoading(false)
        return
      }

      // Otherwise fetch by token from URL
      if (token) {
        const { data, error: fetchErr } = await supabase
          .from('company_invitations')
          .select('*, companies(name)')
          .eq('token', token)
          .eq('status', 'pending')
          .single()

        if (fetchErr || !data) {
          setNotFound(true)
        } else {
          setInvitation(data)
        }
      } else {
        setNotFound(true)
      }

      setLoading(false)
    }

    if (user) {
      loadInvitation()
    }
  }, [user, token, pendingInvitation])

  const handleAccept = async () => {
    setAccepting(true)
    setError(null)
    try {
      // 1. Update invitation status
      await supabase.from('company_invitations')
        .update({ status: 'accepted', accepted_at: new Date().toISOString() })
        .eq('id', invitation.id)

      // 2. Insert company_members row
      await supabase.from('company_members').insert({
        company_id: invitation.company_id,
        user_id: user.id,
        role: invitation.role,
        invited_by: invitation.invited_by,
      })

      // 3. Update profile with company_id
      await supabase.from('profiles')
        .update({ company_id: invitation.company_id, updated_at: new Date().toISOString() })
        .eq('id', user.id)

      // 4. Reload to dashboard
      window.location.href = '/dashboard'
    } catch (err) {
      setError(err.message)
    } finally {
      setAccepting(false)
    }
  }

  const handleDecline = async () => {
    setDeclining(true)
    setError(null)
    try {
      await supabase.from('company_invitations')
        .update({ status: 'declined' })
        .eq('id', invitation.id)

      // Navigate to register own company
      window.location.href = '/register-company'
    } catch (err) {
      setError(err.message)
    } finally {
      setDeclining(false)
    }
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/login'
    } catch {
      // Silently fail, page will redirect
    }
  }

  const companyName = invitation?.companies?.name || invitation?.company_name || 'a company'
  const roleName = invitation?.role
    ? invitation.role.charAt(0).toUpperCase() + invitation.role.slice(1)
    : 'Member'

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

      {/* Content */}
      <div className="flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-card border border-neutral-100 p-8 text-center">
            {loading ? (
              <div className="py-8">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-neutral-50 mb-4">
                  <div className="h-6 w-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                </div>
                <p className="text-sm text-neutral-500">Loading invitation...</p>
              </div>
            ) : notFound ? (
              <>
                {/* Invitation not found */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-neutral-100 mb-6">
                  <Mail className="h-10 w-10 text-neutral-400" />
                </div>

                <h1 className="text-2xl font-bold text-neutral-800 mb-3">
                  Invitation Not Found
                </h1>
                <p className="text-neutral-500 leading-relaxed mb-6">
                  This invitation may have expired or already been used.
                  You can register your own company instead.
                </p>

                <Link
                  to="/register-company"
                  className="btn-primary px-5 py-2.5 text-sm inline-flex items-center justify-center gap-2 w-full"
                >
                  <Building2 className="h-4 w-4" />
                  Register Your Company
                </Link>
              </>
            ) : (
              <>
                {/* Invitation details */}
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary-50 mb-6">
                  <Users className="h-10 w-10 text-primary-600" />
                </div>

                <h1 className="text-2xl font-bold text-neutral-800 mb-3">
                  Company Invitation
                </h1>
                <p className="text-neutral-500 leading-relaxed mb-6">
                  You've been invited to join <span className="font-semibold text-neutral-700">{companyName}</span> as{' '}
                  <span className="font-semibold text-neutral-700">{roleName}</span>.
                </p>

                {/* Company card */}
                <div className="mb-6 p-4 rounded-xl bg-primary-50/50 border border-primary-100">
                  <div className="flex items-center justify-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary-100">
                      <Building2 className="h-5 w-5 text-primary-600" />
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-semibold text-neutral-800">{companyName}</p>
                      <p className="text-xs text-neutral-500">Role: {roleName}</p>
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-left">
                    <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  <Button
                    onClick={handleAccept}
                    loading={accepting}
                    disabled={declining}
                    className="w-full justify-center"
                  >
                    Accept Invitation
                  </Button>
                  <Button
                    onClick={handleDecline}
                    loading={declining}
                    disabled={accepting}
                    variant="ghost"
                    className="w-full justify-center"
                  >
                    Decline
                  </Button>
                </div>

                <p className="text-xs text-neutral-400 mt-4 leading-relaxed">
                  If you decline, you can register your own company instead.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
