import { test, expect } from '@playwright/test';

test('はさみ将棋のゲームページに正しく遷移し、タイトルが表示されることを確認', async ({ page }) => {
  // トップページにアクセス
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // はさみ将棋へのリンクをクリック
  await page.click('a[href="/games/hasami-shogi/"]');

  // URLが変更されるのを待つ
  await page.waitForURL('**/games/hasami-shogi/');

  // ゲームのタイトルが表示されていることを確認
  await expect(page.locator('header h1')).toHaveText('はさみしょうぎ');
});
