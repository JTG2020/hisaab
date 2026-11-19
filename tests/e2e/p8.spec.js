'use strict';

const { test, expect } = require('@playwright/test');
const { contrastFor } = require('../support/contrast');
const { expectVisibleProfile, readVisibleProfile, setProfile } = require('../support/p8-profile');

async function importShop(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-go');
}

async function readPortfolio(page) {
  return page.evaluate(() => JSON.parse(localStorage.getItem('hisaab.stores.v1')));
}

test('C-40 P8 manager and contract selectors are visible at first paint', async ({ page }) => {
  await page.goto('/');
  for (const id of ['store-manager','store-select','store-name','store-create','store-rename','store-delete','store-confirm-delete','store-cancel-delete','store-msg','active-store-name','total-outstanding','import-box','import-go','shot-input']) {
    await expect(page.locator('#' + id), '#' + id).toBeAttached();
  }
  await expect(page.locator('#store-manager')).toBeVisible();
  await expect(page.locator('#store-confirm-delete')).toBeHidden();
  await expect(page.locator('#store-cancel-delete')).toBeHidden();
});

test('C-41 create and switch store semantics', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Alpha');
  await page.click('#store-create');
  await expect(page.locator('#active-store-name')).toHaveText('Alpha');
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
});

test('C-42 D19 rename rejects blank, overlength and duplicate names', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Alpha');
  await page.click('#store-create');
  await page.fill('#store-name', 'Beta');
  await page.click('#store-create');
  for (const [name, reason] of [['   ', 'Enter a shop name.'], ['A'.repeat(61), 'Shop name must be 60 characters or fewer.'], ['alpha', 'A shop with this name already exists.']]) {
    await page.fill('#store-name', name);
    await page.click('#store-rename');
    await expect(page.locator('#store-msg')).toHaveText(reason);
  }
});

test('C-43 deletion cancellation and confirmation', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Delete Me');
  await page.click('#store-create');
  await page.click('#store-delete');
  await expect(page.locator('#store-confirm-delete')).toBeVisible();
  await page.click('#store-cancel-delete');
  await expect(page.locator('#store-confirm-delete')).toBeHidden();
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.click('#store-delete');
  await page.click('#store-confirm-delete');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
});

test('C-44 last store cannot be deleted', async ({ page }) => {
  await page.goto('/');
  await page.click('#store-delete');
  await expect(page.locator('#store-msg')).toHaveText('The last shop cannot be deleted.');
  await page.click('#store-confirm-delete');
  await expect(page.locator('#store-msg')).toHaveText('The last shop cannot be deleted.');
  await expect(page.locator('#store-select option')).toHaveCount(1);
});

test('C-45 active id, ledger, profile and UPI persist per store', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000000101' }], entries: [{ phone: '9000000101', type: 'credit', amount: 125, date: '2026-10-01' }] });
  const profileA = {
    ownerName: 'A Owner',
    address: '10 Amber Road',
    upi: 'a@upi',
    logoName: 'a-logo.png',
    logoColor: '#B0006A',
  };
  const visibleA = await setProfile(page, profileA);
  await page.fill('#store-name', 'B');
  await page.click('#store-create');
  const profileB = {
    ownerName: 'B Owner',
    address: '20 Cobalt Street',
    upi: 'b@upi',
    logoName: 'b-logo.png',
    logoColor: '#0055CC',
  };
  const visibleB = await setProfile(page, profileB);
  await importShop(page, { shop: 'B', customers: [{ name: 'B User', phone: '9000000202' }], entries: [{ phone: '9000000202', type: 'credit', amount: 250, date: '2026-10-02' }] });
  expect(visibleA.logo).not.toBe(visibleB.logo);
  expect(visibleA.brand).not.toBe(visibleB.brand);
  expect(visibleA.accent).not.toBe(visibleB.accent);
  await expect(page.locator('#total-outstanding')).toHaveText('250');
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('B');
  await expectVisibleProfile(page, profileB, visibleB);
  expect(await readVisibleProfile(page)).toEqual(visibleB);
  await expect(page.locator('[data-customer="9000000202"] [data-balance]')).toHaveText('250');
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
  expect(await readVisibleProfile(page)).toEqual(visibleA);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000000101"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000101"] [data-balance]')).toHaveText('125');
  await expect(page.locator('[data-customer="9000000202"]')).toHaveCount(0);
  await page.selectOption('#store-select', { label: 'B' });
  await expectVisibleProfile(page, profileB, visibleB);
  await expect(page.locator('[data-customer="9000000202"] [data-balance]')).toHaveText('250');
  await expect(page.locator('[data-customer="9000000101"]')).toHaveCount(0);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
});

