import Papa from 'papaparse';
import { notFound, validationError } from '@/lib/errors';
import type { Repository } from '@/lib/repository/types';
import {
  exhibitInputSchema,
  firstZodMessage,
  type ExhibitInputValues,
} from '@/lib/validation';

/**
 * Operator-side exhibit management. The operator can manage every museum's
 * content (multi-tenant guard does NOT apply here, but the operator role is
 * enforced at the page / action layer via `requireOperator`).
 */

async function assertExhibitInMuseum(
  repo: Repository,
  museumId: string,
  exhibitId: string,
) {
  const exhibit = await repo.getExhibitById(exhibitId);
  if (!exhibit || exhibit.museumId !== museumId) {
    throw notFound('展示が見つかりません');
  }
  return exhibit;
}

export async function getMuseumForOperator(repo: Repository, museumId: string) {
  const museum = await repo.getMuseum(museumId);
  if (!museum) throw notFound('施設が見つかりません');
  return museum;
}

export function listExhibitsForOperator(repo: Repository, museumId: string) {
  return repo.listExhibits(museumId);
}

export async function getExhibitForOperator(
  repo: Repository,
  museumId: string,
  exhibitId: string,
) {
  return assertExhibitInMuseum(repo, museumId, exhibitId);
}

export function createExhibitForOperator(
  repo: Repository,
  museumId: string,
  values: ExhibitInputValues,
) {
  return repo.createExhibit(museumId, values);
}

export async function updateExhibitForOperator(
  repo: Repository,
  museumId: string,
  exhibitId: string,
  values: ExhibitInputValues,
) {
  await assertExhibitInMuseum(repo, museumId, exhibitId);
  return repo.updateExhibit(exhibitId, values);
}

export async function deleteExhibitForOperator(
  repo: Repository,
  museumId: string,
  exhibitId: string,
) {
  await assertExhibitInMuseum(repo, museumId, exhibitId);
  await repo.deleteExhibit(exhibitId);
}

export async function setExhibitPublishedForOperator(
  repo: Repository,
  museumId: string,
  exhibitId: string,
  isPublished: boolean,
) {
  const exhibit = await assertExhibitInMuseum(repo, museumId, exhibitId);
  return repo.updateExhibit(exhibitId, {
    exhibitNumber: exhibit.exhibitNumber,
    titleJa: exhibit.titleJa,
    titleEn: exhibit.titleEn,
    descriptionJa: exhibit.descriptionJa,
    descriptionEn: exhibit.descriptionEn,
    narrationJa: exhibit.narrationJa,
    narrationEn: exhibit.narrationEn,
    audioUrlJa: exhibit.audioUrlJa,
    audioUrlEn: exhibit.audioUrlEn,
    imageUrl: exhibit.imageUrl,
    isPublished,
  });
}

// ---------------------------------------------------------------- CSV import

export const CSV_HEADERS = [
  'exhibit_number',
  'title_ja',
  'title_en',
  'description_ja',
  'description_en',
  'narration_ja',
  'narration_en',
  'is_published',
] as const;

export const CSV_TEMPLATE =
  CSV_HEADERS.join(',') +
  '\n' +
  [
    '1,朝の港,Harbor at Dawn,夜明けの港を描いた油彩画。,An oil painting of a harbor at dawn.,,,true',
    '2,赤い椅子,Red Chair,室内の静物画。,A still life.,これは赤い椅子のある室内です。,This is an interior with a red chair.,true',
    '3,（準備中）,,この展示は準備中です。,,,,false',
  ].join('\n') +
  '\n';

export interface CsvImportRowResult {
  row: number;
  status: 'created' | 'updated' | 'error';
  message?: string;
  exhibitNumber?: string;
}

export interface CsvImportResult {
  total: number;
  created: number;
  updated: number;
  errors: number;
  rows: CsvImportRowResult[];
}

/**
 * Bulk-imports exhibits from a CSV body. Audio/image URLs are preserved
 * when updating an existing exhibit (the CSV does not carry asset URLs).
 * Duplicate exhibit numbers map to "update".
 */
export async function importExhibitsCsv(
  repo: Repository,
  museumId: string,
  csvText: string,
): Promise<CsvImportResult> {
  await getMuseumForOperator(repo, museumId);

  const parsed = Papa.parse<Record<string, string>>(csvText.trim(), {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (h) => h.trim(),
  });

  if (parsed.errors.length > 0) {
    throw validationError(`CSV の解析に失敗しました: ${parsed.errors[0].message}`);
  }

  if (parsed.data.length === 0) {
    throw validationError('CSV に行がありません');
  }

  const missing = CSV_HEADERS.filter((h) => !(parsed.meta.fields ?? []).includes(h));
  if (missing.length > 0) {
    throw validationError(`必須列が不足しています: ${missing.join(', ')}`);
  }

  const existing = await repo.listExhibits(museumId);
  const byNumber = new Map(existing.map((e) => [e.exhibitNumber, e]));

  const result: CsvImportResult = {
    total: 0,
    created: 0,
    updated: 0,
    errors: 0,
    rows: [],
  };

  for (let i = 0; i < parsed.data.length; i += 1) {
    result.total += 1;
    const row = parsed.data[i] ?? {};
    const lineNumber = i + 2; // +1 for header, +1 for 1-based
    const exhibitNumber = (row.exhibit_number ?? '').trim();
    try {
      const validated = exhibitInputSchema.safeParse({
        exhibitNumber,
        titleJa: row.title_ja,
        titleEn: row.title_en ?? '',
        descriptionJa: row.description_ja ?? '',
        descriptionEn: row.description_en ?? '',
        narrationJa: row.narration_ja ?? '',
        narrationEn: row.narration_en ?? '',
        audioUrlJa: '',
        audioUrlEn: '',
        imageUrl: '',
        isPublished: (row.is_published ?? '').toString().trim().toLowerCase(),
      });
      if (!validated.success) {
        throw new Error(firstZodMessage(validated.error));
      }

      const previous = byNumber.get(validated.data.exhibitNumber);
      if (previous) {
        // Preserve existing audio / image URLs that aren't in the CSV.
        await repo.updateExhibit(previous.id, {
          ...validated.data,
          audioUrlJa: previous.audioUrlJa,
          audioUrlEn: previous.audioUrlEn,
          imageUrl: previous.imageUrl,
        });
        result.updated += 1;
        result.rows.push({
          row: lineNumber,
          status: 'updated',
          exhibitNumber: validated.data.exhibitNumber,
        });
      } else {
        const created = await repo.createExhibit(museumId, validated.data);
        byNumber.set(created.exhibitNumber, created);
        result.created += 1;
        result.rows.push({
          row: lineNumber,
          status: 'created',
          exhibitNumber: validated.data.exhibitNumber,
        });
      }
    } catch (e) {
      result.errors += 1;
      result.rows.push({
        row: lineNumber,
        status: 'error',
        exhibitNumber: exhibitNumber || undefined,
        message: e instanceof Error ? e.message : '不明なエラー',
      });
    }
  }

  return result;
}
