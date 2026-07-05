import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { step1Schema, type Step1Form, BUSINESS_TYPES } from '@/features/business/schemas/onboarding.schema';

interface StepBusinessInfoProps {
  defaultValues?: Partial<Step1Form>;
  onNext: (data: Step1Form) => void;
}

/**
 * Onboarding step 1 — business name, type, industry, location.
 */
export function StepBusinessInfo({ defaultValues, onNext }: StepBusinessInfoProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Step1Form>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: '',
      type: 'retail_shop',
      industry: '',
      location: '',
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">{t('onboarding.businessName')}</Label>
        <Input id="name" {...register('name')} placeholder={t('onboarding.businessNamePlaceholder')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">{t('onboarding.businessType')}</Label>
        <select
          id="type"
          {...register('type')}
          className="flex h-10 w-full rounded-md border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-sm text-white"
        >
          {BUSINESS_TYPES.map((type) => (
            <option key={type} value={type} className="bg-[#111111] text-white">
              {t(`onboarding.types.${type}`)}
            </option>
          ))}
        </select>
        {errors.type && <p className="text-xs text-destructive">{errors.type.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="industry">{t('onboarding.industry')}</Label>
        <Input id="industry" {...register('industry')} placeholder={t('onboarding.industryPlaceholder')} />
        {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">{t('onboarding.location')}</Label>
        <Input id="location" {...register('location')} placeholder={t('onboarding.locationPlaceholder')} />
        {errors.location && <p className="text-xs text-destructive">{errors.location.message}</p>}
      </div>

      <Button type="submit" variant="gold" className="w-full">
        {t('common.next')}
      </Button>
    </form>
  );
}
