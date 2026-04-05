import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [company, setCompany] = useState(null)
  const [companyRole, setCompanyRole] = useState(null)
  const [registrationStatus, setRegistrationStatus] = useState(null) // 'none' | 'pending' | 'rejected'
  const [pendingInvitation, setPendingInvitation] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchCompanyData = useCallback(async (prof) => {
    if (prof?.company_id) {
      const [companyRes, memberRes] = await Promise.all([
        supabase.from('companies').select('*').eq('id', prof.company_id).single(),
        supabase.from('company_members').select('*').eq('user_id', prof.id).eq('company_id', prof.company_id).single(),
      ])
      setCompany(companyRes.data)
      setCompanyRole(memberRes.data?.role || null)
      setRegistrationStatus(null)
      setPendingInvitation(null)
    } else {
      setCompany(null)
      setCompanyRole(null)

      // Check for pending/rejected registration
      const { data: regData } = await supabase
        .from('company_registrations')
        .select('*')
        .eq('user_id', prof.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (regData && regData.length > 0) {
        setRegistrationStatus(regData[0].status) // 'pending' or 'rejected'
        setPendingInvitation(null)
      } else {
        // Check for pending invitation by email
        const { data: invData } = await supabase
          .from('company_invitations')
          .select('*, companies(name)')
          .eq('email', prof.email)
          .eq('status', 'pending')
          .limit(1)

        if (invData && invData.length > 0) {
          setPendingInvitation(invData[0])
          setRegistrationStatus(null)
        } else {
          setPendingInvitation(null)
          setRegistrationStatus('none')
        }
      }
    }
  }, [])

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    if (data) await fetchCompanyData(data)
    return data
  }, [fetchCompanyData])

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      // "Remember me" check: if user didn't check "remember me" and this is a new browser session, sign out
      if (session?.user) {
        const rememberMe = localStorage.getItem('buku555_remember_me')
        const sessionActive = sessionStorage.getItem('buku555_session_active')

        if (rememberMe === 'false' && !sessionActive) {
          // New browser session without "remember me" — sign out
          await supabase.auth.signOut()
          setUser(null)
          setLoading(false)
          return
        }

        // Mark this browser session as active
        sessionStorage.setItem('buku555_session_active', 'true')
      }

      setUser(session?.user ?? null)
      if (session?.user) {
        fetchProfile(session.user.id).then(() => setLoading(false))
      } else {
        setLoading(false)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        if (session?.user) {
          // Mark browser session as active on sign-in
          if (event === 'SIGNED_IN') {
            sessionStorage.setItem('buku555_session_active', 'true')
          }

          const prof = await fetchProfile(session.user.id)

          // Capture Google tokens on fresh sign-in
          if (session.provider_token && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
            const tokenUpdates = {
              gdrive_access_token: session.provider_token,
            }
            if (session.provider_refresh_token) {
              tokenUpdates.gdrive_refresh_token = session.provider_refresh_token
              tokenUpdates.gdrive_token_expiry = new Date(
                Date.now() + 3600 * 1000
              ).toISOString()
            }
            // Update if not already connected or tokens differ
            if (!prof?.gdrive_connected || prof?.gdrive_access_token !== session.provider_token) {
              await supabase
                .from('profiles')
                .update(tokenUpdates)
                .eq('id', session.user.id)
              // Re-fetch profile with updated tokens
              await fetchProfile(session.user.id)
            }
          }
        } else {
          setProfile(null)
          setCompany(null)
          setCompanyRole(null)
          setRegistrationStatus(null)
          setPendingInvitation(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [fetchProfile])

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        scopes: 'https://www.googleapis.com/auth/drive.file https://www.googleapis.com/auth/spreadsheets https://www.googleapis.com/auth/gmail.send',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    localStorage.removeItem('buku555_remember_me')
    sessionStorage.removeItem('buku555_session_active')
    setUser(null)
    setProfile(null)
    setCompany(null)
    setCompanyRole(null)
    setRegistrationStatus(null)
    setPendingInvitation(null)
  }

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in')
    const { data, error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', user.id)
      .select()
      .single()
    if (error) throw error
    setProfile(data)
    if (updates.company_id) await fetchCompanyData(data)
    return data
  }

  const value = {
    user,
    profile,
    company,
    companyRole,
    registrationStatus,
    pendingInvitation,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    fetchProfile,
    isAuthenticated: !!user,
    hasCompany: !!profile?.company_id,
    isGDriveConnected: !!profile?.gdrive_connected,
    // RBAC helpers
    isOwner: companyRole === 'owner',
    isCompanyAdmin: companyRole === 'admin' || companyRole === 'owner',
    canManageUsers: companyRole === 'owner' || companyRole === 'admin',
    canEditData: ['owner', 'admin', 'accountant'].includes(companyRole),
    canDeleteData: ['owner', 'admin'].includes(companyRole),
    canExport: ['owner', 'admin', 'accountant'].includes(companyRole),
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
