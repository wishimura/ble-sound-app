import Link from 'next/link';
import { Badge, Card } from '@/components/ui';
import type { Exhibit } from '@/lib/repository/types';

interface Props {
  exhibit: Exhibit;
  editHref: string;
  togglePublishAction: (formData: FormData) => void | Promise<void>;
  /** Operator pages need to pass museumId via hidden input. */
  museumId?: string;
}

/**
 * Compact single-tap row for the admin / operator exhibit list. The card
 * itself is a link to the edit page; a small right-hand button toggles
 * publish without leaving the list.
 */
export default function AdminExhibitRow({
  exhibit,
  editHref,
  togglePublishAction,
  museumId,
}: Props) {
  return (
    <Card className="flex items-stretch overflow-hidden p-0">
      <Link
        href={editHref}
        className="flex min-w-0 flex-1 items-center gap-3 px-3 py-3 transition-colors hover:bg-canvas"
      >
        <div className="flex-none">
          <Badge>No.{exhibit.exhibitNumber}</Badge>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-ink">{exhibit.titleJa}</p>
          <p className="mt-0.5 flex items-center gap-2 text-xs text-ink-muted">
            {exhibit.isPublished ? (
              <span className="text-emerald-700">公開中</span>
            ) : (
              <span>非公開</span>
            )}
            <span>・</span>
            <span>再生 {exhibit.playCount}</span>
          </p>
        </div>
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          className="flex-none text-ink-muted"
        >
          <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </Link>
      <form
        action={togglePublishAction}
        className="flex flex-none items-stretch border-l border-line"
      >
        <input type="hidden" name="id" value={exhibit.id} />
        {museumId ? <input type="hidden" name="museumId" value={museumId} /> : null}
        <input type="hidden" name="publish" value={(!exhibit.isPublished).toString()} />
        <button
          type="submit"
          className="px-3 text-xs text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
          aria-label={exhibit.isPublished ? '非公開にする' : '公開する'}
        >
          {exhibit.isPublished ? '非公開に' : '公開に'}
        </button>
      </form>
    </Card>
  );
}
