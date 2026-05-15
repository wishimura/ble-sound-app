'use client';

import { useEffect, useRef, useState } from 'react';
import type { Language } from '@/lib/repository/types';

/**
 * Plays the given narration text using the browser's built-in speech
 * synthesis. Used when an exhibit has no audio URL but has narration text.
 * Voice quality depends on the visitor's OS / browser.
 */
export default function TTSPlayer({
  text,
  lang,
  exhibitId,
  title,
  museumName,
}: {
  text: string;
  lang: Language;
  exhibitId: string;
  title: string;
  museumName: string;
}) {
  const [supported, setSupported] = useState(true);
  const [speaking, setSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const countedRef = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setSupported('speechSynthesis' in window);
    // Stop anything that was speaking when the text changes.
    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [text, lang]);

  useEffect(() => {
    countedRef.current = false;
    setSpeaking(false);
  }, [text, lang]);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('mediaSession' in navigator)) return;
    navigator.mediaSession.metadata = new MediaMetadata({
      title,
      artist: museumName,
    });
  }, [title, museumName]);

  function pickVoice(langCode: string): SpeechSynthesisVoice | undefined {
    const voices = window.speechSynthesis.getVoices();
    const prefix = langCode.split('-')[0];
    // Prefer an exact match, then a language-prefix match.
    return (
      voices.find((v) => v.lang === langCode) ??
      voices.find((v) => v.lang.toLowerCase().startsWith(prefix))
    );
  }

  function speak() {
    if (!supported) return;
    const synth = window.speechSynthesis;
    synth.cancel();

    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang === 'ja' ? 'ja-JP' : 'en-US';
    const voice = pickVoice(u.lang);
    if (voice) u.voice = voice;
    u.rate = 0.95;
    u.pitch = 1;
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    u.onerror = () => setSpeaking(false);
    utteranceRef.current = u;
    synth.speak(u);

    if (!countedRef.current) {
      countedRef.current = true;
      void fetch(`/api/exhibits/${exhibitId}/play`, { method: 'POST' }).catch(() => {
        countedRef.current = false;
      });
    }
  }

  function stop() {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  }

  if (!supported) {
    return (
      <div className="rounded-xl2 border border-line bg-canvas p-4 text-sm text-ink-muted">
        このブラウザは音声合成に対応していません
      </div>
    );
  }

  return (
    <div className="rounded-xl2 border border-line bg-canvas p-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={speaking ? stop : speak}
          aria-label={speaking ? '停止' : '再生'}
          className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-ink text-canvas transition-colors hover:bg-ink-soft focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          {speaking ? (
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
          <p className="text-sm font-medium text-ink">AI 読み上げ</p>
          <p className="text-xs text-ink-muted">
            {speaking ? '読み上げ中...' : 'タップで読み上げを開始'}
          </p>
        </div>
      </div>
    </div>
  );
}
