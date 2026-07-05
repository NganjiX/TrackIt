import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthFieldInput } from '@/components/forms/AuthField';
import { Button } from '@/components/ui/button';
import { forgotPasswordSchema, type ForgotPasswordForm } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

export function ForgotPasswordPage() {
  const { t } = useTranslation();
  const { forgotPassword } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordForm>({ resolver: zodResolver(forgotPasswordSchema) });

  return (
    <AuthLayout title={t('auth.forgotTitle')} subtitle={t('auth.forgotSubtitle')}>
      <form onSubmit={handleSubmit((d) => forgotPassword.mutate(d.email))} className="space-y-unit-md">
        <AuthFieldInput
          id="email"
          label={t('auth.email')}
          icon="mail"
          type="email"
          autoComplete="email"
          error={errors.email}
          registration={register('email')}
        />
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting || forgotPassword.isPending}>
          {t('common.submit')}
        </Button>
      </form>
      <p className="mt-unit-md text-center font-body-md text-on-primary-container">
        <Link to={ROUTES.LOGIN} className="text-secondary-fixed-dim font-bold hover:underline">
          {t('common.back')}
        </Link>
      </p>
    </AuthLayout>
  );
}
