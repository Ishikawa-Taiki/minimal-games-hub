import { test, expect } from '@playwright/test';

test.describe('リバーシゲームのE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    // CI環境ではbasePathが無効化されるため、プレフィックスは不要
    await page.goto('/games/reversi');
    // ページのタイトルにデフォルトのサイト名が含まれていることを確認する
    await expect(page).toHaveTitle(/リバーシ/);

    // ページが読み込まれるまで待機
    await page.waitForLoadState('networkidle');
    
    // 盤面のセルの数を検証（これが読み込まれていればゲームが表示されている）
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(64);
  });

  test('初期状態の盤面が正しく表示される', async ({ page }) => {
    // 初期配置の駒を確認
    await expect(page.locator('[data-testid="cell-3-3"] > div').first()).toBeVisible();
    await expect(page.locator('[data-testid="cell-3-3"] > div').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(page.locator('[data-testid="cell-3-4"] > div').first()).toBeVisible();
    await expect(page.locator('[data-testid="cell-3-4"] > div').first()).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('[data-testid="cell-4-3"] > div').first()).toBeVisible();
    await expect(page.locator('[data-testid="cell-4-3"] > div').first()).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(page.locator('[data-testid="cell-4-4"] > div').first()).toBeVisible();
    await expect(page.locator('[data-testid="cell-4-4"] > div').first()).toHaveCSS('background-color', 'rgb(255, 255, 255)');

    // スコアの初期状態を検証
    const blackScore = await page.locator('[data-testid="score-black"]').textContent();
    expect(blackScore).toBe('2');
    const whiteScore = await page.locator('[data-testid="score-white"]').textContent();
    expect(whiteScore).toBe('2');

    // 手番表示を検証
    const turnIndicator = await page.locator('[data-testid="turn-indicator"]').textContent();
    expect(turnIndicator).toContain('のばん');
  });

  test('駒を置いて相手の駒が正しく裏返る', async ({ page }) => {
    // 黒が(2,3)に置く
    await page.locator('[data-testid="cell-2-3"]').waitFor();
    await page.locator('[data-testid="cell-2-3"]').click();

    // 少し待機して、アニメーションと状態更新を待つ
    await page.waitForTimeout(1000);

    // 駒が正しく置かれているか
    await expect(page.locator('[data-testid="cell-2-3"] > div').first()).toBeVisible();
    await expect(page.locator('[data-testid="cell-2-3"] > div').first()).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // 駒が裏返っているか
    await expect(page.locator('[data-testid="cell-3-3"] > div')).toHaveCSS('background-color', 'rgb(0, 0, 0)');

    // スコアが更新されているか
    const blackScore = await page.locator('[data-testid="score-black"]').textContent();
    expect(blackScore).toBe('4');
    const whiteScore = await page.locator('[data-testid="score-white"]').textContent();
    expect(whiteScore).toBe('1');

    // 手番が白に変わっているか
    await expect(page.locator('[data-testid="turn-indicator"] div')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('履歴機能が正しく動作する', async ({ page }) => {
    // 初期状態の履歴カウンターを確認
    const initialHistoryCounter = await page.locator('[data-testid="history-counter"]').textContent();
    expect(initialHistoryCounter).toBe('1 / 1');

    // 初期状態では履歴ボタンが無効化されている
    await expect(page.locator('[data-testid="history-first-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="history-back-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="history-forward-button"]')).toBeDisabled();
    await expect(page.locator('[data-testid="history-last-button"]')).toBeDisabled();

    // 1手目を打つ
    await page.locator('[data-testid="cell-2-3"]').click();
    await page.waitForTimeout(500);

    // 履歴カウンターが更新される
    const historyCounter1 = await page.locator('[data-testid="history-counter"]').textContent();
    expect(historyCounter1).toBe('2 / 2');

    // 戻るボタンが有効になる
    await expect(page.locator('[data-testid="history-back-button"]')).toBeEnabled();
    await expect(page.locator('[data-testid="history-first-button"]')).toBeEnabled();

    // 2手目を打つ
    await page.locator('[data-testid="cell-2-2"]').click();
    await page.waitForTimeout(500);

    // 履歴カウンターが更新される
    const historyCounter2 = await page.locator('[data-testid="history-counter"]').textContent();
    expect(historyCounter2).toBe('3 / 3');

    // 1手戻る
    await page.locator('[data-testid="history-back-button"]').click();
    await page.waitForTimeout(200);

    // 履歴カウンターが更新される
    const historyCounter3 = await page.locator('[data-testid="history-counter"]').textContent();
    expect(historyCounter3).toBe('2 / 3');

    // 進むボタンが有効になる
    await expect(page.locator('[data-testid="history-forward-button"]')).toBeEnabled();
    await expect(page.locator('[data-testid="history-last-button"]')).toBeEnabled();

    // 最初に戻る
    await page.locator('[data-testid="history-first-button"]').click();
    await page.waitForTimeout(200);

    // 履歴カウンターが初期状態に戻る
    const historyCounter4 = await page.locator('[data-testid="history-counter"]').textContent();
    expect(historyCounter4).toBe('1 / 3');

    // 初期状態のスコアに戻っている
    const blackScore = await page.locator('[data-testid="score-black"]').textContent();
    expect(blackScore).toBe('2');
    const whiteScore = await page.locator('[data-testid="score-white"]').textContent();
    expect(whiteScore).toBe('2');

    // 最後に進む
    await page.locator('[data-testid="history-last-button"]').click();
    await page.waitForTimeout(200);

    // 履歴カウンターが最新状態になる
    const historyCounter5 = await page.locator('[data-testid="history-counter"]').textContent();
    expect(historyCounter5).toBe('3 / 3');
  });
});
