import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/features/auth/api/auth.api';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * Auth mutations with navigation and toast side effects.
 */
export function useAuth() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { setTokens, logout: clearAuth } = useAuthStore();

  const handleError = (error: ApiError) => {
    toast({
      variant: 'destructive',
      title: t(`errors.${error.errorCode}`, { defaultValue: error.message }),
    });
  };

  const login = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      setTokens(data.accessToken, data.user);
      toast({ title: t('auth.loginSuccess') });
      if (!data.user.onboardingComplete) {
        navigate(ROUTES.ONBOARDING);
      } else {
        navigate(ROUTES.DASHBOARD);
      }
    },
    onError: handleError,
  });

  const register = useMutation({
    mutationFn: authApi.register,
    onSuccess: (_data, variables) => {
      toast({ title: t('auth.registerSuccess') });
      navigate(ROUTES.VERIFY_OTP, { state: { email: variables.email } });
    },
    onError: handleError,
  });

  const verifyOtp = useMutation({
    mutationFn: authApi.verifyOtp,
    onSuccess: () => {
      toast({ title: t('auth.verifySuccess') });
      navigate(ROUTES.LOGIN);
    },
    onError: handleError,
  });

  const resendOtp = useMutation({
    mutationFn: authApi.resendOtp,
    onSuccess: () => toast({ title: t('auth.otpSent') }),
    onError: handleError,
  });

  const forgotPassword = useMutation({
    mutationFn: authApi.forgotPassword,
    onSuccess: () => toast({ title: t('auth.forgotSubtitle') }),
    onError: handleError,
  });

  const resetPassword = useMutation({
    mutationFn: ({ token, password }: { token: string; password: string }) =>
      authApi.resetPassword(token, password),
    onSuccess: () => {
      toast({ title: t('auth.resetSuccess') });
      navigate(ROUTES.LOGIN);
    },
    onError: handleError,
  });

  const logout = useMutation({
    mutationFn: authApi.logout,
    onSettled: () => {
      clearAuth();
      navigate(ROUTES.LOGIN);
    },
  });

  return { login, register, verifyOtp, resendOtp, forgotPassword, resetPassword, logout };
}
