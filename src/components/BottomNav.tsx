'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface Item {
  href: string;
  label: string;
  icon: ReactNode;
  match: (pathname: string) => boolean;
}

const ICONS = {
  home: (
    <path
      d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  grid: (
    <path
      d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  museums: (
    <path
      d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
  heart: (
    <path
      d="M12 20s-7-4.35-9.5-8.5C1 8 3 4.5 6.5 4.5 9 4.5 12 7 12 7s3-2.5 5.5-2.5C21 4.5 23 8 21.5 11.5 19 15.65 12 20 12 20Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
} as const;

// Keep in sync with RESERVED_SLUGS in src/lib/validation.ts. The BottomNav
// runs on the client without server data, so it needs its own copy.
const RESERVED_FIRST_SEGMENTS = new Set([
  'admin',
  'api',
  'operator',
  'm',
  '_next',
  'samples',
  'favorites',
  'museums',
]);

function museumItems(prefix: string): Item[] {
  return [
    {
      href: prefix,
      label: '展示一覧',
      icon: ICONS.grid,
      match: (p) => p === prefix || p.startsWith(`${prefix}/e/`),
    },
    {
      href: `${prefix}/favorites`,
      label: 'お気に入り',
      icon: ICONS.heart,
      match: (p) => p === `${prefix}/favorites`,
    },
  ];
}

export default function BottomNav() {
  const pathname = usePathname();

  // Match either the legacy /m/[id] or the new /[slug] visitor pages.
  let prefix: string | null = null;
  const legacy = pathname.match(/^\/m\/([^/]+)/);
  if (legacy) {
    prefix = `/m/${legacy[1]}`;
  } else {
    const first = pathname.split('/').filter(Boolean)[0];
    if (first && !RESERVED_FIRST_SEGMENTS.has(first)) {
      prefix = `/${first}`;
    }
  }

  if (!prefix) return null;
  const items = museumItems(prefix);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur">
      <ul className="mx-auto flex max-w-md">
        {items.map((item) => {
          const active = item.match(pathname);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                className={`flex flex-col items-center gap-1 py-2.5 text-xs ${
                  active ? 'text-accent-dark' : 'text-ink-muted'
                }`}
              >
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={active ? 2 : 1.6}
                >
                  {item.icon}
                </svg>
                <span className={active ? 'font-medium' : ''}>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
