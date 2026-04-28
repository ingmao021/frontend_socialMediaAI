import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/error.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor — agrega el token en cada petición autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — maneja expiración de sesión globalmente
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<ApiErrorResponse>) => {
    const code = error.response?.data?.code;

    if (code === 'TOKEN_EXPIRADO' || code === 'TOKEN_INVALIDO') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Redirigir al login
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;