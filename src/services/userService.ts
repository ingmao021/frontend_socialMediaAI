import { apiClient } from './apiClient';
import type { UserResponse, UpdateProfileRequest } from '../types/user.types';

export const userService = {
  async getMe(): Promise<UserResponse> {
    const { data } = await apiClient.get<UserResponse>('/api/users/me');
    return data;
  },

  async updateProfile(request: UpdateProfileRequest): Promise<UserResponse> {
    const { data } = await apiClient.put<UserResponse>(
      '/api/users/me',
      request,
    );
    return data;
  },

  async uploadAvatar(file: File): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('file', file);
    // Do NOT set Content-Type manually — axios auto-detects FormData
    // and adds the correct multipart/form-data; boundary=... header.
    // Setting it manually would strip the boundary and the backend rejects it.
    const { data } = await apiClient.post<UserResponse>(
      '/api/users/me/avatar',
      formData,
      {
        headers: {
          'Content-Type': undefined as unknown as string,
        },
      },
    );
    return data;
  },
};
