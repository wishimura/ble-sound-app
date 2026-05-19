import { describe, it, expect } from 'vitest';
import { MemoryRepository } from '@/lib/repository/memory';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import { generateInitialPassword } from '@/lib/auth/initial-password';
import { changeOwnPassword } from '@/lib/services/account';
import { createMuseumAdmin, createMuseumByOperator } from '@/lib/services/operator';
import { authenticate } from '@/lib/services/auth';
import { exhibitInputSchema } from '@/lib/validation';

describe('generateInitialPassword', () => {
  it('returns a string of the requested length', () => {
    expect(generateInitialPassword(12)).toHaveLength(12);
    expect(generateInitialPassword(16)).toHaveLength(16);
  });

  it('only uses unambiguous characters (no 0/O/1/l/I)', () => {
    for (let i = 0; i < 50; i += 1) {
      expect(generateInitialPassword(20)).toMatch(/^[a-zA-Z0-9]+$/);
      expect(generateInitialPassword(20)).not.toMatch(/[0Oo1lI]/);
    }
  });
});

describe('issue + first-login flow', () => {
  async function setup() {
    const repo = new MemoryRepository();
    const museum = await createMuseumByOperator(repo, {
      slug: 'museum-x',
      name: 'M',
      description: null,
      type: 'museum',
      logoUrl: null,
    });
    const { user, initialPassword } = await createMuseumAdmin(repo, {
      email: 'vendor@example.com',
      museumId: museum.id,
    });
    return { repo, museum, user, initialPassword };
  }

  it('issues an account flagged for forced password change', async () => {
    const { user, initialPassword } = await setup();
    expect(user.mustChangePassword).toBe(true);
    expect(initialPassword.length).toBeGreaterThanOrEqual(10);
    expect(await verifyPassword(initialPassword, user.passwordHash)).toBe(true);
  });

  it('login carries the must_change_password flag through', async () => {
    const { repo, initialPassword } = await setup();
    const u = await authenticate(repo, 'vendor@example.com', initialPassword, 'museum_admin');
    expect(u.mustChangePassword).toBe(true);
  });

  it('changeOwnPassword updates the hash and clears the flag', async () => {
    const { repo, user, initialPassword } = await setup();
    const updated = await changeOwnPassword(
      repo,
      user.id,
      initialPassword,
      'brand-new-password',
    );
    expect(updated.mustChangePassword).toBe(false);

    // old password no longer works, new one does
    await expect(
      authenticate(repo, user.email, initialPassword, 'museum_admin'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    const u = await authenticate(repo, user.email, 'brand-new-password', 'museum_admin');
    expect(u.mustChangePassword).toBe(false);
  });

  it('rejects a wrong current password', async () => {
    const { repo, user } = await setup();
    await expect(
      changeOwnPassword(repo, user.id, 'wrong-current', 'brand-new-password'),
    ).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('rejects reusing the same password', async () => {
    const { repo, user, initialPassword } = await setup();
    await expect(
      changeOwnPassword(repo, user.id, initialPassword, initialPassword),
    ).rejects.toMatchObject({ code: 'VALIDATION' });
  });
});

describe('exhibit narration fields', () => {
  it('accepts narration text alongside (or instead of) an audio URL', () => {
    const parsed = exhibitInputSchema.parse({
      exhibitNumber: '1',
      titleJa: 'タイトル',
      titleEn: '',
      descriptionJa: '',
      descriptionEn: '',
      narrationJa: 'これは AI が読み上げる解説テキストです。',
      narrationEn: '',
      audioUrlJa: '',
      audioUrlEn: '',
      imageUrl: '',
      isPublished: 'on',
    });
    expect(parsed.narrationJa).toContain('AI が読み上げる');
    expect(parsed.narrationEn).toBeNull();
    expect(parsed.audioUrlJa).toBeNull();
  });

  it('normalizes empty narration to null', () => {
    const parsed = exhibitInputSchema.parse({
      exhibitNumber: '1',
      titleJa: 'タイトル',
      titleEn: '',
      descriptionJa: '',
      descriptionEn: '',
      narrationJa: '   ',
      narrationEn: '',
      audioUrlJa: '',
      audioUrlEn: '',
      imageUrl: '',
      isPublished: '',
    });
    expect(parsed.narrationJa).toBeNull();
    expect(parsed.narrationEn).toBeNull();
  });
});

// Helper so the import is referenced and tree-shaken correctly.
void hashPassword;
