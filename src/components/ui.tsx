import type { ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';

/** Shared button class helper — used on both <button> and <Link>. */
export function btn(variant: Variant = 'primary', extra = ''): string {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/60';
  const styles: Record<Variant, string> = {
    primary: 'bg-ink text-canvas hover:bg-ink-soft',
    secondary: 'bg-accent text-white hover:bg-accent-dark',
    ghost: 'border border-line bg-surface text-ink hover:bg-canvas',
    danger: 'border border-red-200 bg-white text-red-700 hover:bg-red-50',
  };
  return `${base} ${styles[variant]} ${extra}`.trim();
}

export const inputClass =
  'w-full rounded-xl border border-line bg-surface px-4 py-2.5 text-ink placeholder:text-ink-muted focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30';

export function Card({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`rounded-xl2 border border-line bg-surface shadow-card ${className}`}>
      {children}
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label htmlFor={htmlFor} className="block space-y-1.5">
      <span className="text-sm font-medium text-ink-soft">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-ink-muted">{hint}</span> : null}
    </label>
  );
}

export function Alert({
  kind = 'error',
  children,
}: {
  kind?: 'error' | 'success' | 'info';
  children: ReactNode;
}) {
  const styles: Record<string, string> = {
    error: 'border-red-200 bg-red-50 text-red-700',
    success: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    info: 'border-line bg-canvas text-ink-soft',
  };
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${styles[kind]}`} role="alert">
      {children}
    </div>
  );
}

export function PageTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{title}</h1>
      {subtitle ? <p className="text-sm text-ink-muted">{subtitle}</p> : null}
    </header>
  );
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
    </Card>
  );
}

export function Badge({
  children,
  tone = 'neutral',
}: {
  children: ReactNode;
  tone?: 'neutral' | 'success' | 'muted';
}) {
  const styles: Record<string, string> = {
    neutral: 'bg-accent-soft text-accent-dark',
    success: 'bg-emerald-100 text-emerald-700',
    muted: 'bg-canvas text-ink-muted',
  };
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles[tone]}`}
    >
      {children}
    </span>
  );
}
