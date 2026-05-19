import { describe, it, expect } from 'vitest';
import { MemoryRepository } from '@/lib/repository/memory';
import { isAppError } from '@/lib/errors';
import {
  createMuseumAdmin,
  createMuseumByOperator,
  getGlobalAnalytics,
  listMuseumsForOperator,
  setMuseumActive,
} from '@/lib/services/operator';
import {
  getMuseumForVisitor,
  findExhibitByNumber,
  listMuseumsForVisitor,
  recordExhibitPlay,
} from '@/lib/services/visitor';
import {
  createAdminExhibit,
  getAdminExhibit,
  listAdminExhibits,
  setAdminExhibitPublished,
  updateAdminExhibit,
} from '@/lib/services/admin';
import { authenticate } from '@/lib/services/auth';
import { exhibitInputSchema } from '@/lib/validation';

const PASSWORD = 'demo-password-123';

function exhibitInput(overrides: Record<string, unknown>) {
  return exhibitInputSchema.parse({
    exhibitNumber: '1',
    titleJa: 'タイトル',
    titleEn: '',
    descriptionJa: '解説',
    descriptionEn: '',
    audioUrlJa: 'https://example.com/audio.mp3',
    audioUrlEn: '',
    imageUrl: '',
    isPublished: 'on',
    ...overrides,
  });
}

/**
 * End-to-end scenario test covering the 8 required main flows:
 *  1. visitor selects a facility       5. museum admin logs in
 *  2. visitor enters a number          6. museum admin adds an exhibit
 *  3. exhibit is displayed             7. museum admin publishes an exhibit
 *  4. exhibit audio is played          8. cross-tenant access is denied
 */
