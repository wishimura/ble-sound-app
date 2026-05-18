import { notFound } from 'next/navigation';
import ExhibitGrid from '@/components/ExhibitGrid';
import MuseumHeader from '@/components/MuseumHeader';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  getMuseumForVisitor,
  listPublishedExhibitsForVisitor,
} from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  try {
    const museum = await getMuseumForVisitor(getRepository(), museumId);
    return { title: `${museum.name} | 音声ガイド` };
  } catch {
    return { title: '音声ガイド' };
  }
}

export default async function MuseumHomePage({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  const repo = getRepository();

  let museum;
  try {
    museum = await getMuseumForVisitor(repo, museumId);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  const exhibits = await listPublishedExhibitsForVisitor(repo, museumId);

  return (
    <main className="space-y-6 pb-8">
      <MuseumHeader museum={museum} />
      <section className="space-y-3 px-5">
        <h2 className="text-sm font-medium text-ink-soft">展示一覧</h2>
        <ExhibitGrid museumId={museum.id} exhibits={exhibits} />
      </section>
    </main>
  );
}
