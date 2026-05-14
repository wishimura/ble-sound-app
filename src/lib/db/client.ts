import { neon } from '@neondatabase/serverless';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema';

let cached: NeonHttpDatabase<typeof schema> | null = null;

/**
 * Lazily creates the Neon-backed Drizzle client. Kept lazy so that simply
 * importing modules (e.g. during `next build`) does not require DATABASE_URL.
 */
export function getDb(): NeonHttpDatabase<typeof schema> {
  if (cached) return cached;
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      'DATABASE_URL is not set. Copy .env.example to .env and configure your Neon connection string.',
    );
  }
  cached = drizzle(neon(url), { schema });
  return cached;
}
