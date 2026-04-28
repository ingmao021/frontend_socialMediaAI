import { useState } from 'react';
import { generateVideo } from '../../api/videos.api';
import type { GenerateVideoRequest, Video } from '../../types/video.types';

interface Props {
  onSuccess: (video: Video) => void;
}

export default function VideoForm({ onSuccess }: Props) {
  const [form, setForm] = useState<GenerateVideoRequest>({
    title: '',
    prompt: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const video = await generateVideo(form);
      onSuccess(video);
    } catch (err: any) {
      const message = err.response?.data?.message ?? 'Error al generar el video';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={form.title}
        onChange={(e) => setForm({ ...form, title: e.target.value })}
        placeholder="Título del video"
        maxLength={200}
        required
        disabled={loading}
      />
      <textarea
        value={form.prompt}
        onChange={(e) => setForm({ ...form, prompt: e.target.value })}
        placeholder="Describe el video que quieres generar (5-1000 caracteres)"
        minLength={5}
        maxLength={1000}
        required
        disabled={loading}
      />
      <textarea
        value={form.description ?? ''}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
        placeholder="Descripción (opcional)"
        maxLength={500}
        disabled={loading}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? 'Generando...' : 'Generar Video'}
      </button>
    </form>
  );
}