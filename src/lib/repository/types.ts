export type MuseumType = 'museum' | 'aquarium' | 'zoo' | 'other';
export type UserRole = 'museum_admin' | 'operator';
export type Language = 'ja' | 'en';

export interface Museum {
  id: string;
  name: string;
  description: string | null;
  type: MuseumType;
  logoUrl: string | null;
  isActive: boolean;
  createdAt: Date;
}

export interface MuseumUser {
  id: string;
  museumId: string | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  mustChangePassword: boolean;
  createdAt: Date;
}

export interface Exhibit {
  id: string;
  museumId: string;
  exhibitNumber: string;
  titleJa: string;
  titleEn: string | null;
  descriptionJa: string;
  descriptionEn: string | null;
  narrationJa: string | null;
  narrationEn: string | null;
  audioUrlJa: string | null;
  audioUrlEn: string | null;
  imageUrl: string | null;
  isPublished: boolean;
  playCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface NewMuseum {
  name: string;
  description: string | null;
  type: MuseumType;
  logoUrl: string | null;
  isActive?: boolean;
}

export type MuseumUpdate = Partial<Omit<NewMuseum, 'isActive'>>;

export interface NewMuseumUser {
  museumId: string | null;
  email: string;
  passwordHash: string;
  role: UserRole;
  mustChangePassword?: boolean;
}

export interface ExhibitInput {
  exhibitNumber: string;
  titleJa: string;
  titleEn: string | null;
  descriptionJa: string;
  descriptionEn: string | null;
  narrationJa: string | null;
  narrationEn: string | null;
  audioUrlJa: string | null;
  audioUrlEn: string | null;
  imageUrl: string | null;
  isPublished: boolean;
}

/**
 * Storage abstraction. Two implementations exist:
 *  - `neon.ts`   — production, backed by Neon Postgres via Drizzle.
 *  - `memory.ts` — in-memory, used by the test suite.
 *
 * Keeping the service layer dependent on this interface (not Drizzle directly)
 * makes the visitor / admin / operator flows fully unit-testable.
 */
export interface Repository {
  // ---- visitor ----
  listActiveMuseums(): Promise<Museum[]>;
  getMuseum(id: string): Promise<Museum | null>;
  listPublishedExhibits(museumId: string): Promise<Exhibit[]>;
  getPublishedExhibit(museumId: string, exhibitNumber: string): Promise<Exhibit | null>;
  getExhibitById(id: string): Promise<Exhibit | null>;
  incrementPlayCount(exhibitId: string): Promise<void>;

  // ---- auth ----
  getUserByEmail(email: string): Promise<MuseumUser | null>;
  getUserById(id: string): Promise<MuseumUser | null>;

  // ---- museum admin ----
  listExhibits(museumId: string): Promise<Exhibit[]>;
  createExhibit(museumId: string, input: ExhibitInput): Promise<Exhibit>;
  updateExhibit(id: string, input: ExhibitInput): Promise<Exhibit>;
  deleteExhibit(id: string): Promise<void>;
  updateMuseum(id: string, update: MuseumUpdate): Promise<Museum>;

  // ---- service operator ----
  listAllMuseums(): Promise<Museum[]>;
  createMuseum(input: NewMuseum): Promise<Museum>;
  setMuseumActive(id: string, isActive: boolean): Promise<void>;
  listUsers(): Promise<MuseumUser[]>;
  createUser(input: NewMuseumUser): Promise<MuseumUser>;
  listAllExhibits(): Promise<Exhibit[]>;

  // ---- account ----
  updatePassword(userId: string, passwordHash: string, mustChange: boolean): Promise<void>;
}
