import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { VideoPlayer } from './VideoPlayer';
import { videoService } from '../services/videoService';
import { youtubeService } from '../services/youtubeService';
import { useVideoPolling } from '../hooks/useVideoPolling';
import type { VideoResponse } from '../types/video.types';
import type { YouTubePrivacyStatus } from '../types/youtube.types';

interface VideoCardProps {
  video: VideoResponse;
  onDelete: (videoId: string) => void;
  onVideoCompleted?: (videoId: string) => void;
}

const STATUS_CONFIG = {
  PROCESSING: { label: 'Procesando', className: 'status-processing' },
  COMPLETED: { label: 'Completado', className: 'status-completed' },
  FAILED: { label: 'Error', className: 'status-failed' },
} as const;

const isSignedUrlExpired = (expiresAt: string | null | undefined): boolean => {
  if (!expiresAt) return true;
  const expiry = new Date(expiresAt);
  const margin = 60 * 60 * 1000; // 1 hora de margen
  return Date.now() > expiry.getTime() - margin;
};

// ── AÑADIDO: estados del flujo de compartir en YouTube ────────────────
type YouTubeShareState = 'idle' | 'form' | 'uploading' | 'done' | 'error';
// ─────────────────────────────────────────────────────────────────────

export function VideoCard({ video, onDelete, onVideoCompleted }: VideoCardProps) {
  const [currentVideo, setCurrentVideo] = useState<VideoResponse>(video);

  // ── AÑADIDO: estado YouTube ──────────────────────────────────────────
  const [ytState, setYtState] = useState<YouTubeShareState>('idle');
  const [ytProgress, setYtProgress] = useState<number | null>(null);
  const [ytUrl, setYtUrl] = useState<string | null>(null);
  const [ytError, setYtError] = useState<string | null>(null);
  const [shareTitle, setShareTitle] = useState('');
  const [sharePrivacy, setSharePrivacy] = useState<YouTubePrivacyStatus>('PRIVATE');
  const [checkingConnection, setCheckingConnection] = useState(false);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // ─────────────────────────────────────────────────────────────────────

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCurrentVideo(video);
  }, [video]);

  // ── AÑADIDO: limpiar polling al desmontar ────────────────────────────
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);
  // ─────────────────────────────────────────────────────────────────────

  useVideoPolling({
    videoId: currentVideo.status === 'PROCESSING' ? currentVideo.id : null,
    onComplete: (signedUrl) => {
      setCurrentVideo((prev) => ({
        ...prev,
        status: 'COMPLETED',
        signedUrl,
      }));
      // Notificar al padre para que refresque la lista de videos
      onVideoCompleted?.(currentVideo.id);
    },
    onFailed: (errorMessage) => {
      setCurrentVideo((prev) => ({
        ...prev,
        status: 'FAILED',
        errorMessage,
      }));
    },
  });

  useEffect(() => {
    const checkAndRefreshUrl = async () => {
      if (currentVideo.status === 'COMPLETED' && isSignedUrlExpired(currentVideo.signedUrlExpiresAt)) {
        try {
          const updatedVideo = await videoService.getVideo(currentVideo.id);
          setCurrentVideo(updatedVideo);
        } catch (err) {
          console.error('Error refreshing video URL', err);
        }
      }
    };
    checkAndRefreshUrl();
  }, [currentVideo.status, currentVideo.signedUrlExpiresAt, currentVideo.id]);

  const forceRefreshUrl = async () => {
    if (currentVideo.status === 'COMPLETED') {
      try {
        const updatedVideo = await videoService.getVideo(currentVideo.id);
        setCurrentVideo(updatedVideo);
      } catch (err) {
        console.error('Error forcing video URL refresh', err);
      }
    }
  };

// ── AÑADIDO: funciones del flujo YouTube ─────────────────────────────
 
const startJobPolling = (jobId: string) => {
  if (pollingRef.current) clearInterval(pollingRef.current);
  pollingRef.current = setInterval(async () => {
    try {
      const job = await youtubeService.getExportJob(jobId);
      setYtProgress(job.progressPercent);
      if (job.status === 'COMPLETED') {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
        setYtState('done');
        setYtUrl(job.youtubeVideoUrl);
        toast.success('¡Video publicado en YouTube!');
      } else if (job.status === 'FAILED') {
        clearInterval(pollingRef.current!);
        pollingRef.current = null;
        const msg = job.errorMessage ?? 'Error al subir el video a YouTube';
        setYtState('error');
        setYtError(msg);
        toast.error(msg);
      }
    } catch {
      console.error('[YT poll] error transient, retrying...');
    }
  }, 2000);
};

const handleShareClick = async () => {
  setCheckingConnection(true);
  try {
    await youtubeService.getConnection();
    setShareTitle(currentVideo.prompt.substring(0, 100));
    setSharePrivacy('PRIVATE');
    setYtState('form');
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      try {
        const { authorizationUrl } = await youtubeService.initiateOAuth();
        window.location.href = authorizationUrl;
      } catch {
        toast.error('No se pudo iniciar la conexión con YouTube');
      }
    } else {
      toast.error('Error al verificar la conexión con YouTube');
    }
  } finally {
    setCheckingConnection(false);
  }
};

const handleShareSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!shareTitle.trim()) {
    toast.error('El título es obligatorio');
    return;
  }
  setYtState('uploading');
  setYtProgress(null);
  try {
    const job = await youtubeService.exportVideo(currentVideo.id, {
      title: shareTitle.trim(),
      description: null,
      tags: null,
      privacyStatus: sharePrivacy,
    });
    startJobPolling(job.jobId);
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const code = (err.response?.data as { code?: string })?.code;
      if (code === 'YOUTUBE_NOT_CONNECTED') {
        toast.error('Conecta tu cuenta de YouTube primero');
      } else if (code === 'VIDEO_NOT_READY_FOR_EXPORT') {
        toast.error('El video no está listo para exportar');
      } else {
        toast.error('Error al iniciar la subida a YouTube');
      }
    } else {
      toast.error('Error de conexión');
    }
    setYtState('form');
  }
};

const handleShareCancel = () => {
  if (pollingRef.current) clearInterval(pollingRef.current);
  pollingRef.current = null;
  setYtState('idle');
  setYtProgress(null);
  setYtError(null);
  setYtUrl(null);
};

// ─────────────────────────────────────────────────────────────────────

  const statusCfg = STATUS_CONFIG[currentVideo.status];

  return (
    <div className="video-card glass-card">
      <div className="video-card-preview">
        {currentVideo.status === 'COMPLETED' && currentVideo.signedUrl ? (
          <VideoPlayer src={currentVideo.signedUrl} onNetworkError={forceRefreshUrl} />
        ) : currentVideo.status === 'PROCESSING' ? (
          <div className="video-card-processing">
            <div className="spinner" />
            <span>Generando video…</span>
          </div>
        ) : currentVideo.status === 'FAILED' ? (
          <div className="video-card-error">
            <span>⚠️ {currentVideo.errorMessage || 'Error en la generación'}</span>
          </div>
        ) : (
          // Caso cuando está COMPLETED pero sin signedUrl (debería ser muy raro due to backend)
          <div className="video-card-error">
            <span>⚠️ URL del video no disponible</span>
          </div>
        )}
      </div>

      <div className="video-card-content">
        <div className={`status-badge ${statusCfg.className}`}>
          <span className="status-dot" />
          {statusCfg.label}
        </div>
        <p className="video-card-prompt" title={currentVideo.prompt}>
          {currentVideo.prompt}
        </p>
        <div className="video-card-meta">
          <span>{currentVideo.durationSeconds}s</span>
          <span>
            {new Date(currentVideo.createdAt).toLocaleDateString('es-ES', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>

        {/* ── AÑADIDO: formulario inline de YouTube ── */}
        {currentVideo.status === 'COMPLETED' && ytState === 'form' && (
          <form className="yt-share-form" onSubmit={handleShareSubmit}>
            <input
              className="yt-share-input"
              type="text"
              placeholder="Título del video en YouTube"
              value={shareTitle}
              onChange={(e) => setShareTitle(e.target.value)}
              maxLength={100}
              required
            />
            <select
              className="yt-share-select"
              value={sharePrivacy}
              onChange={(e) => setSharePrivacy(e.target.value as YouTubePrivacyStatus)}
            >
              <option value="PRIVATE">🔒 Privado</option>
              <option value="UNLISTED">🔗 No listado</option>
              <option value="PUBLIC">🌐 Público</option>
            </select>
            <div className="yt-share-form-actions">
              <button type="submit" className="btn btn-yt btn-sm">
                Subir
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={handleShareCancel}
              >
                Cancelar
              </button>
            </div>
          </form>
        )}
 
        {/* ── AÑADIDO: estado subiendo ── */}
        {currentVideo.status === 'COMPLETED' && ytState === 'uploading' && (
          <div className="yt-upload-status">
            <div className="spinner spinner-sm" />
            <span className="yt-upload-label">
              {ytProgress != null
                ? `Subiendo… ${Math.round(ytProgress)}%`
                : 'Preparando subida…'}
            </span>
            {ytProgress != null && (
              <div className="yt-progress-bar">
                <div
                  className="yt-progress-fill"
                  style={{ width: `${Math.round(ytProgress)}%` }}
                />
              </div>
            )}
          </div>
        )}
 
        {/* ── AÑADIDO: estado completado ── */}
        {currentVideo.status === 'COMPLETED' && ytState === 'done' && ytUrl && (
          <div className="yt-done">
            <span className="yt-done-icon">✅</span>
            <a
              href={ytUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="yt-done-link"
            >
              Ver en YouTube →
            </a>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleShareCancel}
            >
              Volver
            </button>
          </div>
        )}
 
        {/* ── AÑADIDO: estado error ── */}
        {currentVideo.status === 'COMPLETED' && ytState === 'error' && (
          <div className="yt-error">
            <span>⚠️ {ytError ?? 'Error al subir a YouTube'}</span>
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={handleShareCancel}
            >
              Reintentar
            </button>
          </div>
        )}
        {/* ─────────────────────────────────────────────────── */}
 


        {/* ── AÑADIDO: botones de acción ────────────────────────────────── */}
        <div className="video-card-actions">
          {/* ── AÑADIDO: botón YouTube ── */}
          {currentVideo.status === 'COMPLETED' && (ytState === 'idle' || ytState === 'done') && (
            <button
              className="btn btn-yt btn-sm"
              onClick={handleShareClick}
              disabled={checkingConnection}
            >
              {checkingConnection ? (
                <span className="spinner spinner-sm" />
              ) : (
                'Compartir en YouTube'
              )}
            </button>
          )}
          {/* ─────────────────────────── */}
          <button
            className="btn btn-danger btn-sm"
            onClick={() => onDelete(currentVideo.id)}
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
}
