import { test, expect, describe } from '@playwright/test';

describe('E2Eテストの仕組みの動作確認', () => {
  test('リバーシのページが正しく読み込まれ、タイトルが表示される', async ({ page }) => {
    // isProdがtrueの場合、basePathが設定されるため、CI環境ではパスのプレフィックスが必要
    await page.goto('/minimal-games-hub/games/reversi');

    // ページのタイトルにゲーム名が含まれていることだけを確認する最小限のテスト
    await expect(page).toHaveTitle(/リバーシ/);
  });
});
