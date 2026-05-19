import { notFound, redirect } from 'next/navigation';
import { getMuseumByIdCached } from '@/lib/cache';

/** Legacy: /m/[uuid]/e/[number] -> /[slug]/e/[number] */
export default async function LegacyExhibitRedirect({
  params,
}: {
  params: Promise<{ museumId: string; number: string }>;
}) {
  const { museumId, number } = await params;
  const museum = await getMuseumByIdCached(museumId);
  if (!museum || !museum.isActive) notFound();
  redirect(`/${museum.slug}/e/${number}`);
}
