'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
import { drawCard, DrawOptions } from '../../lib/drawCard';
import { CardConfig, drawPattern, PhotoKey, NOGAMI_PHOTOS } from '../../lib/types';
import { getBaseUrl } from '../../lib/siteUrl';

// ─── 定数 ────────────────────────────────────────────────────────────

/** 看板を持つうさぎ（25, 26, 27）を除外した有効インデックス */
const VALID_USAGI_INDICES: number[] = [
  ...Array.from({ length: 24 }, (_, i) => i + 1),
  28, 29, 30, 31, 32,
];

const SOUND_PATH = '/sounds/decision48.mp3';

// ─── ユーティリティ ──────────────────────────────────────────────────

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}


// ─── カスタムフック ──────────────────────────────────────────────────

/** 効果音フック */
function useDecisionSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    try {
      audioRef.current = new Audio(SOUND_PATH);
      audioRef.current.load();
    } catch (_) {}
  }, []);

  const play = useCallback(() => {
    try {
      if (!audioRef.current) audioRef.current = new Audio(SOUND_PATH);
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(() => {});
    } catch (e) {
      console.error(e);
    }
  }, []);

  return play;
}

/** 画像リソースロードフック */
function useImageResources() {
  const photosRef = useRef<Record<PhotoKey, HTMLImageElement> | null>(null);
  const qrCodesRef = useRef<{ nogami: HTMLImageElement; fukui: HTMLImageElement } | null>(null);
  const usagiMapRef = useRef<Record<number, HTMLImageElement>>({});
  const logoImgRef = useRef<HTMLImageElement | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const photoKeys: PhotoKey[] = ['nogami', 'nogami2', 'nogami3', 'nogami4', 'nogami5', 'fukui'];
    const photoPromises = photoKeys.map((key) =>
      loadImage(`/photos/${key}${key === 'fukui' ? '.jpg' : '.png'}`)
    );

    const usagiPromises = VALID_USAGI_INDICES.map((idx) =>
      loadImage(`/photos/usagi/usagi_${idx}.png`)
        .then((img) => ({ idx, img }))
        .catch(() => null)
    );

    Promise.all([
      Promise.all(photoPromises),
      loadImage('/photos/nogamiQR.png'),
      loadImage('/photos/fukuiQR.png'),
      loadImage('/photos/logo.png'),
      Promise.all(usagiPromises),
      document.fonts.ready,
    ])
      .then(([photoImgs, nogamiQR, fukuiQR, logo, usagiLoaded]) => {
        photosRef.current = Object.fromEntries(
          photoKeys.map((key, i) => [key, photoImgs[i]])
        ) as Record<PhotoKey, HTMLImageElement>;

        qrCodesRef.current = {
          nogami: nogamiQR as HTMLImageElement,
          fukui: fukuiQR as HTMLImageElement,
        };

        logoImgRef.current = logo as HTMLImageElement;

        const usagiMap: Record<number, HTMLImageElement> = {};
        (usagiLoaded as ({ idx: number; img: HTMLImageElement } | null)[]).forEach((item) => {
          if (item) usagiMap[item.idx] = item.img;
        });
        usagiMapRef.current = usagiMap;

        setLoaded(true);
      })
      .catch((e) => console.error('リソースロードエラー', e));
  }, []);

  return { photosRef, qrCodesRef, usagiMapRef, logoImgRef, loaded };
}

// ─── Member No. 取得 ─────────────────────────────────────────────────

async function fetchNextCardNo(): Promise<string> {
  const res = await fetch('/api/issue-no', { method: 'POST' });
  const data = await res.json();
  return (data.no as string) ?? '0001';
}

// ─── メインコンポーネント ─────────────────────────────────────────────

