import { notFound, redirect } from 'next/navigation';
import { getRepository } from '@/lib/repository';

export const dynamic = 'force-dynamic';

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
  const museum = await getRepository().getMuseum(museumId);
  if (!museum || !museum.isActive) notFound();
  redirect(`/${museum.slug}`);
}
