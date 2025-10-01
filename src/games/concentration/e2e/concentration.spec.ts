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

    // 難易度選択画面が非表示になるのを待つ
    await expect(page.getByTestId("pre-game-screen")).not.toBeVisible();
    // ゲームボードのカードが20枚になることを確認
    await expect(page.locator('[data-testid^="card-"]')).toHaveCount(20);
  });

  test("カードのサイズがモバイルでの反転時に安定していること", async ({
    page,
  }) => {
    // ビューポートをモバイルサイズに設定 (iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });

    // 難易度「むずかしい」を選択
    await page.getByTestId("difficulty-hard").click();
    await expect(page.getByTestId("pre-game-screen")).not.toBeVisible();

    // 最初のカードを取得
    const firstCard = page.locator('[data-testid="card-0"]');
    await expect(firstCard).toBeVisible();

    // カードの初期サイズを取得
    const initialBoundingBox = await firstCard.boundingBox();
    expect(initialBoundingBox).not.toBeNull();

    // カードをクリックして裏返す
    await firstCard.click();

    // アニメーションが完了するのを待つ (0.6s + バッファ)
    await page.waitForTimeout(800);

    // 裏返した後のカードのサイズを取得
    const newBoundingBox = await firstCard.boundingBox();
    expect(newBoundingBox).not.toBeNull();

    // 幅と高さが変わっていないことをアサート（小数点以下の誤差を許容）
    expect(newBoundingBox.width).toBeCloseTo(initialBoundingBox!.width);
    expect(newBoundingBox.height).toBeCloseTo(initialBoundingBox!.height);
  });
});
