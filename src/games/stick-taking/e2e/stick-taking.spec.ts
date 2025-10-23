import { test, expect, Page } from "@playwright/test";

const expectCurrentPlayer = async (page: Page, player: "プレイヤー1" | "プレイヤー2") => {
  const locator = page.getByTestId("game-state-display").locator("p");
  await expect(locator).toHaveText(`「${player}」のばん`);
};

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
    await expect(page.getByRole('button', { name: 'えらんだぼうをとる' })).toBeEnabled();
    await page.getByRole("button", { name: "えらんだぼうをとる" }).click();
    await expect(
      page.getByTestId("game-state-display").locator("p"),
    ).toHaveText("「プレイヤー2」のばん");
  });

  test("ゲーム終了時に結果ダイアログが表示され、もう一度遊べること", async ({ page }) => {
    await page.getByRole("button", { name: "かんたん (3だん)" }).click();

    // Play until the game ends.
    // Turn 1: P1 takes 1 stick from row 0
    await page.locator('[data-testid="row-0"] [data-testid^="stick-"]').nth(0).click();
    await expect(page.getByRole('button', { name: 'えらんだぼうをとる' })).toBeEnabled();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
    await expectCurrentPlayer(page, "プレイヤー2");

    // Turn 2: P2 takes 2 sticks from row 1
    await page.locator('[data-testid="row-1"] [data-testid^="stick-"]').nth(0).click();
    await page.locator('[data-testid="row-1"] [data-testid^="stick-"]').nth(1).click();
    await expect(page.getByRole('button', { name: 'えらんだぼうをとる' })).toBeEnabled();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
    await expectCurrentPlayer(page, "プレイヤー1");

    // Turn 3: P1 takes all 3 sticks from row 2
    await page.locator('[data-testid="row-2"] [data-testid^="stick-"]').nth(0).click();
    await page.locator('[data-testid="row-2"] [data-testid^="stick-"]').nth(1).click();
    await page.locator('[data-testid="row-2"] [data-testid^="stick-"]').nth(2).click();
    await expect(page.getByRole('button', { name: 'えらんだぼうをとる' })).toBeEnabled();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // P1 took the last stick, so P2 wins.
    const dialog = page.getByRole("dialog", { name: "プレイヤー2のかち！" });
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText("プレイヤー1がさいごの1本をとったよ！");

    // Click "OK"
    await dialog.getByRole("button", { name: "OK" }).click();

    // Should be back to the difficulty selection screen.
    await expect(
      page.getByRole("heading", { name: "むずかしさをえらんでね" }),
    ).toBeVisible();
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

  test.describe("無効な操作", () => {
    test("棒を選ばずに取るとエラーになる", async ({ page }) => {
      await page.getByRole("button", { name: "かんたん (3だん)" }).click();

      const consoleMessagePromise = page.waitForEvent("console", (msg) => {
        return msg.type() === "error";
      });

      // 棒を選ばずに「とる」ボタンをクリック
      await page.getByRole("button", { name: "えらんだぼうをとる" }).click();

      const msg = await consoleMessagePromise;
      expect(msg.text()).toBe('Invalid action: Cannot take 0 sticks.');
    });

    test("既に取られた棒を選択しようとするとエラーになる", async ({ page }) => {
      await page.getByRole("button", { name: "かんたん (3だん)" }).click();

      // 1段目の棒を1本取る
      const firstStick = page.locator('[data-testid="row-0"] [data-testid^="stick-"]').nth(0);
      await firstStick.click();
      await page.getByRole("button", { name: "えらんだぼうをとる" }).click();

      // ターンが交代するのを待つ
      await expectCurrentPlayer(page, "プレイヤー2");

      const consoleMessagePromise = page.waitForEvent("console", (msg) => {
        return msg.type() === "error";
      });

      // 再度同じ棒をクリック
      await firstStick.click();

      const msg = await consoleMessagePromise;
      expect(msg.text()).toBe('Invalid action: Stick at row 0, id 0 has already been taken.');
    });
  });
});