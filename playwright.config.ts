/// <reference types="node" />
import { defineConfig } from '@playwright/test';
const BASE_URL = process.env.BASE_URL || 'https://insiderone.com';

export default defineConfig({
  testDir: './tests',
  timeout: 90000,

  expect: {
    timeout: 10000,
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1,

  reporter: [
  
    ['html', { open: 'never' }],
    ['json', { outputFile: 'reports/playwright-results.json' }],
  ],

  use: {
     baseURL: BASE_URL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
   
  },

  projects: [
    {
      name: 'chromium',
      use: {
        browserName: 'chromium',
        viewport: { width: 1536, height: 900 },
        launchOptions: {
          args: ['--window-size=1536,900'],
        },
      },
    },
  ],
});