import { Card } from '@/components/ui';
import { renderQrSvg } from '@/lib/qr';

/**
 * Server component that pre-renders a QR for a museum URL and shows the
 * raw URL alongside it. Use it on both /admin/qr and /operator/museums/[id]/qr.
 */
export default async function QRCodePanel({
  url,
  museumName,
}: {
  url: string;
  museumName: string;
}) {
  const svg = await renderQrSvg(url, 280);

  return (
    <Card className="p-6 text-center">
      <p className="text-sm text-ink-muted">{museumName}</p>
      <p className="mt-1 text-xs text-ink-muted">来館者用QRコード</p>
      <div
        className="mx-auto mt-4 inline-block rounded-xl border border-line bg-white p-3"
        // QR generation is fully controlled (no user input) — safe to inline.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <p className="mt-4 break-all text-xs text-ink-muted">{url}</p>
      <p className="mt-4 text-xs text-ink-muted">
        このQRをポスター・展示入口・チラシなどに掲示してください。
        スキャンすると、この施設専用の音声ガイド画面が直接開きます。
      </p>
    </Card>
  );
}
