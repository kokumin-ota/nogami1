/**
 * Card Canvas Renderer
 * Official Fan-Club Style Card Generator
 * Canvas size: 1012 × 638 px
 */
import { CardConfig, PhotoKey } from './types';

// ─── 定数 ───────────────────────────────────────────────────────────
const W = 1012;
const H = 638;
const CARD_RADIUS = 32;

const FONT = {
  title: '"Cinzel", "Playfair Display", "Times New Roman", serif',
  sans: '"Space Grotesk", "Montserrat", sans-serif',
  jp: '"Noto Sans JP", "Hiragino Kaku Gothic ProN", sans-serif',
} as const;

const PHOTO_AREA_W = 420;

// ─── 型 ─────────────────────────────────────────────────────────────
export interface DrawOptions {
  name: string;
  bio: string;
  cardNo: string;
  config: CardConfig;
  photos: Record<PhotoKey, HTMLImageElement>;
  qrCodes: { nogami: HTMLImageElement; fukui: HTMLImageElement };
  usagiImg: HTMLImageElement;
  logoImg: HTMLImageElement;
}

// ─── ユーティリティ ──────────────────────────────────────────────────

/** 4点星スパークル（✦）を描画 */
function drawSparkle(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  color: string,
  alpha = 1
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = color;
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 - Math.PI / 2;
    const dist = i % 2 === 0 ? r : r * 0.22;
    const px = x + Math.cos(a) * dist;
    const py = y + Math.sin(a) * dist;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/** 写真エリアの右側 S字波形パスを構築 */
function buildPhotoRightPath(ctx: CanvasRenderingContext2D, offsetX = 0) {
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(385 + offsetX, 0);
  ctx.bezierCurveTo(410 + offsetX, 130, 425 + offsetX, 230, 370 + offsetX, 340);
  ctx.bezierCurveTo(325 + offsetX, 430, 350 + offsetX, 540, 380 + offsetX, H);
  ctx.lineTo(0, H);
  ctx.closePath();
}

/** 写真下部のなだらかな波帯パスを構築 */
function buildPhotoBottomWavePath(ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(0, H * 0.74);
  ctx.bezierCurveTo(100, H * 0.72, 220, H * 0.82, 360, H * 0.78);
  ctx.bezierCurveTo(380, H * 0.77, 375, H * 0.88, 380, H);
  ctx.lineTo(0, H);
  ctx.closePath();
}

// ─── 描画サブルーティン ──────────────────────────────────────────────

/** 右上・右下コーナーの波形グラデーションを描画（共通処理） */
function drawCornerWave(
  ctx: CanvasRenderingContext2D,
  gradStart: [number, number],
  gradEnd: [number, number],
  outerPath: () => void,
  innerPath: () => void,
  outerAlpha: number,
  innerAlpha: number,
  c1: string,
  c2: string
) {
  const drawWave = (buildPath: () => void, x0: number, y0: number, x1: number, y1: number, alpha: number) => {
    ctx.save();
    const grad = ctx.createLinearGradient(x0, y0, x1, y1);
    grad.addColorStop(0, c1);
    grad.addColorStop(1, c2);
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    buildPath();
    ctx.fill();
    ctx.restore();
  };
  drawWave(outerPath, gradStart[0], gradStart[1], gradEnd[0], gradEnd[1], outerAlpha);
  drawWave(innerPath, gradStart[0], gradStart[1], gradEnd[0], gradEnd[1], innerAlpha);
}

/** 右上コーナーの波 */
function drawTopRightWave(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  drawCornerWave(
    ctx,
    [W * 0.7, 0], [W, 200],
    () => {
      ctx.beginPath();
      ctx.moveTo(W * 0.68, 0);
      ctx.bezierCurveTo(W * 0.78, 60, W * 0.86, 110, W, 175);
      ctx.lineTo(W, 0);
      ctx.closePath();
    },
    () => {
      ctx.beginPath();
      ctx.moveTo(W * 0.77, 0);
      ctx.bezierCurveTo(W * 0.84, 45, W * 0.91, 90, W, 135);
      ctx.lineTo(W, 0);
      ctx.closePath();
    },
    0.22, 0.38, c1, c2
  );
}

/** 右下コーナーの波 */
function drawBottomRightWave(ctx: CanvasRenderingContext2D, c1: string, c2: string) {
  drawCornerWave(
    ctx,
    [W * 0.62, H], [W, H * 0.6],
    () => {
      ctx.beginPath();
      ctx.moveTo(W * 0.64, H);
      ctx.bezierCurveTo(W * 0.74, H * 0.88, W * 0.86, H * 0.72, W, H * 0.58);
      ctx.lineTo(W, H);
      ctx.closePath();
    },
    () => {
      ctx.beginPath();
      ctx.moveTo(W * 0.74, H);
      ctx.bezierCurveTo(W * 0.82, H * 0.9, W * 0.90, H * 0.78, W, H * 0.68);
      ctx.lineTo(W, H);
      ctx.closePath();
    },
    0.2, 0.35, c1, c2
  );
}

/** 福井ゆうた RARE カード：放射状集中線 */
function drawRareBackdrop(ctx: CanvasRenderingContext2D) {
  const cx = 220;
  const cy = 260;
  const N = 64;
  ctx.save();
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 1 + (i % 3) * 2;
    ctx.globalAlpha = 0.08 + (i % 5) * 0.05;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * (30 + (i % 4) * 12), cy + Math.sin(a) * (30 + (i % 4) * 12));
    ctx.lineTo(cx + Math.cos(a) * 650, cy + Math.sin(a) * 650);
    ctx.stroke();
  }
  ctx.restore();
}

