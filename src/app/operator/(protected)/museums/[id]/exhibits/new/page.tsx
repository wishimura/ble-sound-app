import Link from 'next/link';
import { notFound } from 'next/navigation';
import { operatorSaveExhibitAction } from '@/app/operator/(protected)/museums/[id]/actions';
import ExhibitForm from '@/components/ExhibitForm';
import { Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import { getMuseumForOperator } from '@/lib/services/operator-content';

export const metadata = { title: '展示を登録' };

export default async function OperatorNewExhibitPage({
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

  return (
    <div className="space-y-5">
      <div>
        <Link
          href={`/operator/museums/${museum.id}/exhibits`}
          className="text-sm text-ink-muted"
        >
          ← {museum.name} の展示一覧へ
        </Link>
        <div className="mt-2">
          <PageTitle title="展示を登録" subtitle={museum.name} />
        </div>
      </div>
      <Card className="p-5">
        <ExhibitForm
          action={operatorSaveExhibitAction}
          cancelHref={`/operator/museums/${museum.id}/exhibits`}
          museumId={museum.id}
        />
      </Card>
    </div>
  );
}
