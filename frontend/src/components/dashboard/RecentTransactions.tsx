import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/data-display/EmptyState';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { formatRWF, formatDate } from '@/lib/utils';
import { ROUTES } from '@/lib/constants';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

interface RecentTransactionsProps {
  transactions?: DashboardSummary['recentTransactions'];
  currency?: string;
  isLoading?: boolean;
}

const TYPE_ICONS: Record<string, string> = {
  sale: 'account_balance_wallet',
  expense: 'electric_bolt',
  purchase: 'shopping_cart',
};

/**
 * Recent activity list — Stitch transaction row style (DASH-04).
 */
export function RecentTransactions({ transactions, currency = 'RWF', isLoading }: RecentTransactionsProps) {
  const { t, i18n } = useTranslation();

  if (isLoading) {
    return <Skeleton className="h-96 rounded-2xl" />;
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-unit-md border-b border-outline-variant flex justify-between items-center bg-white/50">
        <h4 className="font-headline-md text-xl text-primary">{t('dashboard.recentTransactions')}</h4>
        <Link to={ROUTES.TRANSACTIONS} className="text-secondary font-bold text-sm hover:underline">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="custom-scrollbar overflow-y-auto max-h-[480px] flex-1">
        {!transactions?.length ? (
          <div className="p-unit-md">
            <EmptyState title={t('dashboard.noTransactions')} description={t('dashboard.noTransactionsDesc')} />
          </div>
        ) : (
          <div className="divide-y divide-outline-variant">
            {transactions.map((txn) => {
              const isOutflow = txn.type === 'expense' || txn.type === 'purchase';
              const icon = TYPE_ICONS[txn.type] ?? 'receipt_long';
              return (
                <div
                  key={txn.id}
                  className="p-unit-md flex items-center justify-between hover:bg-surface-container-low transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                      <MaterialIcon name={icon} className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate">{txn.description}</p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(txn.date, i18n.language)} · {txn.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`font-bold ${isOutflow ? 'text-red-600' : 'text-green-600'}`}>
                      {isOutflow ? '-' : '+'}
                      {formatRWF(txn.amount, currency)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
