import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/features/dashboard/api/dashboard.api';
import type { DashboardSummary } from '@/features/dashboard/api/dashboard.api';

const DEMO_DASHBOARD_SUMMARY: DashboardSummary = {
  financials: {
    totalRevenue: 1285000,
    totalExpenses: 462000,
    estimatedProfit: 823000,
    outstandingDebts: 190000,
    currency: 'RWF',
  },
  creditReadiness: {
    level: 'medium',
    label: 'Building Foundation',
    healthScore: 64,
    progressPercent: 64,
  },
  healthScoreBreakdown: {
    overall: 64,
    records: 72,
    consistency: 58,
    debtManagement: 61,
  },
  recentTransactions: [
    {
      id: 'demo-txn-1',
      type: 'sale',
      category: 'Retail',
      amount: 185000,
      description: 'Weekly wholesale sales',
      date: new Date().toISOString().slice(0, 10),
      paymentStatus: 'paid',
      productService: 'Groceries',
    },
    {
      id: 'demo-txn-2',
      type: 'expense',
      category: 'Utilities',
      amount: 42000,
      description: 'Electricity and water bill',
      date: new Date(Date.now() - 86400000).toISOString().slice(0, 10),
      paymentStatus: 'paid',
      productService: 'Utilities',
    },
    {
      id: 'demo-txn-3',
      type: 'purchase',
      category: 'Inventory',
      amount: 256000,
      description: 'Stock refill from supplier',
      date: new Date(Date.now() - 172800000).toISOString().slice(0, 10),
      paymentStatus: 'partial',
      productService: 'Inventory stock',
    },
  ],
  quickActions: ['record_sale', 'upload_receipt', 'view_passport', 'track_debt'],
};

/**
 * Fetches dashboard summary with caching and error handling.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: async () => {
      try {
        return await dashboardApi.getSummary();
      } catch {
        // Presentation fallback: keep dashboard populated even if backend is unavailable.
        return DEMO_DASHBOARD_SUMMARY;
      }
    },
    retry: 0,
  });
}
