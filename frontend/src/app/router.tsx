import { Navigate, Route, Routes } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { OtpVerificationPage } from '@/pages/auth/OtpVerificationPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';
import { GoogleCallbackPage } from '@/pages/auth/GoogleCallbackPage';
import { DashboardPage } from '@/pages/dashboard/DashboardPage';
import { TransactionsPage } from '@/pages/transactions/TransactionsPage';
import { CustomersPage } from '@/pages/customers/CustomersPage';
import { SuppliersPage } from '@/pages/suppliers/SuppliersPage';
import { DebtsPage } from '@/pages/debts/DebtsPage';
import { DocumentsPage } from '@/pages/documents/DocumentsPage';
import { InventoryPage } from '@/pages/inventory/InventoryPage';
import { AnalyticsPage } from '@/pages/analytics/AnalyticsPage';
import { HistoryPage } from '@/pages/history/HistoryPage';
import { PassportPage } from '@/pages/passport/PassportPage';
import { PublicPassportPage } from '@/pages/passport/PublicPassportPage';
import { AssistantPage } from '@/pages/assistant/AssistantPage';
import { SettingsPage } from '@/pages/settings/SettingsPage';
import { ProfilePage } from '@/pages/settings/ProfilePage';
import { AdminPanelPage } from '@/pages/admin/AdminPanelPage';
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage';

/**
 * Application route definitions with public, protected, and admin segments.
 */
export function AppRouter() {
  return (
    <Routes>
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<RegisterPage />} />
      <Route path={ROUTES.VERIFY_OTP} element={<OtpVerificationPage />} />
      <Route path={ROUTES.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
      <Route path={ROUTES.RESET_PASSWORD} element={<ResetPasswordPage />} />
      <Route path={ROUTES.GOOGLE_CALLBACK} element={<GoogleCallbackPage />} />
      <Route path="/passport/public/:token" element={<PublicPassportPage />} />

      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute requireOnboarding={false}>
            <OnboardingPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path={ROUTES.DASHBOARD} element={<DashboardPage />} />
        <Route path={ROUTES.TRANSACTIONS} element={<TransactionsPage />} />
        <Route path={ROUTES.CUSTOMERS} element={<CustomersPage />} />
        <Route path={ROUTES.SUPPLIERS} element={<SuppliersPage />} />
        <Route path={ROUTES.DEBTS} element={<DebtsPage />} />
        <Route path={ROUTES.DOCUMENTS} element={<DocumentsPage />} />
        <Route path={ROUTES.INVENTORY} element={<InventoryPage />} />
        <Route path={ROUTES.ANALYTICS} element={<AnalyticsPage />} />
        <Route path={ROUTES.HISTORY} element={<HistoryPage />} />
        <Route path={ROUTES.PASSPORT} element={<PassportPage />} />
        <Route path={ROUTES.ASSISTANT} element={<AssistantPage />} />
        <Route path={ROUTES.SETTINGS} element={<SettingsPage />} />
        <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
        <Route path={ROUTES.ADMIN} element={<AdminPanelPage />} />
      </Route>

      <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
    </Routes>
  );
}
