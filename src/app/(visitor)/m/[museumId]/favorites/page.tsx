import { notFound, redirect } from 'next/navigation';
import { getRepository } from '@/lib/repository';

export const dynamic = 'force-dynamic';

/** Legacy: /m/[uuid]/favorites -> /[slug]/favorites */
export default async function LegacyFavoritesRedirect({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  const museum = await getRepository().getMuseum(museumId);
  if (!museum || !museum.isActive) notFound();
  redirect(`/${museum.slug}/favorites`);
}
