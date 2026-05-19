'use client';

import { useState } from 'react';

interface Props {
  narrationInputId: string;
  audioInputId: string;
  lang: 'ja' | 'en';
}

/**
 * Reads the current narration text from a sibling textarea, calls /api/tts
 * to generate a natural-sounding mp3, and writes the resulting URL into the
 * audio URL input. Used inside ExhibitForm next to the narration fields.
 */
export default function GenerateAudioButton({
  narrationInputId,
  audioInputId,
  lang,
}: Props) {
  const [status, setStatus] = useState<{
    kind: 'idle' | 'working' | 'ok' | 'error';
    message?: string;
  }>({ kind: 'idle' });

  async function generate() {
    const textarea = document.getElementById(
      narrationInputId,
    ) as HTMLTextAreaElement | null;
    const text = (textarea?.value ?? '').trim();
    if (!text) {
      setStatus({ kind: 'error', message: '読み上げテキストを入力してください' });
      return;
    }
    setStatus({ kind: 'working', message: 'AI音声を生成中...（数十秒）' });
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, lang }),
      });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        setStatus({ kind: 'error', message: data.error ?? '生成に失敗しました' });
        return;
      }
      const target = document.getElementById(audioInputId) as HTMLInputElement | null;
      if (target) {
        target.value = data.url;
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setStatus({ kind: 'ok', message: 'AI音声を生成しました' });
    } catch {
      setStatus({ kind: 'error', message: '通信エラーが発生しました' });
    }
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={generate}
        disabled={status.kind === 'working'}
        className="rounded-full border border-accent bg-accent-soft px-3 py-1 font-medium text-accent-dark hover:bg-accent hover:text-white disabled:opacity-50"
      >
        AIで音声を生成（高品質）
      </button>
      {status.message ? (
        <span
          className={
            status.kind === 'error'
              ? 'text-red-600'
              : status.kind === 'ok'
                ? 'text-emerald-700'
                : 'text-ink-muted'
          }
        >
          {status.message}
        </span>
      ) : null}
    </div>
  );
}
