import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';
import { getSession } from '@/lib/auth/session';

export const runtime = 'nodejs';
export const maxDuration = 60;

const MAX_TEXT_LENGTH = 4096;
const DEFAULT_MODEL = process.env.OPENAI_TTS_MODEL ?? 'tts-1';
const DEFAULT_VOICE = process.env.OPENAI_TTS_VOICE ?? 'nova';

/**
 * Generates a natural-sounding mp3 from text using OpenAI's text-to-speech
 * API, uploads it to Vercel Blob and returns the public URL. Used by the
 * admin / operator forms to fill the audio_url_* fields without recording.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'ログインが必要です' }, { status: 401 });
  }
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error:
          'OpenAI APIキーが未設定です。Vercel の Environment Variables に OPENAI_API_KEY を追加してください。',
      },
      { status: 500 },
    );
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          'Vercel Blob が未設定です。Vercel ダッシュボードで Blob ストアを作成してください。',
      },
      { status: 500 },
    );
  }

  let body: { text?: string; lang?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'リクエストが不正です' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  const lang = body.lang === 'en' ? 'en' : 'ja';
  if (!text) {
    return NextResponse.json({ error: 'テキストを入力してください' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { error: `テキストが長すぎます（${MAX_TEXT_LENGTH}文字以内）` },
      { status: 400 },
    );
  }

  try {
    const ttsRes = await fetch('https://api.openai.com/v1/audio/speech', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,
        voice: DEFAULT_VOICE,
        input: text,
        response_format: 'mp3',
      }),
    });

    if (!ttsRes.ok) {
      const errorText = await ttsRes.text();
      console.error('OpenAI TTS error', ttsRes.status, errorText);
      return NextResponse.json(
        { error: `音声生成に失敗しました（${ttsRes.status}）` },
        { status: 502 },
      );
    }

    const arrayBuffer = await ttsRes.arrayBuffer();
    const blob = await put(
      `tts/${lang}-${randomUUID()}.mp3`,
      Buffer.from(arrayBuffer),
      {
        access: 'public',
        contentType: 'audio/mpeg',
        addRandomSuffix: false,
      },
    );

    return NextResponse.json({ url: blob.url });
  } catch (e) {
    console.error('TTS generation failed', e);
    return NextResponse.json(
      { error: '音声生成中にエラーが発生しました' },
      { status: 500 },
    );
  }
}
