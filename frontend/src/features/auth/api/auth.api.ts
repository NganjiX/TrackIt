import { apiClient } from '@/lib/api/client';
import type { AuthTokens, UserProfile } from '@/lib/api/types';

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface VerifyOtpPayload {
  email: string;
  code: string;
}

export const authApi = {
  register: (data: RegisterPayload) =>
    apiClient<{ message: string; userId: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  verifyOtp: (data: VerifyOtpPayload) =>
    apiClient<{ message: string }>('/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  resendOtp: (email: string) =>
    apiClient<{ message: string }>('/auth/resend-otp', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  login: (data: LoginPayload) =>
    apiClient<AuthTokens>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
      skipAuth: true,
    }),

  logout: () =>
    apiClient<{ message: string }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (email: string) =>
    apiClient<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  resetPassword: (token: string, password: string) =>
    apiClient<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
      skipAuth: true,
    }),

  getMe: () => apiClient<UserProfile>('/auth/me'),

  googleAuthUrl: () => `${import.meta.env.VITE_API_URL ?? '/api/v1'}/auth/google`,
};