/** 写真エリアを描画（クリッピング + 写真本体 + 下部波帯） */
function drawPhotoArea(
  ctx: CanvasRenderingContext2D,
  photo: HTMLImageElement,
  photoKey: string,
  isRare: boolean,
  waveStart: string,
  waveEnd: string
) {
  ctx.save();
  buildPhotoRightPath(ctx, 0);
  ctx.clip();

  // 背景：通常は白、RARE（福井）はゴールド
  if (isRare) {
    const bg = ctx.createLinearGradient(0, 0, 400, H);
    bg.addColorStop(0, '#FFF9E6');
    bg.addColorStop(1, '#FFE8A3');
    ctx.fillStyle = bg;
  } else {
    ctx.fillStyle = '#FFFFFF';
  }
  ctx.fillRect(0, 0, PHOTO_AREA_W, H);

  // 写真本体（aspect-fit with vertical offset）
  const imgAspect = photo.naturalWidth / photo.naturalHeight;
  const boxAspect = PHOTO_AREA_W / H;
  let sx = 0, sy = 0, sw = photo.naturalWidth, sh = photo.naturalHeight;
  if (imgAspect > boxAspect) {
    sw = sh * boxAspect;
    sx = (photo.naturalWidth - sw) / 2;
  } else {
    sh = sw / boxAspect;
    sy = photoKey === 'nogami3' ? imgAspect * 20 : 0;
  }
  ctx.drawImage(photo, sx, sy, sw, sh, 0, 0, PHOTO_AREA_W, H);

  // 下部波帯
  ctx.save();
  const bottomGrad = ctx.createLinearGradient(0, H * 0.72, 380, H);
  bottomGrad.addColorStop(0, waveStart);
  bottomGrad.addColorStop(1, waveEnd);
  ctx.fillStyle = bottomGrad;
  ctx.globalAlpha = 0.94;
  buildPhotoBottomWavePath(ctx);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

/** 写真エリア右側の二重波帯（写真の上に重なる装飾） */
function drawPhotoSideBands(ctx: CanvasRenderingContext2D, waveStart: string, waveEnd: string) {
  const drawBand = (offset: number, alpha: number) => {
    ctx.save();
    const grad = ctx.createLinearGradient(0, 0, 440 + offset, H);
    grad.addColorStop(0, waveStart);
    grad.addColorStop(1, waveEnd);
    ctx.fillStyle = grad;
    ctx.globalAlpha = alpha;
    buildPhotoRightPath(ctx, offset);
    ctx.fill();
    ctx.restore();
  };
  drawBand(45, 0.2);
  drawBand(22, 0.45);
}

/** ヘッダーエリア（うさぎ + 名前 + 役職） */
function drawHeader(
  ctx: CanvasRenderingContext2D,
  usagiImg: HTMLImageElement,
  isRare: boolean,
  accent: string,
  textMeta: string
) {
  const HEADER_CENTER_X = 645;
  const USAGI_H = 68;
  const usagiW = USAGI_H * (usagiImg.naturalWidth / usagiImg.naturalHeight);
  const usagiX = HEADER_CENTER_X - 165;
  const usagiY = 38;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.1)';
  ctx.shadowBlur = 6;
  ctx.shadowOffsetY = 2;
  ctx.drawImage(usagiImg, usagiX, usagiY, usagiW, USAGI_H);
  ctx.restore();

  const textX = usagiX + usagiW + 16;
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';

  ctx.font = `800 36px ${FONT.title}`;
  ctx.fillStyle = accent;
  ctx.letterSpacing = '0.08em';
  ctx.fillText(isRare ? 'FUKUI YUTA' : 'NOGAMI DAIKI', textX, usagiY + 36);

  ctx.font = `800 12px ${FONT.sans}`;
  ctx.fillStyle = textMeta;
  ctx.letterSpacing = '0.20em';
  ctx.fillText(
    isRare ? 'TOKYO METROPOLITAN ASSEMBLY MEMBER' : 'OTA POLICY COMMISSIONER',
    textX + 2,
    usagiY + 58
  );
  ctx.restore();
}

