import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/services/auth';
import { getRepository } from '@/lib/repository';
import { setSessionCookie } from '@/lib/auth/session';
import { loginSchema } from '@/lib/validation';
import { isAppError } from '@/lib/errors';
import type { UserRole } from '@/lib/repository/types';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエスト形式が不正です' }, { status: 400 });
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? '入力内容を確認してください' },
      { status: 400 },
    );
  }

  const expectedRole = (body as { role?: unknown }).role;
  const role: UserRole | undefined =
    expectedRole === 'museum_admin' || expectedRole === 'operator'
      ? expectedRole
      : undefined;

  try {
    const user = await authenticate(
      getRepository(),
      parsed.data.email,
      parsed.data.password,
      role,
    );
    await setSessionCookie({
      sub: user.id,
      role: user.role,
      museumId: user.museumId,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    });
    // Force vendors with a freshly issued account to change the initial
    // password before they reach any other admin page.
    const redirectTo =
      user.role === 'operator'
        ? '/operator'
        : user.mustChangePassword
          ? '/admin/password'
          : '/admin';
    return NextResponse.json({ role: user.role, redirectTo });
  } catch (e) {
    if (isAppError(e)) {
      return NextResponse.json({ error: e.message }, { status: 401 });
    }
    console.error('login error', e);
    return NextResponse.json({ error: 'ログインに失敗しました' }, { status: 500 });
  }
}
