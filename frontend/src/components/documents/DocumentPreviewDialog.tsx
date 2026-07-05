import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { documentsApi, type Document } from '@/features/documents/api/documents.api';

interface DocumentPreviewDialogProps {
  document: Document | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

/**
 * In-app preview dialog for images and PDFs (DOC-04).
 */
export function DocumentPreviewDialog({ document, open, onOpenChange }: DocumentPreviewDialogProps) {
  const { t } = useTranslation();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['documents', 'preview', document?.id],
    queryFn: () => documentsApi.getPreviewUrl(document!.id),
    enabled: open && !!document,
  });

  const isPdf = document?.mimeType === 'application/pdf';
  const isImage = document?.mimeType.startsWith('image/');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{document?.name ?? t('documents.preview')}</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-[300px] flex items-center justify-center bg-muted/30 rounded-lg overflow-auto">
          {isLoading && <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />}
          {isError && (
            <p className="text-sm text-destructive">{t('documents.previewError')}</p>
          )}
          {data && isImage && (
            <img
              src={data.previewUrl}
              alt={document?.name}
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}
          {data && isPdf && (
            <iframe
              src={data.previewUrl}
              title={document?.name}
              className="w-full h-[70vh] border-0"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
