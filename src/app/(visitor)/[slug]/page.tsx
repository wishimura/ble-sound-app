import { notFound } from 'next/navigation';
import ExhibitGridSearchable from '@/components/ExhibitGridSearchable';
import MuseumHeader from '@/components/MuseumHeader';
import {
  getMuseumBySlugCached,
  listPublishedExhibitsCached,
} from '@/lib/cache';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const museum = await getMuseumBySlugCached(slug);
  if (!museum) return { title: '音声ガイド' };
  return { title: `${museum.name} | 音声ガイド` };
}

export default async function MuseumHomeBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const museum = await getMuseumBySlugCached(slug);
  if (!museum || !museum.isActive) notFound();

  const exhibits = await listPublishedExhibitsCached(museum.id);

  return (
    <main className="space-y-6 pb-8">
      <MuseumHeader museum={museum} />
      <section className="space-y-3 px-5">
        <h2 className="text-sm font-medium text-ink-soft">展示一覧</h2>
        <ExhibitGridSearchable museumSlug={museum.slug} exhibits={exhibits} />
      </section>
    </main>
  );
}
