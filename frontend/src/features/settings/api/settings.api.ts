import { apiClient } from '@/lib/api/client';
import type { UserProfile } from '@/lib/api/types';

export interface HealthSettings {
  healthScore: number;
  creditReadiness: { level: string; label: string };
  breakdown: { records: number; consistency: number; debtManagement: number };
}

export const settingsApi = {
  getProfile: () => apiClient<UserProfile>('/settings/profile'),

  updateProfile: (fullName: string) =>
    apiClient<UserProfile>('/settings/profile', {
      method: 'PATCH',
      body: JSON.stringify({ fullName }),
    }),

  updateLanguage: (language: 'en' | 'rw') =>
    apiClient<UserProfile>('/settings/language', {
      method: 'PATCH',
      body: JSON.stringify({ language }),
    }),

  getHealth: () => apiClient<HealthSettings>('/settings/health'),
};
