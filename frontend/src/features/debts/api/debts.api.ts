import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export type DebtType = 'receivable' | 'payable';
export type DebtStatus = 'pending' | 'partial' | 'paid' | 'overdue';

export interface Debt {
  id: string;
  type: DebtType;
  partyName: string;
  amount: number;
  paidAmount: number;
  remainingAmount: number;
  dueDate: string;
  status: DebtStatus;
  description: string;
  customerId: string | null;
  supplierId: string | null;
  customer: { id: string; name: string } | null;
  supplier: { id: string; name: string } | null;
  createdAt: string;
}

export interface DebtSummary {
  totalReceivable: number;
  totalPayable: number;
  overdueCount: number;
  currency: string;
}

export interface CreateDebtPayload {
  type: DebtType;
  partyName: string;
  customerId?: string;
  supplierId?: string;
  amount: number;
  dueDate: string;
  description: string;
}

export interface RecordPaymentPayload {
  amount: number;
  note?: string;
}

export const debtsApi = {
  list: (params: { page?: number; limit?: number; search?: string; type?: DebtType | '' }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.type) qs.set('type', params.type);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Debt>>(`/debts${query ? `?${query}` : ''}`);
  },

  summary: () => apiClient<DebtSummary>('/debts/summary'),

  create: (data: CreateDebtPayload) =>
    apiClient<Debt>('/debts', { method: 'POST', body: JSON.stringify(data) }),

  recordPayment: (id: string, data: RecordPaymentPayload) =>
    apiClient<Debt>(`/debts/${id}/payments`, { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/debts/${id}`, { method: 'DELETE' }),
};