/** タイトルブロック（NOGAMI/FUKUI CHILDREN + MEMBER CARD） */
function drawTitleBlock(ctx: CanvasRenderingContext2D, isRare: boolean, accent: string) {
  const cx = 680;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `700 28px ${FONT.title}`;
  ctx.fillStyle = accent;

  ctx.letterSpacing = '0.14em';
  ctx.fillText(isRare ? 'FUKUI CHILDREN' : 'NOGAMI CHILDREN', cx, 178);

  ctx.letterSpacing = '0.16em';
  ctx.fillText('MEMBER CARD', cx, 214);
  ctx.restore();
}

/** ラベル行（MEMBER NO. / NAME / MESSAGE の見出し小文字） */
function drawLabel(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, color: string) {
  ctx.save();
  ctx.font = `800 12px ${FONT.sans}`;
  ctx.fillStyle = color;
  ctx.letterSpacing = '0.12em';
  ctx.fillText(text, x, y);
  ctx.restore();
}

/** メンバー情報ブロック（MEMBER NO. / NAME / MESSAGE） */
function drawInfoBlock(
  ctx: CanvasRenderingContext2D,
  name: string,
  bio: string,
  cardNo: string,
  isRare: boolean,
  textDark: string,
  textMeta: string
) {
  const X = 475;
  let y = 305;

  // MEMBER NO.
  drawLabel(ctx, 'MEMBER NO.', X, y, textMeta);
  const formattedNo = cardNo === '----' ? '0000' : cardNo.padStart(4, '0');
  const memberNo = `${isRare ? 'FY' : 'ND'}-2026-${formattedNo}`;
  ctx.save();
  ctx.font = `700 24px ${FONT.sans}`;
  ctx.fillStyle = textDark;
  ctx.letterSpacing = '0.04em';
  ctx.fillText(memberNo, X, y + 28);
  ctx.restore();

  // NAME
  y += 66;
  drawLabel(ctx, 'NAME', X, y, textMeta);
  ctx.save();
  ctx.fillStyle = textDark;
  let nameSize = 24;
  ctx.font = `700 ${nameSize}px ${FONT.jp}`;
  const displayName = name || 'NOGAMI SUPPORTER';
  while (ctx.measureText(displayName).width > 250 && nameSize > 14) {
    nameSize -= 1;
    ctx.font = `700 ${nameSize}px ${FONT.jp}`;
  }
  ctx.fillText(displayName, X, y + 28);
  ctx.restore();

  // MESSAGE
  y += 66;
  drawLabel(ctx, 'MESSAGE', X, y, textMeta);
  ctx.save();
  ctx.font = `500 17px ${FONT.jp}`;
  ctx.fillStyle = textDark;
  const displayBio = bio || '野上だいきを応援しています！';
  const maxBioWidth = 250;
  const bioLines: string[] = [];
  let cur = '';
  for (const ch of displayBio) {
    const test = cur + ch;
    if (ctx.measureText(test).width > maxBioWidth && cur) {
      bioLines.push(cur);
      cur = ch;
    } else {
      cur = test;
    }
  }
  if (cur) bioLines.push(cur);
  bioLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, X, y + 26 + i * 24));
  ctx.restore();
}

/** QRコードエリア（枠 + 画像 + 「公式X」テキスト） */
function drawQRBlock(
  ctx: CanvasRenderingContext2D,
  qrImage: HTMLImageElement,
  textMeta: string
) {
  const BOX = { x: 765, y: 368, w: 155, h: 176, r: 14 };
  const QR_SIZE = 120;

  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.08)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 4;
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(BOX.x, BOX.y, BOX.w, BOX.h, BOX.r);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(0, 64, 152, 0.12)';
  ctx.lineWidth = 1.2;
  ctx.stroke();

  ctx.drawImage(
    qrImage,
    BOX.x + (BOX.w - QR_SIZE) / 2,
    BOX.y + 12,
    QR_SIZE,
    QR_SIZE
  );

  ctx.font = `700 13px ${FONT.jp}`;
  ctx.fillStyle = textMeta;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('公式X', BOX.x + BOX.w / 2, BOX.y + 147);
  ctx.restore();
}

