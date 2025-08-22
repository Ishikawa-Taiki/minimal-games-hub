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
    await expect(page.getByRole('heading', { name: "プレイヤー1のばん" })).toBeVisible();
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await expect(page.getByRole('heading', { name: "プレイヤー1のばん" })).toBeVisible();
    await page.locator('[data-testid^="row-0"] > div').first().click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByRole('heading', { name: "プレイヤー2のばん" })).toBeVisible();
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
    test.slow();
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    // P1: 3段目の棒を1本取る
    await page.locator('[data-testid="row-2"] > div').nth(0).click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // P2: 3段目の残りの棒を2本取る
    await page.locator('[data-testid="row-2"] > div').nth(1).click();
    await page.locator('[data-testid="row-2"] > div').nth(2).click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // P1: 2段目の棒を2本取る
    await page.locator('[data-testid="row-1"] > div').nth(0).click();
    await page.locator('[data-testid="row-1"] > div').nth(1).click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // P2: 1段目の最後の棒を取る
    await page.locator('[data-testid="row-0"] > div').nth(0).click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('game-over-modal')).toBeVisible();
    await expect(page.getByText('かったのは プレイヤー1！')).toBeVisible();
    await expect(page.getByText('(プレイヤー2がさいごのぼうをとったよ)')).toBeVisible();
  });

  test('「もういっかい」ボタンでゲームがリスタートすること', async ({ page }) => {
    test.slow();
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    const stickSelector = '[data-testid^="row-"] > div[style*="background-color: rgb(139, 69, 19)"]';

    // ゲームが終了するまでループ
    for (let i = 0; i < 6; i++) { // 6ターンあれば必ず終わる
      const modalVisible = await page.getByTestId('game-over-modal').isVisible();
      if (modalVisible) break;

      const availableSticks = page.locator(stickSelector);
      await availableSticks.first().click();
      await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
    }

    await page.getByTestId('play-again-button').click();
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
  });
});
