import { updateMuseumAction } from '@/app/admin/actions';
import MuseumForm from '@/components/MuseumForm';
import { Card, PageTitle } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { getOwnMuseum } from '@/lib/services/admin';

export const metadata = { title: '施設設定' };

export default async function AdminMuseumPage() {
  const session = await requireMuseumAdmin();
  const museum = await getOwnMuseum(getRepository(), session);

  return (
    <div className="space-y-5">
      <PageTitle title="施設設定" subtitle="来館者向けに表示される施設情報を編集します" />
      <Card className="p-5">
        <MuseumForm
          action={updateMuseumAction}
          museum={museum}
          submitLabel="保存する"
          successMessage="施設情報を更新しました"
        />
      </Card>
    </div>
  );
}
