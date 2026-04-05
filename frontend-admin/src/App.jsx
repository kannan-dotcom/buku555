import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import AdminLayout from './components/layout/AdminLayout'
import { PageLoader } from './components/ui/LoadingSpinner'
import { MAIN_APP_URL } from './lib/constants'

import AdminLoginPage from './pages/auth/AdminLoginPage'
import BackOfficeDashboard from './pages/admin/BackOfficeDashboard'
import LeadManagement from './pages/admin/LeadManagement'
import AccountantApprovals from './pages/admin/AccountantApprovals'
import SubscriptionManagement from './pages/admin/SubscriptionManagement'

function AdminRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') {
    window.location.href = `${MAIN_APP_URL}/dashboard`
    return <PageLoader />
  }
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated && profile?.role === 'admin') {
    return <Navigate to="/dashboard" replace />
  }
  if (isAuthenticated && profile?.role !== 'admin') {
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
        <Route path="/accountants" element={<AccountantApprovals />} />
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