test('C-46 active import changes only active ledger', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000000101' }], entries: [{ phone: '9000000101', type: 'credit', amount: 100, date: '2026-10-01' }] });
  await page.fill('#store-name', 'B');
  await page.click('#store-create');
  const before = await readPortfolio(page);
  await importShop(page, { shop: 'Imported B', customers: [{ name: 'B User', phone: '9000000202' }], entries: [{ phone: '9000000202', type: 'credit', amount: '250.50', date: '2026-10-02' }] });
  const after = await readPortfolio(page);
  expect(after.stores).toHaveLength(2);
  expect(after.stores.find((store) => store.name === 'My Store').ledger.customers[0].phone).toBe('9000000101');
  expect(after.stores.find((store) => store.name === 'B').ledger.customers[0].phone).toBe('9000000202');
  expect(after.stores.find((store) => store.name === 'B').name).toBe('B');
  expect(before.stores.map((store) => store.id)).toEqual(after.stores.map((store) => store.id));
  await expect(page.locator('#total-outstanding')).toHaveText('250.50');
});

test('C-47 legacy migration is one-time and profile UPI fallback is exact', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('__legacy_seeded')) {
      localStorage.setItem('hisaab.v1', JSON.stringify({ shop: 'Legacy Store', customers: [{ name: 'Legacy User', phone: '9000000303' }], entries: [{ phone: '9000000303', type: 'credit', amountPaise: 30000, date: '2026-10-01' }] }));
      localStorage.setItem('hisaab.profile.v1', JSON.stringify({ ownerName: 'Legacy Owner', address: 'Legacy Address', upi: '' }));
      localStorage.setItem('hisaab.upi.v1', 'fallback@upi');
      localStorage.setItem('__legacy_seeded', '1');
    }
  });
  await page.goto('/');
  await expect(page.locator('#active-store-name')).toHaveText('Legacy Store');
  await expect(page.locator('[data-customer="9000000303"]')).toHaveCount(1);
  await expect(page.locator('#owner-display-name')).toHaveText('Legacy Owner');
  await expect(page.locator('#shop-upi')).toHaveValue('fallback@upi');
  await page.reload();
  const portfolio = await readPortfolio(page);
  expect(portfolio.stores).toHaveLength(1);
});

test('C-48 storage failure stays in memory and customer switch preserves today', async ({ page }) => {
  await page.addInitScript(() => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function () {
      throw new DOMException('Quota', 'QuotaExceededError');
    };
    window.__restoreStoreWrite = () => { Storage.prototype.setItem = original; };
  });
  await page.goto('/?customer=9000000999&today=2026-11-15');
  await page.fill('#store-name', 'Memory Store');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).not.toHaveText('');
  await expect(page.locator('#active-store-name')).toHaveText('Memory Store');
  await expect(page.locator('#total-outstanding')).toBeAttached();
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
});

test('E2E-P8-01 first paint and create/switch', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#store-manager')).toBeVisible();
  await page.fill('#store-name', 'North');
  await page.click('#store-create');
  await expect(page.locator('#active-store-name')).toHaveText('North');
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
});

test('E2E-P8-02 rename validation and normalized names', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', '  North   Store  ');
  await page.click('#store-create');
  await expect(page.locator('#active-store-name')).toHaveText('North Store');
  await page.fill('#store-name', 'Beta');
  await page.click('#store-create');
  await page.fill('#store-name', 'north store');
  await page.click('#store-rename');
  await expect(page.locator('#store-msg')).toHaveText('A shop with this name already exists.');
  await page.fill('#store-name', 'South Store');
  await page.click('#store-rename');
  await expect(page.locator('#active-store-name')).toHaveText('South Store');
});

test('E2E-P8-03 deletion cancel confirm and last-store protection', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Temporary');
  await page.click('#store-create');
  await page.click('#store-delete');
  await page.click('#store-cancel-delete');
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.click('#store-delete');
  await page.click('#store-confirm-delete');
  await expect(page.locator('#store-select option')).toHaveCount(1);
  await page.click('#store-delete');
  await expect(page.locator('#store-msg')).toHaveText('The last shop cannot be deleted.');
});

test('E2E-P8-04 active reload and full per-store ledger/profile/logo/brand isolation', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000000404' }], entries: [{ phone: '9000000404', type: 'credit', amount: 404, date: '2026-10-01' }] });
  const profileA = {
    ownerName: 'North Owner',
    address: '4 North Market',
    upi: 'north@bank',
    logoName: 'north.png',
    logoColor: '#B0006A',
  };
  const visibleA = await setProfile(page, profileA);
  await page.fill('#store-name', 'B');
  await page.click('#store-create');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  const profileB = {
    ownerName: 'South Owner',
    address: '8 South Bazaar',
    upi: 'south@bank',
    logoName: 'south.png',
    logoColor: '#0055CC',
  };
  const visibleB = await setProfile(page, profileB);
  await importShop(page, { shop: 'B', customers: [{ name: 'B User', phone: '9000000444' }], entries: [{ phone: '9000000444', type: 'credit', amount: 444, date: '2026-10-02' }] });
  expect(visibleA.logo).not.toBe(visibleB.logo);
  expect(visibleA.brand).not.toBe(visibleB.brand);
  expect(visibleA.accent).not.toBe(visibleB.accent);
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('B');
  await expectVisibleProfile(page, profileB, visibleB);
  expect(await readVisibleProfile(page)).toEqual(visibleB);
  await expect(page.locator('[data-customer="9000000444"] [data-balance]')).toHaveText('444');
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
  expect(await readVisibleProfile(page)).toEqual(visibleA);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000000404"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000404"] [data-balance]')).toHaveText('404');
  await expect(page.locator('[data-customer="9000000444"]')).toHaveCount(0);
  await page.selectOption('#store-select', { label: 'B' });
  await expectVisibleProfile(page, profileB, visibleB);
  await expect(page.locator('[data-customer="9000000444"] [data-balance]')).toHaveText('444');
  await expect(page.locator('[data-customer="9000000404"]')).toHaveCount(0);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
});

