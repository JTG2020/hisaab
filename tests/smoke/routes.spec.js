'use strict';

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

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

test('C-17 ?customer=unknown renders the not-found view and keeps every list node', async ({ page }) => {
  const { response, diagnostics } = await open(page, '/?customer=9000000101');

  expect(response.status()).toBe(200);

  await expect(page.locator('#cust-name')).toHaveText('Customer not found');

  const balance = page.locator('#cust-balance');
  await expect(balance).toHaveCount(1);
  expect((await balance.textContent()).trim()).toBe('0');
  expect(await balance.getAttribute('data-balance')).toBe('0');

  const entries = page.locator('#entries');
  await expect(entries).toHaveCount(1);
  expect(await entries.evaluate((element) => element.children.length)).toBe(0);
  expect((await entries.textContent()).trim()).toBe('');

  for (const id of ['total-outstanding', 'import-box', 'import-go', 'shot-input', 'customers']) {
    await expect(page.locator('#' + id), '#' + id + ' must remain in the DOM').toHaveCount(1);
  }
  await expect(page.locator('#total-outstanding')).toHaveText('0');
  expect(page.url()).toContain('customer=9000000101');

  await expectClean(diagnostics, expect);
});

test('C-18 ?today=2026-11-15 loads cleanly with the full empty-state contract', async ({ page }) => {
  const { response, diagnostics } = await open(page, '/?today=2026-11-15');

  expect(response.status()).toBe(200);
  for (const id of ALWAYS_RENDERED) {
    await expect(page.locator('#' + id)).toHaveCount(1);
  }
  await expect(page.locator('#total-outstanding')).toHaveText('0');

  await expectClean(diagnostics, expect);
});

test('C-19 invalid ?today values load cleanly and do not crash', async ({ page }) => {
  for (const route of ['/?today=not-a-date', '/?today=']) {
    const { response, diagnostics } = await open(page, route);
    expect(response.status(), route).toBe(200);
    for (const id of ALWAYS_RENDERED) {
      await expect(page.locator('#' + id), route + ' -> #' + id).toHaveCount(1);
    }
    await expect(page.locator('#total-outstanding')).toHaveText('0');
    await expectClean(diagnostics, expect);
  }
});
