import { test, expect } from '@playwright/test';

test('はさみ将棋のゲームページに正しく遷移し、タイトルが表示されることを確認', async ({ page }) => {
  // トップページにアクセス
  await page.goto('/');

  // はさみ将棋へのリンクをクリック
  await page.click('a[href="/games/hasami-shogi/"]');

  // URLが正しく変更されたことを確認
  await expect(page).toHaveURL('/games/hasami-shogi/');

  // ゲームのタイトルが表示されていることを確認
  const titleLocator = page.locator('main h1');
  const titleText = await titleLocator.textContent();
  expect(titleText).toBe('はさみしょうぎ');
});
