import { test, expect, describe, beforeEach } from '@playwright/test';

describe('Tic-Tac-Toe Game', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/tictactoe');
  });

  test('should load the page and display the title', async ({ page }) => {
    await expect(page).toHaveTitle(/Minimal Games Hub/);
    await expect(page.getByRole('heading', { name: '○×ゲーム' })).toBeVisible();
  });

  test('should display the initial state correctly', async ({ page }) => {
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    await expect(page.getByTestId('status')).toHaveText('現在のプレイヤー: O');
  });

  test('should allow players to take turns', async ({ page }) => {
    await page.getByTestId('cell-0-0').click();
    await expect(page.getByTestId('cell-0-0')).toHaveText('O');
    await expect(page.getByTestId('status')).toHaveText('現在のプレイヤー: X');

    await page.getByTestId('cell-0-1').click();
    await expect(page.getByTestId('cell-0-1')).toHaveText('X');
    await expect(page.getByTestId('status')).toHaveText('現在のプレイヤー: O');
  });

  test('should declare a winner', async ({ page }) => {
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-1-0').click(); // X
    await page.getByTestId('cell-0-1').click(); // O
    await page.getByTestId('cell-1-1').click(); // X
    await page.getByTestId('cell-0-2').click(); // O
    await expect(page.getByTestId('status')).toHaveText('勝者: O');
  });

  test('should declare a draw', async ({ page }) => {
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-0-1').click(); // X
    await page.getByTestId('cell-0-2').click(); // O
    await page.getByTestId('cell-1-1').click(); // X
    await page.getByTestId('cell-1-0').click(); // O
    await page.getByTestId('cell-1-2').click(); // X
    await page.getByTestId('cell-2-1').click(); // O
    await page.getByTestId('cell-2-0').click(); // X
    await page.getByTestId('cell-2-2').click(); // O
    await expect(page.getByTestId('status')).toHaveText('引き分け！');
  });

  test('should reset the game', async ({ page }) => {
    await page.getByTestId('cell-0-0').click();
    await page.getByTestId('cell-0-1').click();
    await page.getByTestId('reset-button').click();
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    await expect(page.getByTestId('status')).toHaveText('現在のプレイヤー: O');
  });

  test('should toggle hints and show hint', async ({ page }) => {
    const hintButton = page.getByTestId('hint-button');
    await expect(hintButton).toHaveText('ヒント: OFF');
    await hintButton.click();
    await expect(hintButton).toHaveText('ヒント: ON');

    // Make moves to create a winning opportunity for O
    await page.getByTestId('cell-0-0').click(); // O
    await page.getByTestId('cell-1-0').click(); // X
    await page.getByTestId('cell-0-1').click(); // O

    // Hint for O should be visible in cell-0-2
    const hintCell = page.getByTestId('cell-0-2');
    await expect(hintCell.locator('span')).toHaveText('O');

    // Check for hint color
    await expect(hintCell).toHaveCSS('background-color', 'rgb(254, 249, 195)'); // light yellow from styles.reachingCell
  });
});
