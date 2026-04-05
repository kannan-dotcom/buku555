import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import AppLayout from './components/layout/AppLayout'
import MarketingLayout from './components/layout/MarketingLayout'
import { PageLoader } from './components/ui/LoadingSpinner'

// Auth pages
import LoginPage from './pages/auth/LoginPage'

// Public legal pages
import PrivacyPolicyPage from './pages/PrivacyPolicyPage'
import TermsOfServicePage from './pages/TermsOfServicePage'

// Marketing pages
import LandingPage from './pages/marketing/LandingPage'
import FeaturesPage from './pages/marketing/FeaturesPage'
import PricingPage from './pages/marketing/PricingPage'
import WhyBuku555Page from './pages/marketing/WhyBuku555Page'
import ContactPage from './pages/marketing/ContactPage'
import AccountantSignupPage from './pages/marketing/AccountantSignupPage'

// App pages
import DashboardPage from './pages/DashboardPage'
import ReceiptsPage from './pages/ReceiptsPage'
import BankStatementsPage from './pages/BankStatementsPage'
import ReconciliationPage from './pages/ReconciliationPage'
import LedgerPage from './pages/LedgerPage'
import InvoicesPage from './pages/InvoicesPage'
import ClientsPage from './pages/ClientsPage'
import CompanyDocsPage from './pages/CompanyDocsPage'
import FinancialStatementsPage from './pages/FinancialStatementsPage'
import ReferencePage from './pages/ReferencePage'
import SettingsPage from './pages/SettingsPage'
import GDriveSetupPage from './pages/GDriveSetupPage'

// Admin pages
import BackOfficeDashboard from './pages/admin/BackOfficeDashboard'
import LeadManagement from './pages/admin/LeadManagement'
import AccountantApprovals from './pages/admin/AccountantApprovals'
import SubscriptionManagement from './pages/admin/SubscriptionManagement'

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

function AdminRoute({ children }) {
  const { isAuthenticated, profile, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  if (profile?.role !== 'admin') return <Navigate to="/dashboard" replace />
  return children
}

function PublicRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Marketing pages with shared layout */}
      <Route element={<MarketingLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/why-buku555" element={<WhyBuku555Page />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/for-accountants" element={<AccountantSignupPage />} />
      </Route>

      {/* Public auth route — Google sign-in only */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Public legal pages — no auth, no marketing layout */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />

      {/* Google OAuth callback (from GDrive reconnect) */}
      <Route path="/auth/google/callback" element={<Navigate to="/gdrive-setup" replace />} />

      {/* Protected app routes */}
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/receipts" element={<ReceiptsPage />} />
        <Route path="/bank-statements" element={<BankStatementsPage />} />
        <Route path="/reconciliation" element={<ReconciliationPage />} />
        <Route path="/ledger" element={<LedgerPage />} />
        <Route path="/invoices" element={<InvoicesPage />} />
        <Route path="/clients" element={<ClientsPage />} />
        <Route path="/company-docs" element={<CompanyDocsPage />} />
        <Route path="/financials" element={<FinancialStatementsPage />} />
        <Route path="/reference" element={<ReferencePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/gdrive-setup" element={<GDriveSetupPage />} />
      </Route>

      {/* Admin back office routes */}
      <Route
        element={
          <AdminRoute>
            <AppLayout />
          </AdminRoute>
        }
      >
        <Route path="/admin" element={<BackOfficeDashboard />} />
        <Route path="/admin/leads" element={<LeadManagement />} />
        <Route path="/admin/accountants" element={<AccountantApprovals />} />
        <Route path="/admin/subscriptions" element={<SubscriptionManagement />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
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
