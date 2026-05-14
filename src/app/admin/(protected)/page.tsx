import Link from 'next/link';
import { Badge, Card, PageTitle, Stat, btn } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { getAdminDashboard } from '@/lib/services/admin';

export default async function AdminDashboardPage() {
  const session = await requireMuseumAdmin();
  const { museum, stats, topExhibits } = await getAdminDashboard(
    getRepository(),
    session,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ダッシュボード" subtitle={museum.name} />
        <Link href="/admin/exhibits/new" className={btn('primary')}>
          ＋ 展示を登録
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="展示総数" value={stats.total} />
        <Stat label="公開中" value={stats.published} />
        <Stat label="非公開" value={stats.unpublished} />
        <Stat label="累計再生数" value={stats.totalPlays} />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-ink">人気の展示</h2>
          <Link href="/admin/exhibits" className="text-sm text-accent-dark">
            展示一覧へ →
          </Link>
        </div>
        {topExhibits.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">まだ展示が登録されていません。</p>
        ) : (
          <ol className="mt-4 space-y-2">
            {topExhibits.map((e, i) => (
              <li
                key={e.id}
                className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5"
              >
                <span className="w-5 text-center text-sm font-semibold text-ink-muted">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">
                    {e.titleJa}
                  </span>
                  <span className="text-xs text-ink-muted">No.{e.exhibitNumber}</span>
                </span>
                {e.isPublished ? (
                  <Badge tone="success">公開</Badge>
                ) : (
                  <Badge tone="muted">非公開</Badge>
                )}
                <span className="text-sm font-semibold text-ink">{e.playCount}</span>
              </li>
            ))}
          </ol>
        )}
      </Card>
    </div>
  );
}
