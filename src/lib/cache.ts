import 'server-only';
import { unstable_cache } from 'next/cache';
import { cache } from 'react';
import { getRepository } from '@/lib/repository';

/**
 * Cached read helpers.
 *
 * Two layers:
 *  - `unstable_cache(...)` : persists across requests (TTL + tag based).
 *                            Used for visitor pages so QR-scan -> render is
 *                            served from cache without a DB round-trip.
 *  - React `cache(...)`    : dedupes within a single request render. Used by
 *                            admin layouts that look up the museum both in
 *                            the layout (for nav) and in the page (for data).
 *
 * Invalidation: admin / operator write actions call `revalidateTag(...)` with
 * the matching tag below.
 */

export const CACHE_TAGS = {
  museums: 'museums',
  exhibits: 'exhibits',
} as const;

// ---- visitor-side (cross-request cache) ----

export const getMuseumBySlugCached = unstable_cache(
  async (slug: string) => getRepository().getMuseumBySlug(slug),
  ['museum-by-slug'],
  { revalidate: 300, tags: [CACHE_TAGS.museums] },
);

export const getMuseumByIdCached = unstable_cache(
  async (id: string) => getRepository().getMuseum(id),
  ['museum-by-id'],
  { revalidate: 300, tags: [CACHE_TAGS.museums] },
);

export const listPublishedExhibitsCached = unstable_cache(
  async (museumId: string) => getRepository().listPublishedExhibits(museumId),
  ['published-exhibits'],
  { revalidate: 60, tags: [CACHE_TAGS.exhibits] },
);

export const getPublishedExhibitCached = unstable_cache(
  async (museumId: string, exhibitNumber: string) =>
    getRepository().getPublishedExhibit(museumId, exhibitNumber),
  ['published-exhibit'],
  { revalidate: 60, tags: [CACHE_TAGS.exhibits] },
);

// ---- admin-side (per-request dedup) ----

/**
 * Dedupes the museum lookup that the admin (protected) layout makes for its
 * header against the lookup the page makes for its data. Both calls share
 * the result inside a single render pass.
 */
export const getMuseumDedup = cache(async (id: string) =>
  getRepository().getMuseum(id),
);
