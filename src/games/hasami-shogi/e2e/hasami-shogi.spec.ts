import { test, expect } from "@playwright/test";

interface TestWindow extends Window {
  gameController: {
    getInitialBoard: () => (string | null)[][];
    resetGameWithBoard: (board: (string | null)[][]) => void;
  };
}

test.describe("はさみ将棋ゲームのE2Eテスト", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/hasami-shogi");
  });

  test.describe("初期表示", () => {
    test("盤面と駒が正しく表示される", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // 9x9のマスが存在することを確認
      await page.waitForSelector('[data-testid="cell-0-0"]');
      const cells = await page.locator('[data-testid^="cell-"]').all();
      expect(cells.length).toBe(81);

      // 先手（歩）の駒が9個存在することを確認
      const playerPieces = await page.locator('[data-testid^="piece-PLAYER1-"]').all();
      expect(playerPieces.length).toBe(9);

      // 後手（と）の駒が9個存在することを確認
      const opponentPieces = await page.locator('[data-testid^="piece-PLAYER2-"]').all();
      expect(opponentPieces.length).toBe(9);
    });
  });

  test.describe("コマの移動と選択", () => {
    test("コマを選択すると選択状態になり、再度クリックすると選択が解除される", async ({
      page,
    }) => {
      await page.getByTestId("win-cond-standard").click();
      const cell = page.locator('[data-testid="cell-8-0"]');

      // 1回目のクリックで選択状態になる
      await cell.click();
      await expect(cell).toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
      // 2回目のクリックで選択が解除される
      await cell.click();
      await expect(cell).not.toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
    });

    test("コマを選択した後に別の自分のコマを選択すると、選択が切り替わる", async ({
      page,
    }) => {
      await page.getByTestId("win-cond-standard").click();
      const cell1 = page.locator('[data-testid="cell-8-0"]');
      const cell2 = page.locator('[data-testid="cell-8-1"]');

      await cell1.click();
      await expect(cell1).toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
      await expect(cell2).not.toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);

      await cell2.click();
      await expect(cell1).not.toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
      await expect(cell2).toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
    });

    test("コマを移動させると、ターンが相手に切り替わる", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // P1が(8,0) -> (7,0)へ移動
      await page.locator('[data-testid="cell-8-0"]').click();
      await page.locator('[data-testid="cell-7-0"]').click();

      // アニメーションの完了を待つ
      await expect(page.locator('[data-testid="board-container"]')).toHaveAttribute('data-is-animating', 'false');

      // P2のターンになっていることを確認
      await expect(page.locator('[data-testid="game-state-display"]')).toContainText("「と」チームのばん");

      // P2がコマを選択できることを確認
      const opponentCell = page.locator('[data-testid="cell-0-0"]');
      await opponentCell.click();
      await expect(opponentCell).toHaveCSS("box-shadow", /rgb\(255, 215, 0\)/);
    });

    test("他のコマを飛び越えて移動することはできない", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // (8,1)にP1、(7,1)にP2のコマを配置
      await page.evaluate(() => {
        const controller = (window as TestWindow).gameController;
        const board = controller.getInitialBoard();
        board[7][1] = 'PLAYER2';
        controller.resetGameWithBoard(board);
      });

      // P1が(8,1)を選択
      await page.locator('[data-testid="cell-8-1"]').click();

      // 移動前の駒の位置を取得
      const initialPiecePositions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid^="piece-"]')).map(p => ({
          id: p.getAttribute('data-testid'),
          style: (p as HTMLElement).style.cssText
        }));
      });

      // P2のコマがある(7,1)を飛び越えた(6,1)はクリックしても何も起きない
      await page.locator('[data-testid="cell-6-1"]').click();

      // 移動後の駒の位置を取得
      const newPiecePositions = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('[data-testid^="piece-"]')).map(p => ({
          id: p.getAttribute('data-testid'),
          style: (p as HTMLElement).style.cssText
        }));
      });

      // セルの選択状態によるスタイルの違いは無視し、駒の位置が変わっていないことを確認
      // styleにはtransformも含まれるため、topとleftだけを比較するのは不十分
      expect(newPiecePositions).toEqual(initialPiecePositions);
    });

    test("無効なマスに移動しようとするとコンソールエラーが出力される", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();

      const consoleMessagePromise = new Promise<string>((resolve) => {
        page.on('console', (msg) => {
          if (msg.type() === 'error') {
            resolve(msg.text());
          }
        });
      });

      // P1が(8,0)を選択
      await page.locator('[data-testid="cell-8-0"]').click();
      // 斜めに移動しようとする（無効）
      await page.locator('[data-testid="cell-7-1"]').click();

      const errorMessage = await consoleMessagePromise;
      expect(errorMessage).toBe('Invalid move: Cannot move piece from (8, 0) to (7, 1).');
    });
  });

  test.describe("コマの捕獲", () => {
    test("相手のコマを挟むと、そのコマを捕獲できる", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // P1: (1,3), P2: (1,2), P1: (1,0) が (1,1) に移動するシナリオ
      await page.evaluate(() => {
        const controller = (window as TestWindow).gameController;
        const board = controller.getInitialBoard();
        // ボードをクリア
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) board[r][c] = null;
        board[1][3] = 'PLAYER1';
        board[1][2] = 'PLAYER2';
        board[1][0] = 'PLAYER1';
        controller.resetGameWithBoard(board);
      });

      // P1が(1,0)から(1,1)へ移動してP2を挟む
      await page.locator('[data-testid="cell-1-0"]').click();
      await page.locator('[data-testid="cell-1-1"]').click();

      // P2のコマが消えるのを待つ
      await expect(page.locator('[data-testid^="piece-PLAYER2-"]')).toHaveCount(0, { timeout: 1000 });

      // P1がP2のコマを1つ捕獲したことをスコアで確認
      await expect(page.locator('[data-testid="score-value-PLAYER2"]')).toHaveText("とったかず: 1");
    });

    test("角で相手のコマを囲むと、そのコマを捕獲できる", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // P2が(0,0)に、P1が(0,1)にいる状態で、P1が(1,0)に移動して角のP2を捕獲するシナリオ
      await page.evaluate(() => {
        const controller = (window as TestWindow).gameController;
        const board = controller.getInitialBoard();
        // ボードをクリア
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) board[r][c] = null;
        board[0][0] = 'PLAYER2';
        board[0][1] = 'PLAYER1';
        board[2][0] = 'PLAYER1'; // 移動するコマ
        controller.resetGameWithBoard(board);
      });

      // P1が(2,0)から(1,0)へ移動して角のP2を捕獲
      await page.locator('[data-testid="cell-2-0"]').click();
      await page.locator('[data-testid="cell-1-0"]').click();

      // P2のコマが消えるのを待つ
      await expect(page.locator('[data-testid^="piece-PLAYER2-"]')).toHaveCount(0, { timeout: 1000 });

      // P1がP2のコマを1つ捕獲したことをスコアで確認
      await expect(page.locator('[data-testid="score-value-PLAYER2"]')).toHaveText("とったかず: 1");
    });

    test("辺で相手のコマを囲むと、そのコマを捕獲できる", async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // P1が(1,0)と(3,0)に、P2が(2,0)にいる状態で、P1が(2,1)に移動して囲むシナリオ
      await page.evaluate(() => {
        const controller = (window as TestWindow).gameController;
        const board = controller.getInitialBoard();
        // ボードをクリア
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) board[r][c] = null;
        board[1][0] = 'PLAYER1';
        board[3][0] = 'PLAYER1';
        board[2][0] = 'PLAYER2';
        board[2][2] = 'PLAYER1'; // 移動するコマ
        controller.resetGameWithBoard(board);
      });

      // P1が(2,2)から(2,1)へ移動してP2を囲む
      await page.locator('[data-testid="cell-2-2"]').click();
      await page.locator('[data-testid="cell-2-1"]').click();

      // P2のコマが消えるのを待つ
      await expect(page.locator('[data-testid^="piece-PLAYER2-"]')).toHaveCount(0, { timeout: 1000 });

      // P1がP2のコマを1つ捕獲したことをスコアで確認
      await expect(page.locator('[data-testid="score-value-PLAYER2"]')).toHaveText("とったかず: 1");
    });

    test('角の駒が敵駒2つで囲まれていない場合は捕獲されない', async ({ page }) => {
      await page.getByTestId("win-cond-standard").click();
      // P2が(0,0)にいる状態で、P1が(8,0)から(1,0)に移動する。
      // この時点では(0,1)は空なので、P2は捕獲されない。
      await page.evaluate(() => {
        const controller = (window as TestWindow).gameController;
        const board = controller.getInitialBoard();
        // ボードをクリア
        for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) board[r][c] = null;
        board[0][0] = 'PLAYER2'; // 角の駒
        board[8][0] = 'PLAYER1'; // 移動する駒
        controller.resetGameWithBoard(board);
      });

      // P1が(8,0)から(1,0)へ移動
      await page.locator('[data-testid="cell-8-0"]').click();
      await page.locator('[data-testid="cell-1-0"]').click();
      await page.waitForTimeout(1000); // アニメーション待機

      // P2の駒が捕獲されていないことを確認
      await expect(page.locator('[data-testid^="piece-PLAYER2-"]')).toHaveCount(1);
      // スコアが変わっていないことを確認
      await expect(page.locator('[data-testid="score-value-PLAYER2"]')).toHaveText("とったかず: 0");
    });
  });

  // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
  // ゲーム終了のE2Eテストは、単体テストでコアロジックを網羅的にテストする方針に切り替えたため、削除します。
  // 複雑なゲームシーケンスをE2Eテストで再現するのは不安定であり、
  // コアロジックの単体テストの方がロバスト性が高いためです。
});
