import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Museum Audio Guide',
  description:
    '美術館・水族館向けの番号入力式 音声ガイド Web アプリ。番号を入力して展示の解説と音声を楽しめます。',
};

export const viewport: Viewport = {
  themeColor: '#f7f5f0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
