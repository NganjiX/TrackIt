import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  address: string | null;
  totalPurchases: number;
  debtBalance: number;
  hasDebt: boolean;
}

export interface CreateCustomerPayload {
  name: string;
  phone: string;
  email?: string;
  address?: string;
}

export const customersApi = {
  list: (params: { page?: number; limit?: number; search?: string }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Customer>>(`/customers${query ? `?${query}` : ''}`);
  },

  create: (data: CreateCustomerPayload) =>
    apiClient<Customer>('/customers', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/customers/${id}`, { method: 'DELETE' }),
};
