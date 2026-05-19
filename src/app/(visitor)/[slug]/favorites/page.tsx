import { notFound } from 'next/navigation';
import FavoritesList from '@/components/FavoritesList';
import MuseumHeader from '@/components/MuseumHeader';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import { getMuseumBySlugForVisitor } from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export default async function MuseumFavoritesBySlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  let museum;
  try {
    museum = await getMuseumBySlugForVisitor(getRepository(), slug);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

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
