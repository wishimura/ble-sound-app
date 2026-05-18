import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  operatorDeleteExhibitAction,
  operatorSaveExhibitAction,
} from '@/app/operator/(protected)/museums/[id]/actions';
import DeleteExhibitButton from '@/components/DeleteExhibitButton';
import ExhibitForm from '@/components/ExhibitForm';
import { Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  getExhibitForOperator,
  getMuseumForOperator,
} from '@/lib/services/operator-content';

export const metadata = { title: '展示を編集' };

export default async function OperatorEditExhibitPage({
  params,
}: {
  params: Promise<{ id: string; exhibitId: string }>;
}) {
  await requireOperator();
  const { id, exhibitId } = await params;
  const repo = getRepository();

  let museum;
  let exhibit;
  try {
    museum = await getMuseumForOperator(repo, id);
    exhibit = await getExhibitForOperator(repo, id, exhibitId);
  } catch (e) {
    if (isAppError(e)) notFound();
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
          <PageTitle
            title="展示を編集"
            subtitle={`No.${exhibit.exhibitNumber} / ${exhibit.titleJa}`}
          />
        </div>
      </div>

      <Card className="p-5">
        <ExhibitForm
          exhibit={exhibit}
          action={operatorSaveExhibitAction}
          cancelHref={`/operator/museums/${museum.id}/exhibits`}
          museumId={museum.id}
        />
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-medium text-ink">この展示を削除</p>
          <p className="text-sm text-ink-muted">削除すると元に戻せません。</p>
        </div>
        <DeleteExhibitButton
          exhibitId={exhibit.id}
          action={operatorDeleteExhibitAction}
          museumId={museum.id}
        />
      </Card>
    </div>
  );
}
