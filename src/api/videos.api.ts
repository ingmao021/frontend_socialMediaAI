import api from './client';
import type { Video, GenerateVideoRequest } from '../types/video.types';

export const generateVideo = async (data: GenerateVideoRequest): Promise<Video> => {
  const { data: video } = await api.post<Video>('/api/videos/generate', data);
  return video;
};

export const getVideo = async (id: number): Promise<Video> => {
  const { data } = await api.get<Video>(`/api/videos/${id}`);
  return data;
};

export const listVideos = async (): Promise<Video[]> => {
  const { data } = await api.get<Video[]>('/api/videos');
  return data;
};

export const deleteVideo = async (id: number): Promise<void> => {
  await api.delete(`/api/videos/${id}`);
};