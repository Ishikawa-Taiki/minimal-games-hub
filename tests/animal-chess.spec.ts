import { test, expect, Page } from '@playwright/test';
import { setConfig } from 'next/config'; // setConfig をインポート

// テスト実行前にモックを設定
test.beforeAll(() => {
  setConfig({
    publicRuntimeConfig: {
      basePath: '', // テスト環境では basePath を空文字列に設定
    },
  });
});

// 各テストの前にゲームページにアクセスし、リセットする
test.beforeEach(async ({ page }) => {
  await page.goto('/games/animal-chess');
  await page.waitForLoadState('networkidle');
  const resetButton = page.locator('button:has-text("リセット")');
  if (await resetButton.isVisible()) {
    await resetButton.click();
    await page.waitForLoadState('networkidle');
  }
});

test('Animal Chess Game ページにアクセスすると、タイトルが正しく表示される', async ({ page }) => {
  await expect(page).toHaveTitle(/アニマルチェス/);
  await expect(page.getByRole('banner').getByRole('heading', { name: 'アニマルチェス', level: 1 })).toHaveText('アニマルチェス');
});

test('盤面が正しく表示される', async ({ page }) => {
  const board = page.locator('[data-testid="animal-chess-board"]');
  await expect(board).toBeVisible();
  const cells = await board.locator('[data-testid^="cell-"]').all();
  expect(cells.length).toBe(12);
});

// ヘルパー関数: 特定のセルに指定された駒が存在することを検証
const expectPiece = async (page: Page, cellTestId: string, pieceOwner: 'p1' | 'p2', pieceName: string) => {
  const cell = page.locator(`[data-testid="${cellTestId}"]`);
  const image = cell.locator('img');
  await expect(image).toBeVisible();
  await expect(image).toHaveAttribute('src', new RegExp(`/games/animal-chess/img/${pieceOwner}_${pieceName}.png`));
  const owner = pieceOwner === 'p1' ? 'SENTE' : 'GOTE';
  const type = pieceName.toUpperCase().replace('CHICKEN', 'ROOSTER');
  await expect(image).toHaveAttribute('alt', `${owner} ${type}`);
};

// ヘルパー関数: 特定のセルが空であることを検証
const expectEmpty = async (page: Page, cellTestId: string) => {
  const cell = page.locator(`[data-testid="${cellTestId}"]`);
  await expect(cell.locator('img')).not.toBeVisible();
};

// ヘルパー関数: 現在のプレイヤー表示を検証
const expectCurrentPlayer = async (page: Page, player: 'プレイヤー1' | 'プレイヤー2') => {
  const locator = page.locator('[data-testid="current-player-text"]');
  await expect(locator).toHaveText(`いまのばん: ${player}`);
};

test('初期盤面と駒が正しく表示される', async ({ page }) => {
  // 先手の駒
  await expectPiece(page, 'cell-3-0', 'p1', 'giraffe');
  await expectPiece(page, 'cell-3-1', 'p1', 'lion');
  await expectPiece(page, 'cell-3-2', 'p1', 'elephant');
  await expectPiece(page, 'cell-2-1', 'p1', 'chick');

  // 後手の駒
  await expectPiece(page, 'cell-0-0', 'p2', 'elephant');
  await expectPiece(page, 'cell-0-1', 'p2', 'lion');
  await expectPiece(page, 'cell-0-2', 'p2', 'giraffe');
  await expectPiece(page, 'cell-1-1', 'p2', 'chick');

  // 空のセル
  await expectEmpty(page, 'cell-1-0');
  await expectEmpty(page, 'cell-1-2');
  await expectEmpty(page, 'cell-2-0');
  await expectEmpty(page, 'cell-2-2');

  // 現在のプレイヤー表示
  await expectCurrentPlayer(page, 'プレイヤー1');
});

