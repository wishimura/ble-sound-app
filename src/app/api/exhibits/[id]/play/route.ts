import { NextResponse } from 'next/server';
import { recordExhibitPlay } from '@/lib/services/visitor';
import { getRepository } from '@/lib/repository';
import { isAppError } from '@/lib/errors';

export const runtime = 'nodejs';

/** Public endpoint: records a single play for a published exhibit. */
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    await recordExhibitPlay(getRepository(), id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (isAppError(e)) {
      return NextResponse.json({ error: e.message }, { status: 404 });
    }
    console.error('play count error', e);
    return NextResponse.json({ error: '再生数の記録に失敗しました' }, { status: 500 });
  }
}
