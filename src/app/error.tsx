'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { btn } from '@/components/ui';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error', error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
      <p className="text-5xl">⚠️</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">エラーが発生しました</h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        申し訳ありません。一時的な問題が発生した可能性があります。
        <br />
        もう一度お試しいただくか、しばらく経ってから再度アクセスしてください。
      </p>
      {error.digest ? (
        <p className="mt-3 text-xs text-ink-muted">エラーID: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-col gap-2">
        <button type="button" onClick={reset} className={btn('primary')}>
          再読み込み
        </button>
        <Link href="/" className={btn('ghost')}>
          トップへ戻る
        </Link>
      </div>
    </main>
  );
}
