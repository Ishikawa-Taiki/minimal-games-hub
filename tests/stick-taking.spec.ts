import { test, expect } from '@playwright/test';

test.describe('Stick Taking Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/stick-taking');
  });

  test('should display difficulty selection screen first', async ({ page }) => {
    await expect(page.getByRole('heading', { name: '難易度を選択してください' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'かんたん (3段)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ふつう (5段)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'むずかしい (7段)' })).toBeVisible();
  });

  test('should start the game after selecting a difficulty', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3段)' }).click();
    await expect(page.getByRole('heading', { name: "Player 1のターン" })).toBeVisible();
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(9);
  });

  test('should allow taking sticks and switch turns', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3段)' }).click();

    await expect(page.getByRole('heading', { name: "Player 1のターン" })).toBeVisible();
    await page.getByTestId('stick-0-0').click();
    await page.getByRole('button', { name: '選択した棒を消す' }).click();

    await expect(page.getByRole('heading', { name: "Player 2のターン" })).toBeVisible();
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

  test('should show winner modal when game ends', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3段)' }).click();

    // Player 1 takes all sticks from row 1
    await page.getByTestId('stick-0-0').click();
    await page.getByRole('button', { name: '選択した棒を消す' }).click();

    // Player 2 takes all sticks from row 2
    await page.getByTestId('stick-1-0').click();
    await page.getByTestId('stick-1-1').click();
    await page.getByTestId('stick-1-2').click();
    await page.getByRole('button', { name: '選択した棒を消す' }).click();

    // Player 1 takes 4 sticks from row 3, leaving 1
    await page.getByTestId('stick-2-0').click();
    await page.getByTestId('stick-2-1').click();
    await page.getByTestId('stick-2-2').click();
    await page.getByTestId('stick-2-3').click();
    await page.getByRole('button', { name: '選択した棒を消す' }).click();

    // Player 2 takes the last stick
    await page.getByTestId('stick-2-4').click();
    await page.getByRole('button', { name: '選択した棒を消す' }).click();

    await expect(page.getByTestId('game-over-modal')).toBeVisible();
    await expect(page.getByText('勝者: Player 1')).toBeVisible();
    await expect(page.getByText('(Player 2が最後の棒を取りました)')).toBeVisible();
  });

  test('should restart the game when "Play Again" is clicked', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3段)' }).click();

    // Play until the end
    const stickSelector = '[data-testid^="stick-"]';
    const stickCount = await page.locator(stickSelector).count();
    for (let i = 0; i < stickCount; i++) {
      const sticks = await page.locator('[style*="background-color: rgb(139, 69, 19)"]').all();
      if(sticks.length === 0) break;
      await sticks[0].click();
      await page.getByRole('button', { name: '選択した棒を消す' }).click();
      const isModalVisible = await page.getByTestId('game-over-modal').isVisible();
      if(isModalVisible) break;
    }

    await page.getByTestId('play-again-button').click();
    await expect(page.getByRole('heading', { name: '難易度を選択してください' })).toBeVisible();
  });
});
