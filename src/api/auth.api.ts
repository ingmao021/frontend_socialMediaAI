
import api from './client';
import type { User } from '../types/auth.types';

export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<User>('/api/auth/me');
  return data;
};

export const checkStatus = async (): Promise<boolean> => {
  try {
    await api.get('/api/auth/status');
    return true;
  } catch {
    return false;
  }
};