import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmedia-ixsm.onrender.com';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const response = await fetch(`${API_URL}/api/auth/callback/token`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const data = await response.json();
          
          if (data.success) {
            // Guardar token y datos de usuario
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirigir a dashboard
            navigate('/dashboard', { replace: true });
          } else {
            setError(data.error || 'Error desconocido');
            navigate('/login?error=auth_failed', { replace: true });
          }
        } else {
          setError('Error del servidor');
          navigate('/login?error=auth_failed', { replace: true });
        }
      } catch (err) {
        console.error('Error de red:', err);
        setError('Error de conexión');
        navigate('/login?error=network_error', { replace: true });
      }
    };

    fetchToken();
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      background: 'var(--bg)',
      color: 'var(--text-2)',
      fontFamily: 'var(--font-body)',
    }}>
      <div className="spinner spinner-lg" style={{ color: 'var(--accent)' }} />
      <p style={{ fontSize: 15 }}>Iniciando sesión...</p>
      {error && (
        <p style={{ fontSize: 13, color: 'var(--error)' }}>{error}</p>
      )}
    </div>
  );
}
