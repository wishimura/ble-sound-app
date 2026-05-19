import QRCodePanel from '@/components/QRCodePanel';
import { PageTitle } from '@/components/ui';
import { requireMuseumAdmin } from '@/lib/auth/session';
import { getRequestOrigin } from '@/lib/origin';
import { getRepository } from '@/lib/repository';
import { getOwnMuseum } from '@/lib/services/admin';

export const metadata = { title: 'QRコード' };

export default async function AdminQRPage() {
  const session = await requireMuseumAdmin();
  const museum = await getOwnMuseum(getRepository(), session);
  const origin = await getRequestOrigin();
  const url = `${origin}/${museum.slug}`;

  return (
    <div className="mx-auto max-w-md space-y-5">
      <PageTitle title="QRコード" subtitle="この施設専用のQRコードです" />
      <QRCodePanel url={url} museumName={museum.name} slug={museum.slug} />
    </div>
  );
}
