export type YouTubeUploadStatus =
  | 'PENDING'
  | 'PUBLISHING'
  | 'PUBLISHED'
  | 'FAILED'
  | 'DELETED';

export type YouTubeVisibility = 'PRIVATE' | 'UNLISTED' | 'PUBLIC';

export interface YouTubeUpload {
  id: number;
  videoId: number;
  userId: number;
  status: YouTubeUploadStatus;
  youtubeVideoId: string | null;
  youtubeUrl: string | null;
  title: string;
  description: string | null;
  visibility: YouTubeVisibility;
  publishedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

// Body enviado al POST /api/youtube/publish
export interface YouTubePublishRequest {
  videoId: number;           // ID del video con status COMPLETED
  title: string;             // requerido
  description?: string;      // opcional
  visibility: YouTubeVisibility;
}