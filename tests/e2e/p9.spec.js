'use strict';

const { test, expect } = require('@playwright/test');
const { contrastFor } = require('../support/contrast');

async function addPaste(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, typeof value === 'string' ? value : JSON.stringify(value));
  await page.click('#import-add-store');
}

test('E2E-P9-01 unified workspace and profile controls first paint', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#store-workspace')).toBeVisible();
  await expect(page.locator('#store-manager')).toBeVisible();
  await expect(page.locator('#store-profile-editor')).toBeVisible();
  for (const id of ['store-workspace','store-profile-editor','owner-name','owner-address','shop-upi','logo-input','profile-msg','upi-msg','import-add-store','import-add-file','import-store-name','import-store-confirm','import-store-cancel','import-store-msg','store-manager','store-select','store-name','store-create','store-rename','store-delete','store-confirm-delete','store-cancel-delete','store-msg','active-store-name','import-box','import-go','import-file','import-choose','total-outstanding','shot-input']) {
    await expect(page.locator('#' + id), '#' + id).toHaveCount(1);
  }
  await expect(page.locator('#profile-save')).toHaveCount(0);
  await expect(page.locator('#profile-brand-input')).toHaveCount(0);
});

test('E2E-P9-02 pasted JSON profile separate add activation and reload', async ({ page }) => {
  await page.goto('/?customer=9000000808&today=2026-11-15');
  await addPaste(page, {
    shop: 'P9 North',
    customers: [{ name: 'North Person', phone: '9000000902' }],
    entries: [{ phone: '9000000902', type: 'credit', amount: 902, date: '2026-10-02' }],
    profile: { ownerName: 'North Owner', address: 'North Address', upi: 'north@bank', logo: '', brand: [10, 20, 30] },
  });
  await expect(page.locator('#active-store-name')).toHaveText('P9 North');
  await expect(page.locator('[data-customer="9000000902"] [data-balance]')).toHaveText('902');
  await expect(page.locator('#owner-display-name')).toHaveText('North Owner');
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('P9 North');
  await expect(page.locator('#owner-display-address')).toHaveText('North Address');
});

test('E2E-P9-03 old JSON blank profile and missing/collision confirmation', async ({ page }) => {
  await page.goto('/');
  await addPaste(page, { shop: '', customers: [{ name: 'Old User', phone: '9000000903' }], entries: [{ phone: '9000000903', type: 'credit', amount: 903, date: '2026-10-03' }] });
  await expect(page.locator('.import-store-resolution')).toBeVisible();
  await expect(page.locator('#import-store-msg')).toContainText(/missing|name/i);
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await page.click('#import-store-cancel');
  await expect(page.locator('.import-store-resolution')).toBeHidden();
  await expect(page.locator('[data-customer]')).toHaveCount(0);

  await page.locator('#import-box').evaluate((node) => { node.value = JSON.stringify({ shop: 'My Store', customers: [{ name: 'Existing', phone: '9000000899' }], entries: [{ phone: '9000000899', type: 'credit', amount: 899, date: '2026-10-01' }] }); });
  await page.click('#import-go');
  await addPaste(page, { shop: 'My Store', customers: [{ name: 'Collision', phone: '9000000904' }], entries: [{ phone: '9000000904', type: 'credit', amount: 904, date: '2026-10-04' }] });
  await expect(page.locator('.import-store-resolution')).toBeVisible();
  await expect(page.locator('#import-store-msg')).toContainText(/collide|duplicate/i);
  await page.fill('#import-store-name', 'Old Store');
  await page.click('#import-store-confirm');
  await expect(page.locator('#active-store-name')).toHaveText('Old Store');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const logoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!logoSrc).toBe(true);
});

test('E2E-P9-04 dedicated JSON/CSV add-file immediate validation', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('#import-add-file', {
    name: 'profile.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ shop: 'Added JSON', customers: [{ name: 'JSON User', phone: '9000000904' }], entries: [{ phone: '9000000904', type: 'credit', amount: 904, date: '2026-10-04' }], profile: { ownerName: 'JSON Owner', address: 'JSON Road', upi: 'json@bank', logo: '', brand: null } }), 'utf8'),
  });
  await expect(page.locator('.import-store-resolution')).toBeHidden();
  await expect(page.locator('#active-store-name')).toHaveText('Added JSON');
  await expect(page.locator('#owner-display-name')).toHaveText('JSON Owner');
  await page.setInputFiles('#import-add-file', {
    name: 'data.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('shop,phone,name,type,amount,date,note\nCSV Store,9000000905,CSV User,credit,905,2026-10-05,ok', 'utf8'),
  });
  await expect(page.locator('.import-store-resolution')).toBeHidden();
  await expect(page.locator('#active-store-name')).toHaveText('CSV Store');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const csvLogoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!csvLogoSrc).toBe(true);
  await expect(page.locator('[data-customer="9000000905"] [data-balance]')).toHaveText('905');
});

test('E2E-P9-05 P7/Paste immediate replacement remains ledger-only', async ({ page }) => {
  await page.goto('/');
  await page.setInputFiles('#import-file', {
    name: 'sample.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ shop: 'Replacement One', customers: [{ name: 'One', phone: '9000000906' }], entries: [{ phone: '9000000906', type: 'credit', amount: 906, date: '2026-10-06' }] }), 'utf8'),
  });
  await expect(page.locator('[data-customer="9000000906"] [data-balance]')).toHaveText('906');
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
  await page.locator('#import-box').evaluate((node) => {
    node.value = JSON.stringify({ shop: 'Should Not Create', customers: [{ name: 'Paste User', phone: '9000000907' }], entries: [{ phone: '9000000907', type: 'credit', amount: 907, date: '2026-10-07' }] });
  });
  await page.click('#import-go');
  await expect(page.locator('[data-customer="9000000907"] [data-balance]')).toHaveText('907');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
});

