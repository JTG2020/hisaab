'use strict';

const { test, expect } = require('@playwright/test');

test('U-15 D19 store-name normalization and uniqueness', async ({ page }) => {
  await page.goto('/');
  await page.fill('#store-name', '   North   Shop   ');
  await page.click('#store-create');
  await expect(page.locator('#active-store-name')).toHaveText('North Shop');

  await page.fill('#store-name', 'north   shop');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText('A shop with this name already exists.');
  await expect(page.locator('#store-select option')).toHaveCount(2);

  await page.fill('#store-name', '   ');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText('Enter a shop name.');

  await page.fill('#store-name', 'A'.repeat(61));
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText('Shop name must be 60 characters or fewer.');
  await expect(page.locator('#store-select option')).toHaveCount(2);
});
