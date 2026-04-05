import { useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import AdminLayout from './components/layout/AdminLayout'
import { PageLoader } from './components/ui/LoadingSpinner'
import { MAIN_APP_URL, ALLOWED_ADMIN_EMAILS } from './lib/constants'

import AdminLoginPage from './pages/auth/AdminLoginPage'
import BackOfficeDashboard from './pages/admin/BackOfficeDashboard'
import LeadManagement from './pages/admin/LeadManagement'
import AccountantApprovals from './pages/admin/AccountantApprovals'
import CompanyApprovals from './pages/admin/CompanyApprovals'
import SubscriptionManagement from './pages/admin/SubscriptionManagement'

function isAllowedAdmin(profile, user) {
  const email = profile?.email || user?.email || ''
  return profile?.role === 'admin' && ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())
}

/**
 * Dedicated OAuth callback handler — runs OUTSIDE of any auth guards.
 * Supabase redirects here with #access_token=... in the hash.
 * We wait for auth to fully resolve (session + profile), then redirect
 * to /dashboard or /login based on the result.
 */
function AuthCallback() {
  const { isAuthenticated, profile, loading, user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (loading) return

    if (isAuthenticated && isAllowedAdmin(profile, user)) {
      navigate('/dashboard', { replace: true })
    } else if (isAuthenticated && !isAllowedAdmin(profile, user)) {
      window.location.href = `${MAIN_APP_URL}/dashboard`
    } else {
      navigate('/login', { replace: true })
    }
  }, [loading, isAuthenticated, profile, user, navigate])

  return <PageLoader />
}

function AdminRoute({ children }) {
  const { isAuthenticated, profile, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  // If authenticated but profile not yet loaded, keep showing loader
  // instead of immediately redirecting to main app
  if (!profile) return <PageLoader />
  if (!isAllowedAdmin(profile, user)) {
    window.location.href = `${MAIN_APP_URL}/dashboard`
    return <PageLoader />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, profile, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated && isAllowedAdmin(profile, user)) {
    return <Navigate to="/dashboard" replace />
  }
  if (isAuthenticated && !isAllowedAdmin(profile, user)) {
    window.location.href = `${MAIN_APP_URL}/dashboard`
    return <PageLoader />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/dashboard" element={<BackOfficeDashboard />} />
        <Route path="/leads" element={<LeadManagement />} />
        <Route path="/accountants" element={<AccountantApprovals />} />
        <Route path="/companies" element={<CompanyApprovals />} />
        <Route path="/subscriptions" element={<SubscriptionManagement />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppRoutes />
      </ToastProvider>
    </AuthProvider>
  )
}
