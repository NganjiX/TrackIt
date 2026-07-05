export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  emailVerified: boolean;
  language: string;
  businessId: string | null;
  onboardingComplete: boolean;
}

export interface AuthTokens {
  accessToken: string;
  expiresIn: number;
  user: UserProfile;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  statusCode: number;
  message: string;
  errorCode: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
