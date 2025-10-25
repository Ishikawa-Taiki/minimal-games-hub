/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from '@playwright/test';

export const test = base.extend({
  page: async ({ page }, use) => {
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        console.error(`Browser console error: ${msg.text()}`);
      }
    });
    await use(page);
  },
});

export { expect } from '@playwright/test';
