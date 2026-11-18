'use strict';

const { test, expect } = require('@playwright/test');

async function pasteAdd(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, typeof value === 'string' ? value : JSON.stringify(value));
  await page.click('#import-add-store');
}

test('I-15 pasted JSON adds profile store and activation isolates ledger', async ({ page }) => {
  await page.goto('/?customer=9000000999&today=2026-11-15');
  await pasteAdd(page, {
    shop: 'P9 North',
    customers: [{ name: 'North User', phone: '9000000915' }],
    entries: [{ phone: '9000000915', type: 'credit', amount: 915, date: '2026-10-15' }],
    profile: { ownerName: 'North Owner', address: 'North Road', upi: 'north@bank', logo: '', brand: [1, 2, 3] },
  });
  await expect(page.locator('#active-store-name')).toHaveText('P9 North');
  await expect(page.locator('[data-customer="9000000915"] [data-balance]')).toHaveText('915');
  await expect(page.locator('#owner-display-name')).toHaveText('North Owner');
  await expect(page).toHaveURL(/today=2026-11-15/);
  expect(new URL(page.url()).searchParams.has('customer')).toBe(false);
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('P9 North');
  await expect(page.locator('[data-customer="9000000915"] [data-balance]')).toHaveText('915');
});

test('I-16 malformed JSON profile subfields default independently', async ({ page }) => {
  await page.goto('/');
  await pasteAdd(page, {
    shop: 'Malformed Profile',
    customers: [{ name: 'Safe User', phone: '9000000916' }],
    entries: [{ phone: '9000000916', type: 'credit', amount: 916, date: '2026-10-16' }],
    profile: {
      ownerName: 'Valid Owner',
      address: 99,
      upi: '',
      logo: 'https://example.invalid/logo.png',
      brand: [255, 0, 12.5],
    },
  });
  await expect(page.locator('#active-store-name')).toHaveText('Malformed Profile');
  await expect(page.locator('#owner-display-name')).toHaveText('Valid Owner');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('Valid Owner');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const logoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!logoSrc).toBe(true);
  await expect(page.locator('#import-store-msg')).not.toHaveText('');
  await expect(page.locator('[data-customer="9000000916"] [data-balance]')).toHaveText('916');
});

test('I-17 dedicated add-file and P7 replacement are separate', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#import-add-file')).toHaveCount(1);
  await expect(page.locator('#import-add-file')).toBeHidden();
  await page.setInputFiles('#import-add-file', {
    name: 'add.csv',
    mimeType: 'text/csv',
    buffer: Buffer.from('shop,phone,name,type,amount,date,note\nCSV Store,9000000917,CSV User,credit,917,2026-10-17,ok', 'utf8'),
  });
  await expect(page.locator('.import-store-resolution')).toBeHidden();
  await expect(page.locator('#import-store-name')).toBeHidden();
  await expect(page.locator('#import-store-confirm')).toBeHidden();
  await expect(page.locator('#active-store-name')).toHaveText('CSV Store');
  await expect(page.locator('[data-customer="9000000917"] [data-balance]')).toHaveText('917');

  await page.setInputFiles('#import-file', {
    name: 'replace.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ shop: 'Replacement', customers: [{ name: 'Replacement', phone: '9000000998' }], entries: [{ phone: '9000000998', type: 'credit', amount: 998, date: '2026-10-18' }] }), 'utf8'),
  });
  await expect(page.locator('[data-customer="9000000998"] [data-balance]')).toHaveText('998');
  await expect(page.locator('[data-customer="9000000917"]')).toHaveCount(0);
  await expect(page.locator('#active-store-name')).toHaveText('CSV Store');
});

test('I-18 bootstrap, manual blank profile and storage failure', async ({ page }) => {
  await page.goto('/');
  await pasteAdd(page, {
    shop: 'Bootstrap Store',
    customers: [{ name: 'Bootstrap User', phone: '9000000918' }],
    entries: [{ phone: '9000000918', type: 'credit', amount: 918, date: '2026-10-18' }],
  });
  await expect(page.locator('#active-store-name')).toHaveText('Bootstrap Store');
  await expect(page.locator('[data-customer]')).toHaveCount(1);
  await page.fill('#store-name', 'Manual Store');
  await page.click('#store-create');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const logoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!logoSrc).toBe(true);

  await page.evaluate(() => {
    Storage.prototype.setItem = function () { throw new DOMException('Quota', 'QuotaExceededError'); };
  });
  await pasteAdd(page, { shop: 'Memory Store', customers: [{ name: 'Memory', phone: '9000000997' }], entries: [{ phone: '9000000997', type: 'credit', amount: 997, date: '2026-10-19' }] });
  await expect(page.locator('#import-store-msg')).not.toHaveText('');
  await expect(page.locator('#active-store-name')).toHaveText('Memory Store');
  await expect(page.locator('[data-customer="9000000997"] [data-balance]')).toHaveText('997');
});
