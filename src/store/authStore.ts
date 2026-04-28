import { create } from 'zustand';
import type { User } from '../types/auth.types';
import apiClient from '../api/client';

interface AuthState {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  fetchUser: () => Promise<void>;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isAuthenticated: false,

  fetchUser: async () => {
    set({ loading: true });
    try {
      const res = await apiClient.get('/api/auth/me');
      set({ user: res.data, isAuthenticated: true, loading: false });
    } catch {
      set({ user: null, isAuthenticated: false, loading: false });
    }
  },

  logout: async () => {
    try {
      await apiClient.post('/api/auth/logout');
    } catch {}
    set({ user: null, isAuthenticated: false });
    window.location.href = '/login';
  },
}));