import { test, expect } from '@playwright/test';

test.describe('ホームページのナビゲーション', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('各ゲームへのリンクが正しく設定されている', async ({ page }) => {
    // リバーシへのリンクを確認
    const reversiLink = page.locator('a[href="/games/reversi/"]');
    await expect(reversiLink).toHaveAttribute('href', '/games/reversi/');

    // ○×ゲームへのリンクを確認
    const tictactoeLink = page.locator('a[href="/games/tictactoe/"]');
    await expect(tictactoeLink).toHaveAttribute('href', '/games/tictactoe/');

    // はさみ将棋へのリンクを確認
    const hasamiShogiLink = page.locator('a[href="/games/hasami-shogi/"]');
    await expect(hasamiShogiLink).toHaveAttribute('href', '/games/hasami-shogi/');
  });
});