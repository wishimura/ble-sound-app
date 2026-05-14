import { unauthorized } from '@/lib/errors';
import { verifyPassword } from '@/lib/auth/password';
import type { Repository, UserRole } from '@/lib/repository/types';

/**
 * Verifies credentials and (optionally) that the account has the role the
 * login page expects. Uses a single generic error message so the endpoint
 * does not leak whether an email exists.
 */
export async function authenticate(
  repo: Repository,
  email: string,
  password: string,
  expectedRole?: UserRole,
) {
  const user = await repo.getUserByEmail(email);
  const genericError = unauthorized('メールアドレスまたはパスワードが正しくありません');

  if (!user) {
    // Still run a hash comparison shape to keep timing roughly even.
    await verifyPassword(password, '$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidin');
    throw genericError;
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw genericError;

  if (expectedRole && user.role !== expectedRole) {
    throw genericError;
  }

  return user;
}
