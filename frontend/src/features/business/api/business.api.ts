import { apiClient } from '@/lib/api/client';

export type BusinessType =
  | 'retail_shop'
  | 'farm'
  | 'service'
  | 'manufacturer'
  | 'cooperative'
  | 'other';

export interface BusinessProfile {
  id: string;
  passportId: string;
  name: string;
  type: BusinessType;
  industry: string;
  location: string;
  yearsOperating: number;
  numEmployees: number;
  goals: string;
  currency: string;
  healthScore: number;
  creditReadiness: 'low' | 'medium' | 'high';
  creditReadinessLabel: string;
  onboardingComplete: boolean;
}

export interface OnboardingPayload {
  name: string;
  type: BusinessType;
  industry: string;
  location: string;
  yearsOperating: number;
  numEmployees: number;
  goals: string;
}

export const businessApi = {
  completeOnboarding: (data: OnboardingPayload) =>
    apiClient<BusinessProfile>('/businesses/onboarding', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () => apiClient<BusinessProfile>('/businesses/me'),

  updateMe: (data: Partial<Pick<BusinessProfile, 'name' | 'type' | 'industry' | 'location' | 'numEmployees' | 'currency'>>) =>
    apiClient<BusinessProfile>('/businesses/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
