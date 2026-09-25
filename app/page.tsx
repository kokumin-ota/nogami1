import CardGenerator from './components/CardGenerator';

export default function Home() {
  return (
    <div className="h-dvh flex flex-col overflow-hidden bg-white">

      {/* ── ヘッダー ── */}
      <header className="shrink-0 border-b border-gray-100 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/photos/logo.png" alt="ロゴ" className="h-8 w-auto" />
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-black text-[#004098] leading-tight truncate tracking-wide">
              野上チルドレン証 ジェネレーター
            </h1>
            {/* タイトル直下の非公式表記 */}
            <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
              ※支援者によるファンコンテンツです
            </p>
          </div>
          {/* 右上の非公式バッジ */}
          <span className="hidden sm:inline-flex shrink-0 items-center text-[10px] text-slate-400 border border-slate-200 rounded px-2 py-0.5 bg-slate-50 whitespace-nowrap">
            非公式
          </span>
        </div>
      </header>

      {/* ── メインコンテンツ（残り全高） ── */}
      <main className="flex-1 overflow-hidden">
        <CardGenerator />
      </main>

      {/* ── フッター ── */}
      <footer className="shrink-0 border-t border-gray-100 bg-white py-1.5 px-4">
        <p className="text-center text-[10px] text-slate-400">
          ※このサイトは支援者が作成したコンテンツです。本人、党本部に見せても何も起こりません
        </p>
      </footer>

    </div>
  );
}
