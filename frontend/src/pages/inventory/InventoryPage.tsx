import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, Package, ArrowUpDown } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { SearchInput } from '@/components/data-display/SearchInput';
import { Pagination } from '@/components/data-display/Pagination';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { EmptyState } from '@/components/data-display/EmptyState';
import { LowStockBanner } from '@/components/inventory/LowStockBanner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from '@/components/forms/ProductForm';
import { inventoryApi, type ProductSortField } from '@/features/inventory/api/inventory.api';
import { formatRWF, cn } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

type SortState = { field: ProductSortField; order: 'asc' | 'desc' };

const SORT_COLUMNS: Array<{ field: ProductSortField; labelKey: string }> = [
  { field: 'name', labelKey: 'inventory.name' },
  { field: 'category', labelKey: 'inventory.category' },
  { field: 'price', labelKey: 'inventory.price' },
  { field: 'cost', labelKey: 'inventory.cost' },
  { field: 'stockQuantity', labelKey: 'inventory.stockQuantity' },
];

/**
 * Inventory page with sortable product table and low-stock banner (INV-01..04).
 */
export function InventoryPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortState>({ field: 'name', order: 'asc' });
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['inventory', page, search, sort.field, sort.order],
    queryFn: () => inventoryApi.list({
      page,
      limit: 15,
      search,
      sortBy: sort.field,
      sortOrder: sort.order,
    }),
  });

  const createMutation = useMutation({
    mutationFn: inventoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      setDialogOpen(false);
      toast({ title: t('inventory.created') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: inventoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      toast({ title: t('inventory.deleted') });
    },
  });

  const toggleSort = (field: ProductSortField) => {
    setSort((prev) =>
      prev.field === field
        ? { field, order: prev.order === 'asc' ? 'desc' : 'asc' }
        : { field, order: 'asc' },
    );
    setPage(1);
  };

  return (
    <div>
      <PageHeader
        title={t('pages.inventory')}
        actions={
          <Button variant="gold" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('inventory.add')}
          </Button>
        }
      />

      <LowStockBanner />

      <div className="mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t('inventory.searchPlaceholder')}
        />
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
          icon={<Package className="h-8 w-8 text-muted-foreground" />}
          title={t('inventory.empty')}
          description={t('inventory.emptyDesc')}
        />
      )}

      {!isLoading && data?.data.length ? (
        <Card className="glass-card border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    {SORT_COLUMNS.map(({ field, labelKey }) => (
                      <th key={field} className="text-left p-4 font-medium">
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 hover:text-foreground"
                          onClick={() => toggleSort(field)}
                        >
                          {t(labelKey)}
                          <ArrowUpDown
                            className={cn(
                              'h-3 w-3',
                              sort.field === field ? 'text-foreground' : 'text-muted-foreground/50',
                            )}
                          />
                        </button>
                      </th>
                    ))}
                    <th className="text-left p-4 font-medium">{t('inventory.unit')}</th>
                    <th className="text-left p-4 font-medium">{t('inventory.status')}</th>
                    <th className="p-4 w-10" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((product) => (
                    <tr key={product.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-4 font-medium">{product.name}</td>
                      <td className="p-4">{product.category}</td>
                      <td className="p-4">{formatRWF(product.price)}</td>
                      <td className="p-4">{formatRWF(product.cost)}</td>
                      <td className="p-4">{product.stockQuantity}</td>
                      <td className="p-4">{product.unit}</td>
                      <td className="p-4">
                        {product.isLowStock ? (
                          <Badge variant="warning">{t('inventory.lowStock')}</Badge>
                        ) : (
                          <Badge variant="success">{t('inventory.inStock')}</Badge>
                        )}
                      </td>
                      <td className="p-4">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(product.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('inventory.add')}</DialogTitle>
          </DialogHeader>
          <ProductForm
            onSubmit={(d) => createMutation.mutate(d)}
            onCancel={() => setDialogOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
