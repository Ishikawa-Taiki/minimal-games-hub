import { test, expect } from '@playwright/test';

test('Animal Chess Game ページにアクセスすると、タイトルが正しく表示される', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await expect(page).toHaveTitle(/アニマルチェス/);
});

test('盤面が正しく表示される', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');
  // 3x4 の盤面なので、12個のセルが存在することを確認
  const cells = await page.locator('[data-testid^="cell-"]').all();
  expect(cells.length).toBe(12);
});

test('初期盤面と駒が正しく表示される', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  // 先手の駒の初期配置
  await expect(page.locator('[data-testid="cell-3-0"]')).toHaveText('麒');
  await expect(page.locator('[data-testid="cell-3-1"]')).toHaveText('獅');
  await expect(page.locator('[data-testid="cell-3-2"]')).toHaveText('象');
  await expect(page.locator('[data-testid="cell-2-1"]')).toHaveText('雛');

  // 後手の駒の初期配置
  await expect(page.locator('[data-testid="cell-0-0"]')).toHaveText('象');
  await expect(page.locator('[data-testid="cell-0-1"]')).toHaveText('獅');
  await expect(page.locator('[data-testid="cell-0-2"]')).toHaveText('麒');
  await expect(page.locator('[data-testid="cell-1-1"]')).toHaveText('雛');

  // 空のセル
  await expect(page.locator('[data-testid="cell-1-0"]')).toHaveText(''); // 空であることを確認
  await expect(page.locator('[data-testid="cell-1-2"]')).toHaveText(''); // 空であることを確認
  await expect(page.locator('[data-testid="cell-2-0"]')).toHaveText(''); // 空であることを確認
  await expect(page.locator('[data-testid="cell-2-2"]')).toHaveText(''); // 空であることを確認

  // 現在のプレイヤー表示
  await expect(page.locator('text="現在のプレイヤー: 先手"')).toBeVisible();
});

test('駒をクリックすると選択状態になり、背景色が変わること', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  // styles.selectedCell.backgroundColor の色 (rgb(191, 219, 254))
  const selectedCellColor = /rgb\(191, 219, 254\)/;

  // 先手のライオンを選択
  const lionCell = page.locator('[data-testid="cell-3-1"]');
  await lionCell.click();
  await expect(lionCell).toHaveCSS('background-color', selectedCellColor);

  // 別の先手の駒を選択すると、選択が切り替わる
  const giraffeCell = page.locator('[data-testid="cell-3-0"]');
  await giraffeCell.click();
  await expect(lionCell).not.toHaveCSS('background-color', selectedCellColor);
  await expect(giraffeCell).toHaveCSS('background-color', selectedCellColor);

  // 選択中の駒を再度クリックすると、選択が解除される
  await giraffeCell.click();
  await expect(giraffeCell).not.toHaveCSS('background-color', selectedCellColor);
});

test('選択した駒を有効なマスに移動できること', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  // 先手の雛 (2,1) を (1,1) に移動
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  const destinationCell = page.locator('[data-testid="cell-1-1"]'); // 雛の移動先

  // 雛を選択
  await chickCell.click();

  // 移動先にクリック
  await destinationCell.click();

  // 雛が移動先に存在することを確認
  await expect(destinationCell).toHaveText('雛');
  // 元の場所が空になっていることを確認
  await expect(chickCell).toHaveText('');

  // プレイヤーが後手に変わっていることを確認
  await expect(page.locator('text="現在のプレイヤー: 後手"')).toBeVisible();
});

test('リセットボタンが機能すること', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  // 駒を動かしてゲームの状態を変更
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  const destinationCell = page.locator('[data-testid="cell-1-1"]');
  await chickCell.click();
  await destinationCell.click();

  // プレイヤーが後手に変わっていることを確認
  await expect(page.locator('text="現在のプレイヤー: 後手"')).toBeVisible();

  // リセットボタンをクリック
  await page.locator('button:has-text("リセット")').click();
  await page.waitForLoadState('networkidle');

  // プレイヤーが先手に戻っていることを確認
  await expect(page.locator('text="現在のプレイヤー: 先手"')).toBeVisible();

  // 駒の位置が初期配置に戻っていることを確認
  // cell-2-1 には先手の雛が戻る
  await expect(page.locator('[data-testid="cell-2-1"]')).toHaveText('雛');
  // cell-1-1 には後手の雛が戻る
  await expect(page.locator('[data-testid="cell-1-1"]')).toHaveText('雛'); // 修正
});

test('ヒントボタンが機能すること', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  const hintButton = page.locator('button:has-text("ヒント")');
  const selectedCellColor = /rgb\(191, 219, 254\)/; // 選択中の色
  const validMoveCellColor = /rgb\(220, 252, 231\)/; // styles.validMoveCell.backgroundColor の色 (dcfce7)

  // 初期状態ではヒントがOFFであることを確認
  await expect(hintButton).toHaveText('ヒント: OFF');

  // ヒントボタンをクリックしてONにする
  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: ON');

  // 先手の雛 (2,1) を選択
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  await chickCell.click();
  await expect(chickCell).toHaveCSS('background-color', selectedCellColor);

  // 雛の移動可能なマス (1,1) がハイライトされることを確認
  // (1,1) には後手の雛がいるので、有効な移動先としてハイライトされるはず
  await expect(page.locator('[data-testid="cell-1-1"]')).toHaveCSS('background-color', validMoveCellColor);

  // ヒントボタンを再度クリックしてOFFにする
  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: OFF');

  // ハイライトが消えることを確認
  await expect(page.locator('[data-testid="cell-1-1"]')).not.toHaveCSS('background-color', validMoveCellColor);
});

/*
test('持ち駒を配置できること', async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');

  // 先手のライオン (3,1) を (2,1) に移動させて、後手の雛 (1,1) を捕獲する
  // これにより、先手の持ち駒に雛が追加される
  const lionCell = page.locator('[data-testid="cell-3-1"]');
  const targetCell = page.locator('[data-testid="cell-2-1"]'); // 雛の初期位置

  // ライオンを選択して雛を捕獲
  await lionCell.click();
  await targetCell.click();

  // プレイヤーが後手に変わっていることを確認
  await expect(page.locator('text="現在のプレイヤー: 後手"')).toBeVisible();

  // 先手の持ち駒に雛が追加されていることを確認
  const senteCapturedChick = page.locator('text="先手の持ち駒"').locator('span:has-text("雛")');
  await expect(senteCapturedChick).toBeVisible();

  // 後手のターンで、先手の持ち駒の雛を選択し、空いているマス (0,0) に配置する
  // 持ち駒の雛をクリック
  await senteCapturedChick.click();

  // 配置先のマスをクリック
  const dropTargetCell = page.locator('[data-testid="cell-0-0"]'); // 空いているマス
  await dropTargetCell.click();

  // 雛が配置先に存在することを確認
  await expect(dropTargetCell).toHaveText('雛');
  // 先手の持ち駒から雛が減っていることを確認
  await expect(senteCapturedChick).not.toBeVisible(); // 雛が消えていることを期待

  // プレイヤーが先手に変わっていることを確認
  await expect(page.locator('text="現在のプレイヤー: 先手"')).toBeVisible();
});
*/