import { create } from 'zustand';
import type { User } from '../types/auth.types';
import { getCurrentUser } from '../api/auth.api';
import { removeToken, isAuthenticated } from '../utils/token.utils';

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,

  fetchUser: async () => {
    if (!isAuthenticated()) return;
    set({ loading: true });
    try {
      const user = await getCurrentUser();
      set({ user, loading: false });
    } catch {
      removeToken();
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    removeToken();
    set({ user: null });
    window.location.href = '/login';
  },
}));