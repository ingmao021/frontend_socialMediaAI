import { useEffect, useState } from 'react';
import { listVideos } from '../../api/videos.api';
import type { Video } from '../../types/video.types';
import VideoCard from './VideoCard';
import PublishModal from '../youtube/PublishModal';

export default function VideoList() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [publishTarget, setPublishTarget] = useState<Video | null>(null);

  useEffect(() => {
    listVideos()
      .then(setVideos)
      .catch(() => setError('No se pudo cargar el historial de videos.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-2)' }}>Cargando videos...</p>;
  if (error) return <p style={{ color: '#f87171' }}>{error}</p>;
  if (videos.length === 0) return <p style={{ color: 'var(--text-2)' }}>No hay videos aún.</p>;

  return (
    <div>
      <div className="videos-grid">
        {videos.map((v) => (
          <VideoCard
            key={v.id}
            video={v}
            onPublish={v.status === 'COMPLETED' ? setPublishTarget : undefined}
            onPlay={v.status === 'COMPLETED' && v.videoUrl ? (vid) => window.open(vid.videoUrl!, '_blank') : undefined}
          />
        ))}
      </div>

      {publishTarget && (
        <PublishModal video={publishTarget} onClose={() => setPublishTarget(null)} />
      )}
    </div>
  );
}
