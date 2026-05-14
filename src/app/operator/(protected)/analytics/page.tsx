import { Badge, Card, PageTitle, Stat } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { getGlobalAnalytics } from '@/lib/services/operator';

export const metadata = { title: '全体分析' };

export default async function OperatorAnalyticsPage() {
  await requireOperator();
  const { museumCount, activeMuseumCount, stats, topExhibits } =
    await getGlobalAnalytics(getRepository());

  return (
    <div className="space-y-6">
      <PageTitle title="全体分析" subtitle="サービス全体の利用状況" />

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="施設数" value={museumCount} />
        <Stat label="稼働中施設" value={activeMuseumCount} />
        <Stat label="公開展示数" value={stats.published} />
        <Stat label="累計再生数" value={stats.totalPlays} />
      </div>

      <Card className="p-5">
        <h2 className="font-semibold text-ink">人気展示ランキング（全施設）</h2>
        {topExhibits.length === 0 ? (
          <p className="mt-4 text-sm text-ink-muted">再生データがまだありません。</p>
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
                  <span className="text-xs text-ink-muted">
                    {e.museumName} ・ No.{e.exhibitNumber}
                  </span>
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
