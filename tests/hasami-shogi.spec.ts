import { test, expect, describe, beforeEach } from '@playwright/test';

describe('はさみ将棋ゲームのE2Eテスト', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/hasami-shogi');
  });

  test('初期状態が正しく表示される', async ({ page }) => {
    // ゲームのタイトルが表示されていることを確認
    await expect(page.locator('header h1')).toHaveText('はさみしょうぎ');

    // TODO: 今後、盤面の駒の数や初期配置などを検証するアサーションを追加する
  });
});
