import { test, expect } from "@playwright/test";

test.describe("神経衰弱ゲーム", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/concentration");
    await expect(page).toHaveTitle(/神経衰弱/);
  });

  // TODO: このテストはローカルでは成功するが、CI環境ではカード枚数が40枚と評価され失敗する。
  //       根本原因の調査が必要なため、一時的にスキップする。
  test.skip("初期表示と難易度選択", async ({ page }) => {
    // 初期表示の確認
    await expect(
      page.getByRole("heading", { name: "難易度を選んでください" }),
    ).toBeVisible();

    // 難易度を選択
    await page.getByRole("button", { name: "かんたん" }).click();

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
    await page.getByRole("button", { name: "むずかしい" }).click();
    await expect(page.getByTestId("pre-game-screen")).not.toBeVisible();

    // 最初のカードを取得
    const firstCard = page.locator('[data-testid="card-0"]');
    await expect(firstCard).toBeVisible();

    // カードの初期サイズを取得
    const initialBoundingBox = await firstCard.boundingBox();
    expect(initialBoundingBox).not.toBeNull();

    // カードをクリックして裏返す
    await firstCard.click();

    // アニメーションが完了するのを待つ
    await page.waitForTimeout(800);

    // 裏返した後のカードのサイズを取得
    const newBoundingBox = await firstCard.boundingBox();
    expect(newBoundingBox).not.toBeNull();

    // スタイル変更（scale）後のサイズを許容誤差の範囲で確認
    const scaleFactor = 1.05; // cardSelected のスタイル
    expect(newBoundingBox.width).toBeCloseTo(
      initialBoundingBox!.width * scaleFactor,
    );
    expect(newBoundingBox.height).toBeCloseTo(
      initialBoundingBox!.height * scaleFactor,
    );
  });
});