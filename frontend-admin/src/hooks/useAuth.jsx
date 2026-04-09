import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [loading, setLoading] = useState(true)

  const fetchProfile = useCallback(async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
      if (error) {
        console.error('[Auth] fetchProfile error:', error.message)
        setProfile(null)
        setProfileLoaded(true)
        return null
      }
      setProfile(data)
      setProfileLoaded(true)
      return data
    } catch (err) {
      console.error('[Auth] fetchProfile exception:', err)
      setProfile(null)
      setProfileLoaded(true)
      return null
    }
  }, [])

  useEffect(() => {
    let cancelled = false

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (cancelled) return

        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        }
      } catch (err) {
        console.error('[Auth] getSession error:', err)
      }

      if (!cancelled) {
        setLoading(false)
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return
        if (event === 'INITIAL_SESSION') return

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session.user)
          await fetchProfile(session.user.id)
          setLoading(false)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
          setProfile(null)
          setProfileLoaded(false)
          setLoading(false)
        }
      }
    )

    return () => {
      cancelled = true
      subscription.unsubscribe()
    }
  }, [fetchProfile])

  const signInWithGoogle = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    })
    if (error) throw error
    return data
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
    setProfile(null)
    setProfileLoaded(false)
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
    return data
  }

  const value = {
    user,
    profile,
    profileLoaded,
    loading,
    signInWithGoogle,
    signOut,
    updateProfile,
    fetchProfile,
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within an AuthProvider')
  return context
}
