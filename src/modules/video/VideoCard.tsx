import { Video as VideoIcon, Play, AlertCircle } from 'lucide-react';

const YTIcon = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3.01 3.01 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3.01 3.01 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.01 3.01 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3.01 3.01 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/>
  </svg>
);
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import type { Video } from '../../types/video.types';
import StatusBadge from '../ui/StatusBadge';

interface Props {
  video: Video;
  onPublish?: (video: Video) => void;
  onPlay?: (video: Video) => void;
}

export default function VideoCard({ video, onPublish, onPlay }: Props) {
  const timeAgo = formatDistanceToNow(new Date(video.createdAt), { addSuffix: true, locale: es });

  return (
    <div className="video-card">
      <div className="video-thumbnail">
        <VideoIcon size={36} color="var(--text-3)" opacity={0.5} />
        <div className="video-thumbnail-badge">
          <StatusBadge status={video.status} />
        </div>
        {(video.status === 'PROCESSING' || video.status === 'PENDING') && (
          <div className="video-thumb-progress">
            <div className="video-thumb-progress-bar" />
          </div>
        )}
      </div>

      <div className="video-card-body">
        <div className="video-card-title">{video.title}</div>
        <div className="video-card-meta">
          <span>{timeAgo}</span>
        </div>

        {video.status === 'COMPLETED' && (
          <div className="video-card-actions">
            {onPlay && (
              <button className="btn btn-secondary btn-sm" onClick={() => onPlay(video)}>
                <Play size={13} /> Reproducir
              </button>
            )}
            {onPublish && (
              <button className="btn btn-primary btn-sm" onClick={() => onPublish(video)}>
                <YTIcon size={13} /> YouTube
              </button>
            )}
          </div>
        )}

        {video.status === 'ERROR' && video.errorMessage && (
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, fontSize: 13, color: '#f87171' }}>
            <AlertCircle size={14} style={{ flexShrink: 0, marginTop: 2 }} />
            <span>{video.errorMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
