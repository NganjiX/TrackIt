import { apiClient } from '@/lib/api/client';

export interface HistorySummary {
  summary: {
    totalRevenue: number;
    totalExpenses: number;
    averageAnnualProfit: number;
    transactionCount: number;
    currency: string;
  };
  yearlyTrend: Array<{ year: number; revenue: number; expenses: number; profit: number }>;
  yearOverYearGrowth: { revenue: number; profit: number };
  annualBreakdown: Array<{
    year: number;
    revenue: number;
    expenses: number;
    profit: number;
    transactionCount: number;
  }>;
  milestones: {
    foundingYear: number;
    bestPerformingYear: number;
    totalTransactionVolume: number;
    yearsOperating: number;
  };
}

export const historyApi = {
  fiveYear: () => apiClient<HistorySummary>('/history/five-year'),
};
