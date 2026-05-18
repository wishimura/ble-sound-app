import { museumTypeLabel } from '@/lib/i18n';
import type { Museum } from '@/lib/repository/types';

/**
 * Hero header used at the top of the museum-scoped visitor pages. Makes the
 * page feel like that museum's dedicated app by surfacing its logo + name.
 */
export default function MuseumHeader({ museum }: { museum: Museum }) {
  return (
    <header className="px-5 pt-6 text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl2 border border-line bg-surface shadow-card">
        {museum.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={museum.logoUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="text-2xl font-semibold text-accent-dark">
            {museum.name.slice(0, 1)}
          </span>
        )}
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-accent-dark">
        {museumTypeLabel[museum.type]}
      </p>
      <h1 className="mt-1 text-xl font-semibold tracking-tight text-ink">
        {museum.name}
      </h1>
      {museum.description ? (
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-ink-soft">
          {museum.description}
        </p>
      ) : null}
    </header>
  );
}
