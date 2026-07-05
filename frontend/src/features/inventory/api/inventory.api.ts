import { apiClient } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
  isLowStock: boolean;
  createdAt: string;
}

export interface LowStockResponse {
  count: number;
  data: Product[];
}

export interface CreateProductPayload {
  name: string;
  category: string;
  price: number;
  cost: number;
  stockQuantity: number;
  lowStockThreshold: number;
  unit: string;
}

export type ProductSortField = 'name' | 'category' | 'price' | 'cost' | 'stockQuantity' | 'createdAt';

export const inventoryApi = {
  list: (params: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: ProductSortField;
    sortOrder?: 'asc' | 'desc';
  }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.sortOrder) qs.set('sortOrder', params.sortOrder);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Product>>(`/inventory/products${query ? `?${query}` : ''}`);
  },

  lowStock: () => apiClient<LowStockResponse>('/inventory/products/low-stock'),

  create: (data: CreateProductPayload) =>
    apiClient<Product>('/inventory/products', { method: 'POST', body: JSON.stringify(data) }),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/inventory/products/${id}`, { method: 'DELETE' }),
};
