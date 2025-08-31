import { test, expect } from '@playwright/test';

test.describe('Reversi GameLayout Debug', () => {
  test('should render GameLayout with responsive behavior', async ({ page }) => {
    // リバーシページに移動
    await page.goto('/games/reversi');
    
    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // GameLayoutが正しくレンダリングされているかチェック
    console.log('Checking for GameLayout elements...');
    
    // デスクトップレイアウトの要素をチェック
    const sidebar = page.locator('[data-testid="sidebar"]').or(page.locator('aside'));
    const sidebarExists = await sidebar.count() > 0;
    console.log('Sidebar exists:', sidebarExists);
    
    // ゲームボードが表示されているかチェック
    const gameBoard = page.locator('[data-testid="cell-0-0"]');
    await expect(gameBoard).toBeVisible();
    console.log('Game board is visible');
    
    // スコア表示をチェック
    const scoreBlack = page.locator('[data-testid="score-black"]');
    const scoreWhite = page.locator('[data-testid="score-white"]');
    await expect(scoreBlack).toBeVisible();
    await expect(scoreWhite).toBeVisible();
    console.log('Scores are visible');
    
    // ヒントボタンをチェック
    const hintButton = page.locator('[data-testid="hint-button"]');
    await expect(hintButton).toBeVisible();
    console.log('Hint button is visible');
    
    // ヒントボタンをクリックしてヒント機能をテスト
    await hintButton.click();
    
    // ボタンの状態が変わることを確認（ここでは単純にクリックできるかで判定）
    await expect(hintButton).toBeEnabled();
    
    // 有効な移動をクリックしてゲームが動作するかテスト
    const validMoveCell = page.locator('[data-testid="cell-2-3"]');
    await validMoveCell.click();
    
    // 移動後のスコアが変更されたかチェック
    await page.waitForTimeout(500); // アニメーション待機
    const newScoreBlack = await scoreBlack.textContent();
    console.log('Score after move:', newScoreBlack);
    
    // ブラウザのコンソールログを取得
    const logs: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('GameStateLogger')) {
        logs.push(msg.text());
      }
    });
    
    // 少し待ってログを確認
    await page.waitForTimeout(1000);
    console.log('GameStateLogger logs:', logs.length > 0 ? logs.slice(0, 5) : 'No logs found');
  });

  test('should show mobile layout on small screen', async ({ page }) => {
    // モバイルサイズに設定
    await page.setViewportSize({ width: 375, height: 667 });
    
    // リバーシページに移動
    await page.goto('/games/reversi');
    await page.waitForLoadState('networkidle');
    
    // モバイルレイアウトの要素をチェック
    console.log('Checking mobile layout...');
    
    // FABが表示されているかチェック
    const fab = page.locator('[data-testid="fab"]').or(page.locator('button[aria-label*="コントロール"]'));
    const fabExists = await fab.count() > 0;
    console.log('FAB exists:', fabExists);
    
    if (fabExists) {
      // FABをクリックしてボトムシートを開く
      await fab.click();
      
      // ボトムシートが表示されるかチェック
      const bottomSheet = page.locator('[data-testid="bottom-sheet"]').or(page.locator('[role="dialog"]'));
      const bottomSheetExists = await bottomSheet.count() > 0;
      console.log('Bottom sheet exists after FAB click:', bottomSheetExists);
    }
    
    // ゲームボードが表示されているかチェック
    const gameBoard = page.locator('[data-testid="cell-0-0"]');
    await expect(gameBoard).toBeVisible();
    console.log('Game board is visible on mobile');
  });

  test('should log game state changes', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // コンソールログを収集
    page.on('console', msg => {
      consoleLogs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    // リバーシページに移動
    await page.goto('/games/reversi');
    await page.waitForLoadState('networkidle');
    
    // 少し待ってログを確認
    await page.waitForTimeout(2000);
    
    // GameStateLoggerのログがあるかチェック
    const gameStateLoggerLogs = consoleLogs.filter(log => 
      log.includes('GameStateLogger') || 
      log.includes('useReversi') || 
      log.includes('GameLayout')
    );
    
    console.log('Total console logs:', consoleLogs.length);
    console.log('GameStateLogger related logs:', gameStateLoggerLogs.length);
    
    if (gameStateLoggerLogs.length > 0) {
      console.log('Sample GameStateLogger logs:');
      gameStateLoggerLogs.slice(0, 3).forEach(log => console.log('  ', log));
    }
    
    // ゲームの操作を行ってログが増えるかテスト
    const hintButton = page.locator('[data-testid="hint-button"]');
    if (await hintButton.isVisible()) {
      await hintButton.click();
      await page.waitForTimeout(500);
    }
    
    const validMoveCell = page.locator('[data-testid="cell-2-3"]');
    if (await validMoveCell.isVisible()) {
      await validMoveCell.click();
      await page.waitForTimeout(1000);
    }
    
    // 操作後のログ数をチェック
    const finalGameStateLoggerLogs = consoleLogs.filter(log => 
      log.includes('GameStateLogger') || 
      log.includes('useReversi') || 
      log.includes('GameLayout')
    );
    
    console.log('Final GameStateLogger related logs:', finalGameStateLoggerLogs.length);
    
    // ログが増加していることを確認
    expect(finalGameStateLoggerLogs.length).toBeGreaterThan(gameStateLoggerLogs.length);
  });
});