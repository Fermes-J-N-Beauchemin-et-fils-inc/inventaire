import { defineConfig, devices } from '@playwright/test';

const isCheckly = !!process.env.CHECKLY;

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: isCheckly ? 2 : (process.env.CI ? 2 : 0),
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: isCheckly ? 'https://inventaire-production-30e5.up.railway.app' : 'http://localhost:3000',
    trace: isCheckly ? 'on' : 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'checkly',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: isCheckly ? undefined : {
    command: 'npm run build && npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
