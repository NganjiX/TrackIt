import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '@/components/data-display/PageHeader';
import { ErrorState } from '@/components/data-display/ErrorState';
import { FinancialSummaryCards } from '@/components/dashboard/FinancialSummaryCards';
import { CreditReadinessBanner } from '@/components/dashboard/CreditReadinessBanner';
import { HealthScoreWidget } from '@/components/dashboard/HealthScoreWidget';
import { RecentTransactions } from '@/components/dashboard/RecentTransactions';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { useDashboardSummary } from '@/features/dashboard/hooks/useDashboard';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/button';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import { ROUTES } from '@/lib/constants';

/**
 * Main dashboard — Stitch bento grid layout (DASH-01 through DASH-05).
 */
export function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const { data, isLoading, isError, error, refetch } = useDashboardSummary();

  const greeting = user?.fullName
    ? t('dashboard.greeting', { name: user.fullName.split(' ')[0] })
    : t('pages.dashboard');

  if (isError) {
    return (
      <div>
        <PageHeader title={t('pages.dashboard')} />
        <ErrorState
          errorCode={(error as { errorCode?: string })?.errorCode}
          message={(error as { message?: string })?.message}
          onRetry={() => refetch()}
        />
      </div>
    );
  }

  return (
    <div className="space-y-gutter">
      <header className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-unit-md mb-unit-lg">
        <div>
          <h1 className="font-headline-md text-headline-md text-white">{greeting}</h1>
          <p className="text-[#A0A0A0] font-body-md mt-1">{t('dashboard.welcome')}</p>
        </div>
        <div className="flex flex-wrap gap-unit-md">
          <Button variant="pill" onClick={() => navigate(ROUTES.TRANSACTIONS)} className="bg-[#BFFF00] text-black hover:bg-[#CCFF00]">
            <MaterialIcon name="sell" className="text-black" />
            {t('dashboard.actions.recordSale')}
          </Button>
          <Button variant="pill-outline" onClick={() => navigate(ROUTES.DOCUMENTS)} className="bg-[#0D0D0D] border-[#1E1E1E] text-white hover:border-[#BFFF00]/60">
            <MaterialIcon name="upload_file" />
            {t('dashboard.actions.uploadReceipt')}
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-12 gap-gutter">
        <div className="col-span-12 lg:col-span-8">
          <FinancialSummaryCards financials={data?.financials} isLoading={isLoading} />
        </div>
        <div className="col-span-12 lg:col-span-4">
          <HealthScoreWidget breakdown={data?.healthScoreBreakdown} isLoading={isLoading} />
        </div>

        <div className="col-span-12">
          <CreditReadinessBanner creditReadiness={data?.creditReadiness} isLoading={isLoading} />
        </div>

        <div className="col-span-12 lg:col-span-8">
          <RecentTransactions
            transactions={data?.recentTransactions}
            currency={data?.financials.currency}
            isLoading={isLoading}
          />
        </div>

        <div className="col-span-12 lg:col-span-4">
          <QuickActions actions={data?.quickActions} />
        </div>
      </div>
    </div>
  );
}
