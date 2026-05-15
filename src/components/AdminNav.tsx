'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { href: '/admin', label: 'ダッシュボード', exact: true },
  { href: '/admin/exhibits', label: '展示一覧', exact: false },
  { href: '/admin/museum', label: '施設設定', exact: false },
  { href: '/admin/password', label: 'パスワード', exact: false },
];

export default function AdminNav({ museumName }: { museumName: string }) {
  const pathname = usePathname();
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-accent-dark">美術館管理</p>
            <p className="truncate font-semibold text-ink">{museumName}</p>
          </div>
          <LogoutButton />
        </div>
        <nav className="mt-3 flex gap-1 overflow-x-auto">
          {links.map((link) => {
            const active = link.exact
              ? pathname === link.href
              : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`whitespace-nowrap rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                  active
                    ? 'bg-ink text-canvas'
                    : 'text-ink-muted hover:bg-canvas hover:text-ink'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
