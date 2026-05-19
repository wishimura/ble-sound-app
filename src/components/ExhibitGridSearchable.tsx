'use client';

import { useMemo, useState } from 'react';
import ExhibitGrid from '@/components/ExhibitGrid';
import { Card, inputClass } from '@/components/ui';
import type { Exhibit } from '@/lib/repository/types';

type DisplayExhibit = Pick<
  Exhibit,
  'id' | 'exhibitNumber' | 'titleJa' | 'titleEn' | 'imageUrl'
>;

/**
 * Visitor grid with a client-side search box. Filters by exhibit number
 * (prefix-friendly) or by title (case-insensitive substring on either
 * Japanese or English title).
 */
export default function ExhibitGridSearchable({
  museumSlug,
  exhibits,
}: {
  museumSlug: string;
  exhibits: DisplayExhibit[];
}) {
  const [q, setQ] = useState('');

  const filtered = useMemo(() => {
    const trimmed = q.trim();
    if (!trimmed) return exhibits;
    const needle = trimmed.toLowerCase();
    return exhibits.filter((e) => {
      if (e.exhibitNumber.toLowerCase().includes(needle)) return true;
      if (e.titleJa.toLowerCase().includes(needle)) return true;
      if (e.titleEn && e.titleEn.toLowerCase().includes(needle)) return true;
      return false;
    });
  }, [q, exhibits]);

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          type="search"
          inputMode="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="番号または作品名で探す"
          aria-label="展示の検索"
          className={`${inputClass} pl-10`}
        />
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>

      {filtered.length === 0 ? (
        <Card className="p-6 text-center text-sm text-ink-muted">
          「{q}」に一致する展示は見つかりませんでした
        </Card>
      ) : (
        <ExhibitGrid museumSlug={museumSlug} exhibits={filtered} />
      )}
    </div>
  );
}
