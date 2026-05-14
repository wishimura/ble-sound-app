import { describe, it, expect, beforeAll } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { signSession, verifySession } from '@/lib/auth/jwt';

beforeAll(() => {
  process.env.JWT_SECRET = 'test-secret-value-for-unit-tests-only';
});

describe('password hashing', () => {
  it('verifies a correct password', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(hash).not.toBe('s3cret-pass');
    expect(await verifyPassword('s3cret-pass', hash)).toBe(true);
  });

  it('rejects an incorrect password', async () => {
    const hash = await hashPassword('s3cret-pass');
    expect(await verifyPassword('wrong-pass', hash)).toBe(false);
  });
});

describe('session JWT', () => {
  it('round-trips a valid session payload', async () => {
    const token = await signSession({
      sub: 'user-1',
      role: 'museum_admin',
      museumId: 'museum-1',
      email: 'admin@example.com',
    });
    const decoded = await verifySession(token);
    expect(decoded).toEqual({
      sub: 'user-1',
      role: 'museum_admin',
      museumId: 'museum-1',
      email: 'admin@example.com',
    });
  });

  it('returns null for a tampered/invalid token', async () => {
    expect(await verifySession('not-a-real-token')).toBeNull();
    const token = await signSession({
      sub: 'user-1',
      role: 'operator',
      museumId: null,
      email: 'op@example.com',
    });
    expect(await verifySession(token + 'tampered')).toBeNull();
  });
});
