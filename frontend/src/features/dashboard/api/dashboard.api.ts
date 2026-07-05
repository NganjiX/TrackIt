import { apiClient } from '@/lib/api/client';

export interface DashboardSummary {
  financials: {
    totalRevenue: number;
    totalExpenses: number;
    estimatedProfit: number;
    outstandingDebts: number;
    currency: string;
  };
  creditReadiness: {
    level: 'low' | 'medium' | 'high';
    label: string;
    healthScore: number;
    progressPercent: number;
  };
  healthScoreBreakdown: {
    overall: number;
    records: number;
    consistency: number;
    debtManagement: number;
  };
  recentTransactions: Array<{
    id: string;
    type: 'sale' | 'expense' | 'purchase';
    category: string;
    amount: number;
    description: string;
    date: string;
    paymentStatus: string;
    productService: string;
  }>;
  quickActions: Array<'record_sale' | 'upload_receipt' | 'view_passport' | 'track_debt'>;
}

export const dashboardApi = {
  getSummary: () => apiClient<DashboardSummary>('/dashboard/summary'),
};
