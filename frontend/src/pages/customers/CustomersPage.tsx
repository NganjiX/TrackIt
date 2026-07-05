import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Users } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { SearchInput } from '@/components/data-display/SearchInput';
import { Pagination } from '@/components/data-display/Pagination';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { DebtBadge } from '@/components/data-display/DebtBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CustomerForm } from '@/components/forms/CustomerForm';
import { customersApi } from '@/features/customers/api/customers.api';
import { formatRWF } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * Customers list page (CUST-01..04).
 */
export function CustomersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['customers', page, search],
    queryFn: () => customersApi.list({ page, search }),
  });

  const createMutation = useMutation({
    mutationFn: customersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDialogOpen(false);
      toast({ title: t('customers.created') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: customersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast({ title: t('customers.deleted') });
    },
  });

  return (
    <div>
      <PageHeader
        title={t('pages.customers')}
        actions={
          <Button variant="gold" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('customers.add')}
          </Button>
        }
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('customers.searchPlaceholder')} />
      </div>

      {isLoading && <LoadingSkeleton rows={6} />}
      {isError && (
        <ErrorState
          onRetry={() => refetch()}
          errorCode={(error as unknown as ApiError)?.errorCode}
          message={(error as unknown as ApiError)?.message}
        />
      )}
      {!isLoading && !isError && !data?.data.length && (
        <EmptyState icon={<Users className="h-8 w-8 text-muted-foreground" />} title={t('customers.empty')} description={t('customers.emptyDesc')} />
      )}

      {!isLoading && data?.data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((customer) => (
            <Card key={customer.id} className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{customer.name}</h3>
                    <p className="text-sm text-muted-foreground">{customer.phone}</p>
                    {customer.email && <p className="text-xs text-muted-foreground">{customer.email}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(customer.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('customers.totalPurchases')}</span>
                    <span className="font-medium">{formatRWF(customer.totalPurchases)}</span>
                  </div>
                  <DebtBadge amount={customer.debtBalance} variant="customer" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : null}

      {data?.meta && (
        <Pagination page={data.meta.page} totalPages={data.meta.totalPages} onPageChange={setPage} />
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('customers.add')}</DialogTitle>
          </DialogHeader>
          <CustomerForm
            onSubmit={(d) => createMutation.mutate(d)}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
