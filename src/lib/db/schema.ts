import {
  pgTable,
  pgEnum,
  uuid,
  text,
  boolean,
  integer,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const museumTypeEnum = pgEnum('museum_type', [
  'museum',
  'aquarium',
  'zoo',
  'other',
]);

export const userRoleEnum = pgEnum('user_role', ['museum_admin', 'operator']);

export const museums = pgTable('museums', {
  id: uuid('id').defaultRandom().primaryKey(),
  // URL slug used in /[slug] visitor routes — must be unique per service.
  slug: text('slug').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  type: museumTypeEnum('type').notNull().default('museum'),
  logoUrl: text('logo_url'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const museumUsers = pgTable('museum_users', {
  id: uuid('id').defaultRandom().primaryKey(),
  // museum_id is null for service operators (they are not tied to a single museum).
  museumId: uuid('museum_id').references(() => museums.id, { onDelete: 'cascade' }),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: userRoleEnum('role').notNull(),
  // True for newly issued vendor (museum_admin) accounts. They must change
  // their initial password before they can use the rest of the admin pages.
  mustChangePassword: boolean('must_change_password').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const exhibits = pgTable(
  'exhibits',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    museumId: uuid('museum_id')
      .notNull()
      .references(() => museums.id, { onDelete: 'cascade' }),
    exhibitNumber: text('exhibit_number').notNull(),
    titleJa: text('title_ja').notNull(),
    titleEn: text('title_en'),
    descriptionJa: text('description_ja').notNull().default(''),
    descriptionEn: text('description_en'),
    // Optional spoken-narration scripts. When `audio_url_*` is null but
    // `narration_*` is set, the visitor app uses the browser's speech
    // synthesis to read the script aloud.
    narrationJa: text('narration_ja'),
    narrationEn: text('narration_en'),
    audioUrlJa: text('audio_url_ja'),
    audioUrlEn: text('audio_url_en'),
    imageUrl: text('image_url'),
    isPublished: boolean('is_published').notNull().default(false),
    playCount: integer('play_count').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    // Exhibit numbers are unique within a museum (not globally).
    unique('exhibits_museum_number_unique').on(t.museumId, t.exhibitNumber),
  ],
);
