import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateCustomerPayload } from '@/features/customers/api/customers.api';

const schema = z.object({
  name: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface CustomerFormProps {
  onSubmit: (data: CreateCustomerPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for creating a customer (CUST-01).
 */
export function CustomerForm({ onSubmit, onCancel, isSubmitting }: CustomerFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const handleFormSubmit = (data: FormValues) => {
    onSubmit({
      name: data.name,
      phone: data.phone,
      email: data.email || undefined,
      address: data.address || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('customers.name')}</Label>
        <Input {...register('name')} />
        {errors.name?.message && <p className="text-xs text-destructive">{String(errors.name.message)}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t('customers.phone')}</Label>
        <Input {...register('phone')} />
        {errors.phone?.message && <p className="text-xs text-destructive">{String(errors.phone.message)}</p>}
      </div>
      <div className="space-y-2">
        <Label>{t('customers.email')}</Label>
        <Input type="email" {...register('email')} />
      </div>
      <div className="space-y-2">
        <Label>{t('customers.address')}</Label>
        <Input {...register('address')} />
      </div>
      <div className="flex gap-3 pt-2">
        <Button type="button" variant="outline" className="flex-1" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="gold" className="flex-1" disabled={isSubmitting}>{t('common.save')}</Button>
      </div>
    </form>
  );
}
