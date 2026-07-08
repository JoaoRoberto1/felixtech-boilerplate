import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../stores/auth-store';
import { FullPageSpinner } from '../components/ui/Spinner';

/** Redirects already-authenticated users away from login/register pages. */
export function GuestRoute() {
  const isInitializing = useAuthStore((s) => s.isInitializing);
  const user = useAuthStore((s) => s.user);

  if (isInitializing) return <FullPageSpinner />;
  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
}
