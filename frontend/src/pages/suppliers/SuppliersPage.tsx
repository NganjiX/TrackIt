import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Truck } from 'lucide-react';
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
import { SupplierForm } from '@/components/forms/SupplierForm';
import { suppliersApi } from '@/features/suppliers/api/suppliers.api';
import { formatRWF } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * Suppliers list page (SUPP-01..04).
 */
export function SuppliersPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['suppliers', page, search],
    queryFn: () => suppliersApi.list({ page, search }),
  });

  const createMutation = useMutation({
    mutationFn: suppliersApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      setDialogOpen(false);
      toast({ title: t('suppliers.created') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: suppliersApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast({ title: t('suppliers.deleted') });
    },
  });

  return (
    <div>
      <PageHeader
        title={t('pages.suppliers')}
        actions={
          <Button variant="gold" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('suppliers.add')}
          </Button>
        }
      />

      <div className="mb-6">
        <SearchInput value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder={t('suppliers.searchPlaceholder')} />
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
        <EmptyState icon={<Truck className="h-8 w-8 text-muted-foreground" />} title={t('suppliers.empty')} description={t('suppliers.emptyDesc')} />
      )}

      {!isLoading && data?.data.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.data.map((supplier) => (
            <Card key={supplier.id} className="glass-card border-0">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{supplier.name}</h3>
                    <p className="text-sm text-muted-foreground">{supplier.phone}</p>
                    {supplier.email && <p className="text-xs text-muted-foreground">{supplier.email}</p>}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(supplier.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('suppliers.totalPayments')}</span>
                    <span className="font-medium">{formatRWF(supplier.totalPayments)}</span>
                  </div>
                  <DebtBadge amount={supplier.outstandingBalance} variant="supplier" />
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
            <DialogTitle>{t('suppliers.add')}</DialogTitle>
          </DialogHeader>
          <SupplierForm
            onSubmit={(d) => createMutation.mutate(d)}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
