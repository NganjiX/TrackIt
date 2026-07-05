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
import type { CreateTransactionPayload } from '@/features/transactions/api/transactions.api';

const schema = z.object({
  type: z.enum(['sale', 'expense', 'purchase']),
  category: z.string().min(1),
  amount: z.coerce.number().min(0.01),
  description: z.string().min(1),
  date: z.string().min(1),
  paymentStatus: z.enum(['paid', 'pending', 'partial']),
  productService: z.string().min(1),
  customerId: z.string().optional(),
  supplierId: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface TransactionFormProps {
  defaultType?: 'sale' | 'expense' | 'purchase';
  onSubmit: (data: CreateTransactionPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for creating a sale, expense, or purchase (TXN-01, TXN-02).
 */
export function TransactionForm({ defaultType = 'sale', onSubmit, onCancel, isSubmitting }: TransactionFormProps) {
  const { t } = useTranslation();
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: defaultType,
      paymentStatus: 'paid',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const type = watch('type');

  const { data: customersData } = useQuery({
    queryKey: ['customers', 'all'],
    queryFn: () => customersApi.list({ limit: 100 }),
    enabled: type === 'sale',
  });

  const { data: suppliersData } = useQuery({
    queryKey: ['suppliers', 'all'],
    queryFn: () => suppliersApi.list({ limit: 100 }),
    enabled: type === 'purchase',
  });

  const selectClass = 'flex h-10 w-full rounded-md border border-[#1E1E1E] bg-[#111111] px-3 py-2 text-sm text-white';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('transactions.type')}</Label>
          <select {...register('type')} className={selectClass}>
            <option value="sale">{t('transactions.types.sale')}</option>
            <option value="expense">{t('transactions.types.expense')}</option>
            <option value="purchase">{t('transactions.types.purchase')}</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label>{t('transactions.paymentStatus')}</Label>
          <select {...register('paymentStatus')} className={selectClass}>
            <option value="paid">{t('transactions.payment.paid')}</option>
            <option value="pending">{t('transactions.payment.pending')}</option>
            <option value="partial">{t('transactions.payment.partial')}</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        <Label>{t('transactions.amount')}</Label>
        <Input type="number" step="0.01" {...register('amount')} />
        {errors.amount && <p className="text-xs text-destructive">{errors.amount.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>{t('transactions.category')}</Label>
        <Input {...register('category')} />
      </div>

      <div className="space-y-2">
        <Label>{t('transactions.productService')}</Label>
        <Input {...register('productService')} />
      </div>

      <div className="space-y-2">
        <Label>{t('transactions.description')}</Label>
        <Input {...register('description')} />
      </div>

      <div className="space-y-2">
        <Label>{t('transactions.date')}</Label>
        <Input type="date" {...register('date')} />
      </div>

      {type === 'sale' && (
        <div className="space-y-2">
          <Label>{t('transactions.customer')}</Label>
          <select {...register('customerId')} className={selectClass}>
            <option value="">{t('transactions.noCustomer')}</option>
            {customersData?.data.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      )}

      {type === 'purchase' && (
        <div className="space-y-2">
          <Label>{t('transactions.supplier')}</Label>
          <select {...register('supplierId')} className={selectClass}>
            <option value="">{t('transactions.noSupplier')}</option>
            {suppliersData?.data.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" variant="gold" className="flex-1" disabled={isSubmitting}>
          {t('common.save')}
        </Button>
      </div>
    </form>
  );
}
