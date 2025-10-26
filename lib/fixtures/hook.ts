/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

export const test = base.extend({
  page: async ({ page }, use, testInfo) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });

    await use(page);

    const testFileName = path.basename(testInfo.file).replace(/\.spec\.ts$/, '');
    const testFileDir = path.join(testInfo.project.outputDir, testFileName);
    fs.mkdirSync(testFileDir, { recursive: true });

    const statusMap: { [key: string]: string } = {
      passed: 'S',
      failed: 'F',
      timedOut: 'T',
      interrupted: 'I',
      skipped: 'K',
    };
    const shortStatus = statusMap[testInfo.status || ''] || 'U';

    const screenshotFileName = `${testInfo.testId}-${shortStatus}.png`;
    const screenshotPath = path.join(testFileDir, screenshotFileName);

    await page.screenshot({ path: screenshotPath });
  },
});

export { expect } from '@playwright/test';
