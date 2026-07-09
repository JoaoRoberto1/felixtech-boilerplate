import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useAuthBootstrap } from './hooks/useAuth';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { GuestRoute } from './routes/GuestRoute';
import { AppShell } from './components/layout/AppShell';

import { LoginPage } from './features/auth/LoginPage';
import { RegisterPage } from './features/auth/RegisterPage';
import { ForgotPasswordPage } from './features/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './features/auth/ResetPasswordPage';
import { VerifyEmailPage } from './features/auth/VerifyEmailPage';
import { DashboardPage } from './features/dashboard/DashboardPage';
import { TeamsPage } from './features/teams/TeamsPage';
import { TeamOverviewPage } from './features/teams/TeamOverviewPage';
import { TeamMembersPage } from './features/teams/TeamMembersPage';
import { RolesPage } from './features/teams/RolesPage';
import { BillingPage } from './features/billing/BillingPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { AcceptInvitationPage } from './features/invitations/AcceptInvitationPage';

export function App() {
  useAuthBootstrap();

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        <Route path="/verify-email" element={<VerifyEmailPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/teams" element={<TeamsPage />} />
            <Route path="/teams/:teamId" element={<TeamOverviewPage />} />
            <Route path="/teams/:teamId/members" element={<TeamMembersPage />} />
            <Route path="/teams/:teamId/roles" element={<RolesPage />} />
            <Route path="/teams/:teamId/billing" element={<BillingPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/profile" element={<Navigate to="/settings" replace />} />
            <Route path="/settings/security" element={<Navigate to="/settings" replace />} />
            <Route path="/invitations/accept" element={<AcceptInvitationPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
