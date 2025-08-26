import { test, expect, describe, beforeEach } from '@playwright/test';

describe('Tic-Tac-Toe Game', () => {
  beforeEach(async ({ page }) => {
    await page.goto('/games/tictactoe');
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(9);
  });

  test('should load the page and display the title', async ({ page }) => {
    await expect(page).toHaveTitle(/○×ゲーム/);
    const heading = await page.getByRole('heading', { name: '○×ゲーム' }).textContent();
    expect(heading).toBe('○×ゲーム');
  });

  test('should display the initial state correctly', async ({ page }) => {
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('Oの番');
  });

  test('should allow players to take turns', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click();
    const cell00 = await page.getByTestId('cell-0-0').textContent();
    expect(cell00).toBe('O');
    const status1 = await page.getByTestId('status').textContent();
    expect(status1).toBe('Xの番');

    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click();
    const cell01 = await page.getByTestId('cell-0-1').textContent();
    expect(cell01).toBe('X');
    const status2 = await page.getByTestId('status').textContent();
    expect(status2).toBe('Oの番');
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
    await page.getByTestId('control-panel-reset-button').waitFor();
    await page.getByTestId('control-panel-reset-button').click();
    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    const status = await page.getByTestId('status').textContent();
    expect(status).toBe('Oの番');
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
      expect(status).toBe('Oの番');
    });
  });

  describe('Responsive Layout', () => {
    test('should show desktop layout on wide screens', async ({ page }) => {
      // デスクトップサイズに設定
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/games/tictactoe');
      
      // FABが表示されないことを確認（モバイル専用）
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await expect(fab).not.toBeVisible();
      
      // ステータスが表示されることを確認
      const status = page.getByTestId('status');
      await expect(status).toBeVisible();
      
      // リセットボタンが直接表示されることを確認（サイドバー内）
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).toBeVisible();
      
      // ルールリンクが直接表示されることを確認
      const rulesLink = page.getByRole('link', { name: 'ルールを見る' });
      await expect(rulesLink).toBeVisible();
    });

    test('should show mobile layout on narrow screens', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/games/tictactoe');
      
      // FABが表示されることを確認
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await expect(fab).toBeVisible();
      
      // モバイルヘッダーにステータスが表示されることを確認
      const mobileStatus = page.getByTestId('status');
      await expect(mobileStatus).toBeVisible();
      
      // リセットボタンが直接表示されないことを確認（ボトムシート内にある）
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).not.toBeVisible();
    });

    test('should open bottom sheet when FAB is clicked on mobile', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/games/tictactoe');
      
      // FABをクリック
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await fab.click();
      
      // ボトムシートのオーバーレイが表示されることを確認
      const overlay = page.locator('[style*="position: fixed"][style*="background-color: rgba(0, 0, 0, 0.5)"]');
      await expect(overlay).toBeVisible();
      
      // リセットボタンがボトムシート内に表示されることを確認
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).toBeVisible();
      
      // ルールリンクが表示されることを確認
      const rulesLink = page.getByRole('link', { name: 'ルールを見る' });
      await expect(rulesLink).toBeVisible();
    });

    test('should close bottom sheet when overlay is clicked', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/games/tictactoe');
      
      // FABをクリックしてボトムシートを開く
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await fab.click();
      
      // オーバーレイをクリック
      const overlay = page.locator('[style*="position: fixed"][style*="background-color: rgba(0, 0, 0, 0.5)"]');
      await overlay.click({ position: { x: 10, y: 10 } }); // ボトムシート外をクリック
      
      // リセットボタンが非表示になることを確認
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).not.toBeVisible();
    });

    test('should switch layout when viewport changes', async ({ page }) => {
      // 最初はデスクトップサイズ
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/games/tictactoe');
      
      // リセットボタンが直接表示されることを確認（デスクトップレイアウト）
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).toBeVisible();
      
      // FABが表示されないことを確認
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await expect(fab).not.toBeVisible();
      
      // モバイルサイズに変更
      await page.setViewportSize({ width: 375, height: 667 });
      
      // 少し待ってからレイアウトの変更を確認
      await page.waitForTimeout(200);
      
      // リセットボタンが非表示になることを確認（モバイルレイアウト）
      await expect(resetButton).not.toBeVisible();
      
      // FABが表示されることを確認
      await expect(fab).toBeVisible();
    });
  });
});