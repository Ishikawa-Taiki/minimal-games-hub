import { test, expect } from '@playwright/test';

test.describe('Tic-Tac-Toe Game', () => {
  test.beforeEach(async ({ page }) => {
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
    const status = await page.getByTestId('game-state-display').textContent();
    expect(status).toBe('ゲーム状態○のばん');
  });

  test('should allow players to take turns', async ({ page }) => {
    await page.getByTestId('cell-0-0').waitFor();
    await page.getByTestId('cell-0-0').click();
    const cell00 = await page.getByTestId('cell-0-0').textContent();
    expect(cell00).toBe('O');
    const status1 = await page.getByTestId('game-state-display').textContent();
    expect(status1).toBe('ゲーム状態×のばん');

    await page.getByTestId('cell-0-1').waitFor();
    await page.getByTestId('cell-0-1').click();
    const cell01 = await page.getByTestId('cell-0-1').textContent();
    expect(cell01).toBe('X');
    const status2 = await page.getByTestId('game-state-display').textContent();
    expect(status2).toBe('ゲーム状態○のばん');
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
    const status = await page.getByTestId('game-state-display').textContent();
    expect(status).toBe('ゲーム状態○のかち！');
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
    const status = await page.getByTestId('game-state-display').textContent();
    expect(status).toBe('ゲーム状態ひきわけ！');
  });

  test('should reset the game', async ({ page }) => {
    await page.getByTestId('cell-0-0').click();
    await page.getByTestId('cell-0-1').click();

    const resetButton = page.getByTestId('control-panel-reset-button');
    await expect(resetButton).toBeVisible();
    await resetButton.click();

    // 確認ダイアログでOKをクリック
    const dialog = page.getByRole('dialog', { name: 'かくにん' });
    await expect(dialog).toBeVisible();
    await dialog.getByTestId('confirmation-dialog-confirm-button').click();

    await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
    await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
    const status = await page.getByTestId('game-state-display').textContent();
    expect(status).toBe('ゲーム状態○のばん');
  });

  test.describe('Game Over Modal', () => {
    // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
    test('should show game over modal when a player wins', async ({ page }) => {
      await page.locator('[data-testid="cell-0-0"]').click(); // O
      await page.locator('[data-testid="cell-1-0"]').click(); // X
      await page.locator('[data-testid="cell-0-1"]').click(); // O
      await page.locator('[data-testid="cell-1-1"]').click(); // X
      await page.locator('[data-testid="cell-0-2"]').click(); // O

      const dialog = page.getByRole('dialog', { name: '○のかち！' });
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(dialog).toContainText('○がそろったので、○のかち！');
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

      const dialog = page.getByRole('dialog', { name: 'ひきわけ！' });
      await expect(dialog).toBeVisible({ timeout: 10000 });
      await expect(dialog).toContainText('もういちどあそぶ？');
    });

    test('should reset the game when "Play Again" is clicked', async ({ page }) => {
      await page.locator('[data-testid="cell-0-0"]').click(); // O
      await page.locator('[data-testid="cell-1-0"]').click(); // X
      await page.locator('[data-testid="cell-0-1"]').click(); // O
      await page.locator('[data-testid="cell-1-1"]').click(); // X
      await page.locator('[data-testid="cell-0-2"]').click(); // O

      const dialog = page.getByRole('dialog', { name: '○のかち！' });
      await expect(dialog).toBeVisible();
      await dialog.getByTestId('alert-dialog-confirm-button').click();


      await expect(dialog).not.toBeVisible();
      await expect(page.locator('[data-testid^=cell-]:has-text("O")')).toHaveCount(0);
      await expect(page.locator('[data-testid^=cell-]:has-text("X")')).toHaveCount(0);
      const status = await page.getByTestId('game-state-display').locator('p').textContent();
      expect(status).toBe('○のばん');
    });
  });

  test.describe('Responsive Layout', () => {
    test('should show desktop layout on wide screens', async ({ page }) => {
      // デスクトップサイズに設定
      await page.setViewportSize({ width: 1024, height: 768 });
      await page.goto('/games/tictactoe');
      
      // FABが表示されないことを確認（モバイル専用）
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await expect(fab).not.toBeVisible();
      
      // ゲーム状態表示がされることを確認
      const status = page.getByTestId('game-state-display');
      await expect(status).toBeVisible();
      
      // リセットボタンが直接表示されることを確認（サイドバー内）
      const resetButton = page.getByTestId('control-panel-reset-button');
      await expect(resetButton).toBeVisible();
      await resetButton.click();
      const dialog = page.getByRole('dialog', { name: 'かくにん' });
      await expect(dialog).toBeVisible();
      await dialog.getByTestId('confirmation-dialog-cancel-button').click(); // close dialog
      
      // ルールリンクが直接表示されることを確認
      const rulesLink = page.getByRole('button', { name: 'ルールを見る' });
      await expect(rulesLink).toBeVisible();
    });

    test('should show mobile layout on narrow screens', async ({ page }) => {
      // モバイルサイズに設定
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/games/tictactoe');
      
      // FABが表示されることを確認
      const fab = page.locator('button[aria-label="コントロールパネルを開く"]');
      await expect(fab).toBeVisible();
      
      // ゲーム状態表示が非表示（モバイルヘッダーで代替）であることを確認
      const gameStateDisplay = page.getByTestId('game-state-display');
      await expect(gameStateDisplay).not.toBeVisible();
      
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
      await resetButton.click();
      const dialog = page.getByRole('dialog', { name: 'かくにん' });
      await expect(dialog).toBeVisible();
      await dialog.getByTestId('confirmation-dialog-cancel-button').click(); // close dialog

      // ルールリンクが表示されることを確認
      const rulesLink = page.getByRole('button', { name: 'ルールを見る' });
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