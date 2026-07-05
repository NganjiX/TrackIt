import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthFieldInput } from '@/components/forms/AuthField';
import { Button } from '@/components/ui/button';
import { resetPasswordSchema, type ResetPasswordForm } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

export function ResetPasswordPage() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { resetPassword } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordForm>({ resolver: zodResolver(resetPasswordSchema) });

  if (!token) {
    return (
      <AuthLayout title={t('auth.resetTitle')} subtitle={t('errors.INVALID_RESET_TOKEN')}>
        <p className="text-center font-body-md text-on-primary-container">
          <Link to={ROUTES.FORGOT_PASSWORD} className="text-secondary-fixed-dim font-bold hover:underline">
            {t('auth.forgotPassword')}
          </Link>
        </p>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('auth.resetTitle')} subtitle={t('auth.resetSubtitle')}>
      <form
        onSubmit={handleSubmit((d) => resetPassword.mutate({ token, password: d.password }))}
        className="space-y-unit-md"
      >
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
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting || resetPassword.isPending}>
          {t('auth.resetPassword')}
        </Button>
      </form>
    </AuthLayout>
  );
}