test('E2E-P9-06 missing/collision cancel and confirm never overwrite', async ({ page }) => {
  await page.goto('/');
  await page.locator('#import-box').evaluate((node) => { node.value = JSON.stringify({ shop: 'Ignored', customers: [{ name: 'Existing', phone: '9000000899' }], entries: [{ phone: '9000000899', type: 'credit', amount: 899, date: '2026-10-01' }] }); });
  await page.click('#import-go');
  await expect(page.locator('[data-customer="9000000899"] [data-balance]')).toHaveText('899');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  const originalUrl = page.url();
  await addPaste(page, { shop: '', customers: [{ name: 'Missing', phone: '9000000897' }], entries: [{ phone: '9000000897', type: 'credit', amount: 897, date: '2026-10-02' }] });
  await expect(page.locator('.import-store-resolution')).toBeVisible();
  await page.click('#import-store-cancel');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await expect(page.locator('[data-customer]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000899"] [data-balance]')).toHaveText('899');
  expect(page.url()).toBe(originalUrl);
  await addPaste(page, { shop: 'My Store', customers: [{ name: 'Collision', phone: '9000000908' }], entries: [{ phone: '9000000908', type: 'credit', amount: 908, date: '2026-10-08' }] });
  await expect(page.locator('.import-store-resolution')).toBeVisible();
  await page.click('#import-store-cancel');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await expect(page.locator('[data-customer]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000899"] [data-balance]')).toHaveText('899');
  await expect(page.locator('[data-customer="9000000908"]')).toHaveCount(0);
  expect(page.url()).toBe(originalUrl);
  await addPaste(page, { shop: 'My Store', customers: [{ name: 'Collision', phone: '9000000908' }], entries: [{ phone: '9000000908', type: 'credit', amount: 908, date: '2026-10-08' }] });
  await page.fill('#import-store-name', 'Safe Store');
  await page.click('#import-store-confirm');
  await expect(page.locator('#active-store-name')).toHaveText('Safe Store');
  await expect(page.locator('[data-customer="9000000908"] [data-balance]')).toHaveText('908');
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000000899"] [data-balance]')).toHaveText('899');
  await expect(page.locator('[data-customer="9000000908"]')).toHaveCount(0);
});

test('E2E-P9-07 pristine bootstrap versus populated store and manual blank', async ({ page }) => {
  await page.goto('/');
  await addPaste(page, { shop: 'Bootstrap', customers: [{ name: 'One', phone: '9000000909' }], entries: [{ phone: '9000000909', type: 'credit', amount: 909, date: '2026-10-09' }] });
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await expect(page.locator('#active-store-name')).toHaveText('Bootstrap');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const bootstrapLogoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!bootstrapLogoSrc).toBe(true);
  await page.fill('#store-name', 'Manual');
  await page.click('#store-create');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const manualLogoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!manualLogoSrc).toBe(true);
  await addPaste(page, { shop: 'Second', customers: [{ name: 'Two', phone: '9000000910' }], entries: [{ phone: '9000000910', type: 'credit', amount: 910, date: '2026-10-10' }] });
  await expect(page.locator('#active-store-name')).toHaveText('Second');
  await expect(page.locator('[data-customer="9000000910"] [data-balance]')).toHaveText('910');
  await expect(page.locator('#store-select option')).toHaveCount(3);
});

test('E2E-P9-08 activation route cleanup today preservation and reload', async ({ page }) => {
  await page.goto('/?customer=9000000911&today=2026-11-15');
  await addPaste(page, { shop: 'Route Store', customers: [{ name: 'Route User', phone: '9000000911' }], entries: [{ phone: '9000000911', type: 'credit', amount: 911, date: '2026-10-11' }] });
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
  await expect(page.locator('#active-store-name')).toHaveText('Route Store');
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('Route Store');
  await expect(page.locator('[data-customer="9000000911"] [data-balance]')).toHaveText('911');
});

test('E2E-P9-09 storage failure stays in memory', async ({ page }) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); };
  });
  await page.goto('/');
  await page.fill('#store-name', 'Memory');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).not.toHaveText('');
  await addPaste(page, { shop: 'Memory Import', customers: [{ name: 'Memory User', phone: '9000000912' }], entries: [{ phone: '9000000912', type: 'credit', amount: 912, date: '2026-10-12' }] });
  await expect(page.locator('#import-store-msg')).not.toHaveText('');
  await expect(page.locator('#active-store-name')).toHaveText('Memory Import');
  await expect(page.locator('[data-customer="9000000912"] [data-balance]')).toHaveText('912');
});

test('E2E-P9-10 375 px dark and P0-P8 contract baseline', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.goto('/');
  for (const id of ['store-workspace','store-profile-editor','owner-name','owner-address','shop-upi','logo-input','import-add-store','import-box','import-go','total-outstanding','shot-input']) {
    await expect(page.locator('#' + id), '#' + id).toBeVisible();
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  const samples = await page.evaluate(contrastFor, ['#active-store-name','#store-select','#store-name','#store-create','#store-rename','#store-delete','#import-add-store','#import-go']);
  expect(samples.every((sample) => sample.found && sample.ratio >= 4.5), JSON.stringify(samples)).toBe(true);
  await addPaste(page, { shop: 'Mobile Store', customers: [{ name: 'Mobile User', phone: '9000000913' }], entries: [{ phone: '9000000913', type: 'credit', amount: 913, date: '2026-10-13' }] });
  await expect(page.locator('[data-customer="9000000913"] [data-balance]')).toHaveText('913');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
