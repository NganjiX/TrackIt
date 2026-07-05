import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Lightbulb, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RevenueExpenseChart } from '@/components/analytics/RevenueExpenseChart';
import { ExpenseBreakdownChart } from '@/components/analytics/ExpenseBreakdownChart';
import { ProfitTrendChart } from '@/components/analytics/ProfitTrendChart';
import { analyticsApi, type AnalyticsPeriod } from '@/features/analytics/api/analytics.api';
import { formatRWF } from '@/lib/utils';
import type { ApiError } from '@/lib/api/types';

const PERIODS: Array<{ value: AnalyticsPeriod; labelKey: string }> = [
  { value: 'month', labelKey: 'analytics.periods.month' },
  { value: 'quarter', labelKey: 'analytics.periods.quarter' },
  { value: 'year', labelKey: 'analytics.periods.year' },
];

/**
 * Analytics dashboard with charts and auto-generated insights (ANLY-01..05).
 */
export function AnalyticsPage() {
  const { t } = useTranslation();
  const [period, setPeriod] = useState<AnalyticsPeriod>('year');

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['analytics', period],
    queryFn: () => analyticsApi.summary({ period }),
  });

  const currency = data?.summary.currency ?? 'RWF';

  return (
    <div>
      <PageHeader title={t('pages.analytics')} />

      <div className="flex gap-2 mb-6 flex-wrap">
        {PERIODS.map(({ value, labelKey }) => (
          <Button
            key={value}
            size="sm"
            variant={period === value ? 'default' : 'outline'}
            onClick={() => setPeriod(value)}
          >
            {t(labelKey)}
          </Button>
        ))}
      </div>

      {isLoading && <LoadingSkeleton rows={10} />}
      {isError && (
        <ErrorState
          onRetry={() => refetch()}
          errorCode={(error as unknown as ApiError)?.errorCode}
          message={(error as unknown as ApiError)?.message}
        />
      )}

      {data && (
        <>
          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('analytics.totalRevenue')}
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatRWF(data.summary.totalRevenue, currency)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('analytics.totalExpenses')}
                </CardTitle>
                <TrendingDown className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatRWF(data.summary.totalExpenses, currency)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('analytics.netProfit')}
                </CardTitle>
                <Wallet className="h-4 w-4 text-gold-600" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatRWF(data.summary.netProfit, currency)}</p>
              </CardContent>
            </Card>
          </div>

          {data.insights && (
            <Card className="glass-card border-0 mb-6">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-gold-600" />
                  {t('analytics.insights')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li className="flex gap-2">
                    <span className="text-gold-600">•</span>
                    {data.insights.revenueTrend}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-600">•</span>
                    {data.insights.topExpenseCategory}
                  </li>
                  <li className="flex gap-2">
                    <span className="text-gold-600">•</span>
                    {data.insights.profitMargin}
                  </li>
                </ul>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-6 lg:grid-cols-2 mb-6">
            <RevenueExpenseChart data={data.revenueVsExpenses} currency={currency} />
            <ExpenseBreakdownChart data={data.expenseBreakdown} currency={currency} />
          </div>

          <ProfitTrendChart data={data.profitTrend} currency={currency} />
        </>
      )}
    </div>
  );
}
