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
      {!isLoading && !isError && !data?.data.length && (
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

      {!isLoading && data?.data.length ? (
        <ContentPanel noPadding header={<span className="font-headline-md text-primary">{t('transactions.ledger')}</span>}>
          <div className="divide-y divide-outline-variant custom-scrollbar">
            {data.data.map((txn) => {
              const isOutflow = txn.type === 'expense' || txn.type === 'purchase';
              return (
                <div
                  key={txn.id}
                  className="p-unit-md flex items-center justify-between hover:bg-surface-container-low transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-primary/5 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-all shrink-0">
                      <MaterialIcon name={TYPE_ICONS[txn.type]} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-primary truncate">{txn.description}</p>
                      <p className="text-xs text-on-surface-variant">
                        {formatDate(txn.date, i18n.language)} · {txn.category} · {t(`transactions.types.${txn.type}`)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <p className={`font-bold ${isOutflow ? 'text-red-600' : 'text-green-600'}`}>
                      {isOutflow ? '-' : '+'}
                      {formatRWF(txn.amount)}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => deleteMutation.mutate(txn.id)}
                      disabled={deleteMutation.isPending}
                    >
                      <MaterialIcon name="delete" className="text-error text-lg" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
          {data.meta && (
            <div className="px-unit-md pb-unit-md pt-unit-sm border-t border-outline-variant">
              <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
            </div>
          )}
        </ContentPanel>
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
