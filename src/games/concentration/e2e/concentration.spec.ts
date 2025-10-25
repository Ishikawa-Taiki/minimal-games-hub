import { test, expect } from "@playwright/test";

test.describe("神経衰弱ゲーム", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/concentration");
    await expect(page).toHaveTitle(/神経衰弱/);
  });

  test("初期表示と難易度選択", async ({ page }) => {
    // 初期表示の確認
    await expect(
      page.getByRole("heading", { name: "難易度を選んでください" }),
    ).toBeVisible();

    // 難易度を選択
    await page.getByTestId("difficulty-easy").click();

    // ゲームボードが表示されることを確認
    await expect(page.locator('[data-testid^="card-"]')).toHaveCount(20);
  });

  test("カードのサイズがモバイルでの反転時に安定していること", async ({
    page,
  }) => {
    // ビューポートをモバイルサイズに設定 (iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });

    // 難易度「むずかしい」を選択
    await page.getByTestId("difficulty-hard").click();

    // 最初のカードを取得
    const firstCard = page.locator('[data-testid="card-0"]');

    // カードの初期サイズを取得
    const initialBoundingBox = await firstCard.boundingBox();
    expect(initialBoundingBox).not.toBeNull();

    // カードをクリックして裏返す
    await firstCard.click();

    // アニメーションが完了するのを待つ (0.3s + バッファ)
    await page.waitForTimeout(500);

    // 裏返した後のカードのサイズを取得
    const newBoundingBox = await firstCard.boundingBox();
    expect(newBoundingBox).not.toBeNull();

    // 幅と高さが変わっていないことをアサート
    expect(newBoundingBox.width).toBe(initialBoundingBox.width);
    expect(newBoundingBox.height).toBe(initialBoundingBox.height);
  });

  test.describe("無効な操作", () => {
    test("既に表になっているカードは無効化される", async ({ page }) => {
      await page.getByTestId("difficulty-easy").click();

      // 1枚目のカードをクリック
      const card = page.locator('[data-testid="card-0"]');
      await card.click();

      // カードが無効化されていることを確認
      await expect(card).toBeDisabled();
    });

    test("既にマッチが成立しているカードをクリックする", async ({ page }) => {
      await page.getByTestId("difficulty-easy").click();

      // 準備が整うのを待ってから状態を注入する
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await page.waitForFunction(() => (window as any).isConcentrationReadyForTest);

      // `spec-action.md`をテストするため、完全なゲームの状態を直接操作する
      await page.evaluate(() => {
        window.postMessage({
          type: 'SET_GAME_STATE_FOR_TEST',
          state: {
            difficulty: 'easy',
            board: [
              { id: 0, rank: 'A', suit: 'H', isMatched: true, matchedBy: 1 },
              { id: 1, rank: 'A', suit: 'D', isMatched: true, matchedBy: 1 },
              { id: 2, rank: '2', suit: 'H', isMatched: false },
              { id: 3, rank: '2', suit: 'D', isMatched: false },
              // Note: This is a partial board for testing purposes.
            ],
            currentPlayer: 'player1',
            scores: { player1: 1, player2: 0 },
            flippedIndices: [],
            revealedIndices: [],
            hintedIndices: [],
            gameStatus: 'playing',
            hintsEnabled: false,
            status: 'playing',
            winner: null,
          }
        }, '*');
      });

      // 状態がUIに反映されるのを待つ
      await expect(page.locator('[data-testid="card-0"]')).toHaveCSS(
        'background-color',
        'rgba(255, 182, 193, 0.5)',
        { timeout: 1000 }
      );

      // マッチ済みのカードが無効化されていることを確認
      await expect(page.locator('[data-testid="card-0"]')).toBeDisabled();
    });
  });
});
