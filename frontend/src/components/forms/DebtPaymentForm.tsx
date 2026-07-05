import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRWF } from '@/lib/utils';
import type { RecordPaymentPayload } from '@/features/debts/api/debts.api';

const schema = z.object({
  amount: z.coerce.number().min(0.01),
  note: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface DebtPaymentFormProps {
  remainingAmount: number;
  onSubmit: (data: RecordPaymentPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for recording a partial or full debt payment (DEBT-02).
 */
export function DebtPaymentForm({
  remainingAmount,
  onSubmit,
  onCancel,
  isSubmitting,
}: DebtPaymentFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const payFull = () => setValue('amount', remainingAmount);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {t('debts.remaining')}: <span className="font-medium text-foreground">{formatRWF(remainingAmount)}</span>
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label>{t('debts.paymentAmount')}</Label>
          <Button type="button" variant="link" size="sm" className="h-auto p-0" onClick={payFull}>
            {t('debts.payFull')}
          </Button>
        </div>
        <Input type="number" step="0.01" max={remainingAmount} {...register('amount')} />
        {errors.amount?.message && (
          <p className="text-xs text-destructive">{String(errors.amount.message)}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label>{t('debts.paymentNote')}</Label>
        <Input {...register('note')} placeholder={t('debts.paymentNotePlaceholder')} />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="gold" disabled={isSubmitting}>{t('debts.recordPayment')}</Button>
      </div>
    </form>
  );
}
