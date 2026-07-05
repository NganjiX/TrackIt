import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export type TransactionType = 'sale' | 'expense' | 'purchase';
export type PaymentStatus = 'paid' | 'pending' | 'partial';

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentStatus: PaymentStatus;
  productService: string;
  customerId: string | null;
  supplierId: string | null;
  customer?: { id: string; name: string } | null;
  supplier?: { id: string; name: string } | null;
}

export interface CreateTransactionPayload {
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string;
  paymentStatus: PaymentStatus;
  productService: string;
  customerId?: string;
  supplierId?: string;
}

export const transactionsApi = {
  list: (params: { page?: number; limit?: number; search?: string; type?: TransactionType | '' }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.type) qs.set('type', params.type);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Transaction>>(`/transactions${query ? `?${query}` : ''}`);
  },

  create: (data: CreateTransactionPayload) =>
    apiClient<Transaction>('/transactions', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/transactions/${id}`, { method: 'DELETE' }),
};
