import Link from 'next/link';
import { toggleMuseumActiveAction } from '@/app/operator/actions';
/* eslint-disable @next/next/no-img-element */
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
                <div className="flex h-12 w-12 flex-none items-center justify-center overflow-hidden rounded-xl bg-accent-soft">
                  {m.logoUrl ? (
                    <img
                      src={m.logoUrl}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-base font-semibold text-accent-dark">
                      {m.name.slice(0, 1)}
                    </span>
                  )}
                </div>
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
                <div className="flex items-center gap-2">
                  <Link
                    href={`/operator/museums/${m.id}`}
                    className={btn('secondary', 'text-xs')}
                  >
                    管理
                  </Link>
                  <form action={toggleMuseumActiveAction}>
                    <input type="hidden" name="id" value={m.id} />
                    <input
                      type="hidden"
                      name="active"
                      value={(!m.isActive).toString()}
                    />
                    <button
                      type="submit"
                      className={btn(m.isActive ? 'danger' : 'ghost', 'text-xs')}
                    >
                      {m.isActive ? '停止' : '再開'}
                    </button>
                  </form>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
