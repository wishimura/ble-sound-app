import { notFound } from 'next/navigation';
import ExhibitGrid from '@/components/ExhibitGrid';
import MuseumHeader from '@/components/MuseumHeader';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  getMuseumBySlugForVisitor,
  listPublishedExhibitsForVisitor,
} from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  try {
    const museum = await getMuseumBySlugForVisitor(getRepository(), slug);
    return { title: `${museum.name} | 音声ガイド` };
  } catch {
    return { title: '音声ガイド' };
  }
}

export default async function MuseumHomeBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const repo = getRepository();

  let museum;
  try {
    museum = await getMuseumBySlugForVisitor(repo, slug);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  const exhibits = await listPublishedExhibitsForVisitor(repo, museum.id);

  return (
    <main className="space-y-6 pb-8">
      <MuseumHeader museum={museum} />
      <section className="space-y-3 px-5">
        <h2 className="text-sm font-medium text-ink-soft">展示一覧</h2>
        <ExhibitGrid museumSlug={museum.slug} exhibits={exhibits} />
      </section>
    </main>
  );
}
