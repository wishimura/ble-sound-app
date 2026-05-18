import Link from 'next/link';
import { notFound } from 'next/navigation';
import { operatorTogglePublishAction } from '@/app/operator/(protected)/museums/[id]/actions';
import { Badge, Card, PageTitle, btn } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  getMuseumForOperator,
  listExhibitsForOperator,
} from '@/lib/services/operator-content';

export default async function OperatorMuseumExhibitsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireOperator();
  const { id } = await params;
  const repo = getRepository();

  let museum;
  try {
    museum = await getMuseumForOperator(repo, id);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }
  const exhibits = await listExhibitsForOperator(repo, id);

  return (
    <div className="space-y-5">
      <div>
        <Link href={`/operator/museums/${museum.id}`} className="text-sm text-ink-muted">
          ← {museum.name}
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <PageTitle title="展示一覧" subtitle={`登録数: ${exhibits.length}`} />
          <div className="flex gap-2">
            <Link href={`/operator/museums/${museum.id}/import`} className={btn('ghost')}>
              CSVインポート
            </Link>
            <Link
              href={`/operator/museums/${museum.id}/exhibits/new`}
              className={btn('primary')}
            >
              ＋ 展示を登録
            </Link>
          </div>
        </div>
      </div>

      {exhibits.length === 0 ? (
        <Card className="p-8 text-center text-sm text-ink-muted">
          まだ展示がありません。
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
                  <form action={operatorTogglePublishAction}>
                    <input type="hidden" name="museumId" value={museum.id} />
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
                    href={`/operator/museums/${museum.id}/exhibits/${e.id}/edit`}
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
