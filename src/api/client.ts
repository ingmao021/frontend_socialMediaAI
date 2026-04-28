import axios, { AxiosError } from 'axios';
import type { ApiErrorResponse } from '../types/error.types';

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

export default apiClient;