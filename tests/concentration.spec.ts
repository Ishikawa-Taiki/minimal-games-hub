import { test, expect } from '@playwright/test';

test.describe('神経衰弱ゲーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/concentration');
    await expect(page).toHaveTitle(/神経衰弱/);
  });

  test('初期表示と難易度選択', async ({ page }) => {
    // 初期表示の確認
    await expect(page.getByRole('heading', { name: '難易度を選んでください' })).toBeVisible();

    // 難易度を選択
    await page.getByTestId('difficulty-easy').click();

    // ゲームボードが表示されることを確認
    await expect(page.locator('[data-testid^="card-"]')).toHaveCount(20);
  });

});
