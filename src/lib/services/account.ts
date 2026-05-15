import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { notFound, unauthorized, validationError } from '@/lib/errors';
import type { Repository } from '@/lib/repository/types';

/**
 * Changes the logged-in user's password. Returns the updated user so the
 * caller can re-issue a session cookie with the refreshed
 * `mustChangePassword` flag.
 */
export async function changeOwnPassword(
  repo: Repository,
  userId: string,
  currentPassword: string,
  newPassword: string,
) {
  const user = await repo.getUserById(userId);
  if (!user) throw notFound('アカウントが見つかりません');

  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw unauthorized('現在のパスワードが正しくありません');

  if (newPassword === currentPassword) {
    throw validationError('現在のパスワードと異なるものを設定してください');
  }

  const hash = await hashPassword(newPassword);
  await repo.updatePassword(userId, hash, false);
  return { ...user, passwordHash: hash, mustChangePassword: false };
}
