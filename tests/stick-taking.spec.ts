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
    await expect(page.getByRole('heading', { name: "Player 1のばん" })).toBeVisible();
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(9);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await expect(page.getByRole('heading', { name: "Player 1のばん" })).toBeVisible();
    await page.getByTestId('stick-0-0').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByRole('heading', { name: "Player 2のばん" })).toBeVisible();
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

  test('ゲーム終了時に勝者モーダルが表示されること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    // 1段目の棒をすべて取る
    await page.getByTestId('stick-0-0').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // 2段目の棒をすべて取る
    await page.getByTestId('stick-1-0').click();
    await page.getByTestId('stick-1-1').click();
    await page.getByTestId('stick-1-2').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // 3段目の棒を4本取る
    await page.getByTestId('stick-2-0').click();
    await page.getByTestId('stick-2-1').click();
    await page.getByTestId('stick-2-2').click();
    await page.getByTestId('stick-2-3').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // 最後の1本を取る
    await page.getByTestId('stick-2-4').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('game-over-modal')).toBeVisible();
    await expect(page.getByText('かったのは Player 1！')).toBeVisible();
    await expect(page.getByText('(Player 2がさいごのぼうをとったよ)')).toBeVisible();
  });

  test('「もういっかい」ボタンでゲームがリスタートすること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    const stickSelector = '[style*="background-color: rgb(139, 69, 19)"]';
    const stickCount = await page.locator('[data-testid^="stick-"]').count();
    for (let i = 0; i < stickCount; i++) {
      const sticks = await page.locator(stickSelector).all();
      if(sticks.length === 0) break;
      await sticks[0].click();
      await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
      const isModalVisible = await page.getByTestId('game-over-modal').isVisible();
      if(isModalVisible) break;
    }

    await page.getByTestId('play-again-button').click();
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
  });
});
