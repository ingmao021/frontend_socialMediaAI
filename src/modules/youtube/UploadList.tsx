import { useEffect, useState } from 'react';
import { listUploads } from '../../api/youtube.api';
import type { YouTubeUpload } from '../../types/youtube.types';

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PUBLISHING: 'Subiendo a YouTube...',
  PUBLISHED: 'Publicado',
  FAILED: 'Error al publicar',
  DELETED: 'Eliminado',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: '#888',
  PUBLISHING: '#2563eb',
  PUBLISHED: '#16a34a',
  FAILED: '#dc2626',
  DELETED: '#ea580c',
};

export default function UploadList() {
  const [uploads, setUploads] = useState<YouTubeUpload[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listUploads()
      .then(setUploads)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando publicaciones...</p>;
  if (uploads.length === 0) return <p>No hay publicaciones aún.</p>;

  return (
    <ul style={{ listStyle: 'none', padding: 0 }}>
      {uploads.map((u) => (
        <li key={u.id} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 12, marginBottom: 8 }}>
          <strong>{u.title}</strong>
          <span style={{ marginLeft: 12, color: STATUS_COLORS[u.status], fontWeight: 600 }}>
            {STATUS_LABELS[u.status] ?? u.status}
          </span>
          {u.youtubeUrl && (
            <a href={u.youtubeUrl} target="_blank" rel="noreferrer" style={{ marginLeft: 12, fontSize: 13 }}>
              Ver en YouTube
            </a>
          )}
        </li>
      ))}
    </ul>
  );
}
