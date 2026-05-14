import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExhibitNumberForm from '@/components/ExhibitNumberForm';
import { Badge, Card } from '@/components/ui';
import { isAppError } from '@/lib/errors';
import { museumTypeLabel } from '@/lib/i18n';
import { getRepository } from '@/lib/repository';
import { getMuseumForVisitor } from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export default async function MuseumDetailPage({
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
    <main className="space-y-6 px-5 pt-8">
      <div>
        <Link href="/museums" className="text-sm text-ink-muted">
          ← 施設一覧へ
        </Link>
        <div className="mt-3 flex items-center gap-2">
          <Badge tone="muted">{museumTypeLabel[museum.type]}</Badge>
        </div>
        <h1 className="mt-2 text-2xl font-semibold text-ink">{museum.name}</h1>
        {museum.description ? (
          <p className="mt-2 leading-relaxed text-ink-soft">{museum.description}</p>
        ) : null}
      </div>

      <Card className="p-5">
        <h2 className="text-center text-sm font-medium text-ink-soft">
          展示番号を入力してください
        </h2>
        <div className="mt-4">
          <ExhibitNumberForm museumId={museum.id} />
        </div>
      </Card>
    </main>
  );
}
