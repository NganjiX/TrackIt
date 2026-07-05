import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Plus, Trash2, FileText, Eye } from 'lucide-react';
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
import { DocumentUploadForm } from '@/components/forms/DocumentUploadForm';
import { DocumentPreviewDialog } from '@/components/documents/DocumentPreviewDialog';
import {
  documentsApi,
  type Document,
  type DocumentCategory,
  type CreateDocumentPayload,
} from '@/features/documents/api/documents.api';
import { formatRWF, formatDate } from '@/lib/utils';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

const CATEGORY_FILTERS: Array<{ value: DocumentCategory | ''; labelKey: string }> = [
  { value: '', labelKey: 'documents.filters.all' },
  { value: 'receipt', labelKey: 'documents.categories.receipt' },
  { value: 'invoice', labelKey: 'documents.categories.invoice' },
  { value: 'bill', labelKey: 'documents.categories.bill' },
  { value: 'contract', labelKey: 'documents.categories.contract' },
  { value: 'payment_proof', labelKey: 'documents.categories.payment_proof' },
  { value: 'other', labelKey: 'documents.categories.other' },
];

/**
 * Documents page with upload, filter, search, and preview (DOC-01..04).
 */
export function DocumentsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<DocumentCategory | ''>('');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<Document | null>(null);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['documents', page, search, categoryFilter],
    queryFn: () => documentsApi.list({ page, limit: 15, search, category: categoryFilter }),
  });

  const uploadMutation = useMutation({
    mutationFn: async ({ file, meta }: { file: File; meta: CreateDocumentPayload }) => {
      const { uploadUrl, fileKey } = await documentsApi.getUploadUrl({
        fileName: file.name,
        mimeType: file.type,
        fileSize: file.size,
      });
      await documentsApi.uploadFile(uploadUrl, file);
      return documentsApi.create({ ...meta, fileKey, mimeType: file.type, fileSize: file.size });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setUploadOpen(false);
      toast({ title: t('documents.uploaded') });
    },
    onError: (e: ApiError) => toast({ variant: 'destructive', title: e.message }),
  });

  const deleteMutation = useMutation({
    mutationFn: documentsApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast({ title: t('documents.deleted') });
    },
  });

  return (
    <div>
      <PageHeader
        title={t('pages.documents')}
        actions={
          <Button variant="gold" onClick={() => setUploadOpen(true)}>
            <Plus className="h-4 w-4" />
            {t('documents.upload')}
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <SearchInput
          value={search}
          onChange={(v) => { setSearch(v); setPage(1); }}
          placeholder={t('documents.searchPlaceholder')}
        />
        <div className="flex gap-2 flex-wrap">
          {CATEGORY_FILTERS.map(({ value, labelKey }) => (
            <Button
              key={value || 'all'}
              size="sm"
              variant={categoryFilter === value ? 'default' : 'outline'}
              onClick={() => { setCategoryFilter(value); setPage(1); }}
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
          icon={<FileText className="h-8 w-8 text-muted-foreground" />}
          title={t('documents.empty')}
          description={t('documents.emptyDesc')}
        />
      )}

      {!isLoading && data?.data.length ? (
        <Card className="glass-card border-0">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="text-left p-4 font-medium">{t('documents.name')}</th>
                    <th className="text-left p-4 font-medium">{t('documents.category')}</th>
                    <th className="text-left p-4 font-medium">{t('documents.date')}</th>
                    <th className="text-right p-4 font-medium">{t('documents.amount')}</th>
                    <th className="text-left p-4 font-medium">{t('documents.type')}</th>
                    <th className="p-4 w-24" />
                  </tr>
                </thead>
                <tbody>
                  {data.data.map((doc) => (
                    <tr key={doc.id} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="p-4">
                        <div className="font-medium">{doc.name}</div>
                        {doc.notes && (
                          <div className="text-xs text-muted-foreground truncate max-w-[200px]">{doc.notes}</div>
                        )}
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary">{t(`documents.categories.${doc.category}`)}</Badge>
                      </td>
                      <td className="p-4 whitespace-nowrap">{formatDate(doc.date, i18n.language)}</td>
                      <td className="p-4 text-right">
                        {doc.amount !== null ? formatRWF(doc.amount) : '—'}
                      </td>
                      <td className="p-4 text-muted-foreground uppercase text-xs">
                        {doc.mimeType === 'application/pdf' ? 'PDF' : doc.mimeType.split('/')[1]}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setPreviewDoc(doc)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteMutation.mutate(doc.id)}
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

      <Dialog open={uploadOpen} onOpenChange={setUploadOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('documents.upload')}</DialogTitle>
          </DialogHeader>
          <DocumentUploadForm
            onSubmit={(file, meta) => uploadMutation.mutate({ file, meta })}
            onCancel={() => setUploadOpen(false)}
            isSubmitting={uploadMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      <DocumentPreviewDialog
        document={previewDoc}
        open={!!previewDoc}
        onOpenChange={(open) => !open && setPreviewDoc(null)}
      />
    </div>
  );
}
