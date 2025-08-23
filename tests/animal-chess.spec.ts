import { test, expect } from '@playwright/test';

test.describe('Animal Chess Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/animal-chess');
  });

  test('ページのタイトルが正しく表示されている', async ({ page }) => {
    const titleLocator = page.locator('main h1');
    const titleText = await titleLocator.textContent();
    expect(titleText).toBe('アニマルチェス');
  });

  test('初期状態で先手（プレイヤー1）のターンである', async ({ page }) => {
    const turnIndicator = page.locator('div[style*="controls"] p');
    const turnText = await turnIndicator.textContent();
    expect(turnText).toContain('てばん: プレイヤー 1');
  });

  test('駒を動かし、ターンが相手に移ることを確認する', async ({ page }) => {
    const fromCell = page.locator('.board > div:nth-child(3) > div:nth-child(2)'); // (2, 1)
    const toCell = page.locator('.board > div:nth-child(2) > div:nth-child(2)');   // (1, 1)
    const pieceLocator = fromCell.locator('.piece');

    // Initial state check
    await expect(pieceLocator).toHaveCount(1);
    await expect(toCell.locator('.piece')).toHaveCount(0);

    // 1. Select piece
    await fromCell.click();

    // 2. Move piece
    await toCell.click();

    // Final state check
    await expect(fromCell.locator('.piece')).toHaveCount(0);
    await expect(toCell.locator('.piece')).toHaveCount(1);

    // Check if label is correct
    const movedPieceText = await toCell.locator('text').textContent();
    expect(movedPieceText).toBe('ヒ');

    // Check turn indicator
    const turnIndicator = page.locator('div[style*="controls"] p');
    const turnText = await turnIndicator.textContent();
    expect(turnText).toContain('てばん: プレイヤー 2');
  });

  test('リセットボタンが正しく機能する', async ({ page }) => {
    const fromCell = page.locator('.board > div:nth-child(3) > div:nth-child(2)'); // (2, 1)
    const toCell = page.locator('.board > div:nth-child(2) > div:nth-child(2)');   // (1, 1)

    // Make a move
    await fromCell.click();
    await toCell.click();

    // Verify move happened
    await expect(fromCell.locator('.piece')).toHaveCount(0);
    await expect(toCell.locator('.piece')).toHaveCount(1);

    // Click reset button (in controls div)
    const resetButton = page.locator('div[style*="controls"] button:has-text("リセット")');
    await resetButton.click();

    // Verify board is reset
    await expect(fromCell.locator('.piece')).toHaveCount(1);
    await expect(toCell.locator('.piece')).toHaveCount(0);

    // Verify turn is reset
    const turnIndicator = page.locator('div[style*="controls"] p');
    const turnText = await turnIndicator.textContent();
    expect(turnText).toContain('てばん: プレイヤー 1');
  });
});
