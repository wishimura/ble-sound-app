import Link from 'next/link';
import ExhibitView from '@/components/ExhibitView';
import { Card, btn } from '@/components/ui';
import { getRepository } from '@/lib/repository';
import { findExhibitByNumber, getMuseumForVisitor } from '@/lib/services/visitor';
import { isAppError } from '@/lib/errors';

export const dynamic = 'force-dynamic';

export default async function ExhibitDetailPage({
  params,
}: {
  params: Promise<{ museumId: string; number: string }>;
}) {
  const { museumId, number } = await params;
  const exhibitNumber = decodeURIComponent(number);
  const repo = getRepository();

  let museum;
  try {
    museum = await getMuseumForVisitor(repo, museumId);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') {
      return <NotFoundCard museumId={museumId} number={exhibitNumber} title="施設が見つかりません" />;
    }
    throw e;
  }

  const exhibit = await findExhibitByNumber(repo, museumId, exhibitNumber);

  if (!exhibit) {
    return (
      <NotFoundCard
        museumId={museumId}
        number={exhibitNumber}
        title={`No.${exhibitNumber} の展示は見つかりませんでした`}
      />
    );
  }

  return (
    <main className="space-y-4 px-5 pt-8">
      <Link href={`/m/${museumId}`} className="text-sm text-ink-muted">
        ← {museum.name}
      </Link>
      <ExhibitView exhibit={exhibit} museumName={museum.name} museumId={museumId} />
    </main>
  );
}

function NotFoundCard({
  museumId,
  number,
  title,
}: {
  museumId: string;
  number: string;
  title: string;
}) {
  return (
    <main className="px-5 pt-8">
      <Card className="space-y-4 p-8 text-center">
        <p className="text-3xl">🔍</p>
        <p className="font-medium text-ink">{title}</p>
        <p className="text-sm text-ink-muted">
          番号をご確認のうえ、もう一度お試しください（入力: {number}）
        </p>
        <Link href={`/m/${museumId}`} className={btn('primary', 'w-full')}>
          番号を入力し直す
        </Link>
      </Card>
    </main>
  );
}
