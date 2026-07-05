import { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  title?: string;
  description?: string;
  icon?: ReactNode;
  iconName?: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Premium empty state for list pages.
 */
export function EmptyState({
  title,
  description,
  icon,
  iconName = 'inbox',
  action,
  className,
}: EmptyStateProps) {
  const { t } = useTranslation();

  return (
    <div className={cn('flex flex-col items-center justify-center py-16 text-center', className)}>
      <div className="rounded-2xl bg-surface-container-low p-5 mb-5 premium-shadow">
        {icon ?? <MaterialIcon name={iconName} className="text-4xl text-primary/40" />}
      </div>
      <h3 className="font-headline-md text-xl text-primary mb-2">{title ?? t('empty.title')}</h3>
      <p className="text-body-md text-on-surface-variant max-w-sm mb-6">{description ?? t('empty.description')}</p>
      {action}
    </div>
  );
}
