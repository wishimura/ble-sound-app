import { describe, it, expect } from 'vitest';
import { MemoryRepository } from '@/lib/repository/memory';
import { hashPassword } from '@/lib/auth/password';
import { changeOwnPassword } from '@/lib/services/account';
import { authenticate } from '@/lib/services/auth';
import {
  createMuseumAdmin,
  createMuseumByOperator,
  deleteMuseumAdmin,
  setMuseumActive,
} from '@/lib/services/operator';
import {
  createExhibitForOperator,
  importExhibitsCsv,
  listExhibitsForOperator,
} from '@/lib/services/operator-content';
import {
  findExhibitByNumber,
  getMuseumBySlugForVisitor,
  listPublishedExhibitsForVisitor,
  recordExhibitPlay,
} from '@/lib/services/visitor';
import { exhibitInputSchema } from '@/lib/validation';

function exhibitInput(overrides: Record<string, unknown> = {}) {
  return exhibitInputSchema.parse({
    exhibitNumber: '1',
    titleJa: 'タイトル',
    titleEn: '',
    descriptionJa: '',
    descriptionEn: '',
    narrationJa: '',
    narrationEn: '',
    audioUrlJa: '',
    audioUrlEn: '',
    imageUrl: '',
    isPublished: 'on',
    ...overrides,
  });
}

/**
 * End-to-end exercise of the post-slug / vendor-onboarding flow that mirrors
 * what the actual web UI does. If any of these break, a real user will hit
 * the breakage on the deployed site.
 */
