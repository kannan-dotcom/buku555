import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './hooks/useAuth'
import { ToastProvider } from './components/ui/Toast'
import AppLayout from './components/layout/AppLayout'
import { PageLoader } from './components/ui/LoadingSpinner'

// Auth pages
import LoginPage from './pages/auth/LoginPage'

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

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  if (loading) return <PageLoader />
  if (!isAuthenticated) return <Navigate to="/login" replace />
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
      {/* Public auth route — Google sign-in only */}
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

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

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
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
