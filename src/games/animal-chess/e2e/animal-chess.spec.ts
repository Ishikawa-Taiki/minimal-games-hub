import { test, expect, Page } from "../../../../lib/fixtures/hook";

test.beforeEach(async ({ page }) => {
  await page.goto("/games/animal-chess");
  await expect(page).toHaveTitle(/アニマルチェス/);
});

const teamNameMap = {
  p1: "おかしチーム",
  p2: "おはなチーム",
};

const pieceNameMap: { [key: string]: string } = {
  lion: 'ライオン',
  giraffe: 'キリン',
  elephant: 'ゾウ',
  chick: 'ひよこ',
  rooster: 'にわとり',
};

// Helper functions
const expectPiece = async (
  page: Page,
  cellTestId: string,
  pieceOwner: "p1" | "p2",
  pieceName: string,
) => {
  const cell = page.locator(`[data-testid="${cellTestId}"]`);
  const image = cell.locator("img");
  await expect(image).toBeVisible();
  const ownerName = teamNameMap[pieceOwner];
  const typeName = pieceNameMap[pieceName.toLowerCase()];
  await expect(image).toHaveAttribute("alt", `${ownerName}の${typeName}`);
};

const expectEmpty = async (page: Page, cellTestId: string) => {
  const cell = page.locator(`[data-testid="${cellTestId}"]`);
  await expect(cell.locator("img")).not.toBeVisible();
};

const expectCurrentPlayer = async (
  page: Page,
  player: "おかしチーム" | "おはなチーム",
) => {
  const locator = page.getByTestId("game-state-display").locator("p");
  await expect(locator).toHaveText(`「${player}」のばん`);
};

test("初期盤面とコマが正しく表示される", async ({ page }) => {
  await expectPiece(page, "cell-3-1", "p1", "lion");
  await expectPiece(page, "cell-0-1", "p2", "lion");
  await expectCurrentPlayer(page, "おかしチーム");
});

test("リセットボタンが機能すること", async ({ page }) => {
  await page.locator('[data-testid="cell-2-1"]').click();
  await page.locator('[data-testid="cell-1-1"]').click();
  await expectCurrentPlayer(page, "おはなチーム");

  await page.locator('[data-testid="control-panel-reset-button"]').click();
  const dialog = page.getByRole("dialog", { name: "かくにん" });
  await expect(dialog).toBeVisible();
  await dialog.getByTestId("confirmation-dialog-confirm-button").click();

  await expectCurrentPlayer(page, "おかしチーム");
  await expectPiece(page, "cell-2-1", "p1", "chick");
});

test.describe("無効な操作", () => {
  test("自分の手番でない駒や空のセルを選択する", async ({ page }) => {
    const errorMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
    });

    // 空のセルを選択
    await page.locator('[data-testid="cell-1-1"]').click();
    expect(errorMessages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Invalid selection: Cannot select cell (1, 1) as it is empty or belongs to the opponent.')
      ])
    );

    // 相手の駒を選択
    await page.locator('[data-testid="cell-0-1"]').click();
    expect(errorMessages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Invalid selection: Cannot select cell (0, 1) as it is empty or belongs to the opponent.')
      ])
    );

    // 状態が変わっていないことを確認
    await expectCurrentPlayer(page, "おかしチーム");
  });

  test("ルール上移動できないマスや味方の駒がいるマスに移動しようとする", async ({ page }) => {
    const errorMessages: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errorMessages.push(msg.text());
      }
    });

    // 味方の駒がいるマスに移動
    await page.locator('[data-testid="cell-3-0"]').click(); // select GIRAFFE
    await page.locator('[data-testid="cell-3-1"]').click(); // try to move to LION's cell
    expect(errorMessages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Invalid move: Cannot move GIRAFFE from (3, 0) to (3, 1).')
      ])
    );

    // ルール上移動できないマスに移動
    await page.locator('[data-testid="cell-3-2"]').click(); // select ELEPHANT
    await page.locator('[data-testid="cell-2-2"]').click(); // try to move vertically
    expect(errorMessages).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Invalid move: Cannot move ELEPHANT from (3, 2) to (2, 2).')
      ])
    );

    // 状態が変わっていないことを確認
    await expectPiece(page, "cell-3-0", "p1", "giraffe");
    await expectPiece(page, "cell-3-1", "p1", "lion");
    await expectPiece(page, "cell-3-2", "p1", "elephant");
    await expectEmpty(page, "cell-2-2");
    await expectCurrentPlayer(page, "おかしチーム");
  });

  test("持ち駒を既に駒が存在するマスに置こうとする", async ({ page }) => {
    // 準備：持ち駒を得る
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Chick captures P2 Chick
    await page.locator('[data-testid="cell-0-2"]').click(); // P2 Giraffe
    await page.locator('[data-testid="cell-1-2"]').click();

    // 持ち駒を選択する
    const capturedPieceButton = page.locator('[data-testid="captured-piece-OKASHI-CHICK"]');
    await capturedPieceButton.click();

    // 選択が反映され、スタイルが変わるのを待つ
    await expect(capturedPieceButton).toHaveCSS('background-color', 'rgb(191, 219, 254)');

    // イベント待機とアクションを同時に実行
    const [msg] = await Promise.all([
      page.waitForEvent('console', { predicate: (msg) => msg.type() === 'error' }),
      page.locator('[data-testid="cell-3-1"]').click(), // try to drop on own LION
    ]);

    const errorMessage = msg.text();
    expect(errorMessage).toContain('Invalid drop: Cell (3, 1) is already occupied.');

    // 状態が変わっていないことを確認
    await expectPiece(page, "cell-3-1", "p1", "lion");
    await expect(capturedPieceButton).toBeVisible();
    await expectCurrentPlayer(page, "おかしチーム");
  });

  test("持ち駒の「ヒヨコ」を相手の最終段に置こうとする", async ({ page }) => {
    // 準備：持ち駒を得て、最終段を空ける
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Chick captures P2 Chick
    await page.locator('[data-testid="cell-0-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-1-1"]').click(); // P2 Lion moves

    // 持ち駒のヒヨコを選択
    const capturedPieceButton = page.locator('[data-testid="captured-piece-OKASHI-CHICK"]');
    await capturedPieceButton.click();

    // 選択が反映され、スタイルが変わるのを待つ
    await expect(capturedPieceButton).toHaveCSS('background-color', 'rgb(191, 219, 254)');

    // イベント待機とアクションを同時に実行
    const [msg] = await Promise.all([
      page.waitForEvent('console', { predicate: (msg) => msg.type() === 'error' }),
      page.locator('[data-testid="cell-0-1"]').click(), // try to drop on the final rank (empty cell)
    ]);

    const errorMessage = msg.text();
    expect(errorMessage).toContain('Invalid drop: CHICK cannot be dropped on the final rank.');

    // 状態が変わっていないことを確認
    await expectEmpty(page, "cell-0-1");
    await expect(capturedPieceButton).toBeVisible();
    await expectCurrentPlayer(page, "おかしチーム");
  });

  test("自分の手番ではない時に持ち駒を選択しようとする", async ({ page }) => {
    // 準備：持ち駒を得て、相手のターンにする
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Chick captures P2 Chick
    // ここでP2(おはなチーム)のターンになる

    // イベント待機とアクションを同時に実行
    const [msg] = await Promise.all([
      page.waitForEvent('console', { predicate: (msg) => msg.type() === 'error' }),
      page.locator('[data-testid="captured-piece-OKASHI-CHICK"]').click(),
    ]);

    const errorMessage = msg.text();
    expect(errorMessage).toContain('Invalid action: Cannot select captured piece when game is over or it is not your turn.');

    // 状態が変わっていないことを確認
    await expectCurrentPlayer(page, "おはなチーム");
  });
});

