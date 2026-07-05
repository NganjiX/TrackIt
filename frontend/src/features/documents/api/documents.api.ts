import { apiClient, getAccessToken } from '@/lib/api/client';
import type { PaginatedResponse } from '@/lib/api/types';

export type DocumentCategory =
  | 'receipt'
  | 'invoice'
  | 'bill'
  | 'contract'
  | 'payment_proof'
  | 'other';

export interface Document {
  id: string;
  name: string;
  category: DocumentCategory;
  fileUrl: string;
  mimeType: string;
  fileSize: number;
  date: string;
  amount: number | null;
  notes: string | null;
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileKey: string;
  expiresIn: number;
}

export interface PreviewUrlResponse {
  previewUrl: string;
  mimeType: string;
  name: string;
  expiresIn: number;
}

export interface CreateDocumentPayload {
  name: string;
  category: DocumentCategory;
  fileKey: string;
  mimeType: string;
  fileSize: number;
  date: string;
  amount?: number;
  notes?: string;
}

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const documentsApi = {
  getUploadUrl: (data: { fileName: string; mimeType: string; fileSize: number }) =>
    apiClient<UploadUrlResponse>('/documents/upload-url', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  uploadFile: async (uploadUrl: string, file: File): Promise<void> => {
    if (getAccessToken()?.startsWith('demo-')) {
      // Presentation mode: skip real object storage upload.
      return;
    }
    const response = await fetch(uploadUrl, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    });
    if (!response.ok) {
      throw new Error('File upload failed');
    }
  },

  create: (data: CreateDocumentPayload) =>
    apiClient<Document>('/documents', { method: 'POST', body: JSON.stringify(data) }),

  list: (params: { page?: number; limit?: number; search?: string; category?: DocumentCategory | '' }) => {
    const qs = new URLSearchParams();
    if (params.page) qs.set('page', String(params.page));
    if (params.limit) qs.set('limit', String(params.limit));
    if (params.search) qs.set('search', params.search);
    if (params.category) qs.set('category', params.category);
    const query = qs.toString();
    return apiClient<PaginatedResponse<Document>>(`/documents${query ? `?${query}` : ''}`);
  },

  getPreviewUrl: (id: string) =>
    apiClient<PreviewUrlResponse>(`/documents/${id}/preview-url`),

  delete: (id: string) =>
    apiClient<{ message: string }>(`/documents/${id}`, { method: 'DELETE' }),
};
