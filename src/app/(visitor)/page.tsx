import Link from 'next/link';
import { btn } from '@/components/ui';

export default function HomePage() {
  return (
    <main className="px-5 pt-10">
      <div className="flex min-h-[70vh] flex-col">
        <div className="flex-1">
          <p className="text-sm uppercase tracking-[0.2em] text-accent-dark">
            Museum Audio Guide
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-snug text-ink">
            番号を入力して、
            <br />
            展示の音声ガイドを。
          </h1>
          <p className="mt-4 leading-relaxed text-ink-soft">
            美術館・水族館の展示番号を入力すると、解説文と音声ガイドをお楽しみいただけます。
            Bluetooth イヤホンやオープンイヤーデバイスでの視聴に対応しています。
          </p>

          <ul className="mt-8 space-y-3">
            {[
              ['1', '施設を選ぶ'],
              ['2', '展示番号を入力する'],
              ['3', '解説と音声を楽しむ'],
            ].map(([n, label]) => (
              <li key={n} className="flex items-center gap-3">
                <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-accent-soft text-sm font-semibold text-accent-dark">
                  {n}
                </span>
                <span className="text-ink-soft">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-10 space-y-3">
          <Link href="/museums" className={btn('primary', 'w-full py-3.5 text-base')}>
            音声ガイドを始める
          </Link>
          <Link href="/favorites" className={btn('ghost', 'w-full py-3.5 text-base')}>
            お気に入りを見る
          </Link>
        </div>
      </div>
    </main>
  );
}
