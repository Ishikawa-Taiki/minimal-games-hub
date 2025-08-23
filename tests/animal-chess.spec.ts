import { test, expect } from '@playwright/test';

// 各テストの前にゲームをリセット
test.beforeEach(async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');
  // リセットボタンが存在することを確認してからクリック
  const resetButton = page.locator('button:has-text("リセット")');
  if (await resetButton.isVisible()) { // リセットボタンが存在する場合のみクリック
    await resetButton.click();
    await page.waitForLoadState('networkidle'); // リセット後のUI更新を待つ
  }
});

test('Animal Chess Game ページにアクセスすると、タイトルが正しく表示される', async ({ page }) => {
  await expect(page).toHaveTitle(/アニマルチェス/);
});

test('盤面が正しく表示される', async ({ page }) => {
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');
  // 3x4 の盤面なので、12個のセルが存在することを確認
  const cells = await page.locator('[data-testid^="cell-"]').all();
  expect(cells.length).toBe(12);
});

test('初期盤面と駒が正しく表示される', async ({ page }) => {
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

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
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

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
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

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
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

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
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

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

test('持ち駒を配置できること', async ({ page }) => {
  // beforeEach でページロードとリセットが行われるため、ここでは不要
  // await page.goto('/games/animal-chess');
  // await page.waitForLoadState('networkidle');

  // --- 駒を捕獲して持ち駒を生成するシナリオ --- 

  // 1. 先手のライオン (3,1) を (2,2) に移動 (空マスへの移動)
  const lionCell = page.locator('[data-testid="cell-3-1"]');
  const emptyCell1 = page.locator('[data-testid="cell-2-2"]');
  await lionCell.click();
  await emptyCell1.click();
  await expect(emptyCell1).toHaveText('獅'); // ライオンが移動したことを確認
  await expect(page.locator('text="現在のプレイヤー: 後手"')).toBeVisible(); // ターン交代を確認

  // 2. 後手のキリン (0,2) を (1,2) に移動 (空マスへの移動)
  const goteGiraffeCell = page.locator('[data-testid="cell-0-2"]');
  const emptyCell2 = page.locator('[data-testid="cell-1-2"]');
  await goteGiraffeCell.click();
  await emptyCell2.click();
  await expect(emptyCell2).toHaveText('麒'); // キリンが移動したことを確認
  await expect(page.locator('text="現在のプレイヤー: 先手"')).toBeVisible(); // ターン交代を確認

  // 3. 先手のライオン (2,2) を (1,2) に移動させて、後手のキリン (1,2) を捕獲する
  // これにより、先手の持ち駒にキリンが追加される
  const movedLionCell = page.locator('[data-testid="cell-2-2"]');
  const targetGiraffeCell = page.locator('[data-testid="cell-1-2"]'); // 捕獲対象のキリン
  await movedLionCell.click();
  await targetGiraffeCell.click();
  await expect(targetGiraffeCell).toHaveText('獅'); // ライオンが移動したことを確認
  await expect(page.locator('text="現在のプレイヤー: 後手"')).toBeVisible(); // ターン交代を確認

  // 先手の持ち駒にキリンが追加されていることを確認
  const senteCapturedGiraffe = page.locator('[data-testid="captured-piece-SENTE-GIRAFFE"]'); // セレクタ修正
  await expect(senteCapturedGiraffe).toBeVisible();

  // --- 持ち駒を配置するシナリオ ---

  // 後手のターンで、先手の持ち駒のキリンを選択し、空いているマス (1,0) に配置する
  // 持ち駒のキリンをクリック
  await senteCapturedGiraffe.click();

  // 配置先のマスをクリック
  const dropTargetCell = page.locator('[data-testid="cell-1-0"]'); // 空いているマスに変更
  await dropTargetCell.click();

  // キリンが配置先に存在することを確認
  await expect(dropTargetCell).toHaveText('麒');

  // 先手の持ち駒からキリンが減っていることを確認
  await expect(senteCapturedGiraffe).not.toBeVisible(); // キリンが消えていることを期待

  // プレイヤーが先手に変わっていることを確認
  await expect(page.locator('text="現在のプレイヤー: 先手"')).toBeVisible();
});