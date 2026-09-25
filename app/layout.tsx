import type { Metadata } from 'next';
import { Noto_Sans_JP, Bebas_Neue } from 'next/font/google';
import './globals.css';

const bebasNeue = Bebas_Neue({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-bebas',
});

const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: '野上チルドレン証 ジェネレーター',
  description:
    '大田区政策委員・野上だいきのコミュニティ「チルドレン証」を作成・シェアできるツールです。',
  openGraph: {
    title: '野上チルドレン証 ジェネレーター',
    description: 'オリジナルのチルドレン証を作ってXでシェアしよう！',
    locale: 'ja_JP',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja" className={`${notoSansJP.className} ${bebasNeue.variable}`}>
      <body className="bg-white text-gray-900 antialiased">{children}</body>
    </html>
  );
}
