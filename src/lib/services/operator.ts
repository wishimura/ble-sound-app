import { conflict, forbidden, notFound } from '@/lib/errors';
import { rankPopularExhibits, summarizeExhibits } from '@/lib/analytics';
import { hashPassword } from '@/lib/auth/password';
import { generateInitialPassword } from '@/lib/auth/initial-password';
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

/**
 * Issues a new vendor (museum-admin) account bound to a single museum.
 *
 * The initial password is auto-generated and returned in plaintext exactly
 * once so the operator can copy it and send it to the vendor out-of-band.
 * The `mustChangePassword` flag is set so the vendor is forced to choose
 * their own password on first login.
 */
export async function createMuseumAdmin(
  repo: Repository,
  input: { email: string; museumId: string; password?: string },
) {
  const museum = await repo.getMuseum(input.museumId);
  if (!museum) throw notFound('施設が見つかりません');
  const existing = await repo.getUserByEmail(input.email);
  if (existing) throw conflict('このメールアドレスは既に登録されています');

  const initialPassword = input.password ?? generateInitialPassword();
  const passwordHash = await hashPassword(initialPassword);
  const user = await repo.createUser({
    museumId: input.museumId,
    email: input.email,
    passwordHash,
    role: 'museum_admin',
    mustChangePassword: true,
  });
  return { user, initialPassword };
}

/**
 * Deletes a vendor (museum_admin) account. Operator accounts are protected
 * because removing them would lock the platform out of itself.
 */
export async function deleteMuseumAdmin(repo: Repository, userId: string) {
  const user = await repo.getUserById(userId);
  if (!user) throw notFound('アカウントが見つかりません');
  if (user.role !== 'museum_admin') {
    throw forbidden('運営アカウントは削除できません');
  }
  await repo.deleteUser(userId);
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
