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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const videoId = useMemo(() => getYouTubeVideoId(source), [source]);

  useEffect(() => {
    if (videoId) {
      // The YouTube iframe API accepts these commands after enablejsapi=1.
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: isPlaying ? 'playVideo' : 'pauseVideo', args: [] }), '*');
      return;
    }

    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) audio.play().catch(() => onPlaybackError?.());
    else audio.pause();
  }, [isPlaying, videoId, onPlaybackError]);

  useEffect(() => {
    if (!videoId || !isPlaying) return;
    const timer = window.setTimeout(() => {
      iframeRef.current?.contentWindow?.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*');
    }, 350);
    return () => window.clearTimeout(timer);
  }, [videoId, source, isPlaying]);

  if (videoId) {
    return (
      <iframe
        ref={iframeRef}
        title="Música ambiental"
        className="fixed h-px w-px -left-2 -top-2 opacity-0 pointer-events-none"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&autoplay=0&loop=1&playlist=${videoId}&controls=0&playsinline=1&rel=0`}
        allow="autoplay; encrypted-media"
      />
    );
  }

  return <audio ref={audioRef} loop preload="none" src={source} onError={onPlaybackError} />;
};
