/**
 * API Route: GET /api/issue-no
 * ファイルベースの簡易カウンター（KV不要のローカル版）
 * Vercel KV/Supabase 移行時はここを差し替えればOK
 */
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const COUNTER_FILE = path.join(process.cwd(), '.counter');

function readCount(): number {
  try {
    const raw = fs.readFileSync(COUNTER_FILE, 'utf-8').trim();
    return parseInt(raw, 10) || 0;
  } catch {
    return 0;
  }
}

function writeCount(n: number): void {
  fs.writeFileSync(COUNTER_FILE, String(n), 'utf-8');
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
  const padded = String(current).padStart(4, '0');
  return NextResponse.json({ no: padded });
}
