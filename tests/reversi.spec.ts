import { test, expect, describe, beforeEach } from '@playwright/test';

describe('リバーシゲームのE2Eテスト', () => {
  beforeEach(async ({ page }) => {
    // CI環境ではbasePathが無効化されるため、プレフィックスは不要
    await page.goto('/games/reversi');
  });

  test('初期状態の盤面が正しく表示される', async ({ page }) => {
    // 盤面のセルの数を検証
    await expect(page.locator('[data-testid^="cell-"]')).toHaveCount(64);

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

  test('ゲームをリセットできる', async ({ page }) => {
    // 駒を置く
    await page.locator('[data-testid="cell-2-3"]').click();
    await page.waitForTimeout(1000);

    // リセットボタンを押す
    await page.locator('[data-testid="reset-button"]').click();
    await page.locator('[data-testid="confirm-reset-button"]').click();

    // 初期状態に戻っているか検証
    const blackScore = await page.locator('[data-testid="score-black"]').textContent();
    expect(blackScore).toBe('2');
    const whiteScore = await page.locator('[data-testid="score-white"]').textContent();
    expect(whiteScore).toBe('2');
    await expect(page.locator('[data-testid="cell-3-3"] > div')).toHaveCSS('background-color', 'rgb(255, 255, 255)');
  });

  test('ヒント機能が正しく動作する', async ({ page }) => {
    const hintButton = page.locator('[data-testid="hint-button"]');

    // 初期状態の「ヒントなし」を確認
    const hintLevelText1 = await page.locator('[data-testid="hint-level-text"]').textContent();
    expect(hintLevelText1).toBe('(ヒントなし)');
    await expect(page.locator('[data-testid="cell-2-3"] > .moveHint')).not.toBeVisible();
    await expect(page.locator('[data-testid="cell-2-3"] > .placeableHint')).not.toBeVisible();

    // 「おけるばしょ」に切り替え
    await hintButton.click();
    await page.waitForTimeout(200);
    const hintLevelText2 = await page.locator('[data-testid="hint-level-text"]').textContent();
    expect(hintLevelText2).toBe('(おけるばしょ)');
    await expect(page.locator('[data-testid="placeable-hint-2-3"]')).toBeVisible();

    // 「ぜんぶヒント」に切り替え
    await hintButton.click();
    await page.waitForTimeout(200);
    const hintLevelText3 = await page.locator('[data-testid="hint-level-text"]').textContent();
    expect(hintLevelText3).toBe('(ぜんぶヒント)');
    const moveHint = await page.locator('[data-testid="cell-2-3"] > .moveHint').textContent();
    expect(moveHint).toBe('1');
  });
});