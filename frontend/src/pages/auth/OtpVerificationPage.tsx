import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { AuthFieldInput } from '@/components/forms/AuthField';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { otpSchema, type OtpForm } from '@/features/auth/schemas/auth.schema';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { ROUTES } from '@/lib/constants';

export function OtpVerificationPage() {
  const { t } = useTranslation();
  const location = useLocation();
  const emailFromState = (location.state as { email?: string })?.email ?? '';
  const { verifyOtp, resendOtp } = useAuth();

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<OtpForm>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: emailFromState, code: '' },
  });

  return (
    <AuthLayout title={t('auth.otpTitle')} subtitle={t('auth.otpSubtitle')}>
      <p className="text-sm text-[#A0A0A0] text-center mb-unit-md">{t('auth.otpSent')}</p>
      <form onSubmit={handleSubmit((d) => verifyOtp.mutate(d))} className="space-y-unit-md">
        <AuthFieldInput
          id="email"
          label={t('auth.email')}
          icon="mail"
          type="email"
          error={errors.email}
          registration={register('email')}
        />
        <div className="space-y-unit-xs">
          <Label htmlFor="code" variant="auth">
            {t('auth.otpCode')}
          </Label>
          <Input
            id="code"
            inputMode="numeric"
            maxLength={6}
            variant="auth"
            className="text-center text-2xl tracking-[0.5em] font-mono pl-3"
            {...register('code')}
          />
          {errors.code && <p className="text-xs text-[#BFFF00]">{errors.code.message}</p>}
        </div>
        <Button type="submit" variant="gold" className="w-full" disabled={isSubmitting || verifyOtp.isPending}>
          {t('auth.verifyOtp')}
        </Button>
      </form>
      <Button
        type="button"
        variant="ghost"
        className="w-full"
        onClick={() => resendOtp.mutate(getValues('email'))}
        disabled={resendOtp.isPending}
      >
        {t('auth.resendOtp')}
      </Button>
      <p className="mt-unit-md text-center font-body-md text-[#A0A0A0]">
        <Link to={ROUTES.LOGIN} className="text-[#CCFF00] font-bold hover:underline">
          {t('auth.login')}
        </Link>
      </p>
    </AuthLayout>
  );
}
