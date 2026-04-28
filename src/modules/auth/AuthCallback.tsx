import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmedia-ixsm.onrender.com';

export default function AuthCallback() {
  const navigate = useNavigate();

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

    const params = new URLSearchParams(window.location.search);
    if (params.get('error')) {
      navigate('/login?error=oauth', { replace: true });
      return;
    }
    // El backend ya seteó cookies HttpOnly, simplemente redirigimos
    navigate('/dashboard', { replace: true });
  }, [navigate]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center'
    }}>
      <span>Procesando autenticación...</span>
    </div>
  );
}
