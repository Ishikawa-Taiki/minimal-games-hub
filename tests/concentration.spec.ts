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

    // プレイヤー1が全10ペアを取得する
    for (let i = 0; i < 10; i++) {
      const card1_index = i * 2;
      const card2_index = i * 2 + 1;
      await page.locator(`[data-testid="card-${card1_index}"]`).click();
      await page.locator(`[data-testid="card-${card2_index}"]`).click();
      await page.waitForTimeout(200); // 状態更新を待つ
    }

    const winner = 'プレイヤー1';
    const p1_score = 10;
    const p2_score = 0;
    const expectedTitle = `${winner}のかち`;
    const expectedMessage = `プレイヤー1が${p1_score}ペア、プレイヤー2が${p2_score}ペアとったよ！`;

    const dialog = page.getByRole('dialog', { name: expectedTitle });
    await expect(dialog).toBeVisible({ timeout: 10000 });
    await expect(dialog).toContainText(expectedMessage);

    // OKボタンをクリックしてゲームをリセット
    await dialog.getByTestId('alert-dialog-confirm-button').click();

    // 難易度選択画面に戻ることを確認
    await expect(page.getByRole('heading', { name: '難易度を選んでください' })).toBeVisible();
  });
});