test('E2E-P8-05 import only active ledger and preserves portfolio/profile', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A', phone: '9000000505' }], entries: [{ phone: '9000000505', type: 'credit', amount: 505, date: '2026-10-01' }] });
  await page.fill('#store-name', 'B');
  await page.click('#store-create');
  await page.fill('#shop-upi', 'b@upi');
  await page.click('#store-rename');
  await importShop(page, { shop: 'Should Not Rename B', customers: [{ name: 'B', phone: '9000000606' }], entries: [{ phone: '9000000606', type: 'credit', amount: 606, date: '2026-10-02' }] });
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('B');
  await expect(page.locator('[data-customer="9000000606"]')).toHaveCount(1);
  await expect(page.locator('#shop-upi')).toHaveValue('b@upi');
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000000505"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000606"]')).toHaveCount(0);
});

test('E2E-P8-06 legacy migration and same-phone independence', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('hisaab.v1', JSON.stringify({ shop: 'Legacy', customers: [{ name: 'Same Phone Legacy', phone: '9000000707' }], entries: [{ phone: '9000000707', type: 'credit', amountPaise: 70700, date: '2026-10-01' }] }));
    localStorage.setItem('hisaab.profile.v1', JSON.stringify({ ownerName: 'Owner', address: 'Address', upi: '', logo: '' }));
  });
  await page.goto('/');
  await expect(page.locator('#active-store-name')).toHaveText('Legacy');
  await page.fill('#store-name', 'Other');
  await page.click('#store-create');
  await importShop(page, { shop: 'Other Ledger', customers: [{ name: 'Same Phone Other', phone: '9000000707' }], entries: [{ phone: '9000000707', type: 'credit', amount: 70, date: '2026-10-02' }] });
  await expect(page.locator('[data-balance]', { hasText: '70' })).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000707"] [data-balance]')).toHaveText('70');
  await expect(page.locator('[data-customer="9000000707"] [data-balance]')).toHaveAttribute('data-balance', '70');
  await page.selectOption('#store-select', { label: 'Legacy' });
  await expect(page.locator('[data-balance]', { hasText: '707' })).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000707"] [data-balance]')).toHaveText('707');
  await expect(page.locator('[data-customer="9000000707"] [data-balance]')).toHaveAttribute('data-balance', '707');
});

test('E2E-P8-07 customer route switch clears customer but preserves today', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000000808' }], entries: [{ phone: '9000000808', type: 'credit', amount: 808, date: '2026-10-01' }] });
  await page.goto('/?customer=9000000808&today=2026-11-15');
  await page.fill('#store-name', 'B');
  await page.click('#store-create');
  await expect(page.locator('#cust-name')).toHaveText('Select a customer');
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
  await expect(page.locator('[data-customer="9000000808"]')).toHaveCount(0);
});

test('E2E-P8-08 storage failure, 375 px and contract regressions', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.addInitScript(() => {
    Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); };
  });
  await page.goto('/');
  await page.fill('#store-name', 'Memory');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).not.toHaveText('');
  await expect(page.locator('#active-store-name')).toHaveText('Memory');
  await expect(page.locator('#store-manager')).toBeVisible();
  for (const selector of ['#store-select', '#store-name', '#store-create', '#store-rename', '#store-delete', '#store-msg', '#active-store-name']) {
    await expect(page.locator(selector), selector + ' remains visible at 375px in dark mode').toBeVisible();
  }
  await expect(page.locator('#store-select')).toHaveJSProperty('tagName', 'SELECT');
  await expect(page.locator('#store-name')).toHaveJSProperty('tagName', 'INPUT');
  await expect(page.locator('#total-outstanding')).toHaveText('0');
  await expect(page.locator('#import-box')).toBeVisible();
  await expect(page.locator('#import-go')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  const managerText = await page.evaluate(contrastFor, [
    '#active-store-name',
    '#store-select',
    '#store-name',
    '#store-create',
    '#store-rename',
    '#store-delete',
    '#store-msg',
  ]);
  expect(managerText.every((sample) => sample.found && sample.ratio >= 4.5), JSON.stringify(managerText)).toBe(true);
  const managerBounds = await page.locator('#store-manager').evaluate((manager) => {
    const rect = manager.getBoundingClientRect();
    return {
      left: rect.left,
      right: rect.right,
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
    };
  });
  expect(managerBounds.left).toBeGreaterThanOrEqual(0);
  expect(managerBounds.right).toBeLessThanOrEqual(375);
  expect(managerBounds.scrollWidth).toBeLessThanOrEqual(375);
});
