import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  totalPayments: number;
  outstandingBalance: number;
  hasOutstanding: boolean;
}

export interface CreateSupplierPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const suppliersApi = {
  list: (params: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Supplier>>(`/suppliers${query ? `?${query}` : ''}`);
  },

  create: (data: CreateSupplierPayload) =>
    apiClient<Supplier>('/suppliers', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/suppliers/${id}`, { method: 'DELETE' }),
};
