import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import { museumTypeLabel } from '@/lib/i18n';
import type { Museum } from '@/lib/repository/types';

export default function MuseumCard({ museum }: { museum: Museum }) {
  return (
    <Link href={`/m/${museum.id}`} className="block">
      <Card className="flex items-center gap-4 p-4 transition-shadow hover:shadow-card">
        <div className="flex h-14 w-14 flex-none items-center justify-center overflow-hidden rounded-xl bg-accent-soft">
          {museum.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={museum.logoUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-lg font-semibold text-accent-dark">
              {museum.name.slice(0, 1)}
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge tone="muted">{museumTypeLabel[museum.type]}</Badge>
          </div>
          <p className="mt-1 truncate font-medium text-ink">{museum.name}</p>
          {museum.description ? (
            <p className="truncate text-sm text-ink-muted">{museum.description}</p>
          ) : null}
        </div>
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="flex-none text-ink-muted"
        >
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Card>
    </Link>
  );
}
