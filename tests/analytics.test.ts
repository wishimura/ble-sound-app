import { describe, it, expect } from 'vitest';
import { rankPopularExhibits, summarizeExhibits } from '@/lib/analytics';
import { assertExhibitOwnership, canAccessMuseum } from '@/lib/tenant';
import { isAppError } from '@/lib/errors';
import type { Exhibit } from '@/lib/repository/types';

function exhibit(partial: Partial<Exhibit>): Exhibit {
  return {
    id: 'e',
    museumId: 'm1',
    exhibitNumber: '1',
    titleJa: 'タイトル',
    titleEn: null,
    descriptionJa: '',
    descriptionEn: null,
    narrationJa: null,
    narrationEn: null,
    audioUrlJa: null,
    audioUrlEn: null,
    imageUrl: null,
    isPublished: true,
    playCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...partial,
  };
}

describe('summarizeExhibits', () => {
  it('counts totals, published/unpublished and plays', () => {
    const stats = summarizeExhibits([
      exhibit({ id: 'a', isPublished: true, playCount: 10 }),
      exhibit({ id: 'b', isPublished: false, playCount: 5 }),
      exhibit({ id: 'c', isPublished: true, playCount: 2 }),
    ]);
    expect(stats).toEqual({ total: 3, published: 2, unpublished: 1, totalPlays: 17 });
  });
});

describe('rankPopularExhibits', () => {
  it('orders by play count descending and respects the limit', () => {
    const ranked = rankPopularExhibits(
      [
        exhibit({ id: 'a', playCount: 3 }),
        exhibit({ id: 'b', playCount: 30 }),
        exhibit({ id: 'c', playCount: 12 }),
      ],
      2,
    );
    expect(ranked.map((e) => e.id)).toEqual(['b', 'c']);
  });
});

describe('tenant isolation guards', () => {
  it('allows a museum admin to touch its own exhibit', () => {
    expect(() => assertExhibitOwnership({ museumId: 'm1' }, 'm1')).not.toThrow();
  });

  it('blocks a museum admin from another museum exhibit', () => {
    try {
      assertExhibitOwnership({ museumId: 'm2' }, 'm1');
      throw new Error('should have thrown');
    } catch (e) {
      expect(isAppError(e) && e.code).toBe('FORBIDDEN');
    }
  });

  it('canAccessMuseum: operator anywhere, admin only own museum', () => {
    expect(canAccessMuseum({ role: 'operator', museumId: null }, 'any')).toBe(true);
    expect(canAccessMuseum({ role: 'museum_admin', museumId: 'm1' }, 'm1')).toBe(true);
    expect(canAccessMuseum({ role: 'museum_admin', museumId: 'm1' }, 'm2')).toBe(false);
  });
});
