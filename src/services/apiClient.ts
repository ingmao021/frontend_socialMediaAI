import axios from 'axios';
import { getToken, clearToken } from '../utils/tokenStorage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { 'Content-Type': 'application/json' },
  // NO withCredentials — auth is via Authorization header, not cookies
});

// Request interceptor: attach JWT to every request
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401 globally
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Don't redirect if already on a public page — prevents infinite loops
      // if backend returns 401 on /login or /register endpoints by mistake
      const publicPaths = ['/login', '/register'];
      const currentPath = window.location.pathname;
      if (!publicPaths.includes(currentPath)) {
        clearToken();
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  },
);
