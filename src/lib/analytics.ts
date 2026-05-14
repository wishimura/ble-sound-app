import type { Exhibit } from './repository/types';

export interface ExhibitStats {
  total: number;
  published: number;
  unpublished: number;
  totalPlays: number;
}

export function summarizeExhibits(exhibits: Exhibit[]): ExhibitStats {
  return exhibits.reduce<ExhibitStats>(
    (acc, e) => {
      acc.total += 1;
      acc.totalPlays += e.playCount;
      if (e.isPublished) acc.published += 1;
      else acc.unpublished += 1;
      return acc;
    },
    { total: 0, published: 0, unpublished: 0, totalPlays: 0 },
  );
}

/** Most-played exhibits first. Ties broken by title for stable ordering. */
export function rankPopularExhibits(exhibits: Exhibit[], limit = 10): Exhibit[] {
  return [...exhibits]
    .sort((a, b) => b.playCount - a.playCount || a.titleJa.localeCompare(b.titleJa))
    .slice(0, limit);
}
