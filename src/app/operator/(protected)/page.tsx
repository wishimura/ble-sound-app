import Link from 'next/link';
import { toggleMuseumActiveAction } from '@/app/operator/actions';
import { Badge, Card, PageTitle, btn } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { museumTypeLabel } from '@/lib/i18n';
import { getRepository } from '@/lib/repository';
import { listMuseumsForOperator } from '@/lib/services/operator';

export default async function OperatorMuseumsPage() {
  await requireOperator();
  const museums = await listMuseumsForOperator(getRepository());

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="施設一覧" subtitle={`登録施設数: ${museums.length}`} />
        <Link href="/operator/museums/new" className={btn('primary')}>
          ＋ 施設を追加
        </Link>
      </div>

      {museums.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-muted">
          施設がまだありません。「施設を追加」から登録してください。
        </Card>
      ) : (
        <ul className="space-y-2">
          {museums.map((m) => (
            <li key={m.id}>
              <Card className="flex flex-wrap items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge tone="muted">{museumTypeLabel[m.type]}</Badge>
                    {m.isActive ? (
                      <Badge tone="success">稼働中</Badge>
                    ) : (
                      <Badge tone="muted">停止中</Badge>
                    )}
                  </div>
                  <p className="mt-1 truncate font-medium text-ink">{m.name}</p>
                  {m.description ? (
                    <p className="truncate text-sm text-ink-muted">{m.description}</p>
                  ) : null}
                </div>
                <form action={toggleMuseumActiveAction}>
                  <input type="hidden" name="id" value={m.id} />
                  <input
                    type="hidden"
                    name="active"
                    value={(!m.isActive).toString()}
                  />
                  <button
                    type="submit"
                    className={btn(m.isActive ? 'danger' : 'secondary', 'text-xs')}
                  >
                    {m.isActive ? '施設を停止' : '施設を再開'}
                  </button>
                </form>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
