import QRCode from 'qrcode';
import { getSession } from '@/lib/auth/session';
import { getRequestOrigin } from '@/lib/origin';
import { getRepository } from '@/lib/repository';

export const runtime = 'nodejs';

/**
 * Serves a QR code as a downloadable file (SVG by default, PNG with
 * `?format=png`). Auth-gated so only admin / operator users can pull QRs.
 */
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const session = await getSession();
  if (!session) {
    return new Response('Unauthorized', { status: 401 });
  }

  const { slug } = await params;
  const museum = await getRepository().getMuseumBySlug(slug);
  if (!museum) {
    return new Response('Not Found', { status: 404 });
  }

  // For museum admins, only their own museum's QR is downloadable.
  if (session.role === 'museum_admin' && session.museumId !== museum.id) {
    return new Response('Forbidden', { status: 403 });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get('format') === 'png' ? 'png' : 'svg';
  const origin = await getRequestOrigin();
  const target = `${origin}/${museum.slug}`;
  const filename = `${museum.slug}-qr.${format}`;
  const headers = {
    'content-disposition': `attachment; filename="${filename}"`,
    'cache-control': 'no-store',
  };

  if (format === 'png') {
    const buf = await QRCode.toBuffer(target, {
      type: 'png',
      errorCorrectionLevel: 'M',
      margin: 2,
      width: 1024,
      color: { dark: '#22201c', light: '#ffffff' },
    });
    return new Response(new Uint8Array(buf), {
      headers: { ...headers, 'content-type': 'image/png' },
    });
  }

  const svg = await QRCode.toString(target, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 2,
    width: 1024,
    color: { dark: '#22201c', light: '#ffffff' },
  });
  return new Response(svg, {
    headers: { ...headers, 'content-type': 'image/svg+xml' },
  });
}
