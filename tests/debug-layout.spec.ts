import { test } from '@playwright/test';

test('レイアウト構造のデバッグ', async ({ page }) => {
  // 1. デスクトップサイズに設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  // 2. リバーシのページに移動
  await page.goto('/games/reversi');
  await page.waitForLoadState('networkidle');
  
  // 3. ページの構造をログに出力
  const bodyContent = await page.locator('body').innerHTML();
  console.log('Page body content (first 2000 chars):', bodyContent.substring(0, 2000));
  
  // 4. h1要素の数を確認
  const h1Count = await page.locator('h1').count();
  console.log('h1要素の数:', h1Count);
  
  // 5. すべてのヘッダー要素のテキストを取得して出力
  const headers = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
  console.log('すべてのヘッダー要素:', headers);
  
  // 6. サイドバーとメインコンテンツの存在を確認
  const sidebarCount = await page.locator('[style*="display: flex"][style*="flex-direction: row"]').count();
  const mainCount = await page.locator('main').count();
  console.log('サイドバーの数:', sidebarCount);
  console.log('メインコンテンツの数:', mainCount);
  
  // 7. レスポンシブ状態を確認するためのスタイル情報を取得
  const containerStyles = await page.locator('body > div').first().getAttribute('style');
  console.log('コンテナのスタイル:', containerStyles);
});