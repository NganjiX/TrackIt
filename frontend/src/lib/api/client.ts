import { API_BASE_URL } from '@/lib/constants';
import type { ApiError, ApiResponse } from './types';

type RequestOptions = RequestInit & { skipAuth?: boolean };

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

/**
 * Sets the current access token for authenticated requests.
 */
export function setAccessToken(token: string | null): void {
  accessToken = token;
}

/**
 * Returns the current access token.
 */
export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        setAccessToken(null);
        return null;
      }

      const json = (await res.json()) as ApiResponse<{ accessToken: string }>;
      const token = json.data.accessToken;
      setAccessToken(token);
      return token;
    } catch {
      setAccessToken(null);
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

/**
 * Typed fetch wrapper with JWT injection and automatic token refresh.
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {},
): Promise<T> {
  const { skipAuth, headers, ...rest } = options;
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

  const buildHeaders = (token: string | null): HeadersInit => ({
    'Content-Type': 'application/json',
    ...(!skipAuth && token ? { Authorization: `Bearer ${token}` } : {}),
    ...headers,
  });

  let response = await fetch(url, {
    ...rest,
    credentials: 'include',
    headers: buildHeaders(skipAuth ? null : accessToken),
  });

  if (response.status === 401 && !skipAuth) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      response = await fetch(url, {
        ...rest,
        credentials: 'include',
        headers: buildHeaders(newToken),
      });
    }
  }

  if (!response.ok) {
    const error = (await response.json().catch(() => ({
      statusCode: response.status,
      message: response.statusText,
      errorCode: 'UNKNOWN_ERROR',
    }))) as ApiError;
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const json = await response.json();
  if (
    typeof json === 'object' &&
    json !== null &&
    'data' in json &&
    Object.keys(json as Record<string, unknown>).length === 1
  ) {
    return (json as { data: T }).data;
  }
  return json as T;
}
