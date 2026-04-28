import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/error.types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: false,
});

// Request interceptor — agrega el token en cada petición autenticada
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_token');
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
      localStorage.removeItem('jwt_token');
      // Redirigir al login — ajusta según tu router
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;