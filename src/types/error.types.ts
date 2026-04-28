// Estructura estándar de todos los errores del backend
export interface ApiErrorResponse {
  timestamp: string;   // ISO-8601
  status: number;
  error: string;       // Ej: "Bad Request"
  code: string;        // Código de error específico (ver sección 9)
  message: string;
  path: string;
}