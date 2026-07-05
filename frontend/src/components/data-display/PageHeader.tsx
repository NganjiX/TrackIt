import { ReactNode } from 'react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: ReactNode;
}

/**
 * Standard page header — Stitch typography.
 */
export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <div className="mb-unit-lg">
      <Breadcrumbs />
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-unit-md">
        <div>
          <h1 className="font-headline-md text-headline-md md:text-3xl text-primary tracking-tight">{title}</h1>
          {description && (
            <p className="text-on-surface-variant mt-1 text-body-md">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
    </div>
  );
}
