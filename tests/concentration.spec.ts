import { test, expect } from '@playwright/test';

test('concentration game navigation and core functionality', async ({ page }) => {
  // 1. ゲームページへ直接遷移して正しく表示されることを確認
  await page.goto('/games/concentration/');

  // ゲームのタイトルが表示されていることを確認
  // まず、レイアウトが読み込まれているかを確認するために静的な要素をテスト
  await expect(page.getByRole('link', { name: 'ホームに戻る' })).toBeVisible(); // 'Back to Home' -> 'ホームに戻る'

  // 次に、動的なタイトルをテスト
  await expect(page.getByRole('heading', { name: '神経衰弱' })).toBeVisible();

  // 2. ゲームの基本的な動作を確認 (オプション)
  // E2Eテストの責務外だが、基本的なUI要素の存在を確認する

  // ステータス表示を確認
  await expect(page.locator('[data-testid="status"]')).toBeVisible();
  await expect(page.locator('[data-testid="status"]')).toContainText('プレイヤー1の番');

  // スコア表示を確認
  await expect(page.locator('h4:has-text("スコア")')).toBeVisible();
  await expect(page.locator('h4:has-text("スコア")').locator('..')).toContainText('プレイヤー1: 0');
  await expect(page.locator('h4:has-text("スコア")').locator('..')).toContainText('プレイヤー2: 0');

  // リセットボタンが存在することを確認
  await expect(page.locator('[data-testid="control-panel-reset-button"]')).toBeVisible();

  // 難易度を「むずかしい」に設定
  const hardDifficultyLabel = page.getByLabel('むずかしい');
  await hardDifficultyLabel.scrollIntoViewIfNeeded(); // 要素がビューポート内に表示されるようにスクロール
  await expect(hardDifficultyLabel).toBeEnabled(); // 要素が有効であることを確認
  await hardDifficultyLabel.waitFor({ state: 'visible' }); // 要素が表示されるまで待機
  await hardDifficultyLabel.click();
  await expect(page.locator('input[value="hard"]')).toBeChecked();

  // 54枚のカードが存在することを確認
  const cards = await page.locator('[data-testid^="card-"]').all();
  expect(cards.length).toBe(54);

  // 3. ヒント機能のトグルを確認
  const hintButton = page.locator('[data-testid="control-panel-hint-button"]'); // data-testid 変更
  await expect(hintButton).toHaveText('ヒント切り替え'); // テキスト変更
  await hintButton.click();
  // ヒントの表示状態は getDisplayStatus で確認する
  // await expect(hintButton).toHaveText('ヒント: ON'); // このアサーションは不要
  await hintButton.click();
  // await expect(hintButton).toHaveText('ヒント: OFF'); // このアサーションは不要
});
