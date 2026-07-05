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
    return <Skeleton className="h-96 rounded-2xl bg-[#111111]" />;
  }

  return (
    <div className="glass-card rounded-2xl overflow-hidden flex flex-col h-full">
      <div className="p-unit-md border-b border-[#1E1E1E] flex justify-between items-center bg-[#0D0D0D]">
        <h4 className="font-headline-md text-xl text-white">{t('dashboard.recentTransactions')}</h4>
        <Link to={ROUTES.TRANSACTIONS} className="text-[#BFFF00] font-bold text-sm hover:underline">
          {t('dashboard.viewAll')}
        </Link>
      </div>
      <div className="custom-scrollbar overflow-y-auto max-h-[480px] flex-1">
        {!transactions?.length ? (
          <div className="p-unit-md">
            <EmptyState title={t('dashboard.noTransactions')} description={t('dashboard.noTransactionsDesc')} />
          </div>
        ) : (
          <div className="divide-y divide-[#1E1E1E]">
            {transactions.map((txn) => {
              const isOutflow = txn.type === 'expense' || txn.type === 'purchase';
              const icon = TYPE_ICONS[txn.type] ?? 'receipt_long';
              return (
                <div
                  key={txn.id}
                  className="p-unit-md flex items-center justify-between hover:bg-[#111111] transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#111111] border border-[#1E1E1E] flex items-center justify-center text-[#BFFF00] group-hover:bg-[#BFFF00] group-hover:text-black transition-all shrink-0">
                      <MaterialIcon name={icon} className="text-lg" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white truncate">{txn.description}</p>
                      <p className="text-xs text-[#A0A0A0]">
                        {formatDate(txn.date, i18n.language)} · {txn.category}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <p className={`font-bold ${isOutflow ? 'text-[#A0A0A0]' : 'text-[#BFFF00]'}`}>
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
