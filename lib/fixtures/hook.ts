/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import * as path from 'path';
import * as crypto from 'crypto';

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });

    await use(page);

    // Keep the test title for readability, but sanitize it.
    const testTitle = testInfo.titlePath[testInfo.titlePath.length - 1];
    const sanitizedTitle = testTitle.replace(/[\s<>:"/\\|?*]/g, '_');

    // Create a short, unique hash from the full test path to ensure uniqueness.
    const fullTestPath = testInfo.titlePath.join(' > ');
    const hash = crypto.createHash('md5').update(fullTestPath).digest('hex').slice(0, 8);

    const uniqueFileName = `${sanitizedTitle}-${hash}-${testInfo.status}.png`;
    const screenshotPath = path.join(testInfo.project.outputDir, uniqueFileName);
    await page.screenshot({ path: screenshotPath });
  },
});

export { expect } from '@playwright/test';
