import { NeonRepository } from './neon';
import type { Repository } from './types';

let cached: Repository | null = null;

/** Returns the production (Neon-backed) repository. */
export function getRepository(): Repository {
  if (!cached) {
    cached = new NeonRepository();
  }
  return cached;
}

export type { Repository } from './types';
