import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { PageHeader } from '@/components/data-display/PageHeader';
import { SearchInput } from '@/components/data-display/SearchInput';
import { Pagination } from '@/components/data-display/Pagination';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { ContentPanel, FilterChip } from '@/components/layout/ContentPanel';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TransactionForm } from '@/components/forms/TransactionForm';
import { transactionsApi, type TransactionType } from '@/features/transactions/api/transactions.api';
import { formatRWF, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

const TYPE_FILTERS: Array<{ value: TransactionType | ''; labelKey: string }> = [
  { value: '', labelKey: 'transactions.filters.all' },
  { value: 'sale', labelKey: 'transactions.types.sale' },
  { value: 'expense', labelKey: 'transactions.types.expense' },
  { value: 'purchase', labelKey: 'transactions.types.purchase' },
];

const TYPE_ICONS: Record<TransactionType, string> = {
  sale: 'account_balance_wallet',
  expense: 'electric_bolt',
  purchase: 'shopping_cart',
};

export function TransactionsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<TransactionType | ''>('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['transactions', page, search, typeFilter],
    queryFn: () => transactionsApi.list({ page, limit: 15, search, type: typeFilter }),
  });
  const rows = Array.isArray(data?.data) ? data.data : [];
  const pagination = data && !Array.isArray(data) && 'meta' in data ? data.meta : null;
  const monthly = rows.reduce(
    (acc, txn) => {
      if (txn.type === 'sale') acc.sales += txn.amount;
      if (txn.type === 'expense' || txn.type === 'purchase') acc.expenses += txn.amount;
      return acc;
    },
    { sales: 0, expenses: 0 },
  );
  const cashflow = monthly.sales - monthly.expenses;

  const createMutation = useMutation({
    mutationFn: transactionsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
      toast({ title: t('transactions.created') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: transactionsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: t('transactions.deleted') });
    },
  });

  return (
    <div className="space-y-gutter">
      <PageHeader
        title={t('pages.transactions')}
        description={t('transactions.subtitle')}
        actions={
          <Button variant="gold" onClick={() => setDialogOpen(true)}>
            <MaterialIcon name="add_circle" />
            {t('transactions.add')}
          </Button>
        }
      />

      <div className="flex flex-col lg:flex-row gap-unit-md mb-unit-md">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('transactions.searchPlaceholder')} />
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(({ value, labelKey }) => (
            <FilterChip
              key={value || 'all'}
              active={typeFilter === value}
              onClick={() => { setTypeFilter(value); setPage(1); }}
            >
              {t(labelKey)}
            </FilterChip>
          ))}
        </div>
      </div>

      {isLoading && <LoadingSkeleton rows={8} />}
      {isError && (
        <ErrorState
          onRetry={() => refetch()}
          errorCode={(error as unknown as ApiError)?.errorCode}
          message={(error as unknown as ApiError)?.message}
        />
      )}
      {!isLoading && !isError && rows.length === 0 && (
        <ContentPanel>
          <EmptyState
            iconName="receipt_long"
            title={t('transactions.empty')}
            description={t('transactions.emptyDesc')}
            action={
              <Button variant="gold" onClick={() => setDialogOpen(true)}>
                <MaterialIcon name="add" />
                {t('transactions.add')}
              </Button>
            }
          />
        </ContentPanel>
      )}

      {!isLoading && rows.length > 0 ? (
        <div className="grid grid-cols-12 gap-gutter">
          <div className="col-span-12 xl:col-span-8">
            <ContentPanel
              noPadding
              header={<span className="font-headline-md text-primary">{t('transactions.ledger')}</span>}
            >
              <div className="grid grid-cols-12 px-unit-md py-4 bg-primary/5 border-b border-outline-variant/20 text-[11px] uppercase tracking-wider text-on-surface-variant font-bold">
                <div className="col-span-2">{t('transactions.date')}</div>
                <div className="col-span-3">{t('transactions.description')}</div>
                <div className="col-span-2">{t('transactions.category')}</div>
                <div className="col-span-2">{t('transactions.party', { defaultValue: 'Party' })}</div>
                <div className="col-span-2 text-right">{t('transactions.amount')}</div>
                <div className="col-span-1 text-center">{t('transactions.paymentStatus')}</div>
              </div>
              <div className="divide-y divide-outline-variant/20 custom-scrollbar">
                {rows.map((txn) => {
                  const isOutflow = txn.type === 'expense' || txn.type === 'purchase';
                  const party = txn.customer?.name || txn.supplier?.name || '-';
                  const statusTone =
                    txn.paymentStatus === 'paid'
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : txn.paymentStatus === 'partial'
                        ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                        : 'bg-red-100 text-red-800 border-red-200';

                  return (
                    <div
                      key={txn.id}
                      className="grid grid-cols-12 px-unit-md py-4 hover:bg-surface-container-low transition-colors items-center gap-2 group"
                    >
                      <div className="col-span-2 text-sm text-on-surface">{formatDate(txn.date, i18n.language)}</div>
                      <div className="col-span-3 min-w-0">
                        <div className="flex items-center gap-2">
                          <MaterialIcon name={TYPE_ICONS[txn.type]} className="text-primary text-lg shrink-0" />
                          <p className="font-semibold text-primary truncate">{txn.description}</p>
                        </div>
                      </div>
                      <div className="col-span-2">
                        <span className="px-2 py-1 rounded-full bg-surface-container-high text-on-primary-container text-[11px] font-semibold">
                          {txn.category}
                        </span>
                      </div>
                      <div className="col-span-2 text-sm text-on-surface-variant truncate">{party}</div>
                      <div className={`col-span-2 text-right font-bold ${isOutflow ? 'text-error' : 'text-green-700'}`}>
                        {isOutflow ? '-' : '+'}
                        {formatRWF(txn.amount)}
                      </div>
                      <div className="col-span-1 flex items-center justify-center gap-1">
                        <span className={`px-2 py-1 rounded-full text-[10px] uppercase font-bold border ${statusTone}`}>
                          {t(`transactions.payment.${txn.paymentStatus}`)}
                        </span>
                        <button
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => deleteMutation.mutate(txn.id)}
                          disabled={deleteMutation.isPending}
                          aria-label={t('common.delete', { defaultValue: 'Delete' })}
                        >
                          <MaterialIcon name="delete" className="text-error text-lg" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              {pagination && (
                <div className="px-unit-md pb-unit-md pt-unit-sm border-t border-outline-variant">
                  <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
                </div>
              )}
            </ContentPanel>
          </div>

          <aside className="col-span-12 xl:col-span-4 space-y-unit-md">
            <ContentPanel
              header={
                <span className="font-headline-md text-primary">
                  {t('transactions.monthlySummary', { defaultValue: 'Monthly Summary' })}
                </span>
              }
            >
              <div className="space-y-3">
                <div className="rounded-xl bg-green-50 border border-green-100 p-3">
                  <p className="text-xs text-green-700">{t('transactions.totalSales', { defaultValue: 'Total Sales' })}</p>
                  <p className="font-headline-md text-green-800">{formatRWF(monthly.sales)}</p>
                </div>
                <div className="rounded-xl bg-red-50 border border-red-100 p-3">
                  <p className="text-xs text-red-700">{t('transactions.totalExpenses', { defaultValue: 'Total Expenses' })}</p>
                  <p className="font-headline-md text-red-800">{formatRWF(monthly.expenses)}</p>
                </div>
                <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                  <p className="text-xs text-primary">{t('transactions.netCashflow', { defaultValue: 'Net Cash Flow' })}</p>
                  <p className="font-headline-md text-primary">{formatRWF(cashflow)}</p>
                </div>
              </div>
            </ContentPanel>

            <ContentPanel
              header={
                <span className="font-headline-md text-primary">
                  {t('transactions.quickInsights', { defaultValue: 'Quick Insights' })}
                </span>
              }
            >
              <p className="text-sm text-on-surface-variant leading-relaxed">
                {rows.length === 0
                  ? t('transactions.noInsights', { defaultValue: 'Add transactions to unlock actionable insights.' })
                  : t('transactions.insightsHint', {
                      defaultValue:
                        'You have {{count}} recent records. Keep logging consistently to strengthen your credit profile.',
                      count: rows.length,
                    })}
              </p>
              <Button variant="outline" className="w-full mt-4">
                <MaterialIcon name="download" />
                {t('transactions.export', { defaultValue: 'Export Report' })}
              </Button>
            </ContentPanel>
          </aside>
        </div>
      ) : null}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('transactions.add')}</DialogTitle>
          </DialogHeader>
          <TransactionForm
            onSubmit={(d) => {
              const payload = { ...d };
              if (!payload.customerId) delete payload.customerId;
              if (!payload.supplierId) delete payload.supplierId;
              createMutation.mutate(payload);
            }}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
