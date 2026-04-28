import type { VideoStatus } from '../../types/video.types';

const CONFIG: Record<VideoStatus, { label: string; cls: string }> = {
  PENDING:    { label: 'Pendiente',   cls: 'badge badge-pending' },
  PROCESSING: { label: 'Procesando',  cls: 'badge badge-processing' },
  COMPLETED:  { label: 'Completado',  cls: 'badge badge-completed' },
  ERROR:      { label: 'Error',       cls: 'badge badge-error' },
};

export default function StatusBadge({ status }: { status: VideoStatus }) {
  const { label, cls } = CONFIG[status] ?? CONFIG.ERROR;
  return <span className={cls}>{label}</span>;
}