describe('main scenario (integration)', () => {
  it('runs the full visitor + admin + operator flow', async () => {
    const repo = new MemoryRepository();

    // --- operator sets up two museums + their admins -----------------------
    const artMuseum = await createMuseumByOperator(repo, {
      slug: 'minato-art',
      name: '湊町近代美術館',
      description: 'アート',
      type: 'museum',
      logoUrl: null,
    });
    const aquarium = await createMuseumByOperator(repo, {
      slug: 'uminoiro',
      name: 'うみのいろ水族館',
      description: 'アクアリウム',
      type: 'aquarium',
      logoUrl: null,
    });

    const artIssued = await createMuseumAdmin(repo, {
      email: 'art-admin@example.com',
      password: PASSWORD,
      museumId: artMuseum.id,
    });
    const aquaIssued = await createMuseumAdmin(repo, {
      email: 'aqua-admin@example.com',
      password: PASSWORD,
      museumId: aquarium.id,
    });
    expect(artIssued.initialPassword).toBe(PASSWORD);
    expect(artIssued.user.mustChangePassword).toBe(true);
    expect(aquaIssued.user.mustChangePassword).toBe(true);

    const sessionArt = { museumId: artMuseum.id };
    const sessionAqua = { museumId: aquarium.id };

    // --- flow 6: museum admin adds exhibits --------------------------------
    const published = await createAdminExhibit(
      repo,
      sessionArt,
      exhibitInput({ exhibitNumber: '5', titleJa: '朝の港', isPublished: 'on' }),
    );
    const draft = await createAdminExhibit(
      repo,
      sessionArt,
      exhibitInput({ exhibitNumber: '6', titleJa: '準備中', isPublished: null }),
    );

    // --- flow 1: visitor selects a facility --------------------------------
    const visitorMuseums = await listMuseumsForVisitor(repo);
    expect(visitorMuseums.map((m) => m.id).sort()).toEqual(
      [artMuseum.id, aquarium.id].sort(),
    );
    const chosen = await getMuseumForVisitor(repo, artMuseum.id);
    expect(chosen.name).toBe('湊町近代美術館');

    // --- flow 2 + 3: visitor enters a number, exhibit is displayed ---------
    const found = await findExhibitByNumber(repo, artMuseum.id, '5');
    expect(found?.id).toBe(published.id);

    // unpublished exhibits must not be visible to visitors
    expect(await findExhibitByNumber(repo, artMuseum.id, '6')).toBeNull();
    // unknown numbers return null (handled with a friendly message in the UI)
    expect(await findExhibitByNumber(repo, artMuseum.id, '404')).toBeNull();

    // --- flow 4: visitor plays the audio (play count increments) -----------
    await recordExhibitPlay(repo, published.id);
    await recordExhibitPlay(repo, published.id);
    expect((await repo.getExhibitById(published.id))?.playCount).toBe(2);

    // play count cannot be inflated on an unpublished exhibit
    await expect(recordExhibitPlay(repo, draft.id)).rejects.toThrow();

    // --- flow 5: museum admin logs in --------------------------------------
    const loggedIn = await authenticate(
      repo,
      'art-admin@example.com',
      PASSWORD,
      'museum_admin',
    );
    expect(loggedIn.museumId).toBe(artMuseum.id);
    await expect(
      authenticate(repo, 'art-admin@example.com', 'wrong-password', 'museum_admin'),
    ).rejects.toThrow();

    // --- flow 7: museum admin publishes an exhibit -------------------------
    await setAdminExhibitPublished(repo, sessionArt, draft.id, true);
    expect(await findExhibitByNumber(repo, artMuseum.id, '6')).not.toBeNull();

    // --- flow 8: cross-tenant access is denied -----------------------------
    // The aquarium admin owns its own exhibit...
    const aquaExhibit = await createAdminExhibit(
      repo,
      sessionAqua,
      exhibitInput({ exhibitNumber: '5', titleJa: 'クラゲ' }),
    );
    // ...and the art-museum admin must NOT be able to read or mutate it.
    await expect(
      getAdminExhibit(repo, sessionArt, aquaExhibit.id),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });
    await expect(
      updateAdminExhibit(
        repo,
        sessionArt,
        aquaExhibit.id,
        exhibitInput({ exhibitNumber: '5', titleJa: '乗っ取り' }),
      ),
    ).rejects.toMatchObject({ code: 'FORBIDDEN' });

    // each admin only sees its own museum's exhibits
    const artList = await listAdminExhibits(repo, sessionArt);
    expect(artList.every((e) => e.museumId === artMuseum.id)).toBe(true);
    expect(artList).toHaveLength(2);

    // --- operator: stopping a museum hides it from visitors ----------------
    await setMuseumActive(repo, aquarium.id, false);
    const afterStop = await listMuseumsForVisitor(repo);
    expect(afterStop.map((m) => m.id)).toEqual([artMuseum.id]);
    await expect(getMuseumForVisitor(repo, aquarium.id)).rejects.toThrow();

    // --- operator: global analytics ----------------------------------------
    const analytics = await getGlobalAnalytics(repo);
    expect(analytics.museumCount).toBe(2);
    expect(analytics.activeMuseumCount).toBe(1);
    expect(analytics.topExhibits[0]?.id).toBe(published.id);
    expect(analytics.topExhibits[0]?.museumName).toBe('湊町近代美術館');
  });

  it('rejects duplicate admin emails and duplicate exhibit numbers per museum', async () => {
    const repo = new MemoryRepository();
    const museum = await createMuseumByOperator(repo, {
      slug: 'test-m',
      name: 'M',
      description: null,
      type: 'museum',
      logoUrl: null,
    });
    await createMuseumAdmin(repo, {
      email: 'dup@example.com',
      museumId: museum.id,
    });
    await expect(
      createMuseumAdmin(repo, {
        email: 'dup@example.com',
        museumId: museum.id,
      }),
    ).rejects.toMatchObject({ code: 'CONFLICT' });

    const session = { museumId: museum.id };
    await createAdminExhibit(repo, session, exhibitInput({ exhibitNumber: '1' }));
    await expect(
      createAdminExhibit(repo, session, exhibitInput({ exhibitNumber: '1' })),
    ).rejects.toThrow(/unique/i);
  });

  it('operator can list every museum including stopped ones', async () => {
    const repo = new MemoryRepository();
    const a = await createMuseumByOperator(repo, {
      slug: 'a',
      name: 'A',
      description: null,
      type: 'museum',
      logoUrl: null,
    });
    await createMuseumByOperator(repo, {
      slug: 'b',
      name: 'B',
      description: null,
      type: 'zoo',
      logoUrl: null,
    });
    await setMuseumActive(repo, a.id, false);
    const all = await listMuseumsForOperator(repo);
    expect(all).toHaveLength(2);
  });
});
