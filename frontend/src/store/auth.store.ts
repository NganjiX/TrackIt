import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserProfile } from '@/lib/api/types';
import { setAccessToken } from '@/lib/api/client';

interface AuthState {
  user: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setTokens: (accessToken: string, user: UserProfile) => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
}

/**
 * Global authentication state persisted across sessions.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setTokens: (accessToken, user) => {
        setAccessToken(accessToken);
        set({ accessToken, user, isAuthenticated: true, isLoading: false });
      },
      logout: () => {
        setAccessToken(null);
        set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
      },
      setLoading: (isLoading) => set({ isLoading }),
    }),
    {
      name: 'smartledger-auth',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        if (state?.accessToken) {
          setAccessToken(state.accessToken);
          state.isAuthenticated = true;
        }
        state?.setLoading(false);
      },
    },
  ),
);
