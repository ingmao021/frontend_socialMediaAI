import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


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
