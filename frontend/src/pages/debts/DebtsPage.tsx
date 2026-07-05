import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Banknote, AlertTriangle, ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { SearchInput } from '@/components/data-display/SearchInput';
import { Pagination } from '@/components/data-display/Pagination';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DebtForm } from '@/components/forms/DebtForm';
import { DebtPaymentForm } from '@/components/forms/DebtPaymentForm';
import { debtsApi, type Debt, type DebtType } from '@/features/debts/api/debts.api';
import { formatRWF, formatDate, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

const TYPE_FILTERS: Array<{ value: DebtType | ''; labelKey: string }> = [
  { value: '', labelKey: 'debts.filters.all' },
  { value: 'receivable', labelKey: 'debts.types.receivable' },
  { value: 'payable', labelKey: 'debts.types.payable' },
];

const STATUS_VARIANTS: Record<Debt['status'], 'secondary' | 'warning' | 'success' | 'destructive'> = {
  pending: 'secondary',
  partial: 'warning',
  paid: 'success',
  overdue: 'destructive',
};

/**
 * Debt management page with summary cards, filters, and payment recording (DEBT-01..05).
 */
export function DebtsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<DebtType | ''>('');
  const [createOpen, setCreateOpen] = useState(false);
  const [paymentDebt, setPaymentDebt] = useState<Debt | null>(null);

  const { data: summary } = useQuery({
    queryKey: ['debts', 'summary'],
    queryFn: debtsApi.summary,
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['debts', page, search, typeFilter],
    queryFn: () => debtsApi.list({ page, limit: 15, search, type: typeFilter }),
  });

  const createMutation = useMutation({
    mutationFn: debtsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setCreateOpen(false);
      toast({ title: t('debts.created') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const paymentMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string; amount: number; note?: string }) =>
      debtsApi.recordPayment(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setPaymentDebt(null);
      toast({ title: t('debts.paymentRecorded') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: debtsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['debts'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: t('debts.deleted') });
    },
  });

  return (
    <div>
      <PageHeader
        title={t('pages.debts')}
        actions={
          <Button variant="gold" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('debts.add')}
          </Button>
        }
      />

      {summary && (
        <div className="grid gap-4 sm:grid-cols-3 mb-6">
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-emerald-600 mb-2">
                <ArrowUpRight className="h-4 w-4" />
                <span className="text-sm font-medium">{t('debts.summary.receivable')}</span>
              </div>
              <p className="text-2xl font-bold">{formatRWF(summary.totalReceivable)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-red-600 mb-2">
                <ArrowDownLeft className="h-4 w-4" />
                <span className="text-sm font-medium">{t('debts.summary.payable')}</span>
              </div>
              <p className="text-2xl font-bold">{formatRWF(summary.totalPayable)}</p>
            </CardContent>
          </Card>
          <Card className="glass-card border-0">
            <CardContent className="p-5">
              <div className="flex items-center gap-2 text-amber-600 mb-2">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">{t('debts.summary.overdue')}</span>
              </div>
              <p className="text-2xl font-bold">{summary.overdueCount}</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t('debts.searchPlaceholder')}
        />
        <div className="flex gap-2 flex-wrap">
          {TYPE_FILTERS.map(({ value, labelKey }) => (
            <Button
              key={value || 'all'}
              size="sm"
              variant={typeFilter === value ? 'default' : 'outline'}
              onClick={() => { setTypeFilter(value); setPage(1); }}
            >
              {t(labelKey)}
            </Button>
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
        <EmptyState
          icon={<Banknote className="h-8 w-8 text-muted-foreground" />}
          title={t('debts.empty')}
          description={t('debts.emptyDesc')}
        />
      )}

      {!isLoading && data?.data.length ? (
        <Card className="glass-card border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium">{t('debts.partyName')}</th>
                    <th className="text-left p-4 font-medium">{t('debts.type')}</th>
                    <th className="text-left p-4 font-medium">{t('debts.dueDate')}</th>
                    <th className="text-right p-4 font-medium">{t('debts.amount')}</th>
                    <th className="text-right p-4 font-medium">{t('debts.remaining')}</th>
                    <th className="text-left p-4 font-medium">{t('debts.status')}</th>
                    <th className="p-4 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((debt) => (
                    <tr key={debt.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-4">
                        <div className="font-medium">{debt.partyName}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[180px]">{debt.description}</div>
                      </td>
                      <td className="p-4">
                        <span className={cn(
                          'inline-flex items-center gap-1',
                          debt.type === 'receivable' ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {debt.type === 'receivable'
                            ? <ArrowUpRight className="h-4 w-4" />
                            : <ArrowDownLeft className="h-4 w-4" />}
                          {t(`debts.types.${debt.type}`)}
                        </span>
                      </td>
                      <td className="p-4 whitespace-nowrap">{formatDate(debt.dueDate, i18n.language)}</td>
                      <td className="p-4 text-right">{formatRWF(debt.amount)}</td>
                      <td className="p-4 text-right font-medium">{formatRWF(debt.remainingAmount)}</td>
                      <td className="p-4">
                        <Badge variant={STATUS_VARIANTS[debt.status]}>
                          {t(`debts.statuses.${debt.status}`)}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          {debt.status !== 'paid' && (
                            <Button variant="ghost" size="sm" onClick={() => setPaymentDebt(debt)}>
                              {t('debts.pay')}
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(debt.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.meta && (
              <div className="px-4 pb-4">
                <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : null}

      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('debts.add')}</DialogTitle>
          </DialogHeader>
          <DebtForm
            onSubmit={(d) => createMutation.mutate(d)}
            onCancel={() => setCreateOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={!!paymentDebt} onOpenChange={(open) => !open && setPaymentDebt(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('debts.recordPayment')}</DialogTitle>
          </DialogHeader>
          {paymentDebt && (
            <DebtPaymentForm
              remainingAmount={paymentDebt.remainingAmount}
              onSubmit={(payload) => paymentMutation.mutate({ id: paymentDebt.id, ...payload })}
              onCancel={() => setPaymentDebt(null)}
              isSubmitting={paymentMutation.isPending}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
