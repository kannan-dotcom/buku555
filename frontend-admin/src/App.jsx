import { Routes, Route, Navigate } from 'react-router-dom'
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
import UserManagement from './pages/admin/UserManagement'

function isAllowedAdmin(profile, user) {
  const email = profile?.email || user?.email || ''
  return profile?.role === 'admin' && ALLOWED_ADMIN_EMAILS.includes(email.toLowerCase())
}

function AdminRoute({ children }) {
  const { isAuthenticated, profile, profileLoaded, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }
  // Wait for profile fetch to complete (not forever — profileLoaded is always set)
  if (!profileLoaded) return <PageLoader />
  if (!isAllowedAdmin(profile, user)) {
    window.location.href = `${MAIN_APP_URL}/dashboard`
    return <PageLoader />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, profile, profileLoaded, loading, user } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) {
    // Wait for profile fetch to complete
    if (!profileLoaded) return <PageLoader />
    if (isAllowedAdmin(profile, user)) {
      return <Navigate to="/dashboard" replace />
    }
    // Authenticated but not an allowed admin — send to main app
    window.location.href = `${MAIN_APP_URL}/dashboard`
    return <PageLoader />
  }
  return children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><AdminLoginPage /></PublicRoute>} />

      <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="/dashboard" element={<BackOfficeDashboard />} />
        <Route path="/leads" element={<LeadManagement />} />
        <Route path="/users" element={<UserManagement />} />
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
