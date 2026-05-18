import Link from 'next/link';
import Image from 'next/image';
import { Badge, Card } from '@/components/ui';
import type { Exhibit } from '@/lib/repository/types';

interface Props {
  museumId: string;
  exhibits: Pick<Exhibit, 'id' | 'exhibitNumber' | 'titleJa' | 'imageUrl'>[];
}

/**
 * Visitor-facing grid of all published exhibits for a museum. Replaces the
 * old number-keypad flow — visitors browse and tap an exhibit directly.
 */
export default function ExhibitGrid({ museumId, exhibits }: Props) {
  if (exhibits.length === 0) {
    return (
      <Card className="p-8 text-center text-sm text-ink-muted">
        公開中の展示はまだありません。
      </Card>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {exhibits.map((e) => (
        <li key={e.id}>
          <Link
            href={`/m/${museumId}/e/${encodeURIComponent(e.exhibitNumber)}`}
            className="group block"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl border border-line bg-canvas">
              {e.imageUrl ? (
                <Image
                  src={e.imageUrl}
                  alt={e.titleJa}
                  fill
                  sizes="(max-width: 640px) 50vw, 200px"
                  className="object-cover transition-transform group-hover:scale-105"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-accent-soft text-3xl font-semibold text-accent-dark">
                  {e.titleJa.slice(0, 1)}
                </div>
              )}
              <span className="absolute left-2 top-2">
                <Badge>No.{e.exhibitNumber}</Badge>
              </span>
            </div>
            <p className="mt-1.5 truncate text-sm font-medium text-ink">{e.titleJa}</p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
