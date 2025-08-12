import { test, expect } from '@playwright/test';

test.describe('ホームページのナビゲーション', () => {
  test('トップページからリバーシのページに正しく遷移できる', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. "リバーシ" という表示名のゲームリンクを探してクリック
    const reversiLink = page.locator('a[href="/games/reversi/"]');
    await reversiLink.click();

    // 3. URLが正しく変更されたことを確認
    // next.config.ts の trailingSlash: true の設定に基づき、URLの末尾には / がつく
    await expect(page).toHaveURL('/games/reversi/');

    // 4. ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');
    
  });

  test('トップページから○×ゲームのページに正しく遷移できる', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. "○×ゲーム" という表示名のゲームリンクを探してクリック
    const tictactoeLink = page.locator('a', { hasText: '○×ゲーム' });
    await tictactoeLink.click();

    // 3. URLが正しく変更されたことを確認
    await expect(page).toHaveURL('/games/tictactoe/');

    // 4. ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    
  });
});
