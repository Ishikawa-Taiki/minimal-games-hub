import { defineConfig, devices } from '@playwright/test';

const isPrepuch = process.env.PREPUSH === 'true';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: isPrepuch ? 'http://localhost:3000/minimal-games-hub' : 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: isPrepuch ? 'npx serve@latest out' : 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
  },
});
