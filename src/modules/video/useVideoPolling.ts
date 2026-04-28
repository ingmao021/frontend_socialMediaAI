import { useState, useEffect, useRef } from 'react';
import { getVideo } from '../../api/videos.api';
import type { Video, VideoStatus } from '../../types/video.types';

const TERMINAL_STATES: VideoStatus[] = ['COMPLETED', 'ERROR'];
const POLL_INTERVAL_MS = 10_000; // 10 segundos (el backend hace polling cada 30s)

export function useVideoPolling(videoId: number | null) {
  const [video, setVideo] = useState<Video | null>(null);
  const [loading, setLoading] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const fetchStatus = async () => {
    if (!videoId) return;
    try {
      const updated = await getVideo(videoId);
      setVideo(updated);
      if (TERMINAL_STATES.includes(updated.status)) {
        stopPolling();
      }
    } catch {
      stopPolling();
    }
  };

  useEffect(() => {
    if (!videoId) return;

    setLoading(true);
    fetchStatus().then(() => setLoading(false));

    intervalRef.current = setInterval(fetchStatus, POLL_INTERVAL_MS);

    return stopPolling;
  }, [videoId]);

  return { video, loading };
}