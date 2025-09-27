import { test, expect } from '@playwright/test';

test.describe('ドット＆ボックス E2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/dots-and-boxes');
    await page.waitForLoadState('networkidle');
  });

  test('難易度を選択してゲームを開始し、基本的な操作ができる', async ({ page }) => {
    // 1. 難易度選択画面が表示されていることを確認
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();

    // 2. 「かんたん」を選択してゲームを開始
    await page.getByRole('button', { name: 'かんたん (2x2マス)' }).click();

    // 3. ゲームボードが表示されることを確認 (ドットの数で判断)
    await expect(page.locator('[data-testid^="dot-"]')).toHaveCount(9);

    // 4. 最初の線を引く (プレビュー)
    const firstHorizontalLine = page.locator('[data-testid="h-line-0-0"]');
    await firstHorizontalLine.click();

    // 5. 同じ線を再度クリックして手を確定
    await firstHorizontalLine.click();

    // 6. ターンがプレイヤー2に切り替わったことを確認
    const statusText = page.locator('[data-testid="game-state-display"]');
    await expect(statusText).toHaveText('「プレイヤー2」のばん');
  });
});