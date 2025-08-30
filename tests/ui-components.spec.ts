import { test, expect } from '@playwright/test';

test.describe('UI Component Debug Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/debug');
  });

  test('should render all component sections', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'UI Component Debug Page' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Buttons' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Dialogs' })).toBeVisible();
  });

  test.describe('Buttons Section', () => {
    test('should render all button types', async ({ page }) => {
      await expect(page.getByRole('button', { name: 'Positive' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Negative' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Selectable' })).toBeVisible();
    });

    test('should change button size', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'Positive' });

      // Check medium size (default)
      await expect(positiveButton).toHaveCSS('font-size', '16px'); // 1rem

      // Change to small
      await page.getByLabel('Size:').selectOption('small');
      await expect(positiveButton).toHaveCSS('font-size', '14px'); // 0.875rem

      // Change to large
      await page.getByLabel('Size:').selectOption('large');
      await expect(positiveButton).toHaveCSS('font-size', '18px'); // 1.125rem
    });

    test('should disable and enable buttons', async ({ page }) => {
      const positiveButton = page.getByRole('button', { name: 'Positive' });
      const disabledCheckbox = page.getByLabel('Disabled');

      await expect(positiveButton).toBeEnabled();

      // Disable buttons
      await disabledCheckbox.check();
      await expect(positiveButton).toBeDisabled();
      await expect(positiveButton).toHaveCSS('background-color', 'rgb(156, 163, 175)'); // gray-400

      // Enable buttons
      await disabledCheckbox.uncheck();
      await expect(positiveButton).toBeEnabled();
      await expect(positiveButton).toHaveCSS('background-color', 'rgb(37, 99, 235)'); // blue-600
    });

    test('should toggle SelectableButton state and style', async ({ page }) => {
      const selectableButton = page.getByRole('button', { name: 'Selectable' });
      const output = page.getByText('SelectableButton isSelected:');

      await expect(output).toHaveText('SelectableButton isSelected: false');
      // 'ghost' variant has a transparent background
      await expect(selectableButton).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');

      // Click to select
      await selectableButton.click();
      await expect(output).toHaveText('SelectableButton isSelected: true');
      // 'success' variant is green
      await expect(selectableButton).toHaveCSS('background-color', 'rgb(22, 163, 74)'); // green-600
    });
  });

  test.describe('Dialogs Section', () => {
    test('should show and hide AlertDialog correctly', async ({ page }) => {
      const output = page.getByText('Last dialog result:');
      await expect(output).not.toBeVisible();

      await page.getByRole('button', { name: 'Show Alert' }).click();

      const alertDialog = page.getByRole('dialog');
      await expect(alertDialog).toBeVisible();
      await expect(alertDialog.getByRole('heading', { name: 'アラート' })).toBeVisible();

      // Verify it's not dismissible by clicking overlay
      await page.locator('div[role="dialog"]').first().click({ position: { x: 10, y: 10 } });
      await expect(alertDialog).toBeVisible();

      await alertDialog.getByRole('button', { name: 'OK' }).click();
      await expect(alertDialog).not.toBeVisible();
      await expect(output).toHaveText('Last dialog result: Alert dialog confirmed.');
    });

    test('should show and hide ConfirmationDialog correctly', async ({ page }) => {
        const output = page.getByText('Last dialog result:');
        await expect(output).not.toBeVisible();

        // Test "Cancel"
        await page.getByRole('button', { name: 'Show Confirm' }).click();
        const confirmDialog = page.getByRole('dialog');
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'キャンセル' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('Last dialog result: Confirmation result: false');

        // Test "OK"
        await page.getByRole('button', { name: 'Show Confirm' }).click();
        await expect(confirmDialog).toBeVisible();
        await confirmDialog.getByRole('button', { name: 'OK' }).click();
        await expect(confirmDialog).not.toBeVisible();
        await expect(output).toHaveText('Last dialog result: Confirmation result: true');
    });
  });
});
