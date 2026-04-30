import { VideoPlayer } from './VideoPlayer';
import type { VideoResponse } from '../types/video.types';

interface VideoCardProps {
  video: VideoResponse;
  onDelete: (videoId: string) => void;
}

const STATUS_CONFIG = {
  PROCESSING: { label: 'Procesando', className: 'status-processing' },
  COMPLETED: { label: 'Completado', className: 'status-completed' },
  FAILED: { label: 'Error', className: 'status-failed' },
} as const;

export function VideoCard({ video, onDelete }: VideoCardProps) {
  const statusCfg = STATUS_CONFIG[video.status];

  return (
    <div className="video-card glass-card">
      <div className="video-card-preview">
        {video.status === 'COMPLETED' && video.signedUrl ? (
          <VideoPlayer src={video.signedUrl} />
        ) : video.status === 'PROCESSING' ? (
          <div className="video-card-processing">
            <div className="spinner" />
            <span>Generando video…</span>
          </div>
        ) : (
          <div className="video-card-error">
            <span>⚠️ {video.errorMessage || 'Error en la generación'}</span>
          </div>
        )}
      </div>

      <div className="video-card-content">
        <div className={`status-badge ${statusCfg.className}`}>
          <span className="status-dot" />
          {statusCfg.label}
        </div>
        <p className="video-card-prompt" title={video.prompt}>
          {video.prompt}
        </p>
        <div className="video-card-meta">
          <span>{video.durationSeconds}s</span>
          <span>
            {new Date(video.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
        <div className="video-card-actions">
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(video.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
