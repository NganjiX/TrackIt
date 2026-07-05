import { apiClient } from '@/lib/api/client';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  read: boolean;
  link: string | null;
  createdAt: string;
}

export const notificationsApi = {
  list: () =>
    apiClient<{ data: Notification[]; unreadCount: number }>('/notifications'),

  markRead: (id: string) =>
    apiClient<{ message: string }>(`/notifications/${id}/read`, { method: 'PATCH' }),

  markAllRead: () =>
    apiClient<{ message: string }>('/notifications/read-all', { method: 'PATCH' }),
};
