import { test, expect } from '@playwright/test';

test.describe('UIコンポーネントのデバッグページ', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/debug');
  });

  test('すべてのコンポーネントセクションが正しく表示される', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'UI Component Debug Page' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dialogs' })).toBeVisible();
  });

  test.describe('ボタンセクション', () => {
    test('すべてのボタンタイプが正しく表示される', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Positive' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Negative' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Selectable' })).toBeVisible();
    });

    test('ボタンのサイズが変更できる', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'Positive' });

      // デフォルトのmediumサイズを確認
      await expect(positiveButton).toHaveCSS('font-size', '16px'); // 1rem

      // smallサイズに変更
      await page.getByLabel('Size:').selectOption('small');
      await expect(positiveButton).toHaveCSS('font-size', '14px'); // 0.875rem

      // largeサイズに変更
      await page.getByLabel('Size:').selectOption('large');
      await expect(positiveButton).toHaveCSS('font-size', '18px'); // 1.125rem
    });

    test('ボタンのdisabled状態を切り替えられる', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'Positive' });
      const disabledCheckbox = page.getByLabel('Disabled');

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
      const selectableButton = page.getByRole('button', { name: 'Selectable' });
      const output = page.getByText('SelectableButton isSelected:');

      await expect(output).toHaveText('SelectableButton isSelected: false');
      // 'ghost' variantは背景が透明
      await expect(selectableButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

      // クリックして選択状態にする
      await selectableButton.click();
      await expect(output).toHaveText('SelectableButton isSelected: true');
      // 'success' variantは緑色
      await expect(selectableButton).toHaveCSS('background-color', 'rgb(22, 163, 74)'); // green-600
    });
  });

  test.describe('ダイアログセクション', () => {
    test('AlertDialogが正しく表示・非表示される', async ({ page }) => {
      const output = page.getByText('Last dialog result:');
      await expect(output).not.toBeVisible();

      await page.getByRole('button', { name: 'Show Alert' }).click();

      const alertDialog = page.getByRole('dialog');
      await expect(alertDialog).toBeVisible();
      await expect(alertDialog.getByRole('heading', { name: 'アラート' })).toBeVisible();

      // オーバーレイをクリックしても閉じないことを確認
      await page.locator('div[role="dialog"]').first().click({ position: { x: 10, y: 10 } });
      await expect(alertDialog).toBeVisible();

      await alertDialog.getByRole('button', { name: 'OK' }).click();
      await expect(alertDialog).not.toBeVisible();
      await expect(output).toHaveText('Last dialog result: Alert dialog confirmed.');
    });

    test('ConfirmationDialogが正しく表示・非表示され、結果を返す', async ({ page }) => {
        const output = page.getByText('Last dialog result:');
        await expect(output).not.toBeVisible();

        // 「キャンセル」のテスト
        await page.getByRole('button', { name: 'Show Confirm' }).click();
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'キャンセル' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('Last dialog result: Confirmation result: false');

        // 「OK」のテスト
        await page.getByRole('button', { name: 'Show Confirm' }).click();
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'OK' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('Last dialog result: Confirmation result: true');
    });
  });
});
