import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getStorageDir(): string {
  const isServerless = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production';
  return isServerless
    ? path.join('/tmp', '.og-cards')
    : path.join(process.cwd(), '.og-cards');
}

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const sanitizedId = id.replace(/[^a-zA-Z0-9_-]/g, '');
    const storageDir = getStorageDir();
    const filePath = path.join(storageDir, `${sanitizedId}.png`);

    if (fs.existsSync(filePath)) {
      const buffer = fs.readFileSync(filePath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    }

    // フォールバック：デフォルトのnogami写真等
    const fallbackPath = path.join(process.cwd(), 'public', 'photos', 'nogami.png');
    if (fs.existsSync(fallbackPath)) {
      const buffer = fs.readFileSync(fallbackPath);
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, max-age=3600',
        },
      });
    }

    return new NextResponse('Not Found', { status: 404 });
  } catch (error) {
    console.error('画像取得エラー:', error);
    return new NextResponse('Internal Error', { status: 500 });
  }
}
