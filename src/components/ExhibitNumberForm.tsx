'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { btn } from '@/components/ui';

const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', 'clear', '0', 'back'];

export default function ExhibitNumberForm({ museumId }: { museumId: string }) {
  const router = useRouter();
  const [value, setValue] = useState('');

  function press(key: string) {
    if (key === 'clear') return setValue('');
    if (key === 'back') return setValue((v) => v.slice(0, -1));
    if (value.length >= 32) return;
    setValue((v) => v + key);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    router.push(`/m/${museumId}/e/${encodeURIComponent(trimmed)}`);
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <input
        inputMode="text"
        value={value}
        onChange={(e) => setValue(e.target.value.slice(0, 32))}
        placeholder="例: 12"
        aria-label="展示番号"
        className="w-full rounded-xl2 border border-line bg-surface px-5 py-4 text-center text-3xl font-semibold tracking-widest text-ink focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30"
      />
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => press(key)}
            className="rounded-xl border border-line bg-surface py-4 text-xl font-medium text-ink transition-colors hover:bg-canvas active:bg-accent-soft"
          >
            {key === 'clear' ? 'C' : key === 'back' ? '⌫' : key}
          </button>
        ))}
      </div>
      <button type="submit" disabled={!value.trim()} className={btn('primary', 'w-full py-3')}>
        この番号の展示を表示
      </button>
    </form>
  );
}
