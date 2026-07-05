import { Badge } from '@/components/ui/badge';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

interface DebtBadgeProps {
  amount?: number;
  currency?: string;
  variant?: 'customer' | 'supplier';
  className?: string;
}

/**
 * Visual badge for outstanding customer debt or supplier balance (CUST-03, SUPP-03).
 */
export function DebtBadge({ amount = 0, currency = 'RWF', variant = 'customer', className }: DebtBadgeProps) {
  const { t } = useTranslation();

  if (amount <= 0) return null;

  const formatted = new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);

  return (
    <Badge
      variant="warning"
      className={cn('font-normal', className)}
    >
      {variant === 'customer' ? t('customers.debtBadge') : t('suppliers.owedBadge')}: {formatted}
    </Badge>
  );
}
