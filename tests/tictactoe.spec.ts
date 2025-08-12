import { test, expect, describe, beforeEach } from '@playwright/test';

describe('Tic-Tac-Toe Game', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/tictactoe');
  });

  test('should load the page and display the title', async ({ page }) => {
    await expect(page).toHaveTitle(/Minimal Games Hub/);
  });

  test('should display the initial state correctly', async ({ page }) => {
    await expect(page.locator('h1')).toHaveText('○×ゲーム');
    await expect(page.locator('button:has-text("O")')).toHaveCount(0);
    await expect(page.locator('button:has-text("X")')).toHaveCount(0);
    await expect(page.locator('p')).toHaveText('現在のプレイヤー: O');
  });

  test('should allow players to take turns', async ({ page }) => {
    await page.locator('button').nth(0).click();
    await expect(page.locator('button').nth(0)).toHaveText('O');
    await expect(page.locator('p')).toHaveText('現在のプレイヤー: X');

    await page.locator('button').nth(1).click();
    await expect(page.locator('button').nth(1)).toHaveText('X');
    await expect(page.locator('p')).toHaveText('現在のプレイヤー: O');
  });

  test('should declare a winner', async ({ page }) => {
    await page.locator('button').nth(0).click(); // O
    await page.locator('button').nth(3).click(); // X
    await page.locator('button').nth(1).click(); // O
    await page.locator('button').nth(4).click(); // X
    await page.locator('button').nth(2).click(); // O
    await expect(page.locator('p')).toHaveText('勝者: O');
  });

  test('should declare a draw', async ({ page }) => {
    await page.locator('button').nth(0).click(); // O
    await page.locator('button').nth(1).click(); // X
    await page.locator('button').nth(2).click(); // O
    await page.locator('button').nth(4).click(); // X
    await page.locator('button').nth(3).click(); // O
    await page.locator('button').nth(5).click(); // X
    await page.locator('button').nth(7).click(); // O
    await page.locator('button').nth(6).click(); // X
    await page.locator('button').nth(8).click(); // O
    await expect(page.locator('p')).toHaveText('引き分け！');
  });

  test('should reset the game', async ({ page }) => {
    await page.locator('button').nth(0).click();
    await page.locator('button').nth(1).click();
    await page.locator('button:has-text("ゲームをリセット")').click();
    await expect(page.locator('button:has-text("O")')).toHaveCount(0);
    await expect(page.locator('button:has-text("X")')).toHaveCount(0);
    await expect(page.locator('p')).toHaveText('現在のプレイヤー: O');
  });

  test('should toggle hints', async ({ page }) => {
    const hintButton = page.locator('button:has-text("ヒント: OFF")');
    await hintButton.click();
    await expect(page.locator('button:has-text("ヒント: ON")')).toBeVisible();

    // Make a move to create a winning opportunity for O
    await page.locator('button').nth(0).click(); // O
    await page.locator('button').nth(3).click(); // X
    await page.locator('button').nth(1).click(); // O

    // Hint for O should be visible
    await expect(page.locator('button').nth(2)).toContainText('O');
    await expect(page.locator('button').nth(2)).toHaveCSS('background-color', 'rgb(254, 249, 195)');
  });
});
