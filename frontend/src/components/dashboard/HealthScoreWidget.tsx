import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

interface HealthScoreWidgetProps {
  breakdown?: DashboardSummary['healthScoreBreakdown'];
  isLoading?: boolean;
}

/**
 * Circular health score ring widget (DASH-03).
 */
export function HealthScoreWidget({ breakdown, isLoading }: HealthScoreWidgetProps) {
  const { t } = useTranslation();

  if (isLoading) {
    return <Skeleton className="h-72 rounded-2xl" />;
  }

  const overall = breakdown?.overall ?? 0;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (overall / 100) * circumference;

  const status =
    overall >= 70 ? 'good' : overall >= 35 ? 'medium' : 'low';

  return (
    <div className="glass-card p-unit-md rounded-2xl flex flex-col items-center justify-center text-center h-full min-h-[280px]">
      <h4 className="font-label-sm text-on-surface-variant mb-4 uppercase">
        {t('dashboard.healthScore')}
      </h4>
      <div className="relative w-32 h-32 flex items-center justify-center">
        <svg className="w-full h-full" viewBox="0 0 100 100">
          <circle
            className="text-surface-container"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeWidth="8"
          />
          <circle
            className="text-secondary progress-ring__circle"
            cx="50"
            cy="50"
            fill="transparent"
            r={radius}
            stroke="currentColor"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            strokeWidth="8"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display-lg text-3xl text-primary">{overall}</span>
          <span className="text-xs text-on-surface-variant">/100</span>
        </div>
      </div>
      <p
        className={`mt-4 font-bold flex items-center gap-1 text-sm ${
          status === 'good' ? 'text-green-600' : status === 'medium' ? 'text-secondary' : 'text-error'
        }`}
      >
        <MaterialIcon name={status === 'good' ? 'check_circle' : 'warning'} className="text-sm" />
        {t(`dashboard.healthStatus.${status}`)}
      </p>
    </div>
  );
}
