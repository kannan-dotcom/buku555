import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext(null)

// Check if the URL contains OAuth callback tokens in the hash
function hasOAuthCallbackInURL() {
  const hash = window.location.hash
  return hash.includes('access_token=') || hash.includes('error=')
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const resolvedRef = useRef(false)

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

    const resolve = async (session) => {
      if (cancelled || resolvedRef.current) return
      resolvedRef.current = true

      if (session?.user) {
        setUser(session.user)
        await fetchProfile(session.user.id)
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    }

    // Listen for auth state changes first — this is what processes
    // the OAuth hash fragment and fires SIGNED_IN
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (cancelled) return

        if (!resolvedRef.current) {
          // First auth event — this resolves initialization
          await resolve(session)
        } else {
          // Subsequent auth changes (sign out, token refresh)
          if (session?.user) {
            setLoading(true)
            setUser(session.user)
            await fetchProfile(session.user.id)
            setLoading(false)
          } else {
            setUser(null)
            setProfile(null)
            setLoading(false)
          }
        }
      }
    )

    // If there's an OAuth callback in the URL, let onAuthStateChange handle it.
    // Otherwise, use getSession to check for existing session.
    if (!hasOAuthCallbackInURL()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        await resolve(session)
      })
    }

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
