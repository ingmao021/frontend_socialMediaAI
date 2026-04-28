import api from './client';
import type { YouTubeUpload, YouTubePublishRequest } from '../types/youtube.types';

export const publishToYouTube = async (
  data: YouTubePublishRequest
): Promise<YouTubeUpload> => {
  const { data: upload } = await api.post<YouTubeUpload>('/api/youtube/publish', data);
  return upload;
};

export const getUploadStatus = async (uploadId: number): Promise<YouTubeUpload> => {
  const { data } = await api.get<YouTubeUpload>(`/api/youtube/uploads/${uploadId}`);
  return data;
};

export const listUploads = async (): Promise<YouTubeUpload[]> => {
  const { data } = await api.get<YouTubeUpload[]>('/api/youtube/uploads');
  return data;
};

export const deleteUpload = async (uploadId: number): Promise<void> => {
  await api.delete(`/api/youtube/uploads/${uploadId}`);
};