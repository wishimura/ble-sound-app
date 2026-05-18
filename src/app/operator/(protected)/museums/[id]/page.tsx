import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, Card, PageTitle, Stat, btn } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';
import { summarizeExhibits } from '@/lib/analytics';
import { isAppError } from '@/lib/errors';
import { museumTypeLabel } from '@/lib/i18n';
import { getRepository } from '@/lib/repository';
import {
  getMuseumForOperator,
  listExhibitsForOperator,
} from '@/lib/services/operator-content';

export default async function OperatorMuseumOverviewPage({
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
  const stats = summarizeExhibits(exhibits);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/operator" className="text-sm text-ink-muted">
          ← 施設一覧へ
        </Link>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <PageTitle
            title={museum.name}
            subtitle={`${museumTypeLabel[museum.type]}${museum.isActive ? '' : ' / 停止中'}`}
          />
          <Badge tone={museum.isActive ? 'success' : 'muted'}>
            {museum.isActive ? '稼働中' : '停止中'}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="展示総数" value={stats.total} />
        <Stat label="公開中" value={stats.published} />
        <Stat label="非公開" value={stats.unpublished} />
        <Stat label="累計再生数" value={stats.totalPlays} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ActionCard
          title="展示を管理"
          description="この施設の展示を追加・編集・公開切替します"
          href={`/operator/museums/${museum.id}/exhibits`}
          cta="展示一覧へ"
        />
        <ActionCard
          title="CSV で一括登録"
          description="番号・タイトル・解説をまとめて登録します（音声/画像は手動）"
          href={`/operator/museums/${museum.id}/import`}
          cta="CSVインポート"
        />
        <ActionCard
          title="QRコード"
          description="この施設専用のQR。来館者はスキャンで施設専用画面を開きます"
          href={`/operator/museums/${museum.id}/qr`}
          cta="QRを表示"
        />
      </div>
    </div>
  );
}

function ActionCard({
  title,
  description,
  href,
  cta,
}: {
  title: string;
  description: string;
  href: string;
  cta: string;
}) {
  return (
    <Card className="flex flex-col gap-3 p-5">
      <div>
        <p className="font-semibold text-ink">{title}</p>
        <p className="mt-1 text-sm text-ink-muted">{description}</p>
      </div>
      <Link href={href} className={btn('secondary', 'self-start')}>
        {cta}
      </Link>
    </Card>
  );
}
