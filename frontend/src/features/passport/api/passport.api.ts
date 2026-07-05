import { API_BASE_URL } from '@/lib/constants';
import { apiClient, getAccessToken } from '@/lib/api/client';

export interface ImprovementChecklistItem {
  id: string;
  completed: boolean;
}

export interface Passport {
  passportId: string;
  business: {
    name: string;
    type: string;
    industry: string;
    location: string;
    yearsOperating: number;
    numEmployees: number;
  };
  healthScore: number;
  healthScoreBreakdown: {
    records: number;
    consistency: number;
    debtManagement: number;
  };
  creditReadiness: {
    level: string;
    label: string;
  };
  activitySummary: {
    transactionsRecorded: number;
    documentsUploaded: number;
    customersRegistered: number;
    debtsResolved: number;
  };
  improvementChecklist: ImprovementChecklistItem[];
  generatedAt: string;
}

export interface ShareLinkResponse {
  shareUrl: string;
  token: string;
  expiresAt: string;
}

export const passportApi = {
  get: () => apiClient<Passport>('/passport'),

  getPublic: (token: string) =>
    apiClient<Passport>(`/passport/public/${token}`, { skipAuth: true }),

  createShareLink: (expiresInDays = 7) =>
    apiClient<ShareLinkResponse>('/passport/share-link', {
      method: 'POST',
      body: JSON.stringify({ expiresInDays }),
    }),

  exportPdf: async (): Promise<Blob> => {
    const token = getAccessToken();
    const response = await fetch(`${API_BASE_URL}/passport/export/pdf`, {
      credentials: 'include',
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!response.ok) {
      throw new Error('PDF export failed');
    }
    return response.blob();
  },
};
