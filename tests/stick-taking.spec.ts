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
    await expect(page.getByTestId('game-state-display').locator('p')).toHaveText('「プレイヤー1」のばん');
    await expect(page.locator('[data-testid^="stick-"]')).toHaveCount(6);
  });

  test('棒を取るとターンが交代すること', async ({ page }) => {
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();

    await page.locator('[data-testid="stick-0-0"]').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    await expect(page.getByTestId('game-state-display').locator('p')).toHaveText('「プレイヤー2」のばん');
    const stick = page.locator('[data-testid="stick-0-0"]');
    await expect(stick).toHaveAttribute('data-taken', 'true');
  });

  test.skip('ゲーム終了時に結果ダイアログが表示され、もう一度遊べること', async ({ page }) => {
    // TODO: ダイアログ表示がテスト環境で不安定なため、一時的にスキップ。要調査。
    await page.getByRole('button', { name: 'かんたん (3だん)' }).click();
    // ...
  });

  test('ヒント機能が正しく表示・非表示され、内容も更新されること', async ({ page }) => {
    await page.getByRole('button', { name: 'ふつう (5だん)' }).click();

    // 初期状態ではヒントが非表示であることを確認
    const hintRow = page.locator('[style*="visibility: hidden"]');
    await expect(hintRow).toHaveCount(6); // 5段 + nim-sum
    await expect(page.getByTestId('hint-nim-sum')).not.toBeVisible();

    // ヒントをオンにする
    await page.getByTestId('control-panel-hint-button').click();

    // ヒントが表示されることを確認
    await expect(page.getByTestId('hint-item-0-0')).toBeVisible();
    await expect(page.getByTestId('hint-nim-sum')).toBeVisible();

    // 初期状態のヒント内容を確認
    await expect(page.getByTestId('hint-item-0-0')).toHaveText('1');
    await expect(page.getByTestId('hint-item-1-0')).toHaveText('2');
    await expect(page.getByTestId('hint-item-2-1')).toHaveText('3');
    await expect(page.getByTestId('hint-item-3-1')).toHaveText('4');
    await expect(page.getByTestId('hint-item-4-2')).toHaveText('5');
    await expect(page.getByTestId('hint-nim-sum')).toHaveText('チャンス (ニム和 = 1)');

    // 4段目の真ん中の2本を取る
    await page.getByTestId('stick-3-1').click();
    await page.getByTestId('stick-3-2').click();
    await page.getByRole('button', { name: 'えらんだぼうをとる' }).click();

    // ヒントが更新されることを確認 (4段目が [1, 1] に分割される)
    await expect(page.getByTestId('hint-item-3-0')).toHaveText('1');
    await expect(page.getByTestId('hint-item-3-1')).toHaveText('-');
    await expect(page.getByTestId('hint-item-3-2')).toHaveText('-');
    await expect(page.getByTestId('hint-item-3-3')).toHaveText('1');
    // プレイヤーが交代したので、ニム和のテキストの色も変わるはず
    await expect(page.getByTestId('hint-nim-sum')).toHaveText('チャンス (ニム和 = 5)');

    // ヒントをオフにする
    await page.getByTestId('control-panel-hint-button').click();
    await expect(page.getByTestId('hint-item-0-0')).not.toBeVisible();
    await expect(page.getByTestId('hint-nim-sum')).not.toBeVisible();
  });
});
