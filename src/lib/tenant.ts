import { forbidden } from './errors';
import type { Exhibit } from './repository/types';

/**
 * Tenant-isolation guard. A museum admin may only ever touch rows that belong
 * to their own museum. This is the single chokepoint enforcing multi-tenancy
 * in the admin flows, so it is covered directly by the test suite.
 */
export function assertExhibitOwnership(
  exhibit: Pick<Exhibit, 'museumId'>,
  museumId: string,
): void {
  if (exhibit.museumId !== museumId) {
    throw forbidden('他施設のデータにはアクセスできません');
  }
}

export function canAccessMuseum(
  user: { role: 'museum_admin' | 'operator'; museumId: string | null },
  museumId: string,
): boolean {
  if (user.role === 'operator') return true;
  return user.museumId === museumId;
}
