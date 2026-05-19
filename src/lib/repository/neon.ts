import { and, desc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/lib/db/client';
import { exhibits, museums, museumUsers } from '@/lib/db/schema';
import type {
  ExhibitInput,
  Museum,
  MuseumUpdate,
  NewMuseum,
  NewMuseumUser,
  Repository,
} from './types';

/**
 * Neon (PostgreSQL) backed implementation of the Repository interface.
 * All column names map 1:1 to the domain types via the Drizzle schema.
 */
export class NeonRepository implements Repository {
  private get db() {
    return getDb();
  }

  async listActiveMuseums() {
    return this.db
      .select()
      .from(museums)
      .where(eq(museums.isActive, true))
      .orderBy(museums.name);
  }

  async getMuseum(id: string) {
    const rows = await this.db.select().from(museums).where(eq(museums.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async getMuseumBySlug(slug: string) {
    const rows = await this.db
      .select()
      .from(museums)
      .where(eq(museums.slug, slug))
      .limit(1);
    return rows[0] ?? null;
  }

  async listPublishedExhibits(museumId: string) {
    return this.db
      .select()
      .from(exhibits)
      .where(and(eq(exhibits.museumId, museumId), eq(exhibits.isPublished, true)))
      .orderBy(exhibits.exhibitNumber);
  }

  async getPublishedExhibit(museumId: string, exhibitNumber: string) {
    const rows = await this.db
      .select()
      .from(exhibits)
      .where(
        and(
          eq(exhibits.museumId, museumId),
          eq(exhibits.exhibitNumber, exhibitNumber),
          eq(exhibits.isPublished, true),
        ),
      )
      .limit(1);
    return rows[0] ?? null;
  }

  async getExhibitById(id: string) {
    const rows = await this.db.select().from(exhibits).where(eq(exhibits.id, id)).limit(1);
    return rows[0] ?? null;
  }

  async incrementPlayCount(exhibitId: string) {
    await this.db
      .update(exhibits)
      .set({ playCount: sql`${exhibits.playCount} + 1` })
      .where(eq(exhibits.id, exhibitId));
  }

  async getUserByEmail(email: string) {
    const rows = await this.db
      .select()
      .from(museumUsers)
      .where(eq(museumUsers.email, email.toLowerCase()))
      .limit(1);
    return rows[0] ?? null;
  }

  async getUserById(id: string) {
    const rows = await this.db
      .select()
      .from(museumUsers)
      .where(eq(museumUsers.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async listExhibits(museumId: string) {
    return this.db
      .select()
      .from(exhibits)
      .where(eq(exhibits.museumId, museumId))
      .orderBy(exhibits.exhibitNumber);
  }

  async createExhibit(museumId: string, input: ExhibitInput) {
    const rows = await this.db
      .insert(exhibits)
      .values({ museumId, ...input })
      .returning();
    return rows[0];
  }

  async updateExhibit(id: string, input: ExhibitInput) {
    const rows = await this.db
      .update(exhibits)
      .set({ ...input, updatedAt: new Date() })
      .where(eq(exhibits.id, id))
      .returning();
    return rows[0];
  }

  async deleteExhibit(id: string) {
    await this.db.delete(exhibits).where(eq(exhibits.id, id));
  }

  async updateMuseum(id: string, update: MuseumUpdate): Promise<Museum> {
    const rows = await this.db
      .update(museums)
      .set(update)
      .where(eq(museums.id, id))
      .returning();
    return rows[0];
  }

  async listAllMuseums() {
    return this.db.select().from(museums).orderBy(desc(museums.createdAt));
  }

  async createMuseum(input: NewMuseum) {
    const rows = await this.db.insert(museums).values(input).returning();
    return rows[0];
  }

  async setMuseumActive(id: string, isActive: boolean) {
    await this.db.update(museums).set({ isActive }).where(eq(museums.id, id));
  }

  async listUsers() {
    return this.db.select().from(museumUsers).orderBy(desc(museumUsers.createdAt));
  }

  async createUser(input: NewMuseumUser) {
    const rows = await this.db
      .insert(museumUsers)
      .values({ ...input, email: input.email.toLowerCase() })
      .returning();
    return rows[0];
  }

  async listAllExhibits() {
    return this.db.select().from(exhibits).orderBy(desc(exhibits.playCount));
  }

  async updatePassword(userId: string, passwordHash: string, mustChange: boolean) {
    await this.db
      .update(museumUsers)
      .set({ passwordHash, mustChangePassword: mustChange })
      .where(eq(museumUsers.id, userId));
  }
}
