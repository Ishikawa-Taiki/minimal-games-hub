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

  test("無効な操作（3枚目のカードをクリック）でコンソールエラーが出力される", async ({ page }) => {
    // 難易度を選択してゲーム開始
    await page.getByTestId("difficulty-easy").click();

    const consoleMessagePromise = new Promise<string>((resolve) => {
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          resolve(msg.text());
        }
      });
    });

    // 1枚目、2枚目のカードをクリック
    await page.locator('[data-testid="card-0"]').click();
    await page.locator('[data-testid="card-1"]').click();
    // 3枚目のカードをクリック
    await page.locator('[data-testid="card-2"]').click();

    const errorMessage = await consoleMessagePromise;
    expect(errorMessage).toBe('Invalid action: Cannot flip more than two cards at a time.');
  });
});
