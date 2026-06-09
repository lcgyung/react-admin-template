import { create } from 'zustand';
import { persist } from 'zustand/middleware';

import type { User } from '@/types/user';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      clearAuth: () => set({ token: null, user: null }),
    }),
    { name: 'auth-storage' },
  ),
);

// React 외부(axios 인터셉터 등)에서 인증 상태에 접근하기 위한 헬퍼.
export const getAuthToken = () => useAuthStore.getState().token;
export const clearAuthState = () => useAuthStore.getState().clearAuth();
