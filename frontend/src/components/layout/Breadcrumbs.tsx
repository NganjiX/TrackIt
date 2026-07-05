import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
}

const PATH_LABELS: Record<string, string> = {
  dashboard: 'pages.dashboard',
  transactions: 'pages.transactions',
  customers: 'pages.customers',
  suppliers: 'pages.suppliers',
  debts: 'pages.debts',
  documents: 'pages.documents',
  inventory: 'pages.inventory',
  analytics: 'pages.analytics',
  history: 'pages.history',
  passport: 'pages.passport',
  assistant: 'pages.assistant',
  settings: 'pages.settings',
  profile: 'pages.profile',
  admin: 'pages.admin',
  onboarding: 'pages.onboarding',
};

/**
 * Auto-generated breadcrumb navigation from current route.
 */
export function Breadcrumbs({ items }: BreadcrumbsProps) {
  const { t } = useTranslation();
  const location = useLocation();

  const crumbs: BreadcrumbItem[] = items ?? (() => {
    const segments = location.pathname.split('/').filter(Boolean);
    return segments.map((seg, i) => ({
      label: t(PATH_LABELS[seg] ?? seg),
      href: i < segments.length - 1 ? `/${segments.slice(0, i + 1).join('/')}` : undefined,
    }));
  })();

  if (crumbs.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
      <Link to="/dashboard" className="hover:text-foreground transition-colors">
        <Home className="h-4 w-4" />
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          <ChevronRight className="h-3 w-3" />
          {crumb.href ? (
            <Link to={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className={cn('font-medium text-foreground')}>{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
