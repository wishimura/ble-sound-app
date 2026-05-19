import Link from 'next/link';
import { btn } from '@/components/ui';

export const metadata = { title: 'ページが見つかりません' };

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6 text-center">
      <p className="text-5xl">🔍</p>
      <h1 className="mt-4 text-xl font-semibold text-ink">
        ページが見つかりません
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-ink-soft">
        URL が変更されたか、削除された可能性があります。
        <br />
        ご来館者の方は、施設に掲示されている QR コードを再度読み取ってください。
      </p>
      <div className="mt-8">
        <Link href="/" className={btn('primary')}>
          トップへ
        </Link>
      </div>
    </main>
  );
}
