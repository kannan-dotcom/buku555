import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import AppLayout from './components/layout/AppLayout'
import MarketingLayout from './components/layout/MarketingLayout'
import { PageLoader } from './components/ui/LoadingSpinner'

// Auth pages
import LoginPage from './pages/auth/LoginPage'
import SignUpPage from './pages/auth/SignUpPage'
import CompanyRegistrationPage from './pages/auth/CompanyRegistrationPage'
import RegistrationPendingPage from './pages/auth/RegistrationPendingPage'
import AcceptInvitePage from './pages/auth/AcceptInvitePage'

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
import TeamManagementPage from './pages/TeamManagementPage'

// Protected route: requires auth + company membership
function ProtectedRoute({ children }) {
  const { isAuthenticated, hasCompany, registrationStatus, pendingInvitation, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />

  // Authenticated but no company — redirect to appropriate onboarding
  if (!hasCompany) {
    if (registrationStatus === 'pending') return <Navigate to="/registration-pending" replace />
    if (pendingInvitation) return <Navigate to={`/accept-invite/${pendingInvitation.token}`} replace />
    return <Navigate to="/register-company" replace />
  }

  return children
}

// Authenticated route: requires auth only (no company required)
function AuthenticatedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
  return children
}

// Public route: redirect to dashboard if already authenticated with company
function PublicRoute({ children }) {
  const { isAuthenticated, hasCompany, loading } = useAuth()
  if (loading) return <PageLoader />
  if (isAuthenticated && hasCompany) return <Navigate to="/dashboard" replace />
  if (isAuthenticated && !hasCompany) return <Navigate to="/register-company" replace />
  return children
}

function BackOfficeRedirect() {
  window.location.href = 'https://backoffice.buku555.online'
  return null
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

      {/* Public signup — no auth required, submits lead for review */}
      <Route path="/signup" element={<SignUpPage />} />

      {/* Public auth route — Google sign-in only */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* Public legal pages — no auth, no marketing layout */}
      <Route path="/privacy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsOfServicePage />} />

      {/* Google OAuth callback (from GDrive reconnect) */}
      <Route path="/auth/google/callback" element={<Navigate to="/gdrive-setup" replace />} />

      {/* Company onboarding routes (authenticated, no company required) */}
      <Route path="/register-company" element={<AuthenticatedRoute><CompanyRegistrationPage /></AuthenticatedRoute>} />
      <Route path="/registration-pending" element={<AuthenticatedRoute><RegistrationPendingPage /></AuthenticatedRoute>} />
      <Route path="/accept-invite/:token" element={<AuthenticatedRoute><AcceptInvitePage /></AuthenticatedRoute>} />

      {/* Protected app routes (requires auth + company) */}
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
        <Route path="/team" element={<TeamManagementPage />} />
      </Route>

      {/* Redirect old admin routes to back office subdomain */}
      <Route path="/admin/*" element={<BackOfficeRedirect />} />

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
