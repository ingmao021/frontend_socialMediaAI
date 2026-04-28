import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Wand2, Sparkles, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { generateVideo } from '../api/videos.api';
import { useVideoPolling } from '../modules/video/useVideoPolling';
import type { Video } from '../types/video.types';
import type { GenerateVideoRequest } from '../types/video.types';
import Header from '../modules/ui/Header';
import PublishModal from '../modules/youtube/PublishModal';

export default function GeneratePage() {
  const navigate = useNavigate();
  const [form, setForm] = useState<GenerateVideoRequest>({ title: '', prompt: '', description: '' });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [createdVideo, setCreatedVideo] = useState<Video | null>(null);
  const [showPublish, setShowPublish] = useState(false);

  const { video: polledVideo } = useVideoPolling(createdVideo?.id ?? null);
  const currentVideo = polledVideo ?? createdVideo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      const video = await generateVideo(form);
      setCreatedVideo(video);
    } catch (err: any) {
      setFormError(err.response?.data?.message ?? 'Error al iniciar la generación del video.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setCreatedVideo(null);
    setForm({ title: '', prompt: '', description: '' });
    setFormError(null);
  };

  const isProcessing = currentVideo?.status === 'PENDING' || currentVideo?.status === 'PROCESSING';

  return (
    <>
      <Header />
      <div className="page-wrapper">
        <div className="page-content-sm page-enter">

          <button className="breadcrumb" onClick={() => navigate('/dashboard')}>
            <ChevronLeft size={16} /> Dashboard
          </button>

          <div className="section-header" style={{ marginBottom: 24 }}>
            <div>
              <div className="section-title">Generar video</div>
              <div className="section-sub">Describe tu idea y la IA creará el video</div>
            </div>
          </div>

          {/* Form — only shown before submitting */}
          {!createdVideo && (
            <form onSubmit={handleSubmit} className="generate-form-card">
              <div className="form-group">
                <label className="form-label">Título del video *</label>
                <input
                  className="input"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Ej: Amanecer en la montaña"
                  maxLength={200}
                  required
                  disabled={submitting}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Prompt de generación *</label>
                <textarea
                  className="textarea"
                  value={form.prompt}
                  onChange={(e) => setForm({ ...form, prompt: e.target.value })}
                  placeholder="Describe el video que quieres generar... (5-1000 caracteres)"
                  minLength={5}
                  maxLength={1000}
                  rows={5}
                  required
                  disabled={submitting}
                  style={{ minHeight: 140 }}
                />
                <div className="char-counter">{form.prompt.length} / 1000</div>
              </div>

              <div className="form-group" style={{ marginBottom: 20 }}>
                <label className="form-label">Descripción <span style={{ color: 'var(--text-3)' }}>(opcional)</span></label>
                <textarea
                  className="textarea"
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Descripción adicional para el video"
                  maxLength={500}
                  rows={2}
                  disabled={submitting}
                />
              </div>

              <div className="alert alert-info" style={{ marginBottom: 20 }}>
                <Info size={15} style={{ flexShrink: 0 }} />
                <span>Los videos se generan con una duración de 5 segundos en formato 16:9.</span>
              </div>

              {formError && (
                <div className="alert alert-error" style={{ marginBottom: 20 }}>
                  <AlertCircle size={15} style={{ flexShrink: 0 }} />
                  {formError}
                </div>
              )}

              <button
                type="submit"
                className="btn btn-primary btn-lg btn-full"
                disabled={submitting || form.prompt.length < 5 || !form.title.trim()}
              >
                {submitting ? (
                  <><div className="spinner spinner-sm" /> Iniciando generación...</>
                ) : (
                  <><Wand2 size={18} /> Generar video</>
                )}
              </button>
            </form>
          )}

          {/* Status card — shown after submit */}
          {currentVideo && (
            <div className="generate-status-card fade-in">
              {isProcessing && (
                <>
                  <div className="generate-status-header">
                    <div>
                      <div className="generate-status-title">
                        <Sparkles size={16} color="var(--accent)" style={{ display: 'inline', marginRight: 6 }} />
                        Procesando tu video
                      </div>
                      <div className="generate-status-sub">"{currentVideo.title}"</div>
                    </div>
                    <div className="spinner" style={{ color: 'var(--accent)' }} />
                  </div>
                  <div className="progress-bar progress-bar-indeterminate">
                    <div className="progress-bar-fill" />
                  </div>
                  <div className="processing-note">
                    <Info size={12} />
                    Puede tardar hasta 2 minutos. No cierres esta ventana.
                  </div>
                </>
              )}

              {currentVideo.status === 'COMPLETED' && (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                    <CheckCircle2 size={20} color="#34d399" />
                    <span style={{ fontFamily: 'var(--font-head)', fontWeight: 600, color: '#34d399' }}>
                      ¡Video generado con éxito!
                    </span>
                  </div>
                  {currentVideo.videoUrl && (
                    <div className="generate-video-player">
                      <video src={currentVideo.videoUrl} controls />
                    </div>
                  )}
                  <div className="generate-video-actions">
                    <button className="btn btn-secondary" onClick={handleReset}>
                      Generar otro
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowPublish(true)}>
                      Publicar en YouTube
                    </button>
                  </div>
                </>
              )}

              {currentVideo.status === 'ERROR' && (
                <>
                  <div className="alert alert-error" style={{ marginBottom: 16 }}>
                    <AlertCircle size={15} style={{ flexShrink: 0 }} />
                    {currentVideo.errorMessage ?? 'Ocurrió un error al generar el video.'}
                  </div>
                  <button className="btn btn-secondary btn-sm" onClick={handleReset}>
                    Intentar de nuevo
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {showPublish && currentVideo && (
        <PublishModal video={currentVideo} onClose={() => setShowPublish(false)} />
      )}
    </>
  );
}
