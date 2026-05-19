import { notFound, redirect } from 'next/navigation';
import { getMuseumByIdCached } from '@/lib/cache';

/**
 * Legacy redirect: old QR codes / shared links pointing at /m/[uuid]
 * now forward to /[slug] so visitors land on the canonical URL.
 */
export default async function LegacyMuseumRedirect({
  params,
}: {
  params: Promise<{ museumId: string }>;
}) {
  const { museumId } = await params;
  const museum = await getMuseumByIdCached(museumId);
  if (!museum || !museum.isActive) notFound();
  redirect(`/${museum.slug}`);
}
