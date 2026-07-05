import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { StepBusinessInfo } from './StepBusinessInfo';
import { StepOperations } from './StepOperations';
import { StepGoals } from './StepGoals';
import { businessApi } from '@/features/business/api/business.api';
import { useAuthStore } from '@/store/auth.store';
import { ROUTES } from '@/lib/constants';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';
import {
  ONBOARDING_DRAFT_KEY,
  type OnboardingDraft,
  type OnboardingForm,
} from '@/features/business/schemas/onboarding.schema';
import { cn } from '@/lib/utils';

/**
 * 3-step onboarding wizard — draft stored client-side until final submit (AUTH-06).
 */
export function OnboardingPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, setUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<OnboardingDraft>(() => {
    try {
      const saved = sessionStorage.getItem(ONBOARDING_DRAFT_KEY);
      return saved ? (JSON.parse(saved) as OnboardingDraft) : { step: 1 };
    } catch {
      return { step: 1 };
    }
  });

  useEffect(() => {
    sessionStorage.setItem(ONBOARDING_DRAFT_KEY, JSON.stringify({ ...draft, step }));
  }, [draft, step]);

  const completeMutation = useMutation({
    mutationFn: businessApi.completeOnboarding,
    onSuccess: () => {
      sessionStorage.removeItem(ONBOARDING_DRAFT_KEY);
      if (user) {
        setUser({ ...user, onboardingComplete: true });
      }
      toast({ title: t('onboarding.success') });
      navigate(ROUTES.DASHBOARD);
    },
    onError: (error: ApiError) => {
      toast({
        variant: 'destructive',
        title: t(`errors.${error.errorCode}`, { defaultValue: error.message }),
      });
    },
  });

  const handleStep1 = (data: Pick<OnboardingForm, 'name' | 'type' | 'industry' | 'location'>) => {
    setDraft((prev) => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2 = (data: Pick<OnboardingForm, 'yearsOperating' | 'numEmployees'>) => {
    setDraft((prev) => ({ ...prev, ...data }));
    setStep(3);
  };

  const handleStep3 = (data: Pick<OnboardingForm, 'goals'>) => {
    const payload: OnboardingForm = {
      name: draft.name ?? '',
      type: draft.type ?? 'other',
      industry: draft.industry ?? '',
      location: draft.location ?? '',
      yearsOperating: draft.yearsOperating ?? 0,
      numEmployees: draft.numEmployees ?? 1,
      goals: data.goals,
    };
    completeMutation.mutate(payload);
  };

  const steps = [
    t('onboarding.steps.business'),
    t('onboarding.steps.operations'),
    t('onboarding.steps.goals'),
  ];

  return (
    <AuthLayout
      title={t('onboarding.title')}
      subtitle={t('onboarding.subtitle', { step, total: 3 })}
    >
      <div className="flex items-center justify-center gap-2 mb-6">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <div
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-colors',
                i + 1 <= step ? 'bg-gold text-navy' : 'bg-muted text-muted-foreground',
              )}
            >
              {i + 1}
            </div>
            <span className={cn('text-xs hidden sm:inline', i + 1 === step ? 'font-medium' : 'text-muted-foreground')}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border hidden sm:block" />}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {step === 1 && (
            <StepBusinessInfo
              defaultValues={draft}
              onNext={handleStep1}
            />
          )}
          {step === 2 && (
            <StepOperations
              defaultValues={draft}
              onNext={handleStep2}
              onBack={() => setStep(1)}
            />
          )}
          {step === 3 && (
            <StepGoals
              defaultValues={draft}
              onSubmit={handleStep3}
              onBack={() => setStep(2)}
              isSubmitting={completeMutation.isPending}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </AuthLayout>
  );
}
