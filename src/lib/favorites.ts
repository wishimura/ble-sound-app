'use client';

/**
 * Favorites are stored client-side only (LocalStorage), per the MVP spec.
 * Enough display data is denormalized into each entry so the favorites page
 * can render without any network call.
 */
export interface FavoriteItem {
  museumId: string;
  /** URL slug, added so favorites can deep-link to /[slug]/e/...
   *  Optional for backward compatibility with entries saved before slugs. */
  museumSlug?: string;
  museumName: string;
  exhibitId: string;
  exhibitNumber: string;
  title: string;
}

const KEY = 'ag_favorites_v1';
const EVENT = 'ag-favorites-changed';

function read(): FavoriteItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (v): v is FavoriteItem =>
        !!v && typeof v === 'object' && typeof (v as FavoriteItem).exhibitId === 'string',
    );
  } catch {
    return [];
  }
}

function write(items: FavoriteItem[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event(EVENT));
}

export function getFavorites(): FavoriteItem[] {
  return read();
}

export function isFavorite(exhibitId: string): boolean {
  return read().some((f) => f.exhibitId === exhibitId);
}

export function toggleFavorite(item: FavoriteItem): boolean {
  const items = read();
  const exists = items.some((f) => f.exhibitId === item.exhibitId);
  if (exists) {
    write(items.filter((f) => f.exhibitId !== item.exhibitId));
    return false;
  }
  write([item, ...items]);
  return true;
}

export function removeFavorite(exhibitId: string): void {
  write(read().filter((f) => f.exhibitId !== exhibitId));
}

export function subscribeFavorites(listener: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener(EVENT, listener);
  window.addEventListener('storage', listener);
  return () => {
    window.removeEventListener(EVENT, listener);
    window.removeEventListener('storage', listener);
  };
}
