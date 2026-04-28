import { useState } from 'react';
import { Globe, EyeOff, Lock, X, CheckCircle2, ExternalLink, AlertCircle } from 'lucide-react';

const YTIcon = ({ size = 15 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.5 6.2a3.01 3.01 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.6A3.01 3.01 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3.01 3.01 0 0 0 2.1 2.1C4.5 20.5 12 20.5 12 20.5s7.5 0 9.4-.6a3.01 3.01 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8zM9.75 15.5V8.5l6.5 3.5-6.5 3.5z"/>
  </svg>
);
import { publishToYouTube } from '../../api/youtube.api';
import type { Video } from '../../types/video.types';
import type { YouTubeVisibility } from '../../types/youtube.types';

interface Props {
  video: Video;
  onClose: () => void;
}

type Phase = 'idle' | 'loading' | 'success' | 'error';

const VISIBILITY_OPTIONS: { value: YouTubeVisibility; label: string; icon: React.ReactNode }[] = [
  { value: 'PUBLIC',   label: 'Público',     icon: <Globe size={13} /> },
  { value: 'UNLISTED', label: 'No listado',  icon: <EyeOff size={13} /> },
  { value: 'PRIVATE',  label: 'Privado',     icon: <Lock size={13} /> },
];

export default function PublishModal({ video, onClose }: Props) {
  const [title, setTitle] = useState(video.title);
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<YouTubeVisibility>('PUBLIC');
  const [phase, setPhase] = useState<Phase>('idle');
  const [youtubeUrl, setYoutubeUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handlePublish = async () => {
    if (!title.trim()) return;
    setPhase('loading');
    setErrorMsg(null);
    try {
      const upload = await publishToYouTube({ videoId: video.id, title, description, visibility });
      setYoutubeUrl(upload.youtubeUrl);
      setPhase('success');
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message ?? 'Error al publicar en YouTube.');
      setPhase('error');
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <YTIcon size={20} /> Publicar en YouTube
          </span>
          <button className="btn btn-ghost btn-sm" onClick={onClose} style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {phase === 'success' ? (
          <div className="modal-body" style={{ textAlign: 'center', padding: '36px 24px' }}>
            <CheckCircle2 size={48} color="#34d399" style={{ marginBottom: 16 }} />
            <div style={{ fontFamily: 'var(--font-head)', fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>
              ¡Video publicado exitosamente!
            </div>
            <div style={{ fontSize: 14, color: 'var(--text-2)', marginBottom: 24 }}>
              Tu video ya está disponible en YouTube.
            </div>
            {youtubeUrl && (
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm"
                style={{ display: 'inline-flex', marginBottom: 12 }}
              >
                <ExternalLink size={13} /> Ver en YouTube
              </a>
            )}
            <br />
            <button className="btn btn-ghost btn-sm" onClick={onClose}>Cerrar</button>
          </div>
        ) : (
          <>
            <div className="modal-body">
              {phase === 'error' && errorMsg && (
                <div className="alert alert-error">
                  <AlertCircle size={16} style={{ flexShrink: 0 }} />
                  {errorMsg}
                </div>
              )}

              <div className="form-group">
                <label className="form-label">Título del video</label>
                <input
                  className="input"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título para YouTube"
                  maxLength={100}
                  disabled={phase === 'loading'}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Descripción</label>
                <textarea
                  className="textarea"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe tu video (opcional)"
                  rows={3}
                  maxLength={5000}
                  disabled={phase === 'loading'}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Privacidad</label>
                <div className="visibility-group">
                  {VISIBILITY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`visibility-btn${visibility === opt.value ? ' active' : ''}`}
                      onClick={() => setVisibility(opt.value)}
                      disabled={phase === 'loading'}
                      type="button"
                    >
                      {opt.icon} {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onClose} disabled={phase === 'loading'}>
                Cancelar
              </button>
              <button
                className="btn btn-primary"
                onClick={handlePublish}
                disabled={phase === 'loading' || !title.trim()}
              >
                {phase === 'loading' ? (
                  <><div className="spinner spinner-sm" /> Publicando...</>
                ) : (
                  <><YTIcon size={15} /> Publicar</>
                )}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
