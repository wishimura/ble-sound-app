import Link from 'next/link';
import { togglePublishAction } from '@/app/admin/actions';
import AdminExhibitRow from '@/components/AdminExhibitRow';
import { Card, PageTitle, btn } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { listAdminExhibits } from '@/lib/services/admin';

export default async function AdminExhibitsPage() {
  const session = await requireMuseumAdmin();
  const exhibits = await listAdminExhibits(getRepository(), session);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="展示一覧" subtitle={`登録数: ${exhibits.length}`} />
        <Link href="/admin/exhibits/new" className={btn('primary')}>
          ＋ 展示を登録
        </Link>
      </div>

      {exhibits.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-muted">
          まだ展示がありません。「展示を登録」から追加してください。
        </Card>
      ) : (
        <ul className="space-y-2">
          {exhibits.map((e) => (
            <li key={e.id}>
              <AdminExhibitRow
                exhibit={e}
                editHref={`/admin/exhibits/${e.id}/edit`}
                togglePublishAction={togglePublishAction}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