test('駒をクリックすると選択状態になり、背景色が変わること', async ({ page }) => {
  const selectedCellColor = 'rgb(191, 219, 254)'; // #bfdbfe

  const lionCell = page.locator('[data-testid="cell-3-1"]');
  await lionCell.click();
  await expect(lionCell).toHaveCSS('background-color', selectedCellColor);

  const giraffeCell = page.locator('[data-testid="cell-3-0"]');
  await giraffeCell.click();
  await expect(lionCell).not.toHaveCSS('background-color', selectedCellColor);
  await expect(giraffeCell).toHaveCSS('background-color', selectedCellColor);

  await giraffeCell.click();
  await expect(giraffeCell).not.toHaveCSS('background-color', selectedCellColor);
});

test('選択した駒を有効なマスに移動できること', async ({ page }) => {
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  const destinationCell = page.locator('[data-testid="cell-1-1"]');

  await chickCell.click();
  await destinationCell.click();

  await expectPiece(page, 'cell-1-1', 'p1', 'chick');
  await expectEmpty(page, 'cell-2-1');
  await expectCurrentPlayer(page, 'プレイヤー2');
});

test('リセットボタンが機能すること', async ({ page }) => {
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  const destinationCell = page.locator('[data-testid="cell-1-1"]');
  await chickCell.click();
  await destinationCell.click();

  await expectCurrentPlayer(page, 'プレイヤー2');

  await page.locator('button:has-text("リセット")').click();
  await page.waitForLoadState('networkidle');

  await expectCurrentPlayer(page, 'プレイヤー1');
  await expectPiece(page, 'cell-2-1', 'p1', 'chick');
  await expectPiece(page, 'cell-1-1', 'p2', 'chick');
});

test('ヒントボタンが機能すること', async ({ page }) => {
  const hintButton = page.locator('button:has-text("ヒント")');
  const selectedCellColor = 'rgb(191, 219, 254)'; // #bfdbfe
  const validMoveCellColor = 'rgb(220, 252, 231)'; // #dcfce7
  const capturableCellColor = 'rgb(186, 230, 253)'; // #bae6fd

  await expect(hintButton).toHaveText('ヒント: OFF');

  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: ON');

  const chickCell = page.locator('[data-testid="cell-2-1"]');
  await chickCell.click();
  await expect(chickCell).toHaveCSS('background-color', selectedCellColor);

  // This move is a capture, so it should be the capturable color.
  await expect(page.locator('[data-testid="cell-1-1"]')).toHaveCSS('background-color', capturableCellColor);

  await hintButton.click();
  await expect(hintButton).toHaveText('ヒント: OFF');

  // After turning hints off, the highlight should disappear.
  await expect(page.locator('[data-testid="cell-1-1"]')).not.toHaveCSS('background-color', capturableCellColor);
  await expect(page.locator('[data-testid="cell-1-1"]')).not.toHaveCSS('background-color', validMoveCellColor);
});

// test.describe('ゲーム終了とモーダル', () => {
//   test('ライオンを捕獲して勝利する', async ({ page }) => {
//     // 簡単な手順でライオンを捕獲できるシナリオ
//     // 1. P1: Chick(2,1) -> (1,1) (P2のChickを捕獲)
//     await page.locator('[data-testid="cell-2-1"]').click();
//     await page.locator('[data-testid="cell-1-1"]').click();
//     await expectCurrentPlayer(page, 'プレイヤー2');
//     await expect(page.locator('[data-testid="captured-piece-SENTE-CHICK"]')).toBeVisible();

//     // 2. P2: Elephant(0,0) -> (1,0)
//     await page.locator('[data-testid="cell-0-0"]').click();
//     await page.locator('[data-testid="cell-1-0"]').click();
//     await expectCurrentPlayer(page, 'プレイヤー1');

//     // 3. P1: Rooster(1,1) -> (0,1) (P2のLionを捕獲)
//     await page.locator('[data-testid="cell-1-1"]').click();
//     await page.locator('[data-testid="cell-0-1"]').click();

