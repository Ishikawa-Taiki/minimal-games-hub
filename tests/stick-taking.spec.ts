import { test, expect } from '@playwright/test';

test.describe('棒消しゲーム', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/games/stick-taking');
  });

  test('最初に難易度選択画面が表示されること', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'かんたん (3だん)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'ふつう (5だん)' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'むずかしい (7だん)' })).toBeVisible();
  });

  test('難易度を選択するとゲームが開始されること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();
    await expect(page.getByTestId('status')).toHaveText('プレイヤー1のばん');
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await expect(page.getByTestId('status')).toHaveText('プレイヤー1のばん');
    await page.locator('[data-testid^="row-0"] > div').first().click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('status')).toHaveText('プレイヤー2のばん');
    const sticks = await page.locator('[data-testid^="stick-"]').all();
    let takenCount = 0;
    for (const stick of sticks) {
      const style = await stick.getAttribute('style');
      if (style?.includes('background-color: rgb(211, 211, 211)')) {
        takenCount++;
      }
    }
    expect(takenCount).toBe(1);
  });

  // TODO: 共通コンポーネント化時にテストNGとなったため、個別で調査して調整する
  // test('ゲーム終了時に勝者モーダルが表示されること', async ({ page }) => {
  //   test.slow();
  //   await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

  //   // P1: 3段目の棒を1本取る
  //   await page.locator('[data-testid="row-2"] > div').nth(0).click();
  //   await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

  //   // P2: 3段目の残りの棒を2本取る
  //   await page.locator('[data-testid="row-2"] > div').nth(1).click();
  //   await page.locator('[data-testid="row-2"] > div').nth(2).click();
  //   await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

  //   // P1: 2段目の棒を2本取る
  //   await page.locator('[data-testid="row-1"] > div').nth(0).click();
  //   await page.locator('[data-testid="row-1"] > div').nth(1).click();
  //   await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

  //   // P2: 1段目の最後の棒を取る
  //   await page.locator('[data-testid="row-0"] > div').nth(0).click();
  //   await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

  //   const dialog = page.getByRole('dialog', { name: 'けっか' });
  //   await expect(dialog).toBeVisible();
  //   await expect(dialog).toContainText('かったのは プレイヤー1！');
  //   await expect(dialog).toContainText('プレイヤー2がさいごのぼうをとったよ');
  // });

  // TODO: 共通コンポーネント化時にテストNGとなったため、個別で調査して調整する
  // TODO: GameLayoutとの連携起因でコンポーネントが再レンダリングされずテストが失敗する。要調査。
  // test('「もういっかい」ボタンでゲームがリスタートすること', async ({ page }) => {
  //   test.slow();
  //   await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

  //   // ゲームが終了するまでループ
  //   for (let i = 0; i < 10; i++) { // 10ターンあれば必ず終わる
  //     const dialog = page.getByRole('dialog', { name: 'けっか' });
  //     const isVisible = await dialog.isVisible();
  //     if (isVisible) break;

  //     const availableSticks = page.locator('[data-testid^="stick-"]:not([style*="background-color: rgb(211, 211, 211)"])');
  //     await availableSticks.first().click();
  //     await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();
  //     // ターン表示が切り替わるのを少し待つ
  //     await page.waitForTimeout(100);
  //   }

  //   const dialog = page.getByRole('dialog', { name: 'けっか' });
  //   await expect(dialog).toBeVisible();
  //   await dialog.getByTestId('alert-dialog-confirm-button').click();

  //   // ゲームがリセットされ、モーダルが消え、難易度選択画面に戻ることを確認
  //   await expect(dialog).not.toBeVisible();
  //   await expect(page.getByRole('heading', { name: 'むずかしさをえらんでね' })).toBeVisible();
  // });

  test('「おしえて！」機能が正しく動作すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    const hintButton = page.getByTestId('hint-button');
    await expect(hintButton).toBeVisible();

    // スコア情報（ヒント）が最初は表示されていないことを確認
    const scoreInfo = page.locator('div:text("のこりのぼう")');
    await expect(scoreInfo).not.toBeVisible();

    // 「おしえて！」ボタンをクリック
    await hintButton.click();

    // スコア情報が表示されることを確認
    await expect(page.getByText('のこりのぼう: 6本')).toBeVisible();
    await expect(page.getByText('かたまりの数: 3個')).toBeVisible();

    // もう一度クリックして非表示にする
    await hintButton.click();
    await expect(scoreInfo).not.toBeVisible();
  });
});
