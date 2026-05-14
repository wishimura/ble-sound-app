import { z } from 'zod';

/** Empty string / null / undefined -> null. Otherwise must be a valid http(s) URL. */
const optionalUrl = z
  .preprocess(
    (v) => (typeof v === 'string' && v.trim() === '' ? null : v),
    z
      .string()
      .trim()
      .url('URL の形式が正しくありません')
      .refine((u) => /^https?:\/\//i.test(u), 'http(s) の URL を入力してください')
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

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(1, 'パスワードを入力してください'),
});

export const exhibitNumberSchema = z
  .string()
  .trim()
  .min(1, '展示番号を入力してください')
  .max(32, '展示番号が長すぎます');

export const exhibitInputSchema = z.object({
  exhibitNumber: exhibitNumberSchema,
  titleJa: z.string().trim().min(1, '日本語タイトルは必須です').max(200),
  titleEn: optionalText,
  descriptionJa: z.string().trim().max(8000).default(''),
  descriptionEn: optionalText,
  audioUrlJa: optionalUrl,
  audioUrlEn: optionalUrl,
  imageUrl: optionalUrl,
  isPublished: z.preprocess(
    (v) => v === true || v === 'true' || v === 'on' || v === '1',
    z.boolean(),
  ),
});

export const museumInputSchema = z.object({
  name: z.string().trim().min(1, '施設名は必須です').max(200),
  description: optionalText,
  type: museumTypeSchema,
  logoUrl: optionalUrl,
});

export const newUserSchema = z.object({
  email: z.string().trim().toLowerCase().email('メールアドレスの形式が正しくありません'),
  password: z.string().min(8, 'パスワードは8文字以上にしてください').max(128),
  museumId: z.string().uuid('施設を選択してください'),
});

export type ExhibitInputValues = z.infer<typeof exhibitInputSchema>;
export type MuseumInputValues = z.infer<typeof museumInputSchema>;

/** Collapses a ZodError into a single readable message. */
export function firstZodMessage(error: z.ZodError): string {
  return error.issues[0]?.message ?? '入力内容を確認してください';
}
