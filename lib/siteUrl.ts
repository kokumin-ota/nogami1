/**
 * サイトのベースURLを取得するユーティリティ
 * 優先順位:
 * 1. NEXT_PUBLIC_SITE_URL (本番カスタムドメイン等)
 * 2. VERCEL_PROJECT_PRODUCTION_URL (Vercel 本番ドメイン)
 * 3. VERCEL_URL (Vercel デプロイドメイン)
 * 4. クライアント側の window.location.origin
 * 5. ローカル開発環境 http://localhost:3000
 */
export function getBaseUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    return url.startsWith('http') ? url : `https://${url}`;
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin;
  }
  return 'http://localhost:3000';
}
