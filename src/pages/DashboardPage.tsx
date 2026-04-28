
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Video, CheckCircle2, Zap, AlertCircle, Wand2, History, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../store/authStore';
import { listVideos } from '../api/videos.api';
import type { Video as VideoType } from '../types/video.types';
import Header from '../modules/ui/Header';
import VideoCard from '../modules/video/VideoCard';
import PublishModal from '../modules/youtube/PublishModal';

export default function DashboardPage() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [publishTarget, setPublishTarget] = useState<VideoType | null>(null);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate('/login', { replace: true });
    }
  }, [loading, isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      listVideos().then(setVideos).catch(() => {});
    }
  }, [isAuthenticated]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated) {
    return null;
  }

  const firstName = user?.name?.split(' ')[0] ?? 'Usuario';
  const total = videos.length;
  const completed = videos.filter((v) => v.status === 'COMPLETED').length;
  const processing = videos.filter((v) => v.status === 'PROCESSING' || v.status === 'PENDING').length;
  const errors = videos.filter((v) => v.status === 'ERROR').length;
  const recents = videos.slice(0, 3);

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="page-content page-enter">

          {/* Welcome */}
          <div className="welcome-block">
            {user?.picture ? (
              <img className="welcome-avatar" src={user.picture} alt={user.name} />
            ) : (
              <div className="welcome-avatar" style={{
                background: 'var(--accent)', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: 20, fontWeight: 700, color: '#fff',
              }}>
                {firstName[0]}
              </div>
            )}
            <div>
              <div className="welcome-title">Hola, {firstName} 👋</div>
              <div className="welcome-sub">Listo para crear algo increíble hoy</div>
            </div>
          </div>

          {/* Stats */}
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(99,102,241,0.12)' }}>
                <Video size={20} color="#6366f1" />
              </div>
              <div>
                <div className="stat-value">{total}</div>
                <div className="stat-label">Videos generados</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <CheckCircle2 size={20} color="#10b981" />
              </div>
              <div>
                <div className="stat-value">{completed}</div>
                <div className="stat-label">Completados</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.12)' }}>
                <Zap size={20} color="#f59e0b" />
              </div>
              <div>
                <div className="stat-value">{processing}</div>
                <div className="stat-label">En proceso</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: 'rgba(239,68,68,0.12)' }}>
                <AlertCircle size={20} color="#ef4444" />
              </div>
              <div>
                <div className="stat-value">{errors}</div>
                <div className="stat-label">Con error</div>
              </div>
            </div>
          </div>

          {/* Action cards */}
          <div className="actions-grid">
            <button className="action-card" onClick={() => navigate('/generate')}>
              <div className="action-card-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>
                <Wand2 size={22} color="#818cf8" />
              </div>
              <div className="action-card-title">Generar nuevo video</div>
              <div className="action-card-desc">Describe tu idea y la IA lo convertirá en un video en segundos.</div>
              <div className="action-card-link" style={{ color: 'var(--accent)' }}>
                Comenzar ahora <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </div>
            </button>

            <button className="action-card" onClick={() => navigate('/history')}>
              <div className="action-card-icon" style={{ background: 'rgba(16,185,129,0.12)' }}>
                <History size={22} color="#34d399" />
              </div>
              <div className="action-card-title">Ver historial</div>
              <div className="action-card-desc">Revisa todos tus videos generados, descárgalos o publícalos en YouTube.</div>
              <div className="action-card-link" style={{ color: '#34d399' }}>
                Ver historial <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />
              </div>
            </button>
          </div>

          {/* Recent videos */}
          {recents.length > 0 && (
            <>
              <div className="section-header">
                <div>
                  <div className="section-title">Recientes</div>
                  <div className="section-sub">Tus últimos videos generados</div>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => navigate('/history')}>
                  Ver todos
                </button>
              </div>
              <div className="videos-grid">
                {recents.map((v) => (
                  <VideoCard
                    key={v.id}
                    video={v}
                    onPublish={v.status === 'COMPLETED' ? setPublishTarget : undefined}
                    onPlay={v.status === 'COMPLETED' && v.videoUrl ? (vid) => window.open(vid.videoUrl!, '_blank') : undefined}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {publishTarget && (
        <PublishModal video={publishTarget} onClose={() => setPublishTarget(null)} />
      )}
    </>
  );
}
