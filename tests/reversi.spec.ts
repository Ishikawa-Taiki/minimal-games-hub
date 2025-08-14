import { test, expect, describe } from '@playwright/test';

describe('E2Eテストの仕組みの動作確認', () => {
  test('リバーシのページが正しく読み込まれ、タイトルが表示される', async ({ page }) => {
    // CI環境ではbasePathが無効化されるため、プレフィックスは不要
    await page.goto('/games/reversi');

    // ページのタイトルにデフォルトのサイト名が含まれていることを確認する
    await expect(page).toHaveTitle(/Minimal Games Hub/);

    // ゲームのタイトルが表示されていることを確認
    const title = page.locator('header h1');
    await expect(title).toHaveText('リバーシ');
  });
});
