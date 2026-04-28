export interface User {
  id: number;
  name: string;
  email: string;
  picture: string;
}

export interface TokenDebugResponse {
  valid: boolean;
  userId?: number;
  email?: string;
  error?: string;
}