'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  {
    href: '/',
    label: 'ホーム',
    match: (p: string) => p === '/',
    icon: (
      <path d="M3 10.5 12 3l9 7.5M5 9.5V21h14V9.5" strokeLinecap="round" strokeLinejoin="round" />
    ),
  },
  {
    href: '/museums',
    label: '施設',
    match: (p: string) => p === '/museums' || p.startsWith('/m/'),
    icon: (
      <path
        d="M3 21h18M5 21V9l7-5 7 5v12M9 21v-6h6v6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
  {
    href: '/favorites',
    label: 'お気に入り',
    match: (p: string) => p === '/favorites',
    icon: (
      <path
        d="M12 20s-7-4.35-9.5-8.5C1 8 3 4.5 6.5 4.5 9 4.5 12 7 12 7s3-2.5 5.5-2.5C21 4.5 23 8 21.5 11.5 19 15.65 12 20 12 20Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ),
  },
];

export default function BottomNav() {
  const pathname = usePathname();
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
