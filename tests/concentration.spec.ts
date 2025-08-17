import { test, expect } from '@playwright/test';

test('concentration game navigation and core functionality', async ({ page }) => {
  // 1. トップページからゲームページへ正しく遷移できることを確認
  await page.goto('/');

  // "カードあわせ" という表示名のリンクをクリック
  await page.getByRole('link', { name: 'カードあわせ' }).click();

  // URLが正しいことを確認
  await expect(page).toHaveURL('/games/concentration/');

  // ゲームのタイトルが表示されていることを確認
  // まず、レイアウトが読み込まれているかを確認するために静的な要素をテスト
  await expect(page.getByRole('link', { name: 'Back to Home' })).toBeVisible();

  // 次に、動的なタイトルをテスト
  await expect(page.getByRole('heading', { name: 'カードあわせ' })).toBeVisible();

  // 2. ゲームの基本的な動作を確認 (オプション)
  // E2Eテストの責務外だが、基本的なUI要素の存在を確認する

  // ステータス表示、スコア表示、リセットボタンが存在することを確認
  await expect(page.getByTestId('status-message')).toBeVisible();
  await expect(page.getByTestId('score-player1')).toBeVisible();
  await expect(page.getByTestId('score-player2')).toBeVisible();
  await expect(page.getByTestId('reset-button')).toBeVisible();

  // 54枚のカードが存在することを確認
  const cards = await page.locator('[data-testid^="card-"]').all();
  expect(cards.length).toBe(54);

  // 3. ヒント機能のトグルを確認
  const hintButton = page.getByTestId('hint-button');
  await expect(hintButton).toHaveText('ヒント: OFF');
  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: ON');
  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: OFF');
});