export default function CardGenerator() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [cardNo, setCardNo] = useState('0001');
  const [config, setConfig] = useState<CardConfig | null>(null);
  const [usagiIndex, setUsagiIndex] = useState(VALID_USAGI_INDICES[0]);
  const [isLoading, setIsLoading] = useState(false);

  const playSound = useDecisionSound();
  const { photosRef, qrCodesRef, usagiMapRef, logoImgRef, loaded } = useImageResources();

  // 初期化
  useEffect(() => {
    setConfig(drawPattern());
    setUsagiIndex(randomFrom(VALID_USAGI_INDICES));
    fetchNextCardNo().then(setCardNo).catch(console.error);
  }, []);

  // Canvas 再描画
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !config || !photosRef.current || !qrCodesRef.current) return;
    const usagiImg =
      usagiMapRef.current[usagiIndex] ??
      usagiMapRef.current[VALID_USAGI_INDICES[0]] ??
      (logoImgRef.current as HTMLImageElement);
    const opts: DrawOptions = {
      name, bio, cardNo, config,
      photos: photosRef.current,
      qrCodes: qrCodesRef.current,
      usagiImg,
      logoImg: logoImgRef.current ?? usagiImg,
    };
    drawCard(canvas, opts);
  }, [name, bio, cardNo, config, usagiIndex, photosRef, qrCodesRef, usagiMapRef, logoImgRef]);

  useEffect(() => {
    if (loaded) redraw();
  }, [loaded, redraw]);

  // ── ハンドラ ──

  // 再生成（クリックで音を鳴らし、0ミリ秒で即座に新しいカードへ同期描画！）
  const handleRedraw = () => {
    playSound();

    // 1. 次の番号、デザイン、うさぎを即座に計算
    const current = parseInt(cardNo, 10);
    const nextNo = String(isNaN(current) ? 1 : current + 1).padStart(4, '0');
    const nextConfig = drawPattern(config?.pattern, config?.photoKey);
    const candidateUsagi = VALID_USAGI_INDICES.filter((i) => i !== usagiIndex);
    const nextUsagi = candidateUsagi.length > 0
      ? candidateUsagi[Math.floor(Math.random() * candidateUsagi.length)]
      : VALID_USAGI_INDICES[0];

    // 2. React ステート更新
    setCardNo(nextNo);
    setConfig(nextConfig);
    setUsagiIndex(nextUsagi);

    // 3. 【超高速】ReactのuseEffectや再レンダリングを待たず、Canvasへ今すぐ同期描画！
    const canvas = canvasRef.current;
    if (canvas && photosRef.current && qrCodesRef.current) {
      const usagiImg =
        usagiMapRef.current[nextUsagi] ??
        usagiMapRef.current[VALID_USAGI_INDICES[0]] ??
        (logoImgRef.current as HTMLImageElement);

      drawCard(canvas, {
        name,
        bio,
        cardNo: nextNo,
        config: nextConfig,
        photos: photosRef.current,
        qrCodes: qrCodesRef.current,
        usagiImg,
        logoImg: logoImgRef.current ?? usagiImg,
      });
    }

    // 4. サーバー側カウンターを非同期で更新（成功したら反映）
    fetch('/api/issue-no', { method: 'POST' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.no) {
          setCardNo((prev) => {
            const c = parseInt(prev, 10);
            const serverNo = parseInt(data.no, 10);
            return String(Math.max(c, serverNo)).padStart(4, '0');
          });
        }
      })
      .catch(() => {});
  };

  const handleNextPhoto = () => {
    playSound();
    if (!config || config.isRare) return;
    const currentIndex = NOGAMI_PHOTOS.indexOf(config.photoKey);
    const nextIndex = (currentIndex + 1) % NOGAMI_PHOTOS.length;
    const nextConfig = { ...config, photoKey: NOGAMI_PHOTOS[nextIndex] };
    setConfig(nextConfig);

    // ポーズ切り替えも即座に直接描画
    const canvas = canvasRef.current;
    if (canvas && photosRef.current && qrCodesRef.current) {
      const usagiImg =
        usagiMapRef.current[usagiIndex] ??
        usagiMapRef.current[VALID_USAGI_INDICES[0]] ??
        (logoImgRef.current as HTMLImageElement);
      drawCard(canvas, {
        name,
        bio,
        cardNo,
        config: nextConfig,
        photos: photosRef.current,
        qrCodes: qrCodesRef.current,
        usagiImg,
        logoImg: logoImgRef.current ?? usagiImg,
      });
    }
  };

  const handleDownload = () => {
    playSound();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const prefix = config?.isRare ? 'fukui_children' : 'nogami_children';
    const link = document.createElement('a');
    link.download = `${prefix}_no${cardNo}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Xシェア（シンプルにXのポスト作成画面を開く）
  const handleShare = () => {
    playSound();
    const isRare = config?.isRare ?? false;
    const formattedNo = cardNo === '----' ? '0000' : cardNo.padStart(4, '0');
    const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://nogami1.vercel.app';

    const tweetText = isRare
      ? `No.${formattedNo} / \n【レア】福井チルドレン証を作成！\n\n#福井ゆうた #国民民主党 #東京都議会議員\n${siteUrl}`
      : `No.${formattedNo} / \n野上チルドレン証を作成！\n\n#野上だいき #国民民主党 #大田区政策委員\n${siteUrl}`;

    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(tweetText)}`, '_blank');
  };

  const isRare = config?.isRare ?? false;

  // ── 描画 ──

  return (
    <div className="h-full flex flex-col lg:flex-row gap-0 overflow-hidden relative">

      {/* プレビュー（PC: 右 / スマホ: 上） */}
      <div className="flex-1 lg:flex-none lg:w-[58%] flex items-center justify-center bg-slate-100 p-2 lg:p-6 overflow-hidden order-1 lg:order-2">
        <div
          className={`w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 ${
            isRare ? 'ring-4 ring-[#D4AF37] ring-offset-2' : 'ring-1 ring-slate-300'
          }`}
        >
          {!loaded ? (
            <div className="aspect-[1.586] bg-slate-200 flex items-center justify-center">
              <span className="text-slate-500 text-sm font-bold animate-pulse">
                高画質ファンカード生成中...
              </span>
            </div>
          ) : (
            <canvas ref={canvasRef} className="w-full h-auto block" />
          )}
        </div>
      </div>

      {/* フォーム（PC: 左 / スマホ: 下） */}
      <div className="shrink-0 lg:flex-1 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 bg-white overflow-y-auto order-2 lg:order-1">
        <div className="flex-1 flex flex-col gap-3 p-3 lg:p-6">

          {/* スタイルバッジ */}
          {config && (
            <div
              className={`flex items-center justify-between text-xs font-bold px-3.5 py-2 rounded-xl border ${
                isRare
                  ? 'bg-amber-50 border-amber-300 text-amber-900 shadow-sm'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <div className="flex items-center gap-1.5 truncate">
                <span>{isRare ? '⭐' : '✦'}</span>
                <span className="truncate">{config.label}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                {!isRare && (
                  <button
                    onClick={handleNextPhoto}
                    title="写真のポーズを切り替え"
                    className="text-[11px] bg-white hover:bg-slate-50 text-slate-700 px-2.5 py-1 rounded-lg border border-slate-300 font-bold transition-colors shadow-sm"
                  >
                    ポーズ切替 📷
                  </button>
                )}
                {isRare && (
                  <span className="text-[10px] bg-gradient-to-r from-amber-400 to-yellow-400 text-black px-2 py-0.5 rounded font-black shadow-sm">
                    3% RARE
                  </span>
                )}
              </div>
            </div>
          )}

          {/* お名前 */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>お名前（NAME）</span>
              <span className="font-normal text-slate-400">{name.length}/20</span>
            </label>
            <input
              type="text"
              maxLength={20}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="例: 国民 太郎"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 transition-all font-medium"
            />
          </div>

          {/* ひとこと */}
          <div>
            <label className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
              <span>ひとこと（MESSAGE）</span>
              <span className="font-normal text-slate-400">{bio.length}/28</span>
            </label>
            <textarea
              maxLength={28}
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="例: 野上さんを応援しています！"
              className="w-full border border-slate-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none transition-all font-medium"
            />
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col gap-2.5 mt-auto pt-3">
            <div className="grid grid-cols-3 gap-2.5">
              <button
                onClick={handleRedraw}
                disabled={isLoading || !loaded}
                className="bg-[#FAEC00] hover:bg-yellow-300 text-[#004098] font-black text-sm py-4 rounded-xl transition-all border-2 border-[#004098] flex items-center justify-center shadow-sm active:scale-[0.98]"
              >
                {isLoading ? '生成中...' : '再生成'}
              </button>
              <button
                onClick={handleDownload}
                disabled={isLoading || !loaded}
                className="bg-[#004098] hover:bg-blue-900 text-white font-black text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center active:scale-[0.98]"
              >
                高画質保存
              </button>
              <button
                onClick={handleShare}
                disabled={isLoading || !loaded}
                className="bg-black hover:bg-slate-800 text-white font-black text-sm py-4 rounded-xl transition-all shadow-md flex items-center justify-center active:scale-[0.98]"
              >
                Xシェア
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
