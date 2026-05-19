import { redirect } from 'next/navigation';
import AdminNav from '@/components/AdminNav';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRepository } from '@/lib/repository';
import { getOwnMuseum } from '@/lib/services/admin';

export default async function AdminProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let museumName = '事業者管理画面';
  try {
    const session = await requireMuseumAdmin();
    const museum = await getOwnMuseum(getRepository(), session);
    museumName = museum.name;
  } catch {
    redirect('/admin/login');
  }

  return (
    <div className="min-h-screen bg-canvas">
      <AdminNav museumName={museumName} />
      <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
    </div>
  );
}
