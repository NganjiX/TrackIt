import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthFieldInput } from '@/components/forms/AuthField';
import { Button } from '@/components/ui/button';
import { registerSchema, type RegisterForm } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { authApi } from '@/features/auth/api/auth.api';
import { ROUTES } from '@/lib/constants';

/**
 * User registration page (AUTH-01).
 */
export function RegisterPage() {
  const { t } = useTranslation();
  const { register: registerUser } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({ resolver: zodResolver(registerSchema) });

  return (
    <AuthLayout title={t('auth.registerTitle')} subtitle={t('auth.registerSubtitle')}>
      <form
        onSubmit={handleSubmit((d) =>
          registerUser.mutate({
            fullName: d.fullName,
            email: d.email,
            password: d.password,
          }),
        )}
        className="space-y-unit-md"
      >
        <AuthFieldInput
          id="fullName"
          label={t('auth.fullName')}
          icon="person"
          error={errors.fullName}
          registration={register('fullName')}
        />
        <AuthFieldInput
          id="email"
          label={t('auth.email')}
          icon="mail"
          type="email"
          autoComplete="email"
          error={errors.email}
          registration={register('email')}
        />
        <AuthFieldInput
          id="password"
          label={t('auth.password')}
          icon="lock"
          type="password"
          autoComplete="new-password"
          error={errors.password}
          registration={register('password')}
        />
        <AuthFieldInput
          id="confirmPassword"
          label={t('auth.confirmPassword')}
          icon="lock"
          type="password"
          error={errors.confirmPassword}
          registration={register('confirmPassword')}
        />
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting || registerUser.isPending}>
          {t('auth.register')}
        </Button>
      </form>

      <div className="relative py-unit-sm">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[#1E1E1E]" />
        </div>
        <div className="relative flex justify-center">
          <span className="px-unit-md text-[#A0A0A0] bg-[#0D0D0D] font-label-sm uppercase">{t('auth.orContinue')}</span>
        </div>
      </div>

      <Button
        type="button"
        variant="secondary"
        className="w-full"
        onClick={() => {
          window.location.href = authApi.googleAuthUrl();
        }}
      >
        {t('auth.googleLogin')}
      </Button>

      <p className="mt-unit-lg text-center font-body-md text-[#A0A0A0]">
        {t('auth.hasAccount')}{' '}
        <Link to={ROUTES.LOGIN} className="text-[#CCFF00] font-bold hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
