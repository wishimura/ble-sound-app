import Link from 'next/link';
import { togglePublishAction } from '@/app/admin/actions';
import { Badge, Card, PageTitle, btn } from '@/components/ui';
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
              <Card className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge>No.{e.exhibitNumber}</Badge>
                    {e.isPublished ? (
                      <Badge tone="success">公開中</Badge>
                    ) : (
                      <Badge tone="muted">非公開</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium text-ink">{e.titleJa}</p>
                  <p className="text-xs text-ink-muted">再生数: {e.playCount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <form action={togglePublishAction}>
                    <input type="hidden" name="id" value={e.id} />
                    <input
                      type="hidden"
                      name="publish"
                      value={(!e.isPublished).toString()}
                    />
                    <button type="submit" className={btn('ghost', 'text-xs')}>
                      {e.isPublished ? '非公開にする' : '公開する'}
                    </button>
                  </form>
                  <Link
                    href={`/admin/exhibits/${e.id}/edit`}
                    className={btn('secondary', 'text-xs')}
                  >
                    編集
                  </Link>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
