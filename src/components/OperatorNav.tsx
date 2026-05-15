'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';

const links = [
  { href: '/operator', label: '施設一覧', exact: true },
  { href: '/operator/admins', label: '事業者管理', exact: false },
  { href: '/operator/analytics', label: '全体分析', exact: false },
  { href: '/operator/password', label: 'パスワード', exact: false },
];

export default function OperatorNav() {
  const pathname = usePathname();
  return (
    <header className="border-b border-line bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-accent-dark">運営管理</p>
            <p className="font-semibold text-ink">サービス運営コンソール</p>
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