/** 写真下の肩書き・氏名テキスト（ロゴ付き） */
function drawPhotoCaption(
  ctx: CanvasRenderingContext2D,
  isRare: boolean,
  logoImg: HTMLImageElement | null
) {
  // ── ロゴ（肩書テキストの上） ──
  if (logoImg && logoImg.naturalWidth > 0) {
    const LOGO_H = 53; // 1.2倍（44 → 53）
    const logoW = LOGO_H * (logoImg.naturalWidth / logoImg.naturalHeight);
    const logoX = 36;
    // 役職テキストのtop（baseline H-74 - 21px フォント）から 10px 上に余白を取って配置
    const roleTextTop = H - 74 - 21;
    const logoY = roleTextTop - 0 - LOGO_H;

    ctx.save();
    ctx.shadowColor = 'rgba(0, 0, 0, 0.6)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetY = 2;
    ctx.drawImage(logoImg, logoX, logoY, logoW, LOGO_H);
    ctx.restore();
  }

  // ── 肩書き・氏名テキスト ──
  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.9)';
  ctx.shadowBlur = 12;
  ctx.shadowOffsetY = 3;
  ctx.fillStyle = '#FFFFFF';

  ctx.font = `800 21px ${FONT.jp}`;
  ctx.letterSpacing = '0.10em';
  ctx.fillText(isRare ? '東京都議会議員' : '大田区政策委員', 36, H - 74);

  ctx.font = `900 38px ${FONT.jp}`;
  ctx.letterSpacing = '0.08em';
  ctx.fillText(isRare ? '福井ゆうた' : '野上だいき', 36, H - 28);
  ctx.restore();
}

// ─── メイン描画関数 ──────────────────────────────────────────────────

export function drawCard(canvas: HTMLCanvasElement, opts: DrawOptions): void {
  const { name, bio, cardNo, config, photos, qrCodes, usagiImg } = opts;
  canvas.width = W;
  canvas.height = H;

  const ctx = canvas.getContext('2d');
  if (!ctx || !photos || !qrCodes) return;
  ctx.clearRect(0, 0, W, H);

  const { theme, isRare, photoKey } = config;
  const photo = photos[photoKey] ?? (isRare ? photos.fukui : photos.nogami2);
  const qrImage = (isRare ? qrCodes.fukui : qrCodes.nogami) ?? qrCodes.nogami;
  if (!photo || !qrImage) return;

  // ── カード角丸クリップ ──
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(0, 0, W, H, CARD_RADIUS);
  ctx.clip();

  // 1. 白背景
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, W, H);

  // 2. コーナー波
  drawTopRightWave(ctx, theme.waveGradStart, theme.waveGradEnd);
  drawBottomRightWave(ctx, theme.waveGradStart, theme.waveGradEnd);

  // 3. RARE: 集中線
  if (isRare) drawRareBackdrop(ctx);

  // 4. 写真エリアの装飾帯
  drawPhotoSideBands(ctx, theme.waveGradStart, theme.waveGradEnd);

  // 5. 写真エリア本体
  drawPhotoArea(ctx, photo, photoKey, isRare, theme.waveGradStart, theme.waveGradEnd);

  // 6. 写真境界の白線
  ctx.save();
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 2.5;
  ctx.globalAlpha = 0.8;
  buildPhotoRightPath(ctx, 0);
  ctx.stroke();
  ctx.restore();

  // 7. スパークル
  const sc = theme.sparkleColor;
  [
    [405, 85, 7, 0.95], [418, 140, 4, 0.7], [395, 235, 6, 0.85],
    [388, 360, 5, 0.8],  [415, 470, 7, 0.9], [875, 48, 5, 0.7],
    [960, 95, 6, 0.8],   [955, 410, 6, 0.85],[965, 595, 5, 0.75],
    [725, H - 25, 4, 0.6],
  ].forEach(([x, y, r, a]) => drawSparkle(ctx, x, y, r, sc, a));

  // 8. 右側コンテンツ
  drawHeader(ctx, usagiImg, isRare, theme.accent, theme.textMeta);
  drawTitleBlock(ctx, isRare, theme.accent);
  drawInfoBlock(ctx, name, bio, cardNo, isRare, theme.textDark, theme.textMeta);
  drawQRBlock(ctx, qrImage, theme.textMeta);
  drawPhotoCaption(ctx, isRare, opts.logoImg ?? null);

  // カード右下：非公式表記（極小・右揃え）
  ctx.save();
  ctx.font = `400 10px ${FONT.sans}`;
  ctx.fillStyle = 'rgba(160, 160, 160, 0.70)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText('非公式ファンコンテンツ', W - 14, H - 18);
  ctx.restore();

  // 9. カード外枠
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(0.5, 0.5, W - 1, H - 1, CARD_RADIUS);
  ctx.stroke();
  ctx.restore();
}
