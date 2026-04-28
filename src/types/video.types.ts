export type VideoStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'ERROR';

export interface Video {
  id: number;
  userId: number;
  title: string;
  description: string | null;
  prompt: string;
  status: VideoStatus;
  videoUrl: string | null;
  googleJobId: string | null;
  errorMessage: string | null;
  createdAt: string;   // ISO-8601, ej: "2024-04-26T14:00:00"
  updatedAt: string;
}

// Body enviado al POST /api/videos/generate
export interface GenerateVideoRequest {
  title: string;        // requerido, max 200 caracteres
  description?: string; // opcional, max 500 caracteres
  prompt: string;       // requerido, entre 5 y 1000 caracteres
}

// Notas importantes:
// - La duración del video es fija: 5 segundos (definida en el backend)
// - El aspect ratio es fijo: 16:9 (definido en el backend)
// - La generación es ASÍNCRONA: el status inicial es PENDING/PROCESSING
//   y el backend lo actualiza automáticamente mediante polling a Google AI