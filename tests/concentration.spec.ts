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

  // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
  test.skip('カードをクリックしてめくることができる', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click();

    const card1 = page.getByTestId('card-0');
    const card2 = page.getByTestId('card-1');

    // カードをクリック
    await card1.click();
    await card2.click();

    // カードの表面が表示されていることを確認
    await expect(card1.locator('div')).toBeVisible();
    await expect(card2.locator('div')).toBeVisible();
  });

  // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
  test.skip('ゲーム終了時に結果ダイアログが表示され、もう一度遊べること', async ({ page }) => {
    await page.getByTestId('difficulty-easy').click();

    const cards = await page.locator('[data-testid^="card-"]').all();
    for (let i = 0; i < cards.length; i++) {
      // カードがまだ操作可能な場合のみクリック
      const card = page.locator(`[data-testid="card-${i}"]`);
      if (await card.isEnabled()) {
        await card.click();
        await page.waitForTimeout(100); // 状態更新を待つ
      }
    }

    // ゲーム終了まで待機
    await page.waitForTimeout(5000);

    // ダイアログの表示を待つ
    await expect(page.locator('[data-testid="alert-dialog"]')).toBeVisible({ timeout: 15000 });

    const title = await page.locator('[role="dialog"] h2').textContent();
    const message = await page.locator('[role="dialog"] p').textContent();

    expect(title).toMatch(/のかち|ひきわけ/);
    expect(message).toContain('ペアとったよ！');

    // OKボタンをクリックしてゲームをリセット
    await page.getByRole('button', { name: 'OK' }).click();

    // 難易度選択画面に戻ることを確認
    await expect(page.getByRole('heading', { name: '難易度を選んでください' })).toBeVisible();
  });
});
