import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

interface CreditReadinessBannerProps {
  creditReadiness?: DashboardSummary['creditReadiness'];
  isLoading?: boolean;
}

/**
 * Credit readiness hero banner with progress bar (DASH-02).
 */
export function CreditReadinessBanner({ creditReadiness, isLoading }: CreditReadinessBannerProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton className="h-40 rounded-3xl" />;
  }

  const score = creditReadiness?.healthScore ?? 0;
  const label = creditReadiness?.label ?? t('dashboard.creditLevels.low');

  return (
    <div className="relative overflow-hidden bg-primary rounded-3xl p-unit-lg text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
      <div className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-br from-secondary/30 to-transparent" />
      <div className="relative z-10 space-y-4 max-w-xl">
        <h3 className="font-headline-md text-2xl md:text-3xl text-secondary-fixed">
          {t('dashboard.creditReadiness')}
        </h3>
        <p className="text-primary-fixed opacity-90 text-body-lg">
          {t('dashboard.creditBannerDesc', { score, label })}
        </p>
        <div className="w-full bg-primary-container h-3 rounded-full overflow-hidden">
          <div
            className="bg-secondary-fixed h-full transition-all duration-700 shadow-gold"
            style={{ width: `${score}%` }}
          />
        </div>
      </div>
      <div className="relative z-10">
        <Link
          to={ROUTES.PASSPORT}
          className="inline-flex items-center gap-2 px-8 py-4 bg-secondary-fixed text-primary font-bold rounded-xl hover:bg-secondary-fixed-dim transition-all active:scale-95 shadow-xl whitespace-nowrap"
        >
          {t('dashboard.viewCreditReport')}
          <MaterialIcon name="arrow_forward" />
        </Link>
      </div>
    </div>
  );
}
