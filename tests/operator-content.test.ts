import { describe, it, expect } from 'vitest';
import { MemoryRepository } from '@/lib/repository/memory';
import { isAppError } from '@/lib/errors';
import { createMuseumByOperator } from '@/lib/services/operator';
import {
  createExhibitForOperator,
  deleteExhibitForOperator,
  getExhibitForOperator,
  importExhibitsCsv,
  listExhibitsForOperator,
  setExhibitPublishedForOperator,
  updateExhibitForOperator,
} from '@/lib/services/operator-content';
import { listPublishedExhibitsForVisitor } from '@/lib/services/visitor';
import { exhibitInputSchema } from '@/lib/validation';

function input(overrides: Record<string, unknown> = {}) {
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

let slugCounter = 0;
async function museum(repo: MemoryRepository, name = 'M') {
  slugCounter += 1;
  return createMuseumByOperator(repo, {
    slug: `museum-${slugCounter}`,
    name,
    description: null,
    type: 'museum',
    logoUrl: null,
  });
}

describe('operator content management', () => {
  it('CRUD: operator manages any museum exhibits', async () => {
    const repo = new MemoryRepository();
    const a = await museum(repo, 'A');
    const b = await museum(repo, 'B');

    const e1 = await createExhibitForOperator(repo, a.id, input({ exhibitNumber: '1' }));
    await createExhibitForOperator(repo, b.id, input({ exhibitNumber: '1', titleJa: 'B-1' }));

    const aList = await listExhibitsForOperator(repo, a.id);
    expect(aList).toHaveLength(1);

    // get / update / delete are correctly scoped to the museum
    expect((await getExhibitForOperator(repo, a.id, e1.id)).titleJa).toBe('タイトル');
    await updateExhibitForOperator(
      repo,
      a.id,
      e1.id,
      input({ exhibitNumber: '1', titleJa: 'updated' }),
    );
    expect((await getExhibitForOperator(repo, a.id, e1.id)).titleJa).toBe('updated');

    // trying to fetch an exhibit through the wrong museum scope -> NOT_FOUND
    await expect(getExhibitForOperator(repo, b.id, e1.id)).rejects.toMatchObject({
      code: 'NOT_FOUND',
    });

    // publish toggle
    await setExhibitPublishedForOperator(repo, a.id, e1.id, true);
    expect((await getExhibitForOperator(repo, a.id, e1.id)).isPublished).toBe(true);
    await setExhibitPublishedForOperator(repo, a.id, e1.id, false);
    expect((await getExhibitForOperator(repo, a.id, e1.id)).isPublished).toBe(false);

    await deleteExhibitForOperator(repo, a.id, e1.id);
    expect(await listExhibitsForOperator(repo, a.id)).toHaveLength(0);
  });
});

describe('visitor: published exhibit grid', () => {
  it('returns only published exhibits and skips inactive museums', async () => {
    const repo = new MemoryRepository();
    const m = await museum(repo, 'M');
    await createExhibitForOperator(repo, m.id, input({ exhibitNumber: '1', isPublished: 'on' }));
    await createExhibitForOperator(repo, m.id, input({ exhibitNumber: '2', isPublished: '' }));

    const list = await listPublishedExhibitsForVisitor(repo, m.id);
    expect(list.map((e) => e.exhibitNumber)).toEqual(['1']);

    await repo.setMuseumActive(m.id, false);
    const empty = await listPublishedExhibitsForVisitor(repo, m.id);
    expect(empty).toEqual([]);
  });
});

describe('CSV bulk import', () => {
  const header =
    'exhibit_number,title_ja,title_en,description_ja,description_en,narration_ja,narration_en,is_published';

  it('creates new exhibits and updates existing ones in one pass', async () => {
    const repo = new MemoryRepository();
    const m = await museum(repo, 'M');
    // pre-existing exhibit with audio/image set
    await repo.createExhibit(m.id, {
      ...input({ exhibitNumber: '10', titleJa: 'old' }),
      audioUrlJa: 'https://example.com/keep.mp3',
      imageUrl: 'https://example.com/keep.jpg',
    });

    const csv = [
      header,
      '10,新タイトル,New Title,説明,desc,,,true',
      '11,別の作品,Another,,,,,false',
      '12,読み上げ専用,,これは AI 読み上げ,,これを読みます,Read this,true',
    ].join('\n');

    const result = await importExhibitsCsv(repo, m.id, csv);

    expect(result.total).toBe(3);
    expect(result.created).toBe(2);
    expect(result.updated).toBe(1);
    expect(result.errors).toBe(0);

    const all = await listExhibitsForOperator(repo, m.id);
    expect(all).toHaveLength(3);

    // update preserved the existing audio/image URLs
    const updated = all.find((e) => e.exhibitNumber === '10')!;
    expect(updated.titleJa).toBe('新タイトル');
    expect(updated.audioUrlJa).toBe('https://example.com/keep.mp3');
    expect(updated.imageUrl).toBe('https://example.com/keep.jpg');
    expect(updated.isPublished).toBe(true);

    // narration-only row is parsed correctly
    const narr = all.find((e) => e.exhibitNumber === '12')!;
    expect(narr.narrationJa).toContain('読みます');
    expect(narr.audioUrlJa).toBeNull();
  });

  it('reports per-row errors without aborting the import', async () => {
    const repo = new MemoryRepository();
    const m = await museum(repo, 'M');
    const csv = [
      header,
      '1,正常,,desc,,,,true',
      ',タイトル欠落,,,,,,true', // empty exhibit number -> error
      '3,,,,,,,true', // empty title_ja -> error
      '4,正常2,,,,,,false',
    ].join('\n');

    const result = await importExhibitsCsv(repo, m.id, csv);
    expect(result.total).toBe(4);
    expect(result.created).toBe(2);
    expect(result.errors).toBe(2);

    const errorRows = result.rows.filter((r) => r.status === 'error');
    expect(errorRows).toHaveLength(2);
    expect(errorRows[0].message).toMatch(/展示番号/);
    expect(errorRows[1].message).toMatch(/タイトル/);
  });

  it('rejects CSV missing required columns', async () => {
    const repo = new MemoryRepository();
    const m = await museum(repo, 'M');
    const csv = 'exhibit_number,title_ja\n1,テスト';
    try {
      await importExhibitsCsv(repo, m.id, csv);
      throw new Error('expected throw');
    } catch (e) {
      expect(isAppError(e) && e.code).toBe('VALIDATION');
    }
  });
});
