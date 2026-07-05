import { useTranslation } from 'react-i18next';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ErrorStateProps {
  message?: string;
  errorCode?: string;
  onRetry?: () => void;
  className?: string;
}

/**
 * Reusable error state with optional retry action.
 */
export function ErrorState({ message, errorCode, onRetry, className }: ErrorStateProps) {
  const { t } = useTranslation();
  const displayMessage =
    message ??
    (errorCode ? t(`errors.${errorCode}`, { defaultValue: t('common.error') }) : t('common.error'));

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-full bg-destructive/10 p-4 mb-4">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <h3 className="font-semibold text-lg mb-1">{t('common.error')}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mb-4">{displayMessage}</p>
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
