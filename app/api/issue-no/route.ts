import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// サーバーレス環境でも書き込み可能な /tmp を優先
const COUNTER_FILE = process.env.VERCEL === '1' || process.env.NODE_ENV === 'production'
  ? path.join('/tmp', '.counter')
  : path.join(process.cwd(), '.counter');

// メモリ上のフォールバックカウンター
let memoryCount = 0;

function readCount(): number {
  try {
    if (fs.existsSync(COUNTER_FILE)) {
      const raw = fs.readFileSync(COUNTER_FILE, 'utf-8').trim();
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n > 0) {
        memoryCount = Math.max(memoryCount, n);
        return memoryCount;
      }
    }
  } catch (_) {}
  return memoryCount;
}

function writeCount(n: number): void {
  memoryCount = n;
  try {
    fs.writeFileSync(COUNTER_FILE, String(n), 'utf-8');
  } catch (_) {}
}

export async function POST() {
  const current = readCount();
  const next = current + 1;
  writeCount(next);
  const padded = String(next).padStart(4, '0');
  return NextResponse.json({ no: padded });
}

export async function GET() {
  const current = readCount();
  const padded = String(current || 1).padStart(4, '0');
  return NextResponse.json({ no: padded });
}
