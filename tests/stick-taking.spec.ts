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
    await expect(page.getByTestId('status')).toHaveText('プレイヤー1のばん');
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await expect(page.getByTestId('status')).toHaveText('プレイヤー1のばん');
    await page.locator('[data-testid^="row-0"] > div').first().click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('status')).toHaveText('プレイヤー2のばん');
    const sticks = await page.locator('[data-testid^="stick-"]').all();
    let takenCount = 0;
    for (const stick of sticks) {
      const style = await stick.getAttribute('style');
      if (style?.includes('background-color: rgb(211, 211, 211)')) {
        takenCount++;
      }
    }
    expect(takenCount).toBe(1);
  });

});
