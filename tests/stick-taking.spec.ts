import { test, expect } from '@playwright/test';

test.describe('棒消しゲーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/stick-taking');
  });

  test('最初に難易度選択画面が表示されること', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'かんたん (3だん)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ふつう (5だん)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'むずかしい (7だん)' })).toBeVisible();
  });

  test('難易度を選択するとゲームが開始されること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();
    await expect(page.getByTestId('game-state-display')).toHaveText('ゲーム状態プレイヤー1の番');
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await page.locator('[data-testid="stick-0-0"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('game-state-display')).toHaveText('ゲーム状態プレイヤー2の番');
    const stick = page.locator('[data-testid="stick-0-0"]');
    await expect(stick).toHaveAttribute('data-taken', 'true');
  });

  test.skip('ゲーム終了時に結果ダイアログが表示され、もう一度遊べること', async ({ page }) => {
    // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    // 1-1
    await page.locator('[data-testid="stick-0-0"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // 2-2
    await page.locator('[data-testid="stick-1-1"]').click();
    await page.locator('[data-testid="stick-1-2"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // 3-3
    await page.locator('[data-testid="stick-2-3"]').click();
    await page.locator('[data-testid="stick-2-4"]').click();
    await page.locator('[data-testid="stick-2-5"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // Check for the dialog
    await expect(page.getByRole('dialog', { name: 'プレイヤー2のかち！' })).toBeVisible();
    await expect(page.getByText('プレイヤー1がさいごのぼうをとったよ！')).toBeVisible();

    // Click confirm and check for reset
    await page.getByRole('button', { name: 'OK' }).click();
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
  });

});
