'use strict';

const { test, expect } = require('@playwright/test');
const { expectVisibleProfile, readVisibleProfile, setProfile } = require('../support/p8-profile');

async function importShop(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-go');
}

test('I-11 active-store id persists after reload and switch', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Store A');
  await page.click('#store-create');
  await page.fill('#store-name', 'Store B');
  await page.click('#store-create');
  await page.selectOption('#store-select', { label: 'Store A' });
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('Store A');
  await expect(page.locator('#store-select option')).toHaveCount(3);
});

test('I-12 ledger and per-store owner name/address/UPI/logo/brand remain isolated', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A Customer', phone: '9000000111' }], entries: [{ phone: '9000000111', type: 'credit', amount: 100, date: '2026-10-01' }] });
  const profileA = {
    ownerName: 'Owner A',
    address: '11 Amber Lane',
    upi: 'storea@bank',
    logoName: 'store-a.png',
    logoColor: '#B0006A',
  };
  const visibleA = await setProfile(page, profileA);
  await page.fill('#store-name', 'Store B');
  await page.click('#store-create');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#total-outstanding')).toHaveText('0');
  // P12 Create captures the current text draft but never inherits another Shop's logo.
  await expect(page.locator('#shop-upi')).toHaveValue('storea@bank');
  await expect(page.locator('#shop-logo')).toBeHidden();
  const profileB = {
    ownerName: 'Owner B',
    address: '22 Cobalt Avenue',
    upi: 'storeb@bank',
    logoName: 'store-b.png',
    logoColor: '#0055CC',
  };
  const visibleB = await setProfile(page, profileB);
  expect(visibleA.logo).not.toBe(visibleB.logo);
  expect(visibleA.brand).not.toBe(visibleB.brand);
  expect(visibleA.accent).not.toBe(visibleB.accent);

  await importShop(page, { shop: 'B', customers: [{ name: 'B Customer', phone: '9000000222' }], entries: [{ phone: '9000000222', type: 'credit', amount: 200, date: '2026-10-02' }] });
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
  await expect(page.locator('[data-customer="9000000111"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000111"] [data-balance]')).toHaveText('100');
  await expect(page.locator('[data-customer="9000000222"]')).toHaveCount(0);
  await expect(page.locator('#total-outstanding')).toHaveText('100');

  await page.selectOption('#store-select', { label: 'Store B' });
  await expectVisibleProfile(page, profileB, visibleB);
  await expect(page.locator('[data-customer="9000000222"] [data-balance]')).toHaveText('200');
  await expect(page.locator('[data-customer="9000000111"]')).toHaveCount(0);
  await expect(page.locator('#total-outstanding')).toHaveText('200');

  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('Store B');
  await expectVisibleProfile(page, profileB, visibleB);
  expect(await readVisibleProfile(page)).toEqual(visibleB);
  await page.selectOption('#store-select', { label: 'My Store' });
  await expectVisibleProfile(page, profileA, visibleA);
  expect(await readVisibleProfile(page)).toEqual(visibleA);
});

test('I-13 legacy keys migrate once and idempotently', async ({ page }) => {
  await page.addInitScript(() => {
    if (!localStorage.getItem('__p8_migrated_once')) {
      localStorage.setItem('hisaab.v1', JSON.stringify({
        shop: 'Legacy Shop',
        customers: [{ name: 'Legacy Customer', phone: '9000000121' }],
        entries: [{ id: 'legacy-1', phone: '9000000121', type: 'credit', amountPaise: 12500, date: '2026-10-01', note: 'legacy' }]
      }));
      localStorage.setItem('hisaab.profile.v1', JSON.stringify({ ownerName: 'Legacy Owner', address: 'Legacy Address', upi: '', logo: '' }));
      localStorage.setItem('hisaab.upi.v1', 'legacy@upi');
      localStorage.setItem('__p8_migrated_once', '1');
    }
  });
  await page.goto('/');
  await expect(page.locator('#active-store-name')).toHaveText('Legacy Shop');
  await expect(page.locator('[data-customer="9000000121"]')).toHaveCount(1);
  await expect(page.locator('#owner-display-name')).toHaveText('Legacy Owner');
  await expect(page.locator('#shop-upi')).toHaveValue('legacy@upi');
  const first = await page.evaluate(() => JSON.parse(localStorage.getItem('hisaab.stores.v1')).stores.length);
  await page.reload();
  const second = await page.evaluate(() => JSON.parse(localStorage.getItem('hisaab.stores.v1')).stores.length);
  expect(first).toBe(1);
  expect(second).toBe(1);
});

test('I-14 active import changes only active ledger and preserves route/store state', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', 'Store A');
  await page.click('#store-create');
  await page.fill('#store-name', 'Store B');
  await page.click('#store-create');
  await importShop(page, { shop: 'B Imported Name', customers: [{ name: 'B Customer', phone: '9000000131' }], entries: [{ phone: '9000000131', type: 'credit', amount: 300, date: '2026-10-01' }] });
  await page.goto('/?customer=9000000131&today=2026-11-15');
  await page.selectOption('#store-select', { label: 'Store A' });
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
  await expect(page.locator('[data-customer="9000000131"]')).toHaveCount(0);
  await page.selectOption('#store-select', { label: 'Store B' });
  await expect(page.locator('[data-customer="9000000131"]')).toHaveCount(1);
  await expect(page.locator('#active-store-name')).toHaveText('Store B');
});
