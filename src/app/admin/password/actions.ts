'use server';

import { redirect } from 'next/navigation';
import { getSession, setSessionCookie } from '@/lib/auth/session';
import { isAppError, unauthorized } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import { changeOwnPassword } from '@/lib/services/account';
import { firstZodMessage, passwordChangeSchema } from '@/lib/validation';

export interface PasswordActionState {
  error?: string;
  ok?: boolean;
}

export async function changePasswordAction(
  _prev: PasswordActionState,
  formData: FormData,
): Promise<PasswordActionState> {
  const session = await getSession();
  if (!session) throw unauthorized();

  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword'),
    confirmPassword: formData.get('confirmPassword'),
  });
  if (!parsed.success) {
    return { error: firstZodMessage(parsed.error) };
  }

  try {
    const user = await changeOwnPassword(
      getRepository(),
      session.sub,
      parsed.data.currentPassword,
      parsed.data.newPassword,
    );
    // Re-issue the cookie so the `mustChangePassword` flag is cleared.
    await setSessionCookie({
      sub: user.id,
      role: user.role,
      museumId: user.museumId,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    });
  } catch (e) {
    if (isAppError(e)) return { error: e.message };
    console.error('change password error', e);
    return { error: 'パスワードの変更に失敗しました' };
  }

  redirect(session.role === 'operator' ? '/operator' : '/admin');
}
