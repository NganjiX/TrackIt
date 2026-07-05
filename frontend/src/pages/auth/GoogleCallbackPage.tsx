import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PageLoader } from '@/components/data-display/LoadingSkeleton';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/features/auth/api/auth.api';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';

/**
 * Handles Google OAuth callback redirect with access token (AUTH-02).
 */
export function GoogleCallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setTokens } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      toast({ variant: 'destructive', title: t('errors.UNKNOWN_ERROR') });
      navigate(ROUTES.LOGIN);
      return;
    }

    setTokens(token, { id: '', email: '', fullName: '', role: 'user', emailVerified: true, language: 'en', businessId: null, onboardingComplete: false });

    authApi.getMe()
      .then((user) => {
        setTokens(token, user);
        toast({ title: t('auth.loginSuccess') });
        navigate(user.onboardingComplete ? ROUTES.DASHBOARD : ROUTES.ONBOARDING);
      })
      .catch(() => {
        toast({ variant: 'destructive', title: t('errors.UNKNOWN_ERROR') });
        navigate(ROUTES.LOGIN);
      });
  }, [searchParams, setTokens, navigate, t]);

  return <PageLoader />;
}
