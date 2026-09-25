export type CardPattern =
  | 'patternA' | 'patternB' | 'patternC' | 'patternD'
  | 'patternE' | 'patternF' | 'patternG' | 'patternH'
  | 'rare';

export type PhotoKey = 'nogami' | 'nogami2' | 'nogami3' | 'nogami4' | 'nogami5' | 'fukui';

export interface CardConfig {
  pattern: CardPattern;
  label: string;
  probability: number;
  isRare: boolean;
  photoKey: PhotoKey;
  theme: {
    name: string;
    waveGradStart: string; // 波のグラデーション開始色
    waveGradEnd: string;   // 波のグラデーション終了色
    accent: string;        // MEMBER CARD や主要ラベルの色
    textDark: string;      // お名前などの文字色
    textMeta: string;      // 小見出し・ラベル色
    sparkleColor: string;  // スパークル（星）の色
    starLogoGrad: [string, string]; // 星ロゴアイコンのグラデーション
  };
}

export const NOGAMI_PHOTOS: PhotoKey[] = ['nogami2', 'nogami', 'nogami3', 'nogami4', 'nogami5'];

export const CARD_PATTERNS: CardConfig[] = [
  {
    pattern: 'patternA',
    label: '1. サファイアブルー & ラベンダー',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami2',
    theme: {
      name: 'サファイアブルー',
      waveGradStart: '#7CB9F9',
      waveGradEnd: '#C8B6FF',
      accent: '#2B66CC',
      textDark: '#1A2A44',
      textMeta: '#3B7BE8',
      sparkleColor: '#8EBBFF',
      starLogoGrad: ['#4F8DF7', '#9D8DF8'],
    },
  },
  {
    pattern: 'patternB',
    label: '2. 国民民主ブルー & イエロー',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami2',
    theme: {
      name: '国民民主ブルー＆イエロー',
      waveGradStart: '#004098',
      waveGradEnd: '#F7D000',
      accent: '#004098',
      textDark: '#0A1E3F',
      textMeta: '#004098',
      sparkleColor: '#F7D000',
      starLogoGrad: ['#004098', '#F7D000'],
    },
  },
  {
    pattern: 'patternC',
    label: '3. エメラルドグリーン & ミント',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami4',
    theme: {
      name: 'エメラルドミント',
      waveGradStart: '#34D399',
      waveGradEnd: '#6EE7B7',
      accent: '#059669',
      textDark: '#064E3B',
      textMeta: '#10B981',
      sparkleColor: '#6EE7B7',
      starLogoGrad: ['#059669', '#34D399'],
    },
  },
  {
    pattern: 'patternD',
    label: '4. サンセットオレンジ & コーラル',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami5',
    theme: {
      name: 'サンセットオレンジ',
      waveGradStart: '#FB923C',
      waveGradEnd: '#FDE047',
      accent: '#EA580C',
      textDark: '#431407',
      textMeta: '#F97316',
      sparkleColor: '#FDBA74',
      starLogoGrad: ['#EA580C', '#FBBF24'],
    },
  },
  {
    pattern: 'patternE',
    label: '5. パステルピンク & サクラ',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami',
    theme: {
      name: 'パステルピンク',
      waveGradStart: '#FBCFE8',
      waveGradEnd: '#FFE4E6',
      accent: '#B05376',
      textDark: '#36242B',
      textMeta: '#BC708E',
      sparkleColor: '#FDE8F1',
      starLogoGrad: ['#B05376', '#FBCFE8'],
    },
  },
  {
    pattern: 'patternF',
    label: '6. ラベンダー & ライラック',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami3',
    theme: {
      name: 'ラベンダー',
      waveGradStart: '#C4B5FD',
      waveGradEnd: '#E0E7FF',
      accent: '#5B4E9B',
      textDark: '#1E1B38',
      textMeta: '#786CB0',
      sparkleColor: '#EDE9FE',
      starLogoGrad: ['#5B4E9B', '#C4B5FD'],
    },
  },
  {
    pattern: 'patternG',
    label: '7. アクアターコイズ & シアン',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami4',
    theme: {
      name: 'アクアターコイズ',
      waveGradStart: '#06B6D4',
      waveGradEnd: '#67E8F9',
      accent: '#0891B2',
      textDark: '#164E63',
      textMeta: '#06B6D4',
      sparkleColor: '#A5F3FC',
      starLogoGrad: ['#0891B2', '#22D3EE'],
    },
  },
  {
    pattern: 'patternH',
    label: '8. スタイリッシュチャコール & シルバー',
    probability: 0.12125,
    isRare: false,
    photoKey: 'nogami5',
    theme: {
      name: 'チャコールシルバー',
      waveGradStart: '#64748B',
      waveGradEnd: '#CBD5E1',
      accent: '#334155',
      textDark: '#0F172A',
      textMeta: '#475569',
      sparkleColor: '#94A3B8',
      starLogoGrad: ['#334155', '#94A3B8'],
    },
  },
  {
    pattern: 'rare',
    label: '【RARE】福井ゆうたVer. シャンパンゴールド',
    probability: 0.03,
    isRare: true,
    photoKey: 'fukui',
    theme: {
      name: 'シャンパンゴールド',
      waveGradStart: '#D4AF37',
      waveGradEnd: '#FFE082',
      accent: '#B8860B',
      textDark: '#2C1D02',
      textMeta: '#996515',
      sparkleColor: '#FFE082',
      starLogoGrad: ['#D4AF37', '#FFF176'],
    },
  },
];

export function drawPattern(currentPattern?: CardPattern, currentPhoto?: PhotoKey): CardConfig {
  // 3%の確率でレア（福井ゆうた）
  if (Math.random() < 0.03) {
    const rareConfig = CARD_PATTERNS.find((c) => c.isRare);
    if (rareConfig) return { ...rareConfig };
  }

  // 直前と異なるパターンを選定（毎回確実に色がガラリと変わる）
  const normalConfigs = CARD_PATTERNS.filter((c) => !c.isRare && c.pattern !== currentPattern);
  const selectedConfig = normalConfigs.length > 0
    ? normalConfigs[Math.floor(Math.random() * normalConfigs.length)]
    : CARD_PATTERNS[0];

  // 写真も直前と異なるものを優先選定
  const candidatePhotos = NOGAMI_PHOTOS.filter((p) => p !== currentPhoto);
  const selectedPhoto = candidatePhotos.length > 0
    ? candidatePhotos[Math.floor(Math.random() * candidatePhotos.length)]
    : NOGAMI_PHOTOS[0];

  return { ...selectedConfig, photoKey: selectedPhoto };
}
