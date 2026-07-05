import { apiClient } from '@/lib/api/client';

export type AnalyticsPeriod = 'month' | 'quarter' | 'year' | 'custom';

export interface AnalyticsSummary {
  period: AnalyticsPeriod;
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    netProfit: number;
    currency: string;
  };
  revenueVsExpenses: Array<{ month: string; revenue: number; expenses: number }>;
  expenseBreakdown: Array<{ category: string; amount: number; percent: number }>;
  profitTrend: Array<{ month: string; profit: number }>;
  insights: {
    revenueTrend: string;
    topExpenseCategory: string;
    profitMargin: string;
  };
}

export const analyticsApi = {
  summary: (params: { period?: AnalyticsPeriod; dateFrom?: string; dateTo?: string } = {}) => {
    const qs = new URLSearchParams();
    if (params.period) qs.set('period', params.period);
    if (params.dateFrom) qs.set('dateFrom', params.dateFrom);
    if (params.dateTo) qs.set('dateTo', params.dateTo);
    const query = qs.toString();
    return apiClient<AnalyticsSummary>(`/analytics/summary${query ? `?${query}` : ''}`);
  },
};
