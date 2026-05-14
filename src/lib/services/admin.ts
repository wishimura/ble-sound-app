import { notFound } from '@/lib/errors';
import { rankPopularExhibits, summarizeExhibits } from '@/lib/analytics';
import type { Repository } from '@/lib/repository/types';
import { assertExhibitOwnership } from '@/lib/tenant';
import type { ExhibitInputValues, MuseumInputValues } from '@/lib/validation';

/**
 * Museum-admin flows. Every function is scoped to `session.museumId`; the
 * tenant guard (`assertExhibitOwnership`) ensures one museum can never read
 * or mutate another museum's exhibits.
 */
export interface AdminSession {
  museumId: string;
}

export async function getOwnMuseum(repo: Repository, session: AdminSession) {
  const museum = await repo.getMuseum(session.museumId);
  if (!museum) throw notFound('施設が見つかりません');
  return museum;
}

export async function updateOwnMuseum(
  repo: Repository,
  session: AdminSession,
  values: MuseumInputValues,
) {
  await getOwnMuseum(repo, session); // existence check
  return repo.updateMuseum(session.museumId, values);
}

export function listAdminExhibits(repo: Repository, session: AdminSession) {
  return repo.listExhibits(session.museumId);
}

export async function getAdminExhibit(
  repo: Repository,
  session: AdminSession,
  exhibitId: string,
) {
  const exhibit = await repo.getExhibitById(exhibitId);
  if (!exhibit) throw notFound('展示が見つかりません');
  assertExhibitOwnership(exhibit, session.museumId);
  return exhibit;
}

export function createAdminExhibit(
  repo: Repository,
  session: AdminSession,
  values: ExhibitInputValues,
) {
  return repo.createExhibit(session.museumId, values);
}

export async function updateAdminExhibit(
  repo: Repository,
  session: AdminSession,
  exhibitId: string,
  values: ExhibitInputValues,
) {
  await getAdminExhibit(repo, session, exhibitId); // ownership guard
  return repo.updateExhibit(exhibitId, values);
}

export async function deleteAdminExhibit(
  repo: Repository,
  session: AdminSession,
  exhibitId: string,
) {
  await getAdminExhibit(repo, session, exhibitId); // ownership guard
  await repo.deleteExhibit(exhibitId);
}

export async function setAdminExhibitPublished(
  repo: Repository,
  session: AdminSession,
  exhibitId: string,
  isPublished: boolean,
) {
  const exhibit = await getAdminExhibit(repo, session, exhibitId); // ownership guard
  return repo.updateExhibit(exhibitId, {
    exhibitNumber: exhibit.exhibitNumber,
    titleJa: exhibit.titleJa,
    titleEn: exhibit.titleEn,
    descriptionJa: exhibit.descriptionJa,
    descriptionEn: exhibit.descriptionEn,
    audioUrlJa: exhibit.audioUrlJa,
    audioUrlEn: exhibit.audioUrlEn,
    imageUrl: exhibit.imageUrl,
    isPublished,
  });
}

export async function getAdminDashboard(repo: Repository, session: AdminSession) {
  const [museum, exhibits] = await Promise.all([
    getOwnMuseum(repo, session),
    repo.listExhibits(session.museumId),
  ]);
  return {
    museum,
    stats: summarizeExhibits(exhibits),
    topExhibits: rankPopularExhibits(exhibits, 5),
  };
}
