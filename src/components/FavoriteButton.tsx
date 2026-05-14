'use client';

import { useEffect, useState } from 'react';
import {
  isFavorite,
  subscribeFavorites,
  toggleFavorite,
  type FavoriteItem,
} from '@/lib/favorites';

export default function FavoriteButton({ item }: { item: FavoriteItem }) {
  const [fav, setFav] = useState(false);

  useEffect(() => {
    setFav(isFavorite(item.exhibitId));
    return subscribeFavorites(() => setFav(isFavorite(item.exhibitId)));
  }, [item.exhibitId]);

  return (
    <button
      type="button"
      onClick={() => setFav(toggleFavorite(item))}
      aria-pressed={fav}
      className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        fav
          ? 'border-accent bg-accent-soft text-accent-dark'
          : 'border-line bg-surface text-ink-soft hover:bg-canvas'
      }`}
    >
      <svg
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill={fav ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="1.8"
      >
        <path
          d="M12 20s-7-4.35-9.5-8.5C1 8 3 4.5 6.5 4.5 9 4.5 12 7 12 7s3-2.5 5.5-2.5C21 4.5 23 8 21.5 11.5 19 15.65 12 20 12 20Z"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {fav ? 'お気に入り済み' : 'お気に入りに追加'}
    </button>
  );
}
