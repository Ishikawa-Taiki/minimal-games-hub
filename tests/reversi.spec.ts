import { test, expect, describe } from '@playwright/test';

describe('E2Eテストの仕組みの動作確認', () => {
  test('リバーシのページが正しく読み込まれ、タイトルが表示される', async ({ page }) => {
    // CI環境ではbasePathが無効化されるため、プレフィックスは不要
    await page.goto('/games/reversi');

    // ページのタイトルにゲーム名が含まれていることだけを確認する最小限のテスト
    await expect(page).toHaveTitle(/リバーシ/);
  });
});
