import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { step3Schema, type Step3Form } from '@/features/business/schemas/onboarding.schema';

interface StepGoalsProps {
  defaultValues?: Partial<Step3Form>;
  onSubmit: (data: Step3Form) => void;
  onBack: () => void;
  isSubmitting?: boolean;
}

/**
 * Onboarding step 3 — business goals; persisted to server on submit (AUTH-06).
 */
export function StepGoals({ defaultValues, onSubmit, onBack, isSubmitting }: StepGoalsProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step3Form>({
    resolver: zodResolver(step3Schema),
    defaultValues: { goals: '', ...defaultValues },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="goals">{t('onboarding.goals')}</Label>
        <textarea
          id="goals"
          rows={4}
          {...register('goals')}
          placeholder={t('onboarding.goalsPlaceholder')}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {errors.goals && <p className="text-xs text-destructive">{errors.goals.message}</p>}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button type="submit" variant="gold" className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? t('common.loading') : t('onboarding.complete')}
        </Button>
      </div>
    </form>
  );
}
