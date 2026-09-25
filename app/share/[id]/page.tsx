import { Metadata } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import { getBaseUrl } from '../../../lib/siteUrl';

interface Props {
  params: Promise<{ id: string }>;
}

function getStorageDir(): string {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return isServerless
    ? path.join('/tmp', '.og-cards')
    : path.join(process.cwd(), '.og-cards');
}

function getCardMeta(id: string) {
  try {
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
    const metaPath = path.join(getStorageDir(), `${sanitizedId}.json`);
    if (fs.existsSync(metaPath)) {
      return JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
    }
  } catch (_) {}
  return null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const meta = getCardMeta(id);
  const isRare = meta?.isRare ?? id.startsWith('FY-');
  const cardNo = meta?.cardNo ?? '0000';
  const name = meta?.name ? `（${meta.name}さん）` : '';

  const title = isRare
    ? `【レア】福井チルドレン証 No.${cardNo} ${name}`
    : `野上チルドレン証 No.${cardNo} ${name}`;

  const description = isRare
    ? `福井ゆうたチルドレン証（レアカード）が発行されました！あなたも自分だけのチルドレン証を作成しよう！`
    : `野上だいきチルドレン証が発行されました！あなたも自分だけのチルドレン証を作成しよう！`;

  const baseUrl = getBaseUrl();
  const imageUrl = `${baseUrl}/api/card-image/${id}`;

  return {
    title: `${title} | 野上チルドレン証ジェネレーター`,
    description,
    openGraph: {
      title,
      description,
      url: `${baseUrl}/share/${id}`,
      siteName: '野上チルドレン証 ジェネレーター',
      images: [
        {
          url: imageUrl,
          width: 1012,
          height: 638,
          alt: title,
        },
      ],
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function SharePage({ params }: Props) {
  const { id } = await params;
  const meta = getCardMeta(id);
  const isRare = meta?.isRare ?? id.startsWith('FY-');
  const cardNo = meta?.cardNo ?? '0000';

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="max-w-xl w-full flex flex-col items-center gap-6">

        {/* ヘッダー情報 */}
        <div className="text-center">
          <span className="text-[11px] font-bold text-slate-400 bg-white border border-slate-200 px-3 py-1 rounded-full shadow-sm">
            非公式ファンコンテンツ
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-[#004098] mt-3">
            {isRare ? '【レア】福井チルドレン証' : '野上チルドレン証'}
          </h1>
          <p className="text-sm text-slate-600 font-bold mt-1">
            No.{cardNo}
          </p>
        </div>

        {/* カード画像表示 */}
        <div className="w-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/api/card-image/${id}`}
            alt="チルドレン証"
            className="w-full h-auto block"
          />
        </div>

        {/* アクションボタン */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <Link
            href="/"
            className="flex-1 bg-[#FAEC00] hover:bg-yellow-300 text-[#004098] font-black text-center py-4 rounded-xl transition-all border-2 border-[#004098] shadow-md flex items-center justify-center text-sm sm:text-base active:scale-[0.98]"
          >
            自分もチルドレン証を作る！ 🐰
          </Link>
          <a
            href={`/api/card-image/${id}`}
            download={`children_card_no${cardNo}.png`}
            className="bg-[#004098] hover:bg-blue-900 text-white font-bold text-center px-6 py-4 rounded-xl transition-all shadow-md flex items-center justify-center text-sm active:scale-[0.98]"
          >
            画像を保存
          </a>
        </div>

        {/* 注記 */}
        <p className="text-center text-[10px] text-slate-400 leading-relaxed max-w-md">
          ※このサイトは支援者が作成したコンテンツです。本人、党本部に見せても何も起こりません
        </p>

      </div>
    </div>
  );
}
