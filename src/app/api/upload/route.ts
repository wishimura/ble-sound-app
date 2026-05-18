import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_AUDIO_BYTES = 50 * 1024 * 1024; // 50 MB

const IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/svg+xml',
]);
const AUDIO_TYPES = new Set([
  'audio/mpeg',
  'audio/mp3',
  'audio/wav',
  'audio/x-wav',
  'audio/ogg',
  'audio/aac',
  'audio/mp4',
  'audio/m4a',
  'audio/x-m4a',
]);

/**
 * Uploads a single file to Vercel Blob and returns its public URL. Restricted
 * to authenticated admin / operator users so anonymous visitors cannot fill
 * up the Blob store.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Vercel Blob が未設定です。Vercel ダッシュボードで Blob ストアを作成し、BLOB_READ_WRITE_TOKEN を環境変数に追加してください。',
      },
      { status: 500 },
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 });
  }

  const file = formData.get('file');
  const purpose = String(formData.get('purpose') ?? 'image');

  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ error: 'ファイルを選択してください' }, { status: 400 });
  }

  if (purpose !== 'image' && purpose !== 'audio') {
    return NextResponse.json({ error: '不正な用途です' }, { status: 400 });
  }

  const allowed = purpose === 'image' ? IMAGE_TYPES : AUDIO_TYPES;
  const limit = purpose === 'image' ? MAX_IMAGE_BYTES : MAX_AUDIO_BYTES;
  if (file.type && !allowed.has(file.type)) {
    return NextResponse.json(
      { error: `この形式は受け付けていません: ${file.type}` },
      { status: 400 },
    );
  }
  if (file.size > limit) {
    const mb = Math.round(limit / (1024 * 1024));
    return NextResponse.json(
      { error: `ファイルが大きすぎます（${mb}MB以内）` },
      { status: 400 },
    );
  }

  try {
    const safeName = file.name.replace(/[^\w.\-]+/g, '_').slice(0, 80) || 'upload';
    const blob = await put(`${purpose}s/${safeName}`, file, {
      access: 'public',
      addRandomSuffix: true,
      contentType: file.type || undefined,
    });
    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('upload failed', e);
    return NextResponse.json(
      { error: 'アップロードに失敗しました' },
      { status: 500 },
    );
  }
}
