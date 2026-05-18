import { randomUUID } from 'node:crypto';
import type {
  Exhibit,
  ExhibitInput,
  Museum,
  MuseumUpdate,
  MuseumUser,
  NewMuseum,
  NewMuseumUser,
  Repository,
} from './types';

/**
 * In-memory Repository implementation used by the test suite. It mirrors the
 * behaviour of the Neon implementation (including the per-museum unique
 * exhibit number constraint) so that service-level tests are meaningful.
 */
export class MemoryRepository implements Repository {
  private museumsById = new Map<string, Museum>();
  private usersById = new Map<string, MuseumUser>();
  private exhibitsById = new Map<string, Exhibit>();

  async listActiveMuseums() {
    return this.sortByName([...this.museumsById.values()].filter((m) => m.isActive));
  }

  async getMuseum(id: string) {
    return this.museumsById.get(id) ?? null;
  }

  async listPublishedExhibits(museumId: string) {
    return [...this.exhibitsById.values()]
      .filter((e) => e.museumId === museumId && e.isPublished)
      .sort((a, b) => a.exhibitNumber.localeCompare(b.exhibitNumber));
  }

  async getPublishedExhibit(museumId: string, exhibitNumber: string) {
    return (
      [...this.exhibitsById.values()].find(
        (e) =>
          e.museumId === museumId &&
          e.exhibitNumber === exhibitNumber &&
          e.isPublished,
      ) ?? null
    );
  }

  async getExhibitById(id: string) {
    return this.exhibitsById.get(id) ?? null;
  }

  async incrementPlayCount(exhibitId: string) {
    const exhibit = this.exhibitsById.get(exhibitId);
    if (exhibit) exhibit.playCount += 1;
  }

  async getUserByEmail(email: string) {
    return (
      [...this.usersById.values()].find(
        (u) => u.email === email.toLowerCase(),
      ) ?? null
    );
  }

  async getUserById(id: string) {
    return this.usersById.get(id) ?? null;
  }

  async listExhibits(museumId: string) {
    return [...this.exhibitsById.values()]
      .filter((e) => e.museumId === museumId)
      .sort((a, b) => a.exhibitNumber.localeCompare(b.exhibitNumber));
  }

  async createExhibit(museumId: string, input: ExhibitInput) {
    const duplicate = [...this.exhibitsById.values()].some(
      (e) => e.museumId === museumId && e.exhibitNumber === input.exhibitNumber,
    );
    if (duplicate) {
      throw new Error('exhibits_museum_number_unique');
    }
    const now = new Date();
    const exhibit: Exhibit = {
      id: randomUUID(),
      museumId,
      ...input,
      playCount: 0,
      createdAt: now,
      updatedAt: now,
    };
    this.exhibitsById.set(exhibit.id, exhibit);
    return exhibit;
  }

  async updateExhibit(id: string, input: ExhibitInput) {
    const existing = this.exhibitsById.get(id);
    if (!existing) throw new Error('exhibit not found');
    const duplicate = [...this.exhibitsById.values()].some(
      (e) =>
        e.id !== id &&
        e.museumId === existing.museumId &&
        e.exhibitNumber === input.exhibitNumber,
    );
    if (duplicate) {
      throw new Error('exhibits_museum_number_unique');
    }
    const updated: Exhibit = { ...existing, ...input, updatedAt: new Date() };
    this.exhibitsById.set(id, updated);
    return updated;
  }

  async deleteExhibit(id: string) {
    this.exhibitsById.delete(id);
  }

  async updateMuseum(id: string, update: MuseumUpdate) {
    const existing = this.museumsById.get(id);
    if (!existing) throw new Error('museum not found');
    const updated: Museum = { ...existing, ...update };
    this.museumsById.set(id, updated);
    return updated;
  }

  async listAllMuseums() {
    return [...this.museumsById.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createMuseum(input: NewMuseum) {
    const museum: Museum = {
      id: randomUUID(),
      name: input.name,
      description: input.description,
      type: input.type,
      logoUrl: input.logoUrl,
      isActive: input.isActive ?? true,
      createdAt: new Date(),
    };
    this.museumsById.set(museum.id, museum);
    return museum;
  }

  async setMuseumActive(id: string, isActive: boolean) {
    const museum = this.museumsById.get(id);
    if (museum) museum.isActive = isActive;
  }

  async listUsers() {
    return [...this.usersById.values()].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    );
  }

  async createUser(input: NewMuseumUser) {
    const email = input.email.toLowerCase();
    if (await this.getUserByEmail(email)) {
      throw new Error('email already exists');
    }
    const user: MuseumUser = {
      id: randomUUID(),
      museumId: input.museumId,
      email,
      passwordHash: input.passwordHash,
      role: input.role,
      mustChangePassword: input.mustChangePassword ?? true,
      createdAt: new Date(),
    };
    this.usersById.set(user.id, user);
    return user;
  }

  async listAllExhibits() {
    return [...this.exhibitsById.values()].sort(
      (a, b) => b.playCount - a.playCount,
    );
  }

  async updatePassword(userId: string, passwordHash: string, mustChange: boolean) {
    const user = this.usersById.get(userId);
    if (!user) throw new Error('user not found');
    user.passwordHash = passwordHash;
    user.mustChangePassword = mustChange;
  }

  private sortByName(list: Museum[]) {
    return [...list].sort((a, b) => a.name.localeCompare(b.name));
  }
}
