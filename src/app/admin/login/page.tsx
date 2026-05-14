import { redirect } from 'next/navigation';
import LoginForm from '@/components/LoginForm';
import { Card } from '@/components/ui';
import { getSession } from '@/lib/auth/session';

export const metadata = { title: '美術館管理ログイン' };

export default async function AdminLoginPage() {
  const session = await getSession();
  if (session?.role === 'museum_admin') redirect('/admin');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-dark">
          Museum Audio Guide
        </p>
        <h1 className="mt-2 text-xl font-semibold text-ink">美術館管理ログイン</h1>
        <p className="mt-1 text-sm text-ink-muted">
          施設に発行された管理者アカウントでログインしてください
        </p>
      </div>
      <Card className="p-6">
        <LoginForm role="museum_admin" />
      </Card>
    </main>
  );
}
