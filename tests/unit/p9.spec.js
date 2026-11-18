'use strict';

const { test, expect } = require('@playwright/test');

test('U-16 P9 store-name and profile normalization', async ({ page }) => {
  await page.goto('/');
  await page.fill('#import-box', JSON.stringify({
    shop: '   North   Shop   ',
    customers: [{ name: 'U16', phone: '9000000916' }],
    entries: [{ phone: '9000000916', type: 'credit', amount: 160, date: '2026-10-16' }],
    profile: {
      ownerName: 'Owner',
      address: 'Address',
      upi: 'upi@bank',
      logo: 'data:image/png;base64,AA==',
      brand: [12, 34, 56],
    },
  }));
  await page.click('#import-add-store');
  await expect(page.locator('#active-store-name')).toHaveText('North Shop');
  await expect(page.locator('#owner-display-name')).toHaveText('Owner');
  await expect(page.locator('#owner-display-address')).toHaveText('Address');
  await expect(page.locator('#owner-display-upi')).toHaveText('upi@bank');

  await page.fill('#import-box', JSON.stringify({
    shop: 'Invalid Profile',
    profile: {
      ownerName: 12,
      address: null,
      upi: {},
      logo: 'https://example.invalid/logo.png',
      brand: [1, 2, 256],
    },
  }));
  await page.click('#import-add-store');
  await expect(page.locator('#import-store-msg')).toContainText(/profile|logo|brand|invalid|missing/i);
  await expect(page.locator('#active-store-name')).toHaveText('Invalid Profile');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  const logoSrc = await page.locator('#shop-logo').getAttribute('src').catch(() => null);
  expect(!logoSrc).toBe(true);
});