test("選択したコマを有効なマスに移動できること", async ({ page }) => {
  await page.locator('[data-testid="cell-2-1"]').click();
  await page.locator('[data-testid="cell-1-1"]').click();
  await expectPiece(page, "cell-1-1", "p1", "chick");
  await expectEmpty(page, "cell-2-1");
  await expectCurrentPlayer(page, "おはなチーム");
});

test("「おしえて！」機能が正しく動作すること", async ({ page }) => {
  const hintButton = page.locator('[data-testid="control-panel-hint-button"]');
  const chickCell = page.locator('[data-testid="cell-2-1"]');
  const validMoveCell = page.locator('[data-testid="cell-1-1"]');
  // このテストケースでは、(1,1)への移動は相手のライオンに取られるため「危険マス」となる
  const dangerHighlightColor = "rgba(239, 68, 68, 0.7)"; // Red for danger

  await hintButton.click();
  await chickCell.click();
  await expect(validMoveCell).toHaveCSS(
    "background-color",
    dangerHighlightColor,
  );
});

test("持ちコマを配置できること", async ({ page }) => {
  await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
  await page.locator('[data-testid="cell-1-1"]').click(); // P1 Chick moves & captures P2 Chick

  // P2 makes a non-recapturing move
  await page.locator('[data-testid="cell-0-2"]').click(); // P2 Giraffe
  await page.locator('[data-testid="cell-1-2"]').click(); // P2 Giraffe moves

  await expectCurrentPlayer(page, "おかしチーム");
  const capturedPiece = page.locator(
    '[data-testid="captured-piece-OKASHI-CHICK"]',
  );
  await expect(capturedPiece).toBeVisible();
  await capturedPiece.click();

  await page.locator('[data-testid="cell-2-2"]').click(); // Drop piece

  await expectPiece(page, "cell-2-2", "p1", "chick");
  await expect(capturedPiece).not.toBeVisible();
  await expectCurrentPlayer(page, "おはなチーム");
});

test.describe("ゲーム終了とダイアログ", () => {
  test("ライオンを捕獲して勝利する（キャッチ）", async ({ page }) => {
    await page.locator('[data-testid="cell-3-1"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-2-0"]').click();
    await page.locator('[data-testid="cell-0-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-1-0"]').click();
    await page.locator('[data-testid="cell-2-0"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-1-0"]').click(); // -> P2 Lion (WIN)

    const dialog = page.getByRole("dialog", { name: "おかしチームのかち！" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("キャッチ！(ライオンをとったよ！)");
  });

  test("ライオンが最終ラインに到達して勝利する（トライ）", async ({ page }) => {
    await page.locator('[data-testid="cell-3-1"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-2-2"]').click();
    await page.locator('[data-testid="cell-0-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-1-0"]').click();
    await page.locator('[data-testid="cell-2-2"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-1-2"]').click();
    await page.locator('[data-testid="cell-1-0"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-2-0"]').click();
    await page.locator('[data-testid="cell-1-2"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-0-1"]').click(); // P1 Lion moves to the final rank

    const dialog = page.getByRole("dialog", { name: "おかしチームのかち！" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      "トライ！ (さいごのますにとうたつしたよ！)",
    );
  });
});
