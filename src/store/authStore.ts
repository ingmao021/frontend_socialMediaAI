import { create } from 'zustand';
import type { User } from '../types/auth.types';
import { getCurrentUser } from '../api/auth.api';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

const getStoredUser = (): User | null => {
  const userStr = localStorage.getItem(USER_KEY);
  return userStr ? JSON.parse(userStr) : null;
};

const isAuthenticated = (): boolean => {
  return localStorage.getItem(TOKEN_KEY) !== null;
};

interface AuthState {
  user: User | null;
  loading: boolean;
  fetchUser: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getStoredUser(),
  loading: false,

  fetchUser: async () => {
    if (!isAuthenticated()) return;
    set({ loading: true });
    try {
      const user = await getCurrentUser();
      localStorage.setItem(USER_KEY, JSON.stringify(user));
      set({ user, loading: false });
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      set({ user: null, loading: false });
    }
  },

  logout: () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null });
    window.location.href = '/login';
  },
}));