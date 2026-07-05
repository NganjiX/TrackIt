import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { step2Schema, type Step2Form } from '@/features/business/schemas/onboarding.schema';

interface StepOperationsProps {
  defaultValues?: Partial<Step2Form>;
  onNext: (data: Step2Form) => void;
  onBack: () => void;
}

/**
 * Onboarding step 2 — years operating and employee count.
 */
export function StepOperations({ defaultValues, onNext, onBack }: StepOperationsProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step2Form>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      yearsOperating: 1,
      numEmployees: 1,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="yearsOperating">{t('onboarding.yearsOperating')}</Label>
        <Input id="yearsOperating" type="number" min={0} {...register('yearsOperating')} />
        {errors.yearsOperating && (
          <p className="text-xs text-destructive">{errors.yearsOperating.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="numEmployees">{t('onboarding.numEmployees')}</Label>
        <Input id="numEmployees" type="number" min={1} {...register('numEmployees')} />
        {errors.numEmployees && (
          <p className="text-xs text-destructive">{errors.numEmployees.message}</p>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="button" variant="outline" className="flex-1" onClick={onBack}>
          {t('common.back')}
        </Button>
        <Button type="submit" variant="gold" className="flex-1">
          {t('common.next')}
        </Button>
      </div>
    </form>
  );
}
