import { test, expect, describe, beforeEach } from '@playwright/test';

describe('Tic-Tac-Toe Game', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/tictactoe');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(9);
  });

  test('should load the page and display the title', async ({ page }) => {
    await expect(page).toHaveTitle(/Minimal Games Hub/);
    const heading = await page.getByRole('heading', { name: '○×ゲーム' }).textContent();
    expect(heading).toBe('○×ゲーム');
  });

  test('should display the initial state correctly', async ({ page }) => {
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('現在のプレイヤー: O');
  });

  test('should allow players to take turns', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click();
    const cell00 = await page.getByTestId('cell-0-0').textContent();
    expect(cell00).toBe('O');
    const status1 = await page.getByTestId('status').textContent();
    expect(status1).toBe('現在のプレイヤー: X');

    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click();
    const cell01 = await page.getByTestId('cell-0-1').textContent();
    expect(cell01).toBe('X');
    const status2 = await page.getByTestId('status').textContent();
    expect(status2).toBe('現在のプレイヤー: O');
  });

  test('should declare a winner', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-1-0').waitFor();
    await page.getByTestId('cell-1-0').click(); // X
    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click(); // O
    await page.getByTestId('cell-1-1').waitFor();
    await page.getByTestId('cell-1-1').click(); // X
    await page.getByTestId('cell-0-2').waitFor();
    await page.getByTestId('cell-0-2').click(); // O
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('勝者: O');
  });

  test('should declare a draw', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click(); // X
    await page.getByTestId('cell-0-2').waitFor();
    await page.getByTestId('cell-0-2').click(); // O
    await page.getByTestId('cell-1-1').waitFor();
    await page.getByTestId('cell-1-1').click(); // X
    await page.getByTestId('cell-1-0').waitFor();
    await page.getByTestId('cell-1-0').click(); // O
    await page.getByTestId('cell-1-2').waitFor();
    await page.getByTestId('cell-1-2').click(); // X
    await page.getByTestId('cell-2-1').waitFor();
    await page.getByTestId('cell-2-1').click(); // O
    await page.getByTestId('cell-2-0').waitFor();
    await page.getByTestId('cell-2-0').click(); // X
    await page.getByTestId('cell-2-2').waitFor();
    await page.getByTestId('cell-2-2').click(); // O
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('引き分け！');
  });

  test('should reset the game', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click();
    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click();
    await page.getByTestId('reset-button').waitFor();
    await page.getByTestId('reset-button').click();
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('現在のプレイヤー: O');
  });

  test('should toggle hints and show hint', async ({ page }) => {
    const hintButton = page.getByTestId('hint-button');
    await hintButton.waitFor();
    const hintButtonText1 = await hintButton.textContent();
    expect(hintButtonText1).toBe('ヒント: OFF');
    await hintButton.click();
    const hintButtonText2 = await hintButton.textContent();
    expect(hintButtonText2).toBe('ヒント: ON');

    // Make moves to create a winning opportunity for O
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-1-0').waitFor();
    await page.getByTestId('cell-1-0').click(); // X
    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click(); // O

    // Hint for O should be visible in cell-0-2
    const hintCell = page.getByTestId('cell-0-2');
    const hintCellText = await hintCell.locator('span').textContent();
    expect(hintCellText).toBe('O');

    // Check for hint color
    await expect(hintCell).toHaveCSS('background-color', 'rgb(254, 249, 195)'); // light yellow from styles.reachingCell
  });

  describe('Game Over Modal', () => {
    test('should show game over modal when a player wins', async ({ page }) => {
      await page.locator('[data-testid="cell-0-0"]').click(); // O
      await page.locator('[data-testid="cell-1-0"]').click(); // X
      await page.locator('[data-testid="cell-0-1"]').click(); // O
      await page.locator('[data-testid="cell-1-1"]').click(); // X
      await page.locator('[data-testid="cell-0-2"]').click(); // O

      await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="winner-message"]')).toHaveText('勝者: O');
    });

    test('should show game over modal on a draw', async ({ page }) => {
      await page.locator('[data-testid="cell-0-0"]').click(); // O
      await page.locator('[data-testid="cell-0-1"]').click(); // X
      await page.locator('[data-testid="cell-0-2"]').click(); // O
      await page.locator('[data-testid="cell-1-1"]').click(); // X
      await page.locator('[data-testid="cell-1-0"]').click(); // O
      await page.locator('[data-testid="cell-1-2"]').click(); // X
      await page.locator('[data-testid="cell-2-1"]').click(); // O
      await page.locator('[data-testid="cell-2-0"]').click(); // X
      await page.locator('[data-testid="cell-2-2"]').click(); // O

      await expect(page.locator('[data-testid="game-over-modal"]')).toBeVisible();
      await expect(page.locator('[data-testid="winner-message"]')).toHaveText('引き分け！');
    });

    test('should reset the game when "Play Again" is clicked', async ({ page }) => {
      await page.locator('[data-testid="cell-0-0"]').click(); // O
      await page.locator('[data-testid="cell-1-0"]').click(); // X
      await page.locator('[data-testid="cell-0-1"]').click(); // O
      await page.locator('[data-testid="cell-1-1"]').click(); // X
      await page.locator('[data-testid="cell-0-2"]').click(); // O

      await page.locator('[data-testid="play-again-button"]').click();

      await expect(page.locator('[data-testid="game-over-modal"]')).not.toBeVisible();
      await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
      await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
      const status = await page.getByTestId('status').textContent();
      expect(status).toBe('現在のプレイヤー: O');
    });
  });
});