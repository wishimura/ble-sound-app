import Link from 'next/link';
import { notFound } from 'next/navigation';
import DeleteExhibitButton from '@/components/DeleteExhibitButton';
import ExhibitForm from '@/components/ExhibitForm';
import { Card, PageTitle } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import { getAdminExhibit } from '@/lib/services/admin';

export const metadata = { title: '展示を編集' };

export default async function EditExhibitPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireMuseumAdmin();

  let exhibit;
  try {
    exhibit = await getAdminExhibit(getRepository(), session, id);
  } catch (e) {
    // NOT_FOUND, or FORBIDDEN when the exhibit belongs to another museum.
    if (isAppError(e)) notFound();
    throw e;
  }

  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/exhibits" className="text-sm text-ink-muted">
          ← 展示一覧へ
        </Link>
        <div className="mt-2">
          <PageTitle title="展示を編集" subtitle={`No.${exhibit.exhibitNumber} / ${exhibit.titleJa}`} />
        </div>
      </div>

      <Card className="p-5">
        <ExhibitForm exhibit={exhibit} />
      </Card>

      <Card className="flex flex-wrap items-center justify-between gap-3 p-5">
        <div>
          <p className="font-medium text-ink">この展示を削除</p>
          <p className="text-sm text-ink-muted">削除すると元に戻せません。</p>
        </div>
        <DeleteExhibitButton exhibitId={exhibit.id} />
      </Card>
    </div>
  );
}
