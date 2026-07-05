import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthField, AuthFieldInput } from '@/components/forms/AuthField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { loginSchema, type LoginForm } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/api/auth.api';
import { ROUTES } from '@/lib/constants';

export function LoginPage() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  return (
    <AuthLayout title={t('auth.loginTitle')} subtitle={t('auth.loginSubtitle')}>
      <form onSubmit={handleSubmit((d) => login.mutate(d))} className="space-y-unit-md">
        <AuthFieldInput
          id="email"
          label={t('auth.email')}
          icon="mail"
          type="email"
          autoComplete="email"
          placeholder="name@company.com"
          error={errors.email}
          registration={register('email')}
        />

        <AuthField
          id="password"
          label={t('auth.password')}
          icon="lock"
          error={errors.password}
          labelExtra={
            <Link
              to={ROUTES.FORGOT_PASSWORD}
              className="font-label-sm text-on-primary-container hover:text-secondary-fixed transition-colors"
            >
              {t('auth.forgotPassword')}
            </Link>
          }
        >
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            variant="auth"
            autoComplete="current-password"
            placeholder="••••••••"
            className="pl-10 pr-10"
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="absolute right-unit-sm top-1/2 -translate-y-1/2 text-on-primary-container hover:text-on-primary transition-colors"
          >
            <MaterialIcon name={showPassword ? 'visibility_off' : 'visibility'} className="text-xl" />
          </button>
        </AuthField>

        <div className="pt-unit-sm">
          <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting || login.isPending}>
            {t('auth.loginSubmit')}
          </Button>
        </div>

        <div className="relative py-unit-sm">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-unit-md text-white/40 font-label-sm uppercase">{t('auth.orContinue')}</span>
          </div>
        </div>

        <Button
          type="button"
          variant="secondary"
          className="w-full bg-white/5 border-white/10 text-on-primary hover:bg-white/10"
          onClick={() => {
            window.location.href = authApi.googleAuthUrl();
          }}
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" aria-hidden>
            <path d="M12 5.04c1.94 0 3.51.68 4.75 1.72L20.12 3.4C17.9 1.42 15.15.24 12 .24c-4.8 0-8.93 2.74-10.97 6.74l4.24 3.3c.96-2.9 3.66-5.24 6.73-5.24z" fill="#EA4335" />
            <path d="M23.49 12.28c0-.81-.07-1.59-.2-2.34H12v4.42h6.44c-.28 1.48-1.13 2.74-2.42 3.58l3.75 2.91c2.19-2.02 3.45-5 3.45-8.57z" fill="#4285F4" />
            <path d="M5.27 14.28c-.24-.72-.37-1.48-.37-2.28s.13-1.56.37-2.28L1.03 6.42C.37 7.74 0 9.22 0 10.8c0 1.58.37 3.06 1.03 4.38l4.24-3.3z" fill="#FBBC05" />
            <path d="M12 23.76c3.24 0 5.95-1.07 7.94-2.91l-3.75-2.91c-1.1.74-2.51 1.18-4.19 1.18-3.07 0-5.77-2.34-6.73-5.24l-4.24 3.3C3.07 21.02 7.2 23.76 12 23.76z" fill="#34A853" />
          </svg>
          {t('auth.googleLogin')}
        </Button>
      </form>

      <p className="mt-unit-lg text-center font-body-md text-on-primary-container">
        {t('auth.noAccount')}{' '}
        <Link to={ROUTES.REGISTER} className="text-secondary-fixed-dim font-bold hover:underline ml-unit-xs">
          {t('auth.register')}
        </Link>
      </p>
    </AuthLayout>
  );
}
