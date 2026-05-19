import { notFound, redirect } from 'next/navigation';
import { getMuseumByIdCached } from '@/lib/cache';

/** Legacy: /m/[uuid]/favorites -> /[slug]/favorites */
export default async function LegacyFavoritesRedirect({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  const museum = await getMuseumByIdCached(museumId);
  if (!museum || !museum.isActive) notFound();
  redirect(`/${museum.slug}/favorites`);
}
