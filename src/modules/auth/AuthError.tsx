import { useSearchParams, useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  token_missing: 'No se recibió el token de sesión. Intenta iniciar sesión de nuevo.',
  server_error:  'Error interno del servidor. Intenta más tarde.',
};

export default function AuthError() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const reason  = params.get('reason') ?? 'unknown';
  const message = ERROR_MESSAGES[reason] ?? 'Ocurrió un error desconocido al iniciar sesión.';

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      background: 'var(--bg)',
    }}>
      <div style={{ textAlign: 'center', maxWidth: 400 }}>
        <div style={{
          width: 56, height: 56,
          background: 'rgba(239,68,68,0.12)',
          borderRadius: '50%',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <AlertCircle size={28} color="#f87171" />
        </div>
        <h2 style={{ fontFamily: 'var(--font-head)', fontSize: 22, fontWeight: 700, color: 'var(--text)', marginBottom: 10 }}>
          Error de autenticación
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: 15, marginBottom: 28 }}>
          {message}
        </p>
        <button
          className="btn btn-primary"
          onClick={() => navigate('/login', { replace: true })}
        >
          <ArrowLeft size={16} /> Volver al inicio
        </button>
      </div>
    </div>
  );
}
