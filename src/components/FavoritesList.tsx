'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import {
  getFavorites,
  removeFavorite,
  subscribeFavorites,
  type FavoriteItem,
} from '@/lib/favorites';
import { Card } from '@/components/ui';

export default function FavoritesList() {
  const [items, setItems] = useState<FavoriteItem[] | null>(null);

  useEffect(() => {
    const sync = () => setItems(getFavorites());
    sync();
    return subscribeFavorites(sync);
  }, []);

  if (items === null) {
    return <p className="text-sm text-ink-muted">読み込み中...</p>;
  }

  if (items.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-ink-soft">まだお気に入りはありません</p>
        <p className="mt-1 text-sm text-ink-muted">
          展示詳細ページの「お気に入りに追加」から登録できます
        </p>
      </Card>
    );
  }

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.exhibitId}>
          <Card className="flex items-center gap-3 p-4">
            <Link
              href={`/m/${item.museumId}/e/${encodeURIComponent(item.exhibitNumber)}`}
              className="min-w-0 flex-1"
            >
              <p className="text-xs text-ink-muted">
                {item.museumName} ・ No.{item.exhibitNumber}
              </p>
              <p className="truncate font-medium text-ink">{item.title}</p>
            </Link>
            <button
              type="button"
              onClick={() => removeFavorite(item.exhibitId)}
              className="flex-none rounded-full border border-line px-3 py-1.5 text-xs text-ink-muted hover:bg-canvas"
            >
              削除
            </button>
          </Card>
        </li>
      ))}
    </ul>
  );
}
