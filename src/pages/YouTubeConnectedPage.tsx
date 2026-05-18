import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

/** Página que muestra el resultado del flujo OAuth de YouTube.
 *
 * El backend redirige aquí con ?status=success|error&reason=...
 * Esta ruta debe ser pública (no requiere ProtectedRoute).
 */
export function YouTubeConnectedPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState(4);

  const status = searchParams.get('status');
  const reason = searchParams.get('reason');

  const isSuccess = status === 'success';

  const errorMessages: Record<string, string> = {
    USER_DENIED: 'Cancelaste la autorización de YouTube.',
    INVALID_STATE: 'La sesión expiró. Por favor, vuelve a intentarlo.',
    INSUFFICIENT_SCOPES: 'Debes aceptar todos los permisos solicitados para conectar YouTube.',
    INTERNAL_ERROR: 'Algo salió mal. Por favor, inténtalo de nuevo.',
  };

  const errorMessage = reason
    ? (errorMessages[reason] ?? 'Error desconocido al conectar YouTube.')
    : 'Error desconocido al conectar YouTube.';

  // Auto-redirigir al dashboard después de 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) {
          clearInterval(interval);
          navigate('/dashboard', { replace: true });
        }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [navigate]);

  return (
    <div className="yt-connected-page">
      <div className="yt-connected-card glass-card">
        {isSuccess ? (
          <>
            <div className="yt-connected-icon yt-connected-icon--success">✅</div>
            <h2 className="yt-connected-title">¡YouTube conectado!</h2>
            <p className="yt-connected-subtitle">
              Tu cuenta de YouTube fue conectada correctamente.
              Ya puedes compartir tus videos.
            </p>
          </>
        ) : (
          <>
            <div className="yt-connected-icon yt-connected-icon--error">⚠️</div>
            <h2 className="yt-connected-title">No se pudo conectar</h2>
            <p className="yt-connected-subtitle">{errorMessage}</p>
          </>
        )}
        <p className="yt-connected-redirect">
          Redirigiendo al dashboard en <strong>{countdown}</strong>s…
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/dashboard', { replace: true })}
        >
          Ir al dashboard
        </button>
      </div>
    </div>
  );
}