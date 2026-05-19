import { Card, btn } from '@/components/ui';
import { renderQrSvg } from '@/lib/qr';

/**
 * Server component that pre-renders a QR for a museum URL and shows the
 * raw URL alongside it. Includes SVG / PNG download links served by
 * /api/qr/[slug]. Used on both /admin/qr and /operator/museums/[id]/qr.
 */
export default async function QRCodePanel({
  url,
  museumName,
  slug,
}: {
  url: string;
  museumName: string;
  slug: string;
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

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <a
          href={`/api/qr/${slug}?format=png`}
          className={btn('primary', 'text-xs')}
          download
        >
          PNG でダウンロード
        </a>
        <a
          href={`/api/qr/${slug}?format=svg`}
          className={btn('ghost', 'text-xs')}
          download
        >
          SVG でダウンロード
        </a>
      </div>

      <p className="mt-4 text-xs text-ink-muted">
        このQRをポスター・展示入口・チラシなどに掲示してください。
        スキャンすると、この施設専用の音声ガイド画面が直接開きます。
        印刷用には PNG、拡大しても劣化しないデータには SVG をご利用ください。
      </p>
    </Card>
  );
}
