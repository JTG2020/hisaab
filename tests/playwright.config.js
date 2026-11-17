'use strict';

const path = require('path');
const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.HISAAB_BASE_URL || 'http://localhost:4173';

module.exports = defineConfig({
  testDir: __dirname,
  testMatch: ['smoke/**/*.spec.js', 'e2e/**/*.spec.js', 'nonfunctional/**/*.spec.js', 'fuzz/**/*.spec.js'],
  globalSetup: path.join(__dirname, 'support', 'preflight.js'),
  fullyParallel: true,
  // One worker: the reference server (`python3 -m http.server`) drops concurrent
  // keep-alive sockets, which surfaces as ERR_SOCKET_NOT_CONNECTED console noise.
  // Serial execution keeps N6 (no console errors) measuring the app, not the server.
  workers: 1,
  retries: 0,
  timeout: 30000,
  expect: { timeout: 5000 },
  outputDir: path.join(__dirname, '.artifacts'),
  reporter: [['list']],
  use: {
    baseURL: BASE_URL,
    viewport: { width: 1280, height: 800 },
    colorScheme: 'light',
    locale: 'en-IN',
    timezoneId: 'Asia/Kolkata',
    trace: 'off',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 800 },
      },
    },
  ],
});