describe('end-to-end workflow (post-slug / vendor onboarding)', () => {
  it('runs operator -> vendor -> visitor with QR, CSV, delete', async () => {
    const repo = new MemoryRepository();

    // ---- operator: bootstrap operator account ----------------------------
    await repo.createUser({
      museumId: null,
      email: 'operator@example.com',
      passwordHash: await hashPassword('op-secret'),
      role: 'operator',
      mustChangePassword: false,
    });
    const operatorUser = await authenticate(
      repo,
      'operator@example.com',
      'op-secret',
      'operator',
    );
    expect(operatorUser.role).toBe('operator');

    // ---- operator: create two museums with slugs -------------------------
    const art = await createMuseumByOperator(repo, {
      slug: 'minato-art',
      name: '湊町近代美術館',
      description: 'アート',
      type: 'museum',
      logoUrl: null,
    });
    const aqua = await createMuseumByOperator(repo, {
      slug: 'uminoiro',
      name: 'うみのいろ水族館',
      description: '水',
      type: 'aquarium',
      logoUrl: null,
    });

    // duplicate slug at create -> rejected
    await expect(
      createMuseumByOperator(repo, {
        slug: 'minato-art',
        name: 'dup',
        description: null,
        type: 'museum',
        logoUrl: null,
      }),
    ).rejects.toThrow(/slug/i);

    // ---- operator: bulk-import exhibits via CSV --------------------------
    const csv = [
      'exhibit_number,title_ja,title_en,description_ja,description_en,narration_ja,narration_en,is_published',
      '1,朝の港,Harbor at Dawn,夜明けの油彩画,An oil painting,,,true',
      '2,赤い椅子,Red Chair,室内の静物画,A still life,,,true',
      '3,（準備中）,,これから準備します,,,,false',
    ].join('\n');
    const importResult = await importExhibitsCsv(repo, art.id, csv);
    expect(importResult.total).toBe(3);
    expect(importResult.created).toBe(3);
    expect(importResult.errors).toBe(0);

    // attach a media URL via the operator edit path (simulates the form save)
    const list = await listExhibitsForOperator(repo, art.id);
    const exhibit1 = list.find((e) => e.exhibitNumber === '1')!;
    await repo.updateExhibit(exhibit1.id, {
      exhibitNumber: '1',
      titleJa: '朝の港',
      titleEn: 'Harbor at Dawn',
      descriptionJa: '夜明けの油彩画',
      descriptionEn: 'An oil painting',
      narrationJa: null,
      narrationEn: null,
      audioUrlJa: '/samples/guide-ja.wav',
      audioUrlEn: null,
      imageUrl: '/samples/art-1.svg',
      isPublished: true,
    });

    // re-import the same CSV: existing rows update, audio/image preserved
    const reimport = await importExhibitsCsv(repo, art.id, csv);
    expect(reimport.updated).toBe(3);
    expect(reimport.created).toBe(0);
    const after = (await listExhibitsForOperator(repo, art.id)).find(
      (e) => e.exhibitNumber === '1',
    )!;
    expect(after.audioUrlJa).toBe('/samples/guide-ja.wav');
    expect(after.imageUrl).toBe('/samples/art-1.svg');

    // ---- operator: issue a vendor (museum_admin) for the art museum -----
    const issued = await createMuseumAdmin(repo, {
      email: 'art-admin@example.com',
      museumId: art.id,
    });
    expect(issued.user.mustChangePassword).toBe(true);
    expect(issued.initialPassword.length).toBeGreaterThanOrEqual(10);

    // ---- vendor: first login carries the must-change flag ---------------
    const firstLogin = await authenticate(
      repo,
      'art-admin@example.com',
      issued.initialPassword,
      'museum_admin',
    );
    expect(firstLogin.mustChangePassword).toBe(true);

    // ---- vendor: change password; flag clears + old password rejected ---
    await changeOwnPassword(repo, firstLogin.id, issued.initialPassword, 'new-pass-12345');
    await expect(
      authenticate(repo, 'art-admin@example.com', issued.initialPassword, 'museum_admin'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    const secondLogin = await authenticate(
      repo,
      'art-admin@example.com',
      'new-pass-12345',
      'museum_admin',
    );
    expect(secondLogin.mustChangePassword).toBe(false);

    // ---- visitor: open the museum URL via slug --------------------------
    const visited = await getMuseumBySlugForVisitor(repo, 'minato-art');
    expect(visited.id).toBe(art.id);
    const exhibits = await listPublishedExhibitsForVisitor(repo, visited.id);
    expect(exhibits.map((e) => e.exhibitNumber).sort()).toEqual(['1', '2']);

    // ---- visitor: detail + play count -----------------------------------
    const found = await findExhibitByNumber(repo, visited.id, '1');
    expect(found?.titleJa).toBe('朝の港');
    await recordExhibitPlay(repo, found!.id);
    expect((await repo.getExhibitById(found!.id))!.playCount).toBe(1);

    // unpublished exhibit is invisible to visitors
    expect(await findExhibitByNumber(repo, visited.id, '3')).toBeNull();
    // and play count cannot be inflated for an unpublished exhibit
    const draft = (await listExhibitsForOperator(repo, art.id)).find(
      (e) => e.exhibitNumber === '3',
    )!;
    await expect(recordExhibitPlay(repo, draft.id)).rejects.toThrow();

    // ---- operator: stopping a museum hides it from visitors -------------
    await setMuseumActive(repo, aqua.id, false);
    await expect(getMuseumBySlugForVisitor(repo, 'uminoiro')).rejects.toThrow();

    // ---- operator: delete the vendor account; old credentials fail ------
    await deleteMuseumAdmin(repo, secondLogin.id);
    await expect(
      authenticate(repo, 'art-admin@example.com', 'new-pass-12345', 'museum_admin'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(await repo.getUserById(secondLogin.id)).toBeNull();

    // ---- operator: cannot delete themselves -----------------------------
    await expect(deleteMuseumAdmin(repo, operatorUser.id)).rejects.toMatchObject({
      code: 'FORBIDDEN',
    });
    expect(await repo.getUserById(operatorUser.id)).not.toBeNull();
  });

  it('CSV import keeps the visitor grid in sync', async () => {
    const repo = new MemoryRepository();
    const m = await createMuseumByOperator(repo, {
      slug: 'csv-demo',
      name: 'CSV',
      description: null,
      type: 'museum',
      logoUrl: null,
    });

    // Existing manually created exhibit
    await createExhibitForOperator(
      repo,
      m.id,
      exhibitInput({ exhibitNumber: '1', titleJa: 'A', isPublished: 'on' }),
    );

    // CSV brings in 2 new published + 1 unpublished + 1 update
    const csv = [
      'exhibit_number,title_ja,title_en,description_ja,description_en,narration_ja,narration_en,is_published',
      '1,Aリネーム,,,,,,true',
      '2,B,,,,,,true',
      '3,C,,,,,,true',
      '4,D未公開,,,,,,false',
    ].join('\n');
    await importExhibitsCsv(repo, m.id, csv);

    const published = await listPublishedExhibitsForVisitor(repo, m.id);
    expect(published.map((e) => e.exhibitNumber).sort()).toEqual(['1', '2', '3']);
    expect(published.find((e) => e.exhibitNumber === '1')!.titleJa).toBe('Aリネーム');
  });
});
