import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { formatRWF } from '@/lib/utils';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

interface FinancialSummaryCardsProps {
  financials?: DashboardSummary['financials'];
  isLoading?: boolean;
}

const CARD_CONFIG = [
  {
    key: 'revenue',
    titleKey: 'dashboard.totalRevenue',
    icon: 'trending_up',
    iconBg: 'bg-green-50 text-green-600',
    accent: 'text-green-600',
    highlight: false,
  },
  {
    key: 'expenses',
    titleKey: 'dashboard.totalExpenses',
    icon: 'payments',
    iconBg: 'bg-red-50 text-red-600',
    accent: 'text-red-600',
    highlight: false,
  },
  {
    key: 'profit',
    titleKey: 'dashboard.estimatedProfit',
    icon: 'stars',
    iconBg: 'bg-secondary-fixed/20 text-secondary',
    accent: 'text-secondary',
    highlight: true,
    filled: true,
  },
  {
    key: 'debts',
    titleKey: 'dashboard.outstandingDebts',
    icon: 'account_balance',
    iconBg: 'bg-surface-container text-primary',
    accent: 'text-primary',
    highlight: false,
  },
] as const;

/**
 * Financial summary bento cards (DASH-01).
 */
export function FinancialSummaryCards({ financials, isLoading }: FinancialSummaryCardsProps) {
  const { t } = useTranslation();

  const values: Record<string, number> = {
    revenue: financials?.totalRevenue ?? 0,
    expenses: financials?.totalExpenses ?? 0,
    profit: financials?.estimatedProfit ?? 0,
    debts: financials?.outstandingDebts ?? 0,
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-2xl" />
        ))}
      </div>
    );
  }

  const currency = financials?.currency ?? 'RWF';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
      {CARD_CONFIG.map((card) => {
        const { key, titleKey, icon, iconBg, highlight } = card;
        const filled = 'filled' in card && card.filled;
        return (
        <div
          key={key}
          className={`glass-card p-unit-md rounded-2xl flex flex-col justify-between h-40 transition-all hover:-translate-y-1 cursor-default ${
            highlight ? 'border-l-4 border-l-secondary' : ''
          }`}
        >
          <div className={`p-2 rounded-lg w-fit ${iconBg}`}>
            <MaterialIcon name={icon} filled={filled} />
          </div>
          <div>
            <p className="text-on-surface-variant font-label-sm uppercase">{t(titleKey)}</p>
            <h3 className="font-headline-md text-primary text-xl md:text-2xl">
              {formatRWF(values[key], currency)}
            </h3>
          </div>
        </div>
        );
      })}
    </div>
  );
}
