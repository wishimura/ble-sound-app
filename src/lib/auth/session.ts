import 'server-only';
import { cookies } from 'next/headers';
import { forbidden, unauthorized } from '@/lib/errors';
import { SESSION_COOKIE, SESSION_MAX_AGE, signSession, verifySession } from './jwt';
import type { SessionPayload } from './jwt';

export type { SessionPayload } from './jwt';

/** Reads and verifies the current session from the request cookies. */
export async function getSession(): Promise<SessionPayload | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifySession(token);
}

/** Throws AppError('UNAUTHORIZED') unless a museum admin is logged in. */
export async function requireMuseumAdmin(): Promise<SessionPayload & { museumId: string }> {
  const session = await getSession();
  if (!session) throw unauthorized();
  if (session.role !== 'museum_admin' || !session.museumId) {
    throw forbidden('事業者権限が必要です');
  }
  return { ...session, museumId: session.museumId };
}

/** Throws AppError unless a service operator is logged in. */
export async function requireOperator(): Promise<SessionPayload> {
  const session = await getSession();
  if (!session) throw unauthorized();
  if (session.role !== 'operator') {
    throw forbidden('運営権限が必要です');
  }
  return session;
}

export async function setSessionCookie(payload: SessionPayload): Promise<void> {
  const token = await signSession(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}
