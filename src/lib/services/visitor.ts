import { notFound } from '@/lib/errors';
import type { Repository } from '@/lib/repository/types';
import { exhibitNumberSchema } from '@/lib/validation';

/** Visitor-facing read flows. No authentication required. */

export function listMuseumsForVisitor(repo: Repository) {
  return repo.listActiveMuseums();
}

export async function getMuseumForVisitor(repo: Repository, museumId: string) {
  const museum = await repo.getMuseum(museumId);
  if (!museum || !museum.isActive) throw notFound('施設が見つかりません');
  return museum;
}

/**
 * Looks up a published exhibit by its (museum-scoped) number.
 * Returns null when nothing matches so the page can show a friendly message.
 */
export async function findExhibitByNumber(
  repo: Repository,
  museumId: string,
  rawNumber: string,
) {
  const parsed = exhibitNumberSchema.safeParse(rawNumber);
  if (!parsed.success) return null;
  const museum = await repo.getMuseum(museumId);
  if (!museum || !museum.isActive) return null;
  return repo.getPublishedExhibit(museumId, parsed.data);
}

/**
 * Records one play. Only counts plays for exhibits that exist and are
 * published, so the public endpoint cannot be used to inflate arbitrary rows.
 */
export async function recordExhibitPlay(repo: Repository, exhibitId: string) {
  const exhibit = await repo.getExhibitById(exhibitId);
  if (!exhibit || !exhibit.isPublished) {
    throw notFound('展示が見つかりません');
  }
  await repo.incrementPlayCount(exhibitId);
}
