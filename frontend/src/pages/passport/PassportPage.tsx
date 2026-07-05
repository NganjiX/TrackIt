import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Download, Share2 } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { PassportCard } from '@/components/passport/PassportCard';
import { ActivitySummary } from '@/components/passport/ActivitySummary';
import { ImprovementChecklist } from '@/components/passport/ImprovementChecklist';
import { SharePassportDialog } from '@/components/passport/SharePassportDialog';
import { passportApi } from '@/features/passport/api/passport.api';
import { toast } from '@/hooks/useToast';
import type { ApiError } from '@/lib/api/types';

/**
 * Digital Business Passport page (PASS-01..05).
 */
export function PassportPage() {
  const { t } = useTranslation();
  const [shareOpen, setShareOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['passport'],
    queryFn: passportApi.get,
  });

  const handleExportPdf = async () => {
    try {
      setExporting(true);
      const blob = await passportApi.exportPdf();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `smartledger-passport-${data?.passportId ?? 'export'}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      toast({ title: t('passport.pdfDownloaded') });
    } catch {
      toast({ variant: 'destructive', title: t('passport.pdfError') });
    } finally {
      setExporting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title={t('pages.passport')}
        actions={
          data ? (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShareOpen(true)}>
                <Share2 className="h-4 w-4" />
                {t('passport.share')}
              </Button>
              <Button variant="gold" onClick={handleExportPdf} disabled={exporting}>
                <Download className="h-4 w-4" />
                {t('passport.exportPdf')}
              </Button>
            </div>
          ) : undefined
        }
      />

      {isLoading && <LoadingSkeleton rows={10} />}
      {isError && (
        <ErrorState
          onRetry={() => refetch()}
          errorCode={(error as unknown as ApiError)?.errorCode}
          message={(error as unknown as ApiError)?.message}
        />
      )}

      {data && (
        <div className="space-y-6">
          <PassportCard passport={data} />
          <ActivitySummary summary={data.activitySummary} />
          <ImprovementChecklist items={data.improvementChecklist} />
        </div>
      )}

      <SharePassportDialog open={shareOpen} onOpenChange={setShareOpen} />
    </div>
  );
}
