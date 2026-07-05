import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { AlertTriangle } from 'lucide-react';
import { inventoryApi } from '@/features/inventory/api/inventory.api';
import { formatRWF } from '@/lib/utils';

/**
 * Banner warning when products are low on stock (INV-03).
 */
export function LowStockBanner() {
  const { t } = useTranslation();

  const { data } = useQuery({
    queryKey: ['inventory', 'low-stock'],
    queryFn: inventoryApi.lowStock,
  });

  if (!data?.count) return null;

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-800 p-4">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-medium text-amber-900 dark:text-amber-200">
            {t('inventory.lowStockTitle', { count: data.count })}
          </p>
          <ul className="mt-2 text-sm text-amber-800 dark:text-amber-300 space-y-1">
            {data.data.slice(0, 5).map((product) => (
              <li key={product.id}>
                {product.name}: {product.stockQuantity} {product.unit}
                {product.price > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({formatRWF(product.price)}/{product.unit})
                  </span>
                )}
              </li>
            ))}
            {data.count > 5 && (
              <li className="text-muted-foreground">{t('inventory.lowStockMore', { count: data.count - 5 })}</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
