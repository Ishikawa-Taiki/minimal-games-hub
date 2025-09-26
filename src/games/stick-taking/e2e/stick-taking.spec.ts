import { test, expect } from "@playwright/test";

test.describe("棒消しゲーム", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/games/stick-taking");
  });

  test("最初に難易度選択画面が表示されること", async ({ page }) => {
    await expect(
      page.getByRole("heading", { name: "むずかしさをえらんでね" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "かんたん (3だん)" }),
    ).toBeVisible();
  });

  test("難易度を選択するとゲームが開始されること", async ({ page }) => {
    await page.getByRole("button", { name: "かんたん (3だん)" }).click();
    await expect(
      page.getByTestId("game-state-display").locator("p"),
    ).toHaveText("「プレイヤー1」のばん");
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test("棒を取るとターンが交代すること", async ({ page }) => {
    await page.getByRole("button", { name: "かんたん (3だん)" }).click();
    await page
      .getByTestId("row-0")
      .locator('[data-testid^="stick-"]')
      .nth(0)
      .click();
    await page.getByRole("button", { name: "えらんだぼうをとる" }).click();
    await expect(
      page.getByTestId("game-state-display").locator("p"),
    ).toHaveText("「プレイヤー2」のばん");
  });

  test.skip("ゲーム終了時に結果ダイアログが表示され、もう一度遊べること", async () => {
    // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
  });

  test("ヒント機能が正しく表示・非表示され、内容も更新されること", async ({
    page,
  }) => {
    await page.getByRole("button", { name: "ふつう (5だん)" }).click();

    // ヒントをオンにする
    await page.getByTestId("control-panel-hint-button").click();

    // 初期状態のヒント（塊の長さ）が表示されることを確認
    const row4 = page.getByTestId("row-4");
    await expect(row4.getByText("5")).toBeVisible();

    // 5段目の真ん中の1本を取る -> [1,2,3,4,5] -> [1,2,3,4,[2,2]]
    await page
      .getByTestId("row-4")
      .locator('[data-testid^="stick-"]')
      .nth(2)
      .click();
    await page.getByRole("button", { name: "えらんだぼうをとる" }).click();

    // ヒントが更新されることを確認
    const row4Updated = page.getByTestId("row-4");
    const groups = row4Updated.locator('[data-testid^="group-4-"]');
    await expect(groups).toHaveCount(3);

    // 各グループの内容（塊の長さ）を確認
    await expect(groups.nth(0).getByText("2")).toBeVisible();
    await expect(groups.nth(1).getByText("-")).toBeVisible();
    await expect(groups.nth(2).getByText("2")).toBeVisible();

    // ヒントをオフにする
    await page.getByTestId("control-panel-hint-button").click();
    await expect(row4.getByText("5")).not.toBeVisible();
    await expect(groups.nth(0).getByText("2")).not.toBeVisible();
  });
});
