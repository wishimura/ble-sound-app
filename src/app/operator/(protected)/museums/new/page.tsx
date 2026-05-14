import Link from 'next/link';
import { createMuseumAction } from '@/app/operator/actions';
import MuseumForm from '@/components/MuseumForm';
import { Card, PageTitle } from '@/components/ui';
import { requireOperator } from '@/lib/auth/session';

export const metadata = { title: '施設を追加' };

export default async function NewMuseumPage() {
  await requireOperator();
  return (
    <div className="space-y-5">
      <div>
        <Link href="/operator" className="text-sm text-ink-muted">
          ← 施設一覧へ
        </Link>
        <div className="mt-2">
          <PageTitle title="施設を追加" subtitle="新しい施設を登録します" />
        </div>
      </div>
      <Card className="p-5">
        <MuseumForm action={createMuseumAction} submitLabel="施設を作成" />
      </Card>
    </div>
  );
}