//     // ゲーム終了モーダルが表示されることを確認
//     await expect(page.locator('h2:has-text("ゲーム終了")')).toBeVisible();
//     await expect(page.locator('p:has-text("プレイヤー1の勝ち！")')).toBeVisible();

//     // 盤面が操作不能であることを確認
//     await page.locator('[data-testid="cell-3-1"]').click();
//     // 選択状態にならないことを確認 (背景色が変わらない)
//     await expect(page.locator('[data-testid="cell-3-1"]')).not.toHaveCSS('background-color', 'rgb(191, 219, 254)');
//   });

//   test('トライして勝利する', async ({ page }) => {
//     // ライオンが最終列に到達するシナリオ
//     // このテストは、駒の移動を複数回行う必要があるため、少し長くなります
//     await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
//     await page.locator('[data-testid="cell-1-1"]').click(); // Move to capture P2 Chick
//     await page.locator('[data-testid="cell-0-2"]').click(); // P2 Giraffe
//     await page.locator('[data-testid="cell-1-2"]').click();
//     await page.locator('[data-testid="cell-3-1"]').click(); // P1 Lion
//     await page.locator('[data-testid="cell-2-1"]').click();
//     await page.locator('[data-testid="cell-1-2"]').click(); // P2 Giraffe
//     await page.locator('[data-testid="cell-2-2"]').click();
//     await page.locator('[data-testid="cell-2-1"]').click(); // P1 Lion
//     await page.locator('[data-testid="cell-1-2"]').click();
//     await page.locator('[data-testid="cell-0-0"]').click(); // P2 Elephant
//     await page.locator('[data-testid="cell-1-0"]').click();
//     await page.locator('[data-testid="cell-1-2"]').click(); // P1 Lion
//     await page.locator('[data-testid="cell-0-2"]').click(); // Try!

//     // ゲーム終了モーダルが表示されることを確認
//     await expect(page.locator('h2:has-text("ゲーム終了")')).toBeVisible();
//     await expect(page.locator('p:has-text("プレイヤー1の勝ち！")')).toBeVisible();

//     // モーダルのリセットボタンが機能することを確認
//     await page.locator('button:has-text("もう一度遊ぶ")').click();
//     await expect(page.locator('h2:has-text("ゲーム終了")')).not.toBeVisible();
//     await expectCurrentPlayer(page, 'プレイヤー1');
//   });
// });


// test('持ち駒を配置できること', async ({ page }) => {
//   // --- 駒を捕獲して持ち駒を生成するシナリオ ---
//   // 1. P1: Chick(2,1) -> (1,1) (P2のChickを捕獲)
//   await page.locator('[data-testid="cell-2-1"]').click();
//   await page.locator('[data-testid="cell-1-1"]').click();
//   await expectCurrentPlayer(page, 'プレイヤー2');
//   const capturedChick = page.locator('[data-testid="captured-piece-SENTE-CHICK"]');
//   await expect(capturedChick).toBeVisible();

//   // 2. P2: Giraffe(0,2) -> (1,2)
//   await page.locator('[data-testid="cell-0-2"]').click();
//   await page.locator('[data-testid="cell-1-2"]').click();
//   await expectCurrentPlayer(page, 'プレイヤー1');

//   // --- 持ち駒を配置するシナリオ ---
//   // 3. P1: 持ち駒のChickを選択
//   await capturedChick.click();
//   const selectedCapturedPieceColor = 'rgb(191, 219, 254)'; // #bfdbfe
//   await expect(capturedChick).toHaveCSS('background-color', selectedCapturedPieceColor);

//   // 4. P1: Chickを(2,2)に配置
//   const dropTargetCell = page.locator('[data-testid="cell-2-2"]');
//   await dropTargetCell.click();

//   // 5. 検証
//   await expectPiece(page, 'cell-2-2', 'p1', 'chick');
//   await expect(capturedChick).not.toBeVisible();
//   await expectCurrentPlayer(page, 'プレイヤー2');
// });
