import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse, UserProfile } from '@/lib/api/types';

export interface AdminStats {
  userCount: number;
  businessCount: number;
  transactionCount: number;
  documentCount: number;
}

export interface AdminUser extends UserProfile {
  createdAt: string;
  businessName: string | null;
}

export interface AdminBusiness {
  id: string;
  passportId: string;
  name: string;
  type: string;
  location: string;
  healthScore: number;
  creditReadiness: string;
  creditReadinessLabel: string;
  onboardingComplete: boolean;
  owner: { id: string; email: string; fullName: string };
  createdAt: string;
}

export const adminApi = {
  stats: () => apiClient<AdminStats>('/admin/stats'),

  listUsers: (page = 1) =>
    apiClient<PaginatedResponse<AdminUser>>(`/admin/users?page=${page}&limit=20`),

  listBusinesses: (page = 1) =>
    apiClient<PaginatedResponse<AdminBusiness>>(`/admin/businesses?page=${page}&limit=20`),

  updateUserRole: (id: string, role: 'admin' | 'user') =>
    apiClient<UserProfile>(`/admin/users/${id}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    }),
};
