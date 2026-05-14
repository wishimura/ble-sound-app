import Link from 'next/link';
import ExhibitForm from '@/components/ExhibitForm';
import { Card, PageTitle } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';

export const metadata = { title: '展示を登録' };

export default async function NewExhibitPage() {
  await requireMuseumAdmin();
  return (
    <div className="space-y-5">
      <div>
        <Link href="/admin/exhibits" className="text-sm text-ink-muted">
          ← 展示一覧へ
        </Link>
        <div className="mt-2">
          <PageTitle title="展示を登録" subtitle="新しい展示の情報を入力してください" />
        </div>
      </div>
      <Card className="p-5">
        <ExhibitForm />
      </Card>
    </div>
  );
}
