import { test, expect } from '@playwright/test';

test.describe('UIコンポーネントのデバッグページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/debug');
  });

  test('すべてのコンポーネントセクションが正しく表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'UIコンポーネント デバッグページ' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ボタン' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'ダイアログ' })).toBeVisible();
  });

  test.describe('ボタンセクション', () => {
    test('すべてのボタンタイプが正しく表示される', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'ポジティブ' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'ネガティブ' })).toBeVisible();
      await expect(page.getByRole('button', { name: '選択可能' })).toBeVisible();
    });

    test('ボタンのサイズが変更できる', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'ポジティブ' });

      // デフォルトのmediumサイズを確認
      await expect(positiveButton).toHaveCSS('font-size', '16px'); // 1rem

      // smallサイズに変更
      await page.getByLabel('サイズ:').selectOption({ label: '小' });
      await expect(positiveButton).toHaveCSS('font-size', '14px'); // 0.875rem

      // largeサイズに変更
      await page.getByLabel('サイズ:').selectOption({ label: '大' });
      await expect(positiveButton).toHaveCSS('font-size', '18px'); // 1.125rem
    });

    test('ボタンのdisabled状態を切り替えられる', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'ポジティブ' });
      const disabledCheckbox = page.getByLabel('無効');

      await expect(positiveButton).toBeEnabled();

      // ボタンを無効化
      await disabledCheckbox.check();
      await expect(positiveButton).toBeDisabled();
      await expect(positiveButton).toHaveCSS('background-color', 'rgb(156, 163, 175)'); // gray-400

      // ボタンを有効化
      await disabledCheckbox.uncheck();
      await expect(positiveButton).toBeEnabled();
      await expect(positiveButton).toHaveCSS('background-color', 'rgb(37, 99, 235)'); // blue-600
    });

    test('SelectableButtonの状態とスタイルが正しく切り替わる', async ({ page }) => {
      const selectableButton = page.getByRole('button', { name: '選択可能' });
      const output = page.getByText('SelectableButtonの選択状態:');

      await expect(output).toHaveText('SelectableButtonの選択状態: false');
      // 'ghost' variantは背景が透明
      await expect(selectableButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

      // クリックして選択状態にする
      await selectableButton.click();
      await expect(output).toHaveText('SelectableButtonの選択状態: true');
      // 'success' variantは緑色
      await expect(selectableButton).toHaveCSS('background-color', 'rgb(22, 163, 74)'); // green-600
    });
  });

  test.describe('ダイアログセクション', () => {
    test('AlertDialogが正しく表示・非表示される', async ({ page }) => {
      const output = page.getByText('最後のダイアログ結果:');
      await expect(output).not.toBeVisible();

      await page.getByRole('button', { name: 'アラート表示' }).click();

      const alertDialog = page.getByRole('dialog');
      await expect(alertDialog).toBeVisible();
      await expect(alertDialog.getByRole('heading', { name: 'アラート' })).toBeVisible();

      // オーバーレイをクリックしても閉じないことを確認
      await page.locator('div[role="dialog"]').first().click({ position: { x: 10, y: 10 } });
      await expect(alertDialog).toBeVisible();

      await alertDialog.getByRole('button', { name: 'OK' }).click();
      await expect(alertDialog).not.toBeVisible();
      await expect(output).toHaveText('最後のダイアログ結果: アラートダイアログが確認されました。');
    });

    test('ConfirmationDialogが正しく表示・非表示され、結果を返す', async ({ page }) => {
        const output = page.getByText('最後のダイアログ結果:');
        await expect(output).not.toBeVisible();

        // 「キャンセル」のテスト
        await page.getByRole('button', { name: '確認ダイアログ表示' }).click();
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'キャンセル' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('最後のダイアログ結果: 確認ダイアログの結果: false');

        // 「OK」のテスト
        await page.getByRole('button', { name: '確認ダイアログ表示' }).click();
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'OK' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('最後のダイアログ結果: 確認ダイアログの結果: true');
    });
  });

});