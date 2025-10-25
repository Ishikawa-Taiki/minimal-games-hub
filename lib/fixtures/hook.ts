/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import * as path from 'path';

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
    // Use testInfo.testId for uniqueness to avoid collisions.
    const uniqueFileName = `${sanitizedTitle}-${testInfo.status}-${testInfo.testId}.png`;
    const screenshotPath = path.join(testInfo.project.outputDir, uniqueFileName);
    await page.screenshot({ path: screenshotPath });
  },
});

export { expect } from '@playwright/test';
