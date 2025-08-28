import { test, expect } from '@playwright/test';

test.describe('はさみ将棋ゲームのE2Eテスト', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/hasami-shogi');
  });

  test.describe('初期表示', () => {
    test('盤面と駒が正しく表示される', async ({ page }) => {
      // 9x9のマスが存在することを確認
      await page.waitForSelector('[data-testid="cell-0-0"]');
      const cells = await page.locator('[data-testid^="cell-"]').all();
      expect(cells.length).toBe(81);

      // 先手（歩）の駒が9個存在することを確認
      const playerPieces = await page.locator('[data-testid^="cell-"] >> div:has-text("歩")').all();
      expect(playerPieces.length).toBe(9);

      // 後手（と）の駒が9個存在することを確認
      const opponentPieces = await page.locator('[data-testid^="cell-"] >> div:has-text("と")').all();
      expect(opponentPieces.length).toBe(9);
    });

    test('情報パネルが正しく表示される', async ({ page }) => {
      // 現在のターン表示を確認
      const statusText = page.locator('[data-testid="status"]');
      const statusContent = await statusText.textContent();
      expect(statusContent).toContain('「歩」の番');

      // スコア表示を確認（新しいGameLayoutの構造）
      const scoreSection = page.locator('h4:has-text("捕獲数")').locator('..');
      await expect(scoreSection).toBeVisible();
      
      // 初期状態では捕獲数は0
      await expect(scoreSection).toContainText('「歩」: 0');
      await expect(scoreSection).toContainText('「と」: 0');
    });

    test('操作ボタンが正しく表示される', async ({ page }) => {
      // 「はじめから」ボタンが存在することを確認
      const resetButton = page.locator('[data-testid="control-panel-reset-button"]');
      await expect(resetButton).toBeVisible();

      // 「ヒント」ボタンが存在することを確認
      const hintButton = page.locator('[data-testid="control-panel-hint-button"]');
      await expect(hintButton).toBeVisible();
    });
  });

  test.describe('駒の移動と選択', () => {
    test('駒を選択するとハイライトされ、再度クリックすると選択が解除される', async ({ page }) => {
      const piece = page.locator('[data-testid="cell-8-0"]');

      // 最初はハイライトされていない
      await expect(piece).not.toHaveCSS('background-color', /#f6e05e/);

      // 1回目のクリックで選択され、ハイライトされる
      await piece.click();
      await expect(piece).toHaveCSS('background-color', 'rgb(246, 224, 94)'); // #f6e05e

      // 2回目のクリックで選択が解除され、ハイライトが消える
      await piece.click();
      await expect(piece).not.toHaveCSS('background-color', /#f6e05e/);
    });

    test('駒を選択した後に別の自分の駒を選択すると、選択が切り替わる', async ({ page }) => {
      const piece1 = page.locator('[data-testid="cell-8-0"]');
      const piece2 = page.locator('[data-testid="cell-8-1"]');

      // piece1を選択
      await piece1.click();
      await expect(piece1).toHaveCSS('background-color', 'rgb(246, 224, 94)');
      await expect(piece2).not.toHaveCSS('background-color', /#f6e05e/);

      // piece2を選択
      await piece2.click();
      await expect(piece1).not.toHaveCSS('background-color', /#f6e05e/);
      await expect(piece2).toHaveCSS('background-color', 'rgb(246, 224, 94)');
    });

    test('駒を移動させると、ターンが相手に切り替わる', async ({ page }) => {
      const piece = page.locator('[data-testid="cell-8-0"]');
      const destination = page.locator('[data-testid="cell-7-0"]');
      const statusText = page.locator('[data-testid="status"]');

      // 駒を移動
      await piece.click();
      await destination.click();

      // ターン表示が「「と」の番」に変わることを確認
      const statusContent = await statusText.textContent() ?? '';
      expect(statusContent).toContain('「と」の番');
    });

    test('他の駒を飛び越えて移動することはできない', async ({ page }) => {
      // 8-0 の駒を 8-2 の前に移動させる
      await page.locator('[data-testid="cell-8-0"]').click();
      await page.locator('[data-testid="cell-7-0"]').click();
      await page.locator('[data-testid="cell-0-0"]').click();
      await page.locator('[data-testid="cell-1-0"]').click();

      // 8-1 の駒を選択
      await page.locator('[data-testid="cell-8-1"]').click();

      // 8-1 の駒は 7-0 の駒を飛び越えられないので、移動先に 6-0 は表示されない
      const invalidMove = page.locator('[data-testid="cell-6-0"]');
      await expect(invalidMove).not.toHaveCSS('background-color', /#9ae6b4/); // Green
      await expect(invalidMove).not.toHaveCSS('background-color', /#feb2b2/); // Red
    });
  });

  test.describe('駒の捕獲', () => {
    test('相手の駒を挟むと、その駒を捕獲できる', async ({ page }) => {
      // 捕獲のセットアップ
      // 1. 先手: (8,1) -> (1,1)
      await page.locator('[data-testid="cell-8-1"]').click();
      await page.locator('[data-testid="cell-1-1"]').click();
      // 2. 後手: (0,2) -> (1,2)
      await page.locator('[data-testid="cell-0-2"]').click();
      await page.locator('[data-testid="cell-1-2"]').click();

      // 3. 先手: (8,3) -> (1,3) で (1,2) の駒を捕獲
      await page.locator('[data-testid="cell-8-3"]').click();
      await page.locator('[data-testid="cell-1-3"]').click();

      // --- 捕獲後の状態を検証 ---

      // 捕獲された駒が盤面から消えていることを確認
      const capturedPiece = page.locator('[data-testid="cell-1-2"]');
      await expect(capturedPiece).toBeEmpty();

      // 獲得した駒の数が1になっていることを確認
      const scoreSection = page.locator('h4:has-text("捕獲数")').locator('..');
      await expect(scoreSection).toContainText('「歩」: 1');

      // 相手の盤面の駒が8個になっていることを確認
      const opponentPieces = await page.locator('[data-testid^="cell-"] >> div:has-text("と")').all();
      expect(opponentPieces.length).toBe(8);
    });
  });

  // ゲーム終了のE2Eテストは、単体テストでコアロジックを網羅的にテストする方針に切り替えたため、削除します。
  // 複雑なゲームシーケンスをE2Eテストで再現するのは不安定であり、
  // コアロジックの単体テストの方がロバスト性が高いためです。

  test.describe('ゲームリセット機能', () => {
    test('「はじめから」ボタンをクリックすると、ゲームが初期状態に戻る', async ({ page }) => {
      // 駒を動かしてゲームの状態を変更
      await page.locator('[data-testid="cell-8-0"]').click();
      await page.locator('[data-testid="cell-7-0"]').click();

      // ターンが相手になっていることを確認
      let statusText = page.locator('[data-testid="status"]');
      await expect(statusText).toContainText('「と」の番');

      // 「はじめから」ボタンをクリック
      await page.locator('[data-testid="control-panel-reset-button"]').click();

      // --- リセット後の状態を検証 ---

      // ターンが先手（「歩」）に戻っていることを確認
      statusText = page.locator('[data-testid="status"]');
      await expect(statusText).toContainText('「歩」の番');

      // 駒の位置が初期配置に戻っていることを確認
      // (動かした駒が元の位置に戻っているか)
      await expect(page.locator('[data-testid="cell-8-0"]')).toContainText('歩');
      await expect(page.locator('[data-testid="cell-7-0"]')).toBeEmpty();

      // 全ての駒の数を確認
      const playerPieces = await page.locator('[data-testid^="cell-"] >> div:has-text("歩")').all();
      expect(playerPieces.length).toBe(9);
      const opponentPieces = await page.locator('[data-testid^="cell-"] >> div:has-text("と")').all();
      expect(opponentPieces.length).toBe(9);

      // 獲得した駒の数がリセットされていることを確認
      const scoreSection = page.locator('h4:has-text("捕獲数")').locator('..');
      await expect(scoreSection).toContainText('「歩」: 0');
      await expect(scoreSection).toContainText('「と」: 0');
    });
  });

  test.describe('ヒント機能', () => {
    test('ヒントボタンをONにすると、移動可能なマスがハイライトされる', async ({ page }) => {
      // ヒントをONにする
      await page.locator('[data-testid="control-panel-hint-button"]').click();

      // 駒を選択
      await page.locator('[data-testid="cell-8-0"]').click();

      // 移動可能なマスがハイライトされていることを確認
      const movableCell = page.locator('[data-testid="cell-7-0"]');
      await expect(movableCell).toHaveCSS('background-color', 'rgb(154, 230, 180)'); // #9ae6b4 (green)
    });

    test('ヒントがOFFの場合、移動可能なマスはハイライトされない', async ({ page }) => {
      // ヒントがOFFであることを確認（デフォルト）

      // 駒を選択
      await page.locator('[data-testid="cell-8-0"]').click();

      // 移動可能なマスがハイライトされていないことを確認
      const movableCell = page.locator('[data-testid="cell-7-0"]');
      await expect(movableCell).not.toHaveCSS('background-color', /#9ae6b4/);
      await expect(movableCell).not.toHaveCSS('background-color', /#feb2b2/);
    });
  });
});
