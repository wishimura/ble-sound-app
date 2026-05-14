import { SignJWT, jwtVerify } from 'jose';
import type { UserRole } from '@/lib/repository/types';

export interface SessionPayload {
  sub: string; // user id
  role: UserRole;
  museumId: string | null;
  email: string;
}

const ALG = 'HS256';
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret && secret.length >= 16) {
    return new TextEncoder().encode(secret);
  }
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be set (>= 16 chars) in production.');
  }
  // Development-only fallback so the app runs without extra setup locally.
  return new TextEncoder().encode('dev-insecure-secret-change-me');
}

export async function signSession(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${COOKIE_MAX_AGE}s`)
    .sign(getSecret());
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    if (
      typeof payload.sub === 'string' &&
      (payload.role === 'museum_admin' || payload.role === 'operator') &&
      typeof payload.email === 'string'
    ) {
      return {
        sub: payload.sub,
        role: payload.role,
        museumId: (payload.museumId as string | null) ?? null,
        email: payload.email,
      };
    }
    return null;
  } catch {
    return null;
  }
}

export const SESSION_COOKIE = 'ag_session';
export const SESSION_MAX_AGE = COOKIE_MAX_AGE;
