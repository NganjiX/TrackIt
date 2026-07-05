import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { customersApi } from '@/features/customers/api/customers.api';
import { suppliersApi } from '@/features/suppliers/api/suppliers.api';
import type { CreateDebtPayload, DebtType } from '@/features/debts/api/debts.api';

const schema = z.object({
  type: z.enum(['receivable', 'payable']),
  partyName: z.string().min(2),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
  amount: z.coerce.number().min(0.01),
  dueDate: z.string().min(1),
  description: z.string().min(3),
});

type FormValues = z.infer<typeof schema>;

interface DebtFormProps {
  defaultType?: DebtType;
  onSubmit: (data: CreateDebtPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for recording a receivable or payable debt (DEBT-01).
 */
export function DebtForm({ defaultType = 'receivable', onSubmit, onCancel, isSubmitting }: DebtFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      dueDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
    },
  });

  const type = watch('type');
  const selectClass = 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm';

  const { data: customersData } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => customersApi.list({ limit: 100 }),
    enabled: type === 'receivable',
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => suppliersApi.list({ limit: 100 }),
    enabled: type === 'payable',
  });

  const handleFormSubmit = (data: FormValues) => {
    const payload: CreateDebtPayload = {
      type: data.type,
      partyName: data.partyName,
      amount: data.amount,
      dueDate: data.dueDate,
      description: data.description,
    };
    if (data.type === 'receivable' && data.customerId) {
      payload.customerId = data.customerId;
    }
    if (data.type === 'payable' && data.supplierId) {
      payload.supplierId = data.supplierId;
    }
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('debts.type')}</Label>
        <select {...register('type')} className={selectClass}>
          <option value="receivable">{t('debts.types.receivable')}</option>
          <option value="payable">{t('debts.types.payable')}</option>
        </select>
      </div>

      {type === 'receivable' && (
        <div className="space-y-2">
          <Label>{t('debts.customer')}</Label>
          <select
            className={selectClass}
            {...register('customerId')}
            onChange={(e) => {
              register('customerId').onChange(e);
              const customer = customersData?.data.find((c) => c.id === e.target.value);
              if (customer) setValue('partyName', customer.name);
            }}
          >
            <option value="">{t('debts.noCustomer')}</option>
            {customersData?.data.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'payable' && (
        <div className="space-y-2">
          <Label>{t('debts.supplier')}</Label>
          <select
            className={selectClass}
            {...register('supplierId')}
            onChange={(e) => {
              register('supplierId').onChange(e);
              const supplier = suppliersData?.data.find((s) => s.id === e.target.value);
              if (supplier) setValue('partyName', supplier.name);
            }}
          >
            <option value="">{t('debts.noSupplier')}</option>
            {suppliersData?.data.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <Label>{t('debts.partyName')}</Label>
        <Input {...register('partyName')} placeholder={t('debts.partyNamePlaceholder')} />
        {errors.partyName?.message && (
          <p className="text-xs text-destructive">{String(errors.partyName.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('debts.amount')}</Label>
          <Input type="number" step="0.01" {...register('amount')} />
          {errors.amount?.message && (
            <p className="text-xs text-destructive">{String(errors.amount.message)}</p>
          )}
        </div>
        <div className="space-y-2">
          <Label>{t('debts.dueDate')}</Label>
          <Input type="date" {...register('dueDate')} />
          {errors.dueDate?.message && (
            <p className="text-xs text-destructive">{String(errors.dueDate.message)}</p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('debts.description')}</Label>
        <Input {...register('description')} />
        {errors.description?.message && (
          <p className="text-xs text-destructive">{String(errors.description.message)}</p>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="gold" disabled={isSubmitting}>{t('debts.add')}</Button>
      </div>
    </form>
  );
}
