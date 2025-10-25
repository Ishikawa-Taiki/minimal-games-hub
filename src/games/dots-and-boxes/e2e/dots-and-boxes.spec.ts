import { test, expect } from '@playwright/test';

test.describe('ドット＆ボックス E2Eテスト', () => {
  test('難易度を選択してゲームを開始し、基本的な操作ができる', async ({ page }) => {
    await page.goto('/games/dots-and-boxes');

    // 1. 難易度選択画面が表示されることを確認
    await expect(page.getByRole('button', { name: 'かんたん' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ふつう' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'むずかしい' })).toBeVisible();

    // 2. 「かんたん」モードを選択
    await page.getByRole('button', { name: 'かんたん' }).click();

    // 3. ゲームボードが表示されることを確認 (2x2のマスなので、h-line-0-0が存在するはず)
    const firstLine = page.locator('[data-testid="h-line-0-0"]');
    await expect(firstLine).toBeVisible();

    // 4. 最初のラインを引く
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー1」のばん');
    await firstLine.click();

    // 5. プレイヤーが交代することを確認
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー2」のばん');

    // 6. ボックスを完成させる
    await page.locator('[data-testid="v-line-0-0"]').click(); // p2
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー1」のばん');
    await page.locator('[data-testid="h-line-1-0"]').click(); // p1
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー2」のばん');
    await page.locator('[data-testid="v-line-0-1"]').click(); // p2 completes a box

    // 7. スコアが加算され、ターンが維持されることを確認
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー2」のばん');
    const scorePlayer2 = page.locator('[data-testid="score-value-player2"]');
    await expect(scorePlayer2).toHaveText('1');
  });

  test('無効な操作（既に引かれた辺をクリック）でコンソールエラーが出力される', async ({ page }) => {
    await page.goto('/games/dots-and-boxes');
    await page.getByRole('button', { name: 'かんたん' }).click();

    const firstLine = page.locator('[data-testid="h-line-0-0"]');
    await firstLine.click(); // 1回目のクリック

    // イベント待機とアクションを同時に実行
    const [msg] = await Promise.all([
      page.waitForEvent('console', { predicate: (msg) => msg.type() === 'error' }),
      firstLine.click(), // 2回目のクリック（無効）
    ]);

    const errorMessage = msg.text();
    expect(errorMessage).toBe('Invalid action: Line (h, 0, 0) has already been selected.');
  });

  test('ヒントモードで無効な操作をするとコンソールエラーが出力される', async ({ page }) => {
    await page.goto('/games/dots-and-boxes');
    await page.getByRole('button', { name: 'かんたん' }).click();

    // ヒントモードを有効にする
    await page.getByTestId('control-panel-hint-button').click();

    const firstLine = page.locator('[data-testid="h-line-0-0"]');
    // 1回クリックしてプレビュー
    await firstLine.click();
    // 2回クリックして確定
    await firstLine.click();

    // 確定済みの線を再度クリック
    const [msg] = await Promise.all([
      page.waitForEvent('console', { predicate: (msg) => msg.type() === 'error' }),
      firstLine.click(),
    ]);

    const errorMessage = msg.text();
    expect(errorMessage).toBe('Invalid action: Line (h, 0, 0) has already been selected.');

    // プレイヤーが交代していないことを確認
    await expect(page.getByTestId('game-state-display')).toHaveText('「プレイヤー2」のばん');
  });
});