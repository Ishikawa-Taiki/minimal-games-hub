/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });

    await use(page);

    const sanitizedTitle = testInfo.titlePath
      .join('-')
      .replace(/[\s<>:"/\\|?*]/g, '_');
    const screenshotPath = testInfo.outputPath(`${sanitizedTitle}-${testInfo.status}.png`);
    await page.screenshot({ path: screenshotPath });
  },
});

export { expect } from '@playwright/test';
