import { test, expect, Page, describe } from '@playwright/test';

/**
 * 指定されたセルの駒のプレイヤー（色）を取得します。
 * @param page PlaywrightのPageオブジェクト
 * @param r 行インデックス (0-7)
 * @param c 列インデックス (0-7)
 * @returns 'BLACK'、'WHITE'、または駒がない場合はnull
 */
const getCellDiscPlayer = async (page: Page, r: number, c: number): Promise<'BLACK' | 'WHITE' | null> => {
  const cell = page.getByTestId(`cell-${r}-${c}`);
  // セル内に直接の子供として存在するdivが駒を表す
  const disc = cell.locator('> div').first();
  const hasDisc = await disc.isVisible();
  if (!hasDisc) {
    return null;
  }
  const backgroundColor = await disc.evaluate(el => getComputedStyle(el).backgroundColor);
  if (backgroundColor === 'rgb(0, 0, 0)') { // black
    return 'BLACK';
  }
  if (backgroundColor === 'rgb(255, 255, 255)') { // white
    return 'WHITE';
  }
  return null;
};

test.describe('リバーシゲームの表示仕様', () => {
  test.beforeEach(async ({ page }) => {
    // isProdがtrueの場合、basePathが設定されるため、CI環境ではパスのプレフィックスが必要
    await page.goto('/minimal-games-hub/games/reversi');
    // spec-display.md 1, 2: 初期状態でスコアが表示されるのを待つ
    await expect(page.getByTestId('score-black')).toHaveText('2');
    await expect(page.getByTestId('score-white')).toHaveText('2');
  });

  test('初期状態で盤面、スコア、手番が正しく表示される', async ({ page }) => {
    // spec-display.md 2: スコアボードの初期値を確認
    await expect(page.getByTestId('score-black')).toHaveText('2');
    await expect(page.getByTestId('score-white')).toHaveText('2');

    // spec-display.md 2: 手番インジケーターが黒番であることを確認
    const turnIndicator = page.getByTestId('turn-indicator');
    const disc = turnIndicator.locator('div').first();
    await expect(disc).toHaveCSS('background-color', 'rgb(0, 0, 0)');
    await expect(turnIndicator).toContainText('のばん');

    // spec-display.md 2: 盤面の初期配置を確認
    expect(await getCellDiscPlayer(page, 3, 3)).toBe('WHITE');
    expect(await getCellDiscPlayer(page, 3, 4)).toBe('BLACK');
    expect(await getCellDiscPlayer(page, 4, 3)).toBe('BLACK');
    expect(await getCellDiscPlayer(page, 4, 4)).toBe('WHITE');

    // spec-display.md 1: 主要なボタンが存在することを確認
    await expect(page.getByTestId('reset-button')).toBeVisible();
    await expect(page.getByTestId('hint-button')).toBeVisible();
  });

  test('有効なマスに石を置くと、スコアと盤面が更新され手番が変わる', async ({ page }) => {
    // spec-display.md 3: プレイヤーの操作
    // 有効なマスの一つである (2, 4) をクリック
    await page.getByTestId('cell-2-4').click();

    // spec-display.md 3: 操作へのフィードバックと状態更新
    // 手番が白に変わるのを待つことで、アニメーションと状態更新を待機
    const turnIndicator = page.getByTestId('turn-indicator');
    const disc = turnIndicator.locator('div').first();
    await expect(disc).toHaveCSS('background-color', 'rgb(255, 255, 255)', { timeout: 5000 });

    // spec-display.md 2: スコアが更新されることを確認
    await expect(page.getByTestId('score-black')).toHaveText('4');
    await expect(page.getByTestId('score-white')).toHaveText('1');

    // spec-display.md 2: 盤面が更新されることを確認
    // 新しく置かれた黒石
    expect(await getCellDiscPlayer(page, 2, 4)).toBe('BLACK');
    // ひっくり返された黒石
    expect(await getCellDiscPlayer(page, 3, 4)).toBe('BLACK');
  });

  test('履歴機能（戻る・進む）が正しく動作する', async ({ page }) => {
    // 初期状態の確認
    await expect(page.getByTestId('score-black')).toHaveText('2');
    await expect(page.getByTestId('history-counter')).toHaveText('1 / 1');

    // 1手進める
    await page.getByTestId('cell-2-4').click();
    await expect(page.getByTestId('score-black')).toHaveText('4', { timeout: 5000 });
    await expect(page.getByTestId('history-counter')).toHaveText('2 / 2');

    // 履歴を1手戻す
    await page.getByTestId('history-back-button').click();
    await expect(page.getByTestId('score-black')).toHaveText('2');
    await expect(page.getByTestId('history-counter')).toHaveText('1 / 2');
    // 盤面が初期状態に戻っていることを確認
    expect(await getCellDiscPlayer(page, 2, 4)).toBe(null);
    expect(await getCellDiscPlayer(page, 3, 4)).toBe('BLACK');

    // 履歴を1手進める
    await page.getByTestId('history-forward-button').click();
    await expect(page.getByTestId('score-black')).toHaveText('4');
    await expect(page.getByTestId('history-counter')).toHaveText('2 / 2');
    // 盤面が1手進んだ状態になっていることを確認
    expect(await getCellDiscPlayer(page, 2, 4)).toBe('BLACK');
    expect(await getCellDiscPlayer(page, 3, 4)).toBe('BLACK');
  });
});
