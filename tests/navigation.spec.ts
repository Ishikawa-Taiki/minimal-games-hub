import { test, expect } from '@playwright/test';

test.describe('ホームページのナビゲーション', () => {
  test('トップページからリバーシのページに正しく遷移できる', async ({ page }) => {
    // 1. トップページにアクセス
    await page.goto('/');

    // 2. "リバーシ" という表示名のゲームリンクを探してクリック
    const reversiLink = page.locator('a[href="/games/reversi/"]');
    await reversiLink.click();
    await page.waitForLoadState('networkidle');

    // 3. URLが正しく変更されたことを確認
    // next.config.ts の trailingSlash: true の設定に基づき、URLの末尾には / がつく
    await expect(page).toHaveURL(/\/games\/reversi\/$/);

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
    await page.waitForLoadState('networkidle');

    // 3. URLが正しく変更されたことを確認
    await expect(page).toHaveURL(/\/games\/tictactoe\/$/);

    // 4. ページが完全に読み込まれるのを待つ
    await page.waitForLoadState('networkidle');

    // 5. 遷移先のページのタイトルが表示されていることを確認
    const titleLocator = page.locator('header h1');
    const titleText = await titleLocator.textContent();
    expect(titleText).toBe('○×ゲーム');
  });
});
