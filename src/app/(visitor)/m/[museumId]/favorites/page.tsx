import { notFound } from 'next/navigation';
import FavoritesList from '@/components/FavoritesList';
import MuseumHeader from '@/components/MuseumHeader';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import { getMuseumForVisitor } from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export default async function MuseumFavoritesPage({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  let museum;
  try {
    museum = await getMuseumForVisitor(getRepository(), museumId);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  return (
    <main className="space-y-6 pb-8">
      <MuseumHeader museum={museum} />
      <section className="space-y-3 px-5">
        <h2 className="text-sm font-medium text-ink-soft">お気に入り</h2>
        <FavoritesList museumId={museumId} />
      </section>
    </main>
  );
}
