import { redirect } from 'next/navigation';
import OperatorNav from '@/components/OperatorNav';
import { requireOperator } from '@/lib/auth/session';

export default async function OperatorProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  try {
    await requireOperator();
  } catch {
    redirect('/operator/login');
  }

  return (
    <div className="min-h-screen bg-canvas">
      <OperatorNav />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
