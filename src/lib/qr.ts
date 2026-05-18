import QRCode from 'qrcode';

/** Returns an inline SVG markup string of the given URL as a QR code. */
export function renderQrSvg(url: string, size = 240): Promise<string> {
  return QRCode.toString(url, {
    type: 'svg',
    errorCorrectionLevel: 'M',
    margin: 1,
    width: size,
    color: { dark: '#22201c', light: '#ffffff' },
  });
}
