import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL || 'https://backend-socialmedia-ixsm.onrender.com';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
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
