import { redirect } from 'next/navigation';
import LogoutButton from '@/components/LogoutButton';
import PasswordChangeForm from '@/components/PasswordChangeForm';
import { Card } from '@/components/ui';
import { getSession } from '@/lib/auth/session';

export const metadata = { title: 'パスワード変更' };

export default async function AdminPasswordPage() {
  const session = await getSession();
  if (!session || session.role !== 'museum_admin') redirect('/admin/login');

  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-5 py-10">
      <div className="mb-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent-dark">
          Museum Audio Guide
        </p>
        <h1 className="mt-2 text-xl font-semibold text-ink">パスワード変更</h1>
        <p className="mt-1 text-sm text-ink-muted">{session.email}</p>
      </div>
      <Card className="p-6">
        <PasswordChangeForm forced={session.mustChangePassword} />
      </Card>
      <div className="mt-4 flex justify-center">
        <LogoutButton />
      </div>
    </main>
  );
}
