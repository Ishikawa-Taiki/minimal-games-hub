import { test, expect } from '@playwright/test';

test('はさみ将棋のゲームページに正しく遷移し、タイトルが表示されることを確認', async ({ page }) => {
  // トップページにアクセス
  await page.goto('/');

  // はさみ将棋へのリンクをクリック
  await page.click('a[href="/games/hasami-shogi/"]');

  // URLが正しく変更されたことを確認
  await expect(page).toHaveURL('http://localhost:3000/minimal-games-hub/games/hasami-shogi/');

  // ゲームのタイトルが表示されていることを確認
  const titleLocator = page.locator('header h1');
  const titleText = await titleLocator.textContent();
  expect(titleText).toBe('はさみしょうぎ');
});
