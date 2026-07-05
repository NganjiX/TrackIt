import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';
import { PageLoader } from '@/components/data-display/LoadingSkeleton';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireOnboarding?: boolean;
  adminOnly?: boolean;
}

/**
 * Redirects unauthenticated users to Login (AUTH-07).
 */
export function ProtectedRoute({
  children,
  requireOnboarding = true,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuthStore();
  const location = useLocation();

  if (isLoading) return <PageLoader />;

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} state={{ from: location }} replace />;
  }

  if (adminOnly && user?.role !== 'admin') {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  if (requireOnboarding && user && !user.onboardingComplete && location.pathname !== ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.ONBOARDING} replace />;
  }

  if (user?.onboardingComplete && location.pathname === ROUTES.ONBOARDING) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return <>{children}</>;
}
