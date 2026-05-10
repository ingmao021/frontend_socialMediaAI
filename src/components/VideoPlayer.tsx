interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <video
      key={src}
      className="video-player"
      controls
      playsInline
      preload="metadata"
      src={src}
      onError={(e) => {
        const mediaError = (e.target as HTMLVideoElement).error;
        switch (mediaError?.code) {
          case MediaError.MEDIA_ERR_NETWORK:
            // La URL pudo haber expirado → refetch desde backend
            console.error('Error de red. Verificar si la URL expiró.');
            break;
          case MediaError.MEDIA_ERR_DECODE:
            console.error('Error de decodificación del video.');
            break;
          case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            console.error('Formato de video no soportado.');
            break;
          default:
            console.error('Error desconocido:', mediaError);
        }
      }}
    >
      Tu navegador no soporta la etiqueta de video.
    </video>
  );
}
