import { test, expect } from '@playwright/test';

test('Debug layout structure', async ({ page }) => {
  // デスクトップサイズに設定
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('/games/reversi');
  await page.waitForLoadState('networkidle');
  
  // ページの構造をログ出力
  const bodyContent = await page.locator('body').innerHTML();
  console.log('Page body content:', bodyContent.substring(0, 2000));
  
  // h1要素の数を確認
  const h1Count = await page.locator('h1').count();
  console.log('Number of h1 elements:', h1Count);
  
  // すべてのヘッダー要素を確認
  const headers = await page.locator('h1, h2, h3, h4, h5, h6').allTextContents();
  console.log('All header elements:', headers);
  
  // サイドバーとメインコンテンツの存在を確認
  const sidebarCount = await page.locator('[style*="display: flex"][style*="flex-direction: row"]').count();
  const mainCount = await page.locator('main').count();
  console.log('Sidebar count:', sidebarCount);
  console.log('Main content count:', mainCount);
  
  // レスポンシブ状態を確認するためのスタイルを確認
  const containerStyles = await page.locator('body > div').first().getAttribute('style');
  console.log('Container styles:', containerStyles);
});