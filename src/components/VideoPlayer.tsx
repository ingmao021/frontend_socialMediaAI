interface VideoPlayerProps {
  src: string;
}

export function VideoPlayer({ src }: VideoPlayerProps) {
  return (
    <video
      className="video-player"
      controls
      preload="metadata"
      src={src}
    >
      Tu navegador no soporta la etiqueta de video.
    </video>
  );
}
