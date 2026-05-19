import { notFound } from 'next/navigation';
import FavoritesList from '@/components/FavoritesList';
import MuseumHeader from '@/components/MuseumHeader';
import { getMuseumBySlugCached } from '@/lib/cache';

export default async function MuseumFavoritesBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const museum = await getMuseumBySlugCached(slug);
  if (!museum || !museum.isActive) notFound();

  return (
    <main className="space-y-6 pb-8">
      <MuseumHeader museum={museum} />
      <section className="space-y-3 px-5">
        <h2 className="text-sm font-medium text-ink-soft">お気に入り</h2>
        <FavoritesList museumId={museum.id} />
      </section>
    </main>
  );
}
