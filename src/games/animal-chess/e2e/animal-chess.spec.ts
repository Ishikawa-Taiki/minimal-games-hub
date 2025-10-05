import { test, expect, Page } from "@playwright/test";

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
  test.skip("ライオンを捕獲して勝利する（キャッチ）", async ({ page }) => {
    // A simpler, valid sequence to capture the lion
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
    await page.locator('[data-testid="cell-1-1"]').click(); // -> P2 Chick
    await page.locator('[data-testid="cell-0-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-1-1"]').click(); // -> P1 Chick
    await page.locator('[data-testid="cell-3-2"]').click(); // P1 Elephant
    await page.locator('[data-testid="cell-2-2"]').click();
    await page.locator('[data-testid="cell-1-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-2-1"]').click();
    await page.locator('[data-testid="cell-3-0"]').click(); // P1 Giraffe
    await page.locator('[data-testid="cell-2-0"]').click();
    await page.locator('[data-testid="cell-2-1"]').click(); // P2 Lion
    await page.locator('[data-testid="cell-3-1"]').click();
    await page.locator('[data-testid="cell-2-2"]').click(); // P1 Elephant
    await page.locator('[data-testid="cell-3-1"]').click(); // -> P2 Lion (WIN)

    const dialog = page.getByRole("dialog", { name: "おかしチームのかち！" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("キャッチ！(ライオンをとったよ！)");
  });

  test("ライオンが最終ラインに到達して勝利する（トライ）", async ({ page }) => {
    // A valid sequence of moves leading to a "Try" win
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Chick
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Chick moves & captures
    await page.locator('[data-testid="cell-0-0"]').click(); // P2 Elephant
    await page.locator('[data-testid="cell-1-1"]').click(); // P2 Elephant moves & captures
    await page.locator('[data-testid="cell-3-1"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Lion moves
    await page.locator('[data-testid="cell-1-1"]').click(); // P2 Elephant
    await page.locator('[data-testid="cell-2-2"]').click(); // P2 Elephant moves
    await page.locator('[data-testid="cell-2-1"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Lion moves
    await page.locator('[data-testid="cell-0-2"]').click(); // P2 Giraffe
    await page.locator('[data-testid="cell-1-2"]').click(); // P2 Giraffe moves
    await page.locator('[data-testid="cell-1-1"]').click(); // P1 Lion
    await page.locator('[data-testid="cell-0-1"]').click(); // P1 Lion moves to the final rank

    const dialog = page.getByRole("dialog", { name: "おかしチームのかち！" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText(
      "トライ！ (さいごのますにとうたつしたよ！)",
    );
  });
});