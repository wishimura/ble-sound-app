'use client';

import { useRef, useState } from 'react';

interface Props {
  /** id of the URL <input> this button fills in on success. */
  targetInputId: string;
  purpose: 'image' | 'audio';
}

const accepts: Record<Props['purpose'], string> = {
  image: 'image/jpeg,image/png,image/webp,image/gif,image/svg+xml',
  audio: 'audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/aac,audio/mp4',
};

const labels: Record<Props['purpose'], string> = {
  image: '画像をアップロード',
  audio: '音声をアップロード',
};

/**
 * Posts the selected file to /api/upload and writes the returned public URL
 * into a sibling URL <input> (looked up by `targetInputId`). Used inline next
 * to URL inputs on the admin / operator exhibit and museum forms.
 */
export default function FileUploadButton({ targetInputId, purpose }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<{
    kind: 'idle' | 'uploading' | 'ok' | 'error';
    message?: string;
  }>({ kind: 'idle' });

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    setStatus({ kind: 'uploading', message: `${file.name} をアップロード中...` });

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('purpose', purpose);
      const res = await fetch('/api/upload', { method: 'POST', body: fd });
      const data: { url?: string; error?: string } = await res.json();
      if (!res.ok || !data.url) {
        setStatus({ kind: 'error', message: data.error ?? 'アップロードに失敗しました' });
        return;
      }
      const target = document.getElementById(targetInputId) as HTMLInputElement | null;
      if (target) {
        target.value = data.url;
        // Notify React of the change so controlled forms / state stay in sync.
        target.dispatchEvent(new Event('input', { bubbles: true }));
        target.dispatchEvent(new Event('change', { bubbles: true }));
      }
      setStatus({ kind: 'ok', message: 'アップロードしました' });
    } catch {
      setStatus({ kind: 'error', message: '通信エラーが発生しました' });
    } finally {
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={status.kind === 'uploading'}
        className="rounded-full border border-line bg-surface px-3 py-1 text-ink-soft hover:bg-canvas disabled:opacity-50"
      >
        {labels[purpose]}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accepts[purpose]}
        onChange={onChange}
        className="hidden"
      />
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
