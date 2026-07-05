import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { CreateProductPayload } from '@/features/inventory/api/inventory.api';

const schema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  price: z.coerce.number().min(0),
  cost: z.coerce.number().min(0),
  stockQuantity: z.coerce.number().int().min(0),
  lowStockThreshold: z.coerce.number().int().min(0),
  unit: z.string().min(1),
});

type FormValues = z.infer<typeof schema>;

interface ProductFormProps {
  onSubmit: (data: CreateProductPayload) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

/**
 * Form for adding an inventory product (INV-01).
 */
export function ProductForm({ onSubmit, onCancel, isSubmitting }: ProductFormProps) {
  const { t } = useTranslation();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { unit: 'kg', lowStockThreshold: 10, stockQuantity: 0 },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('inventory.name')}</Label>
        <Input {...register('name')} placeholder={t('inventory.namePlaceholder')} />
        {errors.name?.message && (
          <p className="text-xs text-destructive">{String(errors.name.message)}</p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('inventory.category')}</Label>
          <Input {...register('category')} placeholder={t('inventory.categoryPlaceholder')} />
        </div>
        <div className="space-y-2">
          <Label>{t('inventory.unit')}</Label>
          <Input {...register('unit')} placeholder="kg" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('inventory.price')}</Label>
          <Input type="number" step="0.01" {...register('price')} />
        </div>
        <div className="space-y-2">
          <Label>{t('inventory.cost')}</Label>
          <Input type="number" step="0.01" {...register('cost')} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{t('inventory.stockQuantity')}</Label>
          <Input type="number" {...register('stockQuantity')} />
        </div>
        <div className="space-y-2">
          <Label>{t('inventory.lowStockThreshold')}</Label>
          <Input type="number" {...register('lowStockThreshold')} />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>{t('common.cancel')}</Button>
        <Button type="submit" variant="gold" disabled={isSubmitting}>{t('inventory.add')}</Button>
      </div>
    </form>
  );
}
