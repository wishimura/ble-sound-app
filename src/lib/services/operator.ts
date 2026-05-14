import { conflict, notFound } from '@/lib/errors';
import { rankPopularExhibits, summarizeExhibits } from '@/lib/analytics';
import { hashPassword } from '@/lib/auth/password';
import type { MuseumType, Repository } from '@/lib/repository/types';
import type { MuseumInputValues } from '@/lib/validation';

/** Service-operator flows. The operator can see and manage every museum. */

export function listMuseumsForOperator(repo: Repository) {
  return repo.listAllMuseums();
}

export function createMuseumByOperator(repo: Repository, values: MuseumInputValues) {
  return repo.createMuseum({ ...values, isActive: true });
}

export async function setMuseumActive(
  repo: Repository,
  museumId: string,
  isActive: boolean,
) {
  const museum = await repo.getMuseum(museumId);
  if (!museum) throw notFound('施設が見つかりません');
  await repo.setMuseumActive(museumId, isActive);
}

export async function listMuseumAdmins(repo: Repository) {
  const [users, museums] = await Promise.all([repo.listUsers(), repo.listAllMuseums()]);
  const nameById = new Map(museums.map((m) => [m.id, m.name]));
  return users.map((u) => ({
    id: u.id,
    email: u.email,
    role: u.role,
    museumId: u.museumId,
    museumName: u.museumId ? (nameById.get(u.museumId) ?? '(不明)') : null,
    createdAt: u.createdAt,
  }));
}

/** Issues a new museum-admin account bound to a single museum. */
export async function createMuseumAdmin(
  repo: Repository,
  input: { email: string; password: string; museumId: string },
) {
  const museum = await repo.getMuseum(input.museumId);
  if (!museum) throw notFound('施設が見つかりません');
  const existing = await repo.getUserByEmail(input.email);
  if (existing) throw conflict('このメールアドレスは既に登録されています');
  const passwordHash = await hashPassword(input.password);
  return repo.createUser({
    museumId: input.museumId,
    email: input.email,
    passwordHash,
    role: 'museum_admin',
  });
}

export async function getGlobalAnalytics(repo: Repository) {
  const [museums, exhibits] = await Promise.all([
    repo.listAllMuseums(),
    repo.listAllExhibits(),
  ]);
  const nameById = new Map(museums.map((m) => [m.id, m.name]));
  return {
    museumCount: museums.length,
    activeMuseumCount: museums.filter((m) => m.isActive).length,
    stats: summarizeExhibits(exhibits),
    topExhibits: rankPopularExhibits(exhibits, 10).map((e) => ({
      ...e,
      museumName: nameById.get(e.museumId) ?? '(不明)',
    })),
  };
}

export const MUSEUM_TYPES: MuseumType[] = ['museum', 'aquarium', 'zoo', 'other'];
