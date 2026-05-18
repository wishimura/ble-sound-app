import { headers } from 'next/headers';

/**
 * Resolves the public origin (scheme + host) of the current request.
 * Used to embed full URLs (e.g. into QR codes) without relying on a build-time
 * env var that may not match the actual hostname.
 */
export async function getRequestOrigin(): Promise<string> {
  const h = await headers();
  const forwardedHost = h.get('x-forwarded-host');
  const host = forwardedHost ?? h.get('host') ?? 'localhost:3000';
  const proto =
    h.get('x-forwarded-proto') ??
    (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}
