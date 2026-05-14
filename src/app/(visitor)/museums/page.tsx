import MuseumCard from '@/components/MuseumCard';
import { Alert, PageTitle } from '@/components/ui';
import { getRepository } from '@/lib/repository';
import { listMuseumsForVisitor } from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export default async function MuseumsPage() {
  let museums;
  try {
    museums = await listMuseumsForVisitor(getRepository());
  } catch {
    return (
      <main className="space-y-4 px-5 pt-8">
        <PageTitle title="施設を選択" />
        <Alert>
          施設情報を取得できませんでした。データベースの設定を確認してください。
        </Alert>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-5 pt-8">
      <PageTitle title="施設を選択" subtitle="音声ガイドを利用する施設を選んでください" />
      {museums.length === 0 ? (
        <Alert kind="info">公開中の施設はまだありません。</Alert>
      ) : (
        <ul className="space-y-3">
          {museums.map((museum) => (
            <li key={museum.id}>
              <MuseumCard museum={museum} />
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
