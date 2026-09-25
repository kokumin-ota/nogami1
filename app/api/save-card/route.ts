import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// ローカルではプロジェクト直下、サーバーレス(Vercel)では /tmp を使用
function getStorageDir(): string {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  const targetDir = isServerless
    ? path.join('/tmp', '.og-cards')
    : path.join(process.cwd(), '.og-cards');

  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  return targetDir;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, cardNo, isRare, name } = body;

    if (!image || typeof image !== 'string') {
      return NextResponse.json({ error: '画像データがありません' }, { status: 400 });
    }

    // Base64 のプレフィックスを削除してバイナリバッファに変換
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // ユニークIDを発行（例: ND-0001-a1b2c3）
    const prefix = isRare ? 'FY' : 'ND';
    const formattedNo = (cardNo || '0000').padStart(4, '0');
    const randomHex = Math.random().toString(36).substring(2, 8);
    const id = `${prefix}-${formattedNo}-${randomHex}`;

    // ディレクトリにPNGとして保存
    const storageDir = getStorageDir();
    const filePath = path.join(storageDir, `${id}.png`);
    fs.writeFileSync(filePath, buffer);

    // メタ情報JSONも保存（タイトルや名前など）
    const metaPath = path.join(storageDir, `${id}.json`);
    fs.writeFileSync(
      metaPath,
      JSON.stringify({
        id,
        cardNo: formattedNo,
        isRare: Boolean(isRare),
        name: name || '',
        createdAt: new Date().toISOString(),
      }),
      'utf-8'
    );

    return NextResponse.json({
      success: true,
      id,
      sharePath: `/share/${id}`,
    });
  } catch (error) {
    console.error('カード保存エラー:', error);
    return NextResponse.json({ error: '保存に失敗しました' }, { status: 500 });
  }
}
