import { describe, it, expect } from 'vitest';
import {
  exhibitInputSchema,
  museumInputSchema,
  loginSchema,
  newUserSchema,
  slugSchema,
} from '@/lib/validation';

describe('exhibitInputSchema', () => {
  const base = {
    exhibitNumber: '12',
    titleJa: '朝の港',
    titleEn: '',
    descriptionJa: '解説文',
    descriptionEn: '',
    audioUrlJa: 'https://example.com/a.mp3',
    audioUrlEn: '',
    imageUrl: '',
    isPublished: 'on',
  };

  it('accepts valid input and normalizes empties to null', () => {
    const result = exhibitInputSchema.parse(base);
    expect(result.titleEn).toBeNull();
    expect(result.audioUrlEn).toBeNull();
    expect(result.imageUrl).toBeNull();
    expect(result.isPublished).toBe(true);
  });

  it('treats a missing checkbox as not published', () => {
    const result = exhibitInputSchema.parse({ ...base, isPublished: null });
    expect(result.isPublished).toBe(false);
  });

  it('rejects an empty Japanese title', () => {
    expect(exhibitInputSchema.safeParse({ ...base, titleJa: '  ' }).success).toBe(false);
  });

  it('rejects a non-http URL (XSS / unsafe scheme guard)', () => {
    const bad = exhibitInputSchema.safeParse({
      ...base,
      audioUrlJa: 'javascript:alert(1)',
    });
    expect(bad.success).toBe(false);
  });

  it('rejects a blank exhibit number', () => {
    expect(exhibitInputSchema.safeParse({ ...base, exhibitNumber: '' }).success).toBe(
      false,
    );
  });
});

describe('museumInputSchema', () => {
  it('accepts a valid museum', () => {
    const result = museumInputSchema.parse({
      slug: 'uminoiro',
      name: 'テスト美術館',
      description: '',
      type: 'museum',
      logoUrl: '',
    });
    expect(result.slug).toBe('uminoiro');
    expect(result.description).toBeNull();
    expect(result.type).toBe('museum');
  });

  it('rejects an unknown type', () => {
    expect(
      museumInputSchema.safeParse({
        slug: 'x-museum',
        name: 'x',
        type: 'spaceship',
      }).success,
    ).toBe(false);
  });

  it('rejects a missing slug', () => {
    expect(
      museumInputSchema.safeParse({ name: 'x', type: 'museum' }).success,
    ).toBe(false);
  });
});

describe('slugSchema', () => {
  it('accepts lowercase alphanumeric+hyphen starting with a letter', () => {
    for (const s of ['uminoiro', 'minato-art', 'museum-2024', 'ab']) {
      expect(slugSchema.safeParse(s).success).toBe(true);
    }
  });

  it('rejects illegal patterns', () => {
    for (const s of ['', 'a', '2museum', 'with space', 'with_underscore', 'too-long-'.repeat(10)]) {
      expect(slugSchema.safeParse(s).success).toBe(false);
    }
  });

  it('rejects reserved words (admin / api / operator / ...)', () => {
    for (const s of ['admin', 'api', 'operator', 'login', 'favorites', 'museums']) {
      expect(slugSchema.safeParse(s).success).toBe(false);
    }
  });

  it('lowercases input', () => {
    const r = slugSchema.parse('Uminoiro');
    expect(r).toBe('uminoiro');
  });
});

describe('loginSchema', () => {
  it('lowercases the email', () => {
    const result = loginSchema.parse({ email: 'Admin@Example.com', password: 'pw' });
    expect(result.email).toBe('admin@example.com');
  });

  it('rejects an invalid email', () => {
    expect(loginSchema.safeParse({ email: 'nope', password: 'pw' }).success).toBe(false);
  });
});

describe('newUserSchema', () => {
  it('accepts an email + museum id (password is auto-generated)', () => {
    const r = newUserSchema.safeParse({
      email: 'vendor@example.com',
      museumId: '00000000-0000-0000-0000-000000000000',
    });
    expect(r.success).toBe(true);
  });

  it('rejects an invalid museum id', () => {
    const r = newUserSchema.safeParse({
      email: 'vendor@example.com',
      museumId: 'not-a-uuid',
    });
    expect(r.success).toBe(false);
  });
});
