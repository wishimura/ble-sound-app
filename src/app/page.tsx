import Link from 'next/link';
import { btn } from '@/components/ui';

export const metadata = {
  title: 'Museum Audio Guide',
};

/**
 * Root page. Visitors don't normally hit this URL — they come in via the
 * per-museum QR code (`/[slug]`). Keep a minimal staff-oriented entry so
 * typing the bare domain still surfaces useful options.
 */
export default function RootPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <p className="text-xs uppercase tracking-[0.2em] text-accent-dark">
        Museum Audio Guide
      </p>
      <h1 className="mt-2 text-2xl font-semibold leading-snug text-ink">
        音声ガイド管理コンソール
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        ご来館者の方は、施設に掲示の QR コードからアクセスしてください。
        以下は施設運営者・担当者向けのログイン入口です。
      </p>

      <div className="mt-8 space-y-3">
        <Link href="/operator/login" className={btn('primary', 'w-full')}>
          運営者としてログイン
        </Link>
        <Link href="/admin/login" className={btn('ghost', 'w-full')}>
          施設担当者としてログイン
        </Link>
      </div>
    </main>
  );
}
