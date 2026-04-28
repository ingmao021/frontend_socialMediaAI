import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../../utils/token.utils';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');

    if (token) {
      saveToken(token);
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/auth/error?reason=token_missing', { replace: true });
    }
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
    </div>
  );
}
