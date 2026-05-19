import Link from 'next/link';
import { notFound } from 'next/navigation';
import ExhibitView from '@/components/ExhibitView';
import { Card, btn } from '@/components/ui';
import { isAppError } from '@/lib/errors';
import { getRepository } from '@/lib/repository';
import {
  findExhibitByNumber,
  getMuseumBySlugForVisitor,
} from '@/lib/services/visitor';

export const dynamic = 'force-dynamic';

export default async function ExhibitDetailBySlug({
  params,
}: {
  params: Promise<{ slug: string; number: string }>;
}) {
  const { slug, number } = await params;
  const exhibitNumber = decodeURIComponent(number);
  const repo = getRepository();

  let museum;
  try {
    museum = await getMuseumBySlugForVisitor(repo, slug);
  } catch (e) {
    if (isAppError(e) && e.code === 'NOT_FOUND') notFound();
    throw e;
  }

  const exhibit = await findExhibitByNumber(repo, museum.id, exhibitNumber);

  if (!exhibit) {
    return (
      <main className="px-5 pt-8">
        <Card className="space-y-4 p-8 text-center">
          <p className="text-3xl">🔍</p>
          <p className="font-medium text-ink">
            No.{exhibitNumber} の展示は見つかりませんでした
          </p>
          <p className="text-sm text-ink-muted">
            番号をご確認のうえ、もう一度お試しください
          </p>
          <Link href={`/${museum.slug}`} className={btn('primary', 'w-full')}>
            展示一覧に戻る
          </Link>
        </Card>
      </main>
    );
  }

  return (
    <main className="space-y-4 px-5 pt-8">
      <Link href={`/${museum.slug}`} className="text-sm text-ink-muted">
        ← {museum.name}
      </Link>
      <ExhibitView
        exhibit={exhibit}
        museumName={museum.name}
        museumId={museum.id}
        museumSlug={museum.slug}
      />
    </main>
  );
}
