import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Plus, Video } from 'lucide-react';
import { listVideos } from '../api/videos.api';
import type { Video as VideoType, VideoStatus } from '../types/video.types';
import Header from '../modules/ui/Header';
import VideoCard from '../modules/video/VideoCard';
import PublishModal from '../modules/youtube/PublishModal';

type Filter = 'all' | VideoStatus;

const FILTERS: { value: Filter; label: string }[] = [
  { value: 'all',        label: 'Todos' },
  { value: 'COMPLETED',  label: 'Completados' },
  { value: 'PROCESSING', label: 'En proceso' },
  { value: 'PENDING',    label: 'Pendientes' },
  { value: 'ERROR',      label: 'Con error' },
];

export default function HistoryPage() {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<VideoType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [publishTarget, setPublishTarget] = useState<VideoType | null>(null);

  useEffect(() => {
    listVideos()
      .then(setVideos)
      .catch(() => setError('No se pudo cargar el historial de videos.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? videos : videos.filter((v) => v.status === filter);

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="page-content-lg page-enter">

          <button className="breadcrumb" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={16} /> Dashboard
          </button>

          <div className="section-header">
            <div>
              <div className="section-title">Historial de videos</div>
              <div className="section-sub">{videos.length} video{videos.length !== 1 ? 's' : ''} generado{videos.length !== 1 ? 's' : ''}</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => navigate('/generate')}>
              <Plus size={15} /> Nuevo video
            </button>
          </div>

          {/* Filter tabs */}
          {videos.length > 0 && (
            <div className="filter-tabs">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  className={`filter-tab${filter === f.value ? ' active' : ''}`}
                  onClick={() => setFilter(f.value)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          )}

          {/* States */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '40px 0', color: 'var(--text-2)' }}>
              <div className="spinner" style={{ color: 'var(--accent)' }} /> Cargando videos...
            </div>
          )}

          {!loading && error && (
            <div className="alert alert-error">{error}</div>
          )}

          {!loading && !error && videos.length === 0 && (
            <div className="empty-state">
              <div className="empty-icon">
                <Video size={52} />
              </div>
              <div className="empty-title">Aún no has generado ningún video</div>
              <div className="empty-sub">Crea tu primer video con IA y aparecerá aquí</div>
              <button className="btn btn-primary" onClick={() => navigate('/generate')}>
                <Plus size={16} /> Crear mi primer video
              </button>
            </div>
          )}

          {!loading && !error && videos.length > 0 && filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-2)' }}>
              No hay videos con el filtro seleccionado.
            </div>
          )}

          {!loading && filtered.length > 0 && (
            <div className="videos-grid">
              {filtered.map((v) => (
                <VideoCard
                  key={v.id}
                  video={v}
                  onPublish={v.status === 'COMPLETED' ? setPublishTarget : undefined}
                  onPlay={v.status === 'COMPLETED' && v.videoUrl ? (vid) => window.open(vid.videoUrl!, '_blank') : undefined}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {publishTarget && (
        <PublishModal video={publishTarget} onClose={() => setPublishTarget(null)} />
      )}
    </>
  );
}
