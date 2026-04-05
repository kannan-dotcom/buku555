import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    setProfile(data)
    return data
  }, [])

  useEffect(() => {
    let cancelled = false

    console.log('[Auth] Init — URL:', window.location.href)
    console.log('[Auth] Hash:', window.location.hash ? 'present' : 'none')
    console.log('[Auth] Search:', window.location.search || 'none')

    // Rely solely on onAuthStateChange for initialization.
    // Supabase v2 fires INITIAL_SESSION as the first event, which handles
    // both existing sessions AND implicit grant hash fragment processing.
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return

        console.log('[Auth] onAuthStateChange:', event, 'user:', session?.user?.email || 'none')

        if (session?.user) {
          setUser(session.user)
          const prof = await fetchProfile(session.user.id)
          console.log('[Auth] Profile fetched:', prof?.email, 'role:', prof?.role)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
        setInitialized(true)
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
