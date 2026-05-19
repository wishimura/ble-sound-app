import { z } from 'zod';

/**
 * Empty string / null / undefined -> null. Otherwise must be either an
 * http(s) URL or a root-relative path (e.g. `/samples/guide.wav` for assets
 * hosted by the app itself). Unsafe schemes such as `javascript:` are rejected.
 */
const optionalUrl = z
  .preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z
      .string()
      .trim()
      .max(2000)
      .refine(
        (u) => /^https?:\/\//i.test(u) || /^\/[^\s]+$/.test(u),
        'http(s):// で始まる URL、または / で始まるパスを入力してください',
      )
      .nullable(),
  )
  .nullable()
  .default(null);

const optionalText = z
  .preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().trim().max(4000).nullable(),
  )
  .nullable()
  .default(null);

export const museumTypeSchema = z.enum(['museum', 'aquarium', 'zoo', 'other']);

/**
 * Reserved URL slugs that must not clash with framework / app routes.
 * Kept in sync with both server-side validation and client-side BottomNav
 * pathname detection.
 */
export const RESERVED_SLUGS = new Set<string>([
  'admin',
  'api',
  'operator',
  'm',
  '_next',
  'static',
  'public',
  'login',
  'logout',
  'signin',
  'signup',
  'signout',
  'favorites',
  'museums',
  'qr',
  'samples',
  'images',
  'css',
  'js',
  'fonts',
  'about',
  'contact',
  'help',
  'support',
  'terms',
  'privacy',
  'sitemap',
  'robots',
  'health',
  'status',
  '404',
  '500',
  'error',
  'index',
]);

export const slugSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(2, '識別子は2文字以上で入力してください')
  .max(32, '識別子は32文字以内で入力してください')
  .regex(
    /^[a-z][a-z0-9-]{1,31}$/,
    '半角英小文字・数字・ハイフンのみ、先頭は英字',
  )
  .refine((s) => !RESERVED_SLUGS.has(s), '予約語のため使用できません');

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const exhibitNumberSchema = z
  .string()
  .trim()
  .min(1, '展示番号を入力してください')
  .max(32, '展示番号が長すぎます');

const optionalNarration = z
  .preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z.string().trim().max(8000).nullable(),
  )
  .nullable()
  .default(null);

export const exhibitInputSchema = z.object({
  exhibitNumber: exhibitNumberSchema,
  titleJa: z.string().trim().min(1, '日本語タイトルは必須です').max(200),
  titleEn: optionalText,
  descriptionJa: z.string().trim().max(8000).default(''),
  descriptionEn: optionalText,
  narrationJa: optionalNarration,
  narrationEn: optionalNarration,
  audioUrlJa: optionalUrl,
  audioUrlEn: optionalUrl,
  imageUrl: optionalUrl,
  isPublished: z.preprocess(
    (v) => v === true || v === 'true' || v === 'on' || v === '1',
    z.boolean(),
  ),
});

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(1, '現在のパスワードを入力してください'),
    newPassword: z
      .string()
      .min(8, '新しいパスワードは8文字以上にしてください')
      .max(128),
    confirmPassword: z.string().min(1, '確認のため再入力してください'),
  })
  .refine((v) => v.newPassword === v.confirmPassword, {
    path: ['confirmPassword'],
    message: '新しいパスワードが一致しません',
  })
  .refine((v) => v.newPassword !== v.currentPassword, {
    path: ['newPassword'],
    message: '現在のパスワードと異なるものにしてください',
  });

export const museumInputSchema = z.object({
  slug: slugSchema,
  name: z.string().trim().min(1, '施設名は必須です').max(200),
  description: optionalText,
  type: museumTypeSchema,
  logoUrl: optionalUrl,
});

/**
 * Operator-side schema for issuing a new vendor (museum admin) account.
 * The system always auto-generates the initial password — the operator only
 * supplies the email and the assigned museum.
 */
export const newUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('メールアドレスの形式が正しくありません'),
  museumId: z.string().uuid('施設を選択してください'),
});

export type ExhibitInputValues = z.infer<typeof exhibitInputSchema>;
export type MuseumInputValues = z.infer<typeof museumInputSchema>;

/** Collapses a ZodError into a single readable message. */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? '入力内容を確認してください';
}
