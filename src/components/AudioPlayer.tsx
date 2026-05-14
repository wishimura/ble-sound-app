'use client';

import { useEffect, useRef, useState } from 'react';

interface AudioPlayerProps {
  src: string;
  exhibitId: string;
  title: string;
  museumName: string;
}

/**
 * Minimal HTML5 audio player (play / pause only, per spec). Works with
 * Bluetooth / open-ear devices since it uses the native <audio> element, and
 * registers MediaSession metadata so lock-screen / background controls work.
 * The first successful play is reported to the play-count endpoint.
 */
export default function AudioPlayer({ src, exhibitId, title, museumName }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const countedRef = useRef(false);

  useEffect(() => {
    // Reset when the source changes (e.g. language switch).
    countedRef.current = false;
    setPlaying(false);
    setProgress(0);
  }, [src]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: museumName,
    });
  }, [title, museumName]);

  function reportPlay() {
    if (countedRef.current) return;
    countedRef.current = true;
    void fetch(`/api/exhibits/${exhibitId}/play`, { method: 'POST' }).catch(() => {
      countedRef.current = false;
    });
  }

  function toggle() {
    const el = audioRef.current;
    if (!el) return;
    if (el.paused) {
      void el.play();
    } else {
      el.pause();
    }
  }

  const fmt = (s: number) => {
    if (!Number.isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl2 border border-line bg-canvas p-4">
      <audio
        ref={audioRef}
        src={src}
        preload="metadata"
        onPlay={() => {
          setPlaying(true);
          reportPlay();
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
      />
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={toggle}
          aria-label={playing ? '停止' : '再生'}
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-ink text-canvas transition-colors hover:bg-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {playing ? (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          ) : (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>
        <div className="min-w-0 flex-1">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full bg-accent transition-[width]"
              style={{ width: duration ? `${(progress / duration) * 100}%` : '0%' }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-xs text-ink-muted">
            <span>{fmt(progress)}</span>
            <span>{fmt(duration)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
