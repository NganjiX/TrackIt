import { useQuery } from '@tanstack/react-query';
import { dashboardApi } from '@/features/dashboard/api/dashboard.api';

/**
 * Fetches dashboard summary with caching and error handling.
 */
export function useDashboardSummary() {
  return useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: dashboardApi.getSummary,
  });
}
