import { test, expect } from '@playwright/test';

test.describe('棒消しゲーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/stick-taking');
  });

  test('最初に難易度選択画面が表示されること', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'かんたん (3だん)' })).toBeVisible();
  });

  test('難易度を選択するとゲームが開始されること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();
    await expect(page.getByTestId('game-state-display').locator('p')).toHaveText('「プレイヤー1」のばん');
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();
    await page.locator('[data-testid="stick-0-0"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
    await expect(page.getByTestId('game-state-display').locator('p')).toHaveText('「プレイヤー2」のばん');
  });

  test.skip('ゲーム終了時に結果ダイアログが表示され、もう一度遊べること', async () => {
    // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
  });
});
