export interface UserResponse {
  id: number;
  email: string;
  name: string;
  avatarUrl: string | null;
  hasPassword: boolean;
  hasGoogle: boolean;
  videosGenerated: number;
  videosLimit: number;
  createdAt: string; // ISO-8601 UTC
}

export interface UpdateProfileRequest {
  name: string;
}
