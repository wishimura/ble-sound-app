import Link from 'next/link';
import { PageTitle, Stat, btn } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { getAdminDashboard } from '@/lib/services/admin';

export default async function AdminDashboardPage() {
  const session = await requireMuseumAdmin();
  const { museum, stats } = await getAdminDashboard(getRepository(), session);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageTitle title="ダッシュボード" subtitle={museum.name} />
        <Link href="/admin/exhibits/new" className={btn('primary')}>
          ＋ 展示を登録
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <Stat label="展示総数" value={stats.total} />
        <Stat label="公開中" value={stats.published} />
        <Stat label="非公開" value={stats.unpublished} />
      </div>
    </div>
  );
}
