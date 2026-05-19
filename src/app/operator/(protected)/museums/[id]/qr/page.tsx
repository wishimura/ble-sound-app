import Link from 'next/link';
import { notFound } from 'next/navigation';
import QRCodePanel from '@/components/QRCodePanel';
import { PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRequestOrigin } from '@/lib/origin';
import { getRepository } from '@/lib/repository';
import { getMuseumForOperator } from '@/lib/services/operator-content';

export const metadata = { title: 'QRコード' };

export default async function OperatorMuseumQRPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;

  let museum;
  try {
    museum = await getMuseumForOperator(getRepository(), id);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  const origin = await getRequestOrigin();
  const url = `${origin}/${museum.slug}`;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div>
        <Link href={`/operator/museums/${museum.id}`} className="text-sm text-ink-muted">
          ← {museum.name}
        </Link>
        <div className="mt-2">
          <PageTitle title="QRコード" subtitle="この施設の来館者向けQR" />
        </div>
      </div>
      <QRCodePanel url={url} museumName={museum.name} slug={museum.slug} />
    </div>
  );
}
