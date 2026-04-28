import { useState, useCallback } from 'react';
import type { ApiErrorResponse } from '../types/error.types';
import { AxiosError } from 'axios';

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: ApiErrorResponse | null;
}

export function useApi<T>() {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const execute = useCallback(async (fn: () => Promise<T>) => {
    setState({ data: null, loading: true, error: null });
    try {
      const data = await fn();
      setState({ data, loading: false, error: null });
      return data;
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>;
      const error = axiosErr.response?.data ?? {
        timestamp: new Date().toISOString(),
        status: 0,
        error: 'Network Error',
        code: 'NETWORK_ERROR',
        message: 'No se pudo conectar con el servidor',
        path: '',
      };
      setState({ data: null, loading: false, error });
      throw error;
    }
  }, []);

  return { ...state, execute };
}