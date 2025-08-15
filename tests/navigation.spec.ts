import { test, expect } from '@playwright/test';

test.describe('ホームページのナビゲーション', () => {
  test('トップページからリバーシのページに正しく遷移できる', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. "リバーシ" という表示名のゲームリンクを探してクリック
    const reversiLink = page.locator('a[href="/games/reversi/"]');
    await reversiLink.click();

    // 3. URLが変更されるのを待つ
    await page.waitForURL('**/games/reversi/');

    // 4. ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    // 5. 遷移先のページのタイトルが表示されていることを確認
    const titleLocator = page.locator('header h1');
    const titleText = await titleLocator.textContent();
    expect(titleText).toBe('リバーシ');
  });

  test('トップページから○×ゲームのページに正しく遷移できる', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. "○×ゲーム" という表示名のゲームリンクを探してクリック
    const tictactoeLink = page.locator('a', { hasText: '○×ゲーム' });
    await tictactoeLink.click();

    // 3. URLが変更されるのを待つ
    await page.waitForURL('**/games/tictactoe/');

    // 4. ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    // 5. 遷移先のページのタイトルが表示されていることを確認
    const titleLocator = page.locator('header h1');
    const titleText = await titleLocator.textContent();
    expect(titleText).toBe('○×ゲーム');
  });
});
