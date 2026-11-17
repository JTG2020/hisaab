'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

const APP_DIR = path.resolve(__dirname, '..', '..', 'app');

const ALWAYS_RENDERED = [
  'total-outstanding',
  'new-name',
  'new-phone',
  'add-customer',
  'entry-form',
  'entry-type',
  'entry-amount',
  'entry-date',
  'entry-note',
  'entry-save',
  'shot-input',
  'import-box',
  'import-go',
  'import-msg',
  'search',
  'export-csv',
  'lang-switch',
  'overdue',
  'customers',
];

const DATA_DEPENDENT = [
  '[data-customer]',
  '[data-customer="9000000101"]',
  'a[data-remind]',
  'img[data-shot]',
  '[data-entry-id]',
  '[data-amount]',
  '[data-days]',
  '[data-overdue]',
  '[data-overdue="9000000101"]',
  'a[href^="upi://pay?pa="]',
];

function readTextFiles(directory) {
  const collected = [];
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      collected.push(...readTextFiles(full));
    } else if (/\.(html|css|js|mjs|json|webmanifest)$/.test(entry.name)) {
      collected.push({ file: full, text: fs.readFileSync(full, 'utf8') });
    }
  }
  return collected;
}

test('C-23 Vercel shape: app/index.html, relative assets, no build step, no service worker', async ({ page, request }) => {
  for (const file of ['index.html', 'styles.css', 'app.js']) {
    expect(fs.existsSync(path.join(APP_DIR, file)), 'app/' + file + ' must exist').toBe(true);
  }

  const html = fs.readFileSync(path.join(APP_DIR, 'index.html'), 'utf8');

  const references = Array.from(html.matchAll(/\b(?:src|href)\s*=\s*["']([^"']*)["']/gi)).map((match) => match[1]);
  expect(references.length).toBeGreaterThan(0);
  const offending = references.filter((value) => {
    if (value === '' || value.startsWith('#') || value.startsWith('data:')) return false;
    if (value.startsWith('./') || value.startsWith('../')) return false;
    return true;
  });
  expect(offending, 'only relative asset paths are allowed').toEqual([]);

  const allowedEntries = new Set(['index.html', 'styles.css', 'app.js', 'assets', 'vercel.json']);
  const entries = fs
    .readdirSync(APP_DIR, { withFileTypes: true })
    .map((entry) => entry.name)
    .filter((name) => !name.startsWith('.'));
  const unexpected = entries.filter((name) => !allowedEntries.has(name));
  expect(unexpected, 'app/ must not contain build output or tooling').toEqual([]);

  expect(entries.includes('package.json'), 'no package.json inside the deployable unit').toBe(false);
  expect(entries.includes('node_modules'), 'no node_modules inside the deployable unit').toBe(false);

  const root = await request.get('/');
  expect(root.status()).toBe(200);
  expect((await root.text()).toLowerCase()).toContain('<!doctype html');
  const direct = await request.get('/index.html');
  expect(direct.status()).toBe(200);

  await open(page, '/');
});

test('N-05 no service worker, cookie gate, password field, analytics, or third-party origin', async ({ page }) => {
  const sources = readTextFiles(APP_DIR);
  expect(sources.length).toBeGreaterThanOrEqual(3);

  const forbidden = [
    { name: 'service worker registration', pattern: /serviceWorker/i },
    { name: 'cookie access gate', pattern: /document\s*\.\s*cookie/ },
    { name: 'analytics beacon', pattern: /googletagmanager|google-analytics|\bgtag\s*\(|\bsentry\b|plausible\.io/i },
    { name: 'absolute http(s) asset', pattern: /(?:src|href)\s*=\s*["']https?:\/\//i },
    { name: 'password field', pattern: /type\s*=\s*["']password["']/i },
  ];

  for (const rule of forbidden) {
    for (const source of sources) {
      const match = rule.pattern.exec(source.text);
      expect(match, rule.name + ' found in ' + path.relative(APP_DIR, source.file)).toBeNull();
    }
  }

  const { diagnostics } = await open(page, '/');
  const cookies = await page.context().cookies();
  expect(cookies, 'no cookie may be required to load the app').toEqual([]);
  await expect(page.locator('#total-outstanding')).toBeVisible();
  await expectClean(diagnostics, expect);
});

test('E2E-P0-01 first paint: 19 §2 nodes resolve, data selectors are empty, customer view resolves', async ({ page }) => {
  const home = await open(page, '/');
  expect(home.response.status()).toBe(200);

  for (const id of ALWAYS_RENDERED) {
    await expect(page.locator('#' + id), '#' + id + ' must resolve to one node').toHaveCount(1);
    await expect(page.locator('#' + id), '#' + id + ' must be visible at first paint').toBeVisible();
  }

  for (const selector of DATA_DEPENDENT) {
    await expect(page.locator(selector), selector + ' must have zero matches at empty state').toHaveCount(0);
  }
  await expect(page.locator('#total-outstanding')).toHaveText('0');
  await expectClean(home.diagnostics, expect);

  await page.goto('about:blank');
  const view = await open(page, '/?customer=9000000101');
  expect(view.response.status()).toBe(200);

  for (const id of ['cust-name', 'cust-balance', 'entries']) {
    await expect(page.locator('#' + id), '#' + id + ' must resolve on ?customer=').toHaveCount(1);
  }
  await expect(page.locator('#cust-name')).toHaveText('Customer not found');
  await expect(page.locator('#cust-balance')).toHaveText('0');
  await expectClean(view.diagnostics, expect);
});

test('E2E-P0-02 all query-string routes render the same first paint', async ({ page }) => {
  const routes = [
    '/',
    '/?customer=9000000101',
    '/?today=2026-11-15',
    '/?customer=9000000101&today=2026-11-15',
    '/?today=not-a-date',
  ];

  for (const route of routes) {
    await page.goto('about:blank');
    const { response, diagnostics } = await open(page, route);
    expect(response.status(), route).toBe(200);

    for (const id of ALWAYS_RENDERED) {
      await expect(page.locator('#' + id), route + ' -> #' + id).toHaveCount(1);
    }
    await expect(page.locator('#total-outstanding'), route + ' -> total').toHaveText('0');

    if (route.includes('customer=')) {
      await expect(page.locator('#cust-name'), route + ' -> #cust-name').toHaveText('Customer not found');
      await expect(page.locator('#cust-balance'), route + ' -> #cust-balance').toHaveText('0');
    }

    await expectClean(diagnostics, expect);
  }
});

test('E2E-P0-03 phone + theme baseline and offline-safe load', async ({ page, baseURL }) => {
  const origin = new URL(baseURL).origin;

  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'light' });
  const light = await open(page, '/');
  expect((await page.evaluate(() => document.documentElement.scrollWidth))).toBeLessThanOrEqual(375);
  await expectClean(light.diagnostics, expect);

  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('about:blank');
  const dark = await open(page, '/');
  expect((await page.evaluate(() => document.documentElement.scrollWidth))).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme)).toContain('dark');
  await expect(page.locator('#total-outstanding')).toBeVisible();
  await expectClean(dark.diagnostics, expect);

  const external = dark.diagnostics.requests.filter((raw) => {
    let url;
    try {
      url = new URL(raw);
    } catch (error) {
      return true;
    }
    return !(url.protocol === 'data:' || url.protocol === 'blob:' || url.origin === origin);
  });
  expect(external, 'no third-party request at 375 px / dark').toEqual([]);
});
