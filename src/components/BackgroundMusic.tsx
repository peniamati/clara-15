import React, { useEffect, useMemo, useRef } from 'react';

interface BackgroundMusicProps {
  source: string;
  isPlaying: boolean;
  onPlaybackError?: () => void;
}

const getYouTubeVideoId = (value: string) => {
  try {
    const url = new URL(value);
    if (url.hostname.includes('youtu.be')) return url.pathname.slice(1).split('/')[0] || null;
    if (url.hostname.includes('youtube.com') || url.hostname.includes('youtube-nocookie.com')) {
      if (url.pathname.startsWith('/embed/')) return url.pathname.split('/')[2] || null;
      return url.searchParams.get('v');
    }
  } catch {
    return null;
  }
  return null;
};

/** Plays either a YouTube video (audio only) or a regular audio file. */
export const BackgroundMusic: React.FC<BackgroundMusicProps> = ({ source, isPlaying, onPlaybackError }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const videoId = useMemo(() => getYouTubeVideoId(source), [source]);

  useEffect(() => {
    if (videoId) return;

    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => onPlaybackError?.());
    else audio.pause();
  }, [isPlaying, videoId, onPlaybackError]);

  if (videoId) {
    // The iframe is created by the user's "Abrir invitación" / music-button action.
    // Removing it when muted reliably stops playback on mobile browsers.
    if (!isPlaying) return null;
    return (
      <iframe
        title="Música ambiental"
        className="fixed h-px w-px -left-2 -top-2 opacity-0 pointer-events-none"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0`}
        allow="autoplay; encrypted-media"
      />
    );
  }

  return <audio ref={audioRef} loop preload="none" src={source} onError={onPlaybackError} />;
};
