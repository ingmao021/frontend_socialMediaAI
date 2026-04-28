import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, LayoutDashboard, History, ChevronDown, LogOut, Wand2 } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [open, setOpen] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropRef.current && !dropRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const go = (path: string) => { setOpen(false); navigate(path); };

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';

  return (
    <header className="app-header">
      <button className="header-logo" onClick={() => go('/dashboard')}>
        <span className="logo-icon">
          <Video size={16} color="#fff" />
        </span>
        <span className="logo-text">Social Video AI</span>
      </button>

      {user && (
        <div className="header-dropdown-wrap" ref={dropRef}>
          <button className="header-user-btn" onClick={() => setOpen((v) => !v)}>
            {user.picture ? (
              <img src={user.picture} alt={user.name} />
            ) : (
              <span style={{
                width: 28, height: 28, borderRadius: '50%',
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 600, color: '#fff',
              }}>
                {firstName[0]}
              </span>
            )}
            <span>{firstName}</span>
            <ChevronDown size={14} color="var(--text-2)" />
          </button>

          {open && (
            <div className="dropdown-menu">
              <div className="dropdown-user-info">
                <strong>{user.name}</strong>
                <span>{user.email}</span>
              </div>
              <button className="dropdown-item" onClick={() => go('/dashboard')}>
                <LayoutDashboard size={15} /> Dashboard
              </button>
              <button className="dropdown-item" onClick={() => go('/generate')}>
                <Wand2 size={15} /> Generar video
              </button>
              <button className="dropdown-item" onClick={() => go('/history')}>
                <History size={15} /> Historial
              </button>
              <div className="dropdown-sep" />
              <button className="dropdown-item danger" onClick={logout}>
                <LogOut size={15} /> Cerrar sesión
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
}
