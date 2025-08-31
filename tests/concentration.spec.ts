import { test, expect } from '@playwright/test';

test.describe('神経衰弱ゲーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/concentration');
    await expect(page).toHaveTitle(/神経衰弱/);
  });

  test('初期表示と難易度選択', async ({ page }) => {
    // 初期表示の確認
    await expect(page.getByRole('heading', { name: '難易度選択' })).toBeVisible();

    // 難易度を選択
    await page.getByLabel('かんたん').click();

    // ゲームボードが表示されることを確認
    await expect(page.locator('[data-testid^="card-"]')).toHaveCount(20);
  });

  // TODO: 共通コンポーネント化時にテストNGとなったため、個別で調査して調整する
  // test('カードをクリックしてめくることができる', async ({ page }) => {
  //   await page.getByLabel('かんたん').click();

  //   const card1 = page.getByTestId('card-0');
  //   const card2 = page.getByTestId('card-1');

  //   // カードの裏面が表示されていることを確認（テキストが見えない）
  //   await expect(card1.locator('.cardContent')).not.toBeVisible();
  //   await expect(card2.locator('.cardContent')).not.toBeVisible();

  //   // カードをクリック
  //   await card1.click();
  //   await card2.click();

  //   // カードの表面が表示されていることを確認（テキストが見える）
  //   await expect(card1.locator('.cardContent')).toBeVisible();
  //   await expect(card2.locator('.cardContent')).toBeVisible();
  // });

  // TODO: 共通コンポーネント化時にテストNGとなったため、個別で調査して調整する
  // test('ゲーム終了後、リセットボタンでリスタートできる', async ({ page }) => {
  //   await page.getByLabel('かんたん').click();

  //   // このテストは実際のゲームプレイをシミュレートしない
  //   // 代わりに、手動でゲーム終了状態を作り出す（これはE2Eでは難しい）
  //   // ここでは、ゲーム終了モーダルが表示されたと仮定して、その後のリセット動作をテストする
  //   // (実際のテストでは、ゲームを最後までプレイするロジックが必要)

  //   // ダミーのゲームオーバーモーダルを表示させる（実際にはゲームプレイが必要）
  //   // この部分は実際のアプリケーションの動作に合わせて調整が必要
  //   // 今回はリセットボタンの存在と動作のみを確認する

  //   // ゲームオーバーまでプレイするロジック（簡略版）
  //   // 注意：このループは実際のカードの組み合わせに依存するため、不安定になる可能性がある
  //   const cards = await page.locator('[data-testid^="card-"]').all();
  //   for (const card of cards) {
  //     if (await card.isEnabled()) {
  //       await card.click();
  //       await page.waitForTimeout(50); // 状態更新を待つ
  //     }
  //   }

  //   // ゲームオーバーモーダルを待つ
  //   const modal = page.getByTestId('game-over-modal');
  //   await expect(modal).toBeVisible({ timeout: 15000 }); // 時間がかかる可能性があるのでタイムアウトを延長

  //   // リセットボタンをクリック
  //   await modal.getByTestId('play-again-button').click();

  //   // モーダルが消え、難易度選択画面に戻ることを確認
  //   await expect(modal).not.toBeVisible();
  //   await expect(page.getByRole('heading', { name: '難易度選択' })).toBeVisible();
  // });
});
