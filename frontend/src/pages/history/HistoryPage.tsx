import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Award, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import { PageHeader } from '@/components/data-display/PageHeader';
import { LoadingSkeleton } from '@/components/data-display/LoadingSkeleton';
import { ErrorState } from '@/components/data-display/ErrorState';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { YearlyTrendChart } from '@/components/history/YearlyTrendChart';
import { historyApi } from '@/features/history/api/history.api';
import { formatRWF, cn } from '@/lib/utils';
import type { ApiError } from '@/lib/api/types';

/**
 * Five-year business history with YoY growth and milestones (HIST-01..04).
 */
export function HistoryPage() {
  const { t } = useTranslation();

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['history', 'five-year'],
    queryFn: historyApi.fiveYear,
  });

  const currency = data?.summary.currency ?? 'RWF';

  return (
    <div>
      <PageHeader title={t('pages.history')} />

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
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('history.totalRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatRWF(data.summary.totalRevenue, currency)}</p>
                <p className="text-xs text-muted-foreground mt-1">{t('history.fiveYearLabel')}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('history.avgAnnualProfit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{formatRWF(data.summary.averageAnnualProfit, currency)}</p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('history.yoyRevenue')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  'text-2xl font-bold',
                  data.yearOverYearGrowth.revenue >= 0 ? 'text-emerald-600' : 'text-red-600',
                )}>
                  {data.yearOverYearGrowth.revenue >= 0 ? '+' : ''}
                  {data.yearOverYearGrowth.revenue}%
                </p>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {t('history.yoyProfit')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className={cn(
                  'text-2xl font-bold',
                  data.yearOverYearGrowth.profit >= 0 ? 'text-emerald-600' : 'text-red-600',
                )}>
                  {data.yearOverYearGrowth.profit >= 0 ? '+' : ''}
                  {data.yearOverYearGrowth.profit}%
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 mb-6">
            <Card className="glass-card border-0">
              <CardContent className="p-5 flex items-center gap-3">
                <Calendar className="h-8 w-8 text-navy-600 dark:text-navy-200" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('history.foundingYear')}</p>
                  <p className="text-xl font-bold">{data.milestones.foundingYear}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-5 flex items-center gap-3">
                <Award className="h-8 w-8 text-gold-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('history.bestYear')}</p>
                  <p className="text-xl font-bold">{data.milestones.bestPerformingYear}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="glass-card border-0">
              <CardContent className="p-5 flex items-center gap-3">
                <BarChart3 className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('history.totalTransactions')}</p>
                  <p className="text-xl font-bold">{data.milestones.totalTransactionVolume}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="mb-6">
            <YearlyTrendChart data={data.yearlyTrend} currency={currency} />
          </div>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                {t('history.annualBreakdown')}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      <th className="text-left p-4 font-medium">{t('history.year')}</th>
                      <th className="text-right p-4 font-medium">{t('analytics.revenue')}</th>
                      <th className="text-right p-4 font-medium">{t('analytics.expenses')}</th>
                      <th className="text-right p-4 font-medium">{t('analytics.profit')}</th>
                      <th className="text-right p-4 font-medium">{t('history.transactions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.annualBreakdown.map((row) => (
                      <tr key={row.year} className="border-b last:border-0 hover:bg-muted/20">
                        <td className="p-4 font-medium">
                          {row.year}
                          {row.year === data.milestones.bestPerformingYear && (
                            <Badge variant="gold" className="ml-2 font-normal">
                              {t('history.bestYearBadge')}
                            </Badge>
                          )}
                        </td>
                        <td className="p-4 text-right">{formatRWF(row.revenue, currency)}</td>
                        <td className="p-4 text-right">{formatRWF(row.expenses, currency)}</td>
                        <td className={cn(
                          'p-4 text-right font-medium',
                          row.profit >= 0 ? 'text-emerald-600' : 'text-red-600',
                        )}>
                          {formatRWF(row.profit, currency)}
                        </td>
                        <td className="p-4 text-right text-muted-foreground">{row.transactionCount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
