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
    iconBg: 'bg-[#111111] text-[#BFFF00]',
    accent: 'text-[#BFFF00]',
    trend: '+11.2%',
    highlight: false,
  },
  {
    key: 'expenses',
    titleKey: 'dashboard.totalExpenses',
    icon: 'payments',
    iconBg: 'bg-[#111111] text-[#BFFF00]',
    accent: 'text-[#BFFF00]',
    trend: '+4.0%',
    highlight: false,
  },
  {
    key: 'profit',
    titleKey: 'dashboard.estimatedProfit',
    icon: 'stars',
    iconBg: 'bg-[#111111] text-[#BFFF00]',
    accent: 'text-[#BFFF00]',
    trend: '+18.6%',
    highlight: true,
    filled: true,
  },
  {
    key: 'debts',
    titleKey: 'dashboard.outstandingDebts',
    icon: 'account_balance',
    iconBg: 'bg-[#111111] text-[#BFFF00]',
    accent: 'text-[#BFFF00]',
    trend: '-6.3%',
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
          <Skeleton key={i} className="h-40 rounded-2xl bg-[#111111]" />
        ))}
      </div>
    );
  }

  const currency = financials?.currency ?? 'RWF';

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter">
      {CARD_CONFIG.map((card) => {
        const { key, titleKey, icon, iconBg, highlight, trend } = card;
        const filled = 'filled' in card && card.filled;
        return (
        <div
          key={key}
          className={`glass-card p-unit-md rounded-2xl flex flex-col justify-between h-40 transition-all hover:-translate-y-1 cursor-default ${
            highlight ? 'border-l-4 border-l-[#BFFF00]' : ''
          }`}
        >
          <div className={`p-2 rounded-lg w-fit ${iconBg}`}>
            <MaterialIcon name={icon} filled={filled} />
          </div>
          <div>
            <p className="text-[#A0A0A0] font-label-sm uppercase tracking-wider">{t(titleKey)}</p>
            <h3 className="font-headline-md text-white text-xl md:text-2xl">
              {formatRWF(values[key], currency)}
            </h3>
            <p className="mt-1 text-xs font-semibold text-[#BFFF00] flex items-center gap-1">
              <MaterialIcon name="trending_up" className="text-sm" />
              {trend}
            </p>
          </div>
        </div>
        );
      })}
    </div>
  );
}
