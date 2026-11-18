'use strict';

const { test, expect } = require('@playwright/test');
const { contrastFor } = require('../support/contrast');
const fs = require('fs');
const path = require('path');

async function activePair(page) {
  return page.evaluate(() => {
    const machine = document.querySelector('#active-store-name');
    const line = document.querySelector('.active-shop-display');
    return {
      machineText: machine ? (machine.textContent || '').trim() : null,
      lineText: line ? (line.textContent || '').trim() : null,
      machineCount: document.querySelectorAll('#active-store-name').length,
      lineCount: document.querySelectorAll('.active-shop-display').length,
      lineId: line ? line.id : '',
      lineData: line ? Array.from(line.attributes).filter((attribute) => attribute.name === 'id' || attribute.name.startsWith('data-')).map((attribute) => attribute.name) : [],
      machineInManager: !!(machine && machine.closest('#store-manager')),
    };
  });
}

async function replacement(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-go');
}

test('C-60 P11 active portfolio name source, ordinary line and existing fallbacks', async ({ page }) => {
  await page.goto('/');
  let pair = await activePair(page);
  expect(pair).toEqual({ machineText: 'My Store', lineText: 'My Store', machineCount: 1, lineCount: 1, lineId: '', lineData: [], machineInManager: true });

  await page.fill('#store-name', 'Manual Alpha');
  await page.click('#store-create');
  pair = await activePair(page);
  expect(pair.lineText).toBe('Manual Alpha');
  expect(pair.lineText).toBe(pair.machineText);

  await page.fill('#store-name', 'दुकान फ़ीड');
  await page.click('#store-rename');
  pair = await activePair(page);
  expect(pair.lineText).toBe('दुकान फ़ीड');
  expect(pair.lineText).toBe(pair.machineText);

  await page.selectOption('#store-select', { label: 'My Store' });
  pair = await activePair(page);
  expect(pair.lineText).toBe('My Store');
  await page.selectOption('#store-select', { label: 'दुकान फ़ीड' });
  pair = await activePair(page);
  expect(pair.lineText).toBe(pair.machineText);

  await replacement(page, { shop: 'Replacement Ledger Label', customers: [{ name: 'Ledger User', phone: '9000001101' }], entries: [{ phone: '9000001101', type: 'credit', amount: 1101, date: '2026-10-01' }] });
  pair = await activePair(page);
  expect(pair.lineText).toBe('दुकान फ़ीड');
  expect(pair.lineText).toBe(pair.machineText);

  await page.reload();
  pair = await activePair(page);
  expect(pair.lineText).toBe('दुकान फ़ीड');
  expect(pair.lineText).toBe(pair.machineText);
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
});

test('E2E-P11-01 top-left header tracks switch, rename, manual add and reload', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await expect(page.locator('.shop-profile')).toBeVisible();
  await expect(page.locator('.active-shop-display')).toHaveCount(1);

  const layout = await page.evaluate(() => {
    const owner = document.querySelector('.shop-profile').getBoundingClientRect();
    const line = document.querySelector('.active-shop-display').getBoundingClientRect();
    const active = document.querySelector('#active-store-name').getBoundingClientRect();
    return { ownerLeft: owner.left, ownerTop: owner.top, lineLeft: line.left, lineTop: line.top, activeTop: active.top, activeLeft: active.left };
  });
  expect(layout.ownerLeft).toBeLessThanOrEqual(187.5);
  expect(layout.ownerTop).toBeLessThan(layout.activeTop);
  expect(layout.lineLeft).toBe(layout.ownerLeft);

  await page.fill('#store-name', 'P11 Manual');
  await page.click('#store-create');
  await expect(page.locator('.active-shop-display')).toHaveText('P11 Manual');
  await expect(page.locator('#active-store-name')).toHaveText('P11 Manual');

  await page.fill('#store-name', 'P11 Renamed');
  await page.click('#store-rename');
  await expect(page.locator('.active-shop-display')).toHaveText('P11 Renamed');
  await expect(page.locator('#active-store-name')).toHaveText('P11 Renamed');

  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('.active-shop-display')).toHaveText('My Store');
  await page.selectOption('#store-select', { label: 'P11 Renamed' });
  await expect(page.locator('.active-shop-display')).toHaveText('P11 Renamed');

  await page.reload();
  await expect(page.locator('.active-shop-display')).toHaveText('P11 Renamed');
  await expect(page.locator('#active-store-name')).toHaveText('P11 Renamed');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  await expect(page.locator('#active-store-name')).toHaveCount(1);
});

test('E2E-P11-02 replacement and P9 sample activation preserve portfolio name and fallbacks', async ({ page }) => {
  await page.goto('/');
  await replacement(page, { shop: 'CSV/JSON Ledger Label', customers: [{ name: 'Replace User', phone: '9000001102' }], entries: [{ phone: '9000001102', type: 'credit', amount: 1102, date: '2026-10-02' }] });
  await expect(page.locator('.active-shop-display')).toHaveText('My Store');
  await expect(page.locator('#active-store-name')).toHaveText('My Store');

  const sample = fs.readFileSync(path.resolve(__dirname, '../../sample-data.json'), 'utf8');
  await page.setInputFiles('#import-add-file', {
    name: 'sample-data.json',
    mimeType: 'application/json',
    buffer: Buffer.from(sample, 'utf8'),
  });
  await expect(page.locator('#active-store-name')).not.toHaveText('My Store');
  const activeName = (await page.locator('#active-store-name').textContent()).trim();
  await expect(page.locator('.active-shop-display')).toHaveText(activeName);
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');

  await replacement(page, { shop: 'A Different Ledger Label', customers: [{ name: 'Second Ledger', phone: '9000001103' }], entries: [{ phone: '9000001103', type: 'credit', amount: 1103, date: '2026-10-03' }] });
  await expect(page.locator('.active-shop-display')).toHaveText(activeName);
  await expect(page.locator('#active-store-name')).toHaveText(activeName);
  await page.reload();
  await expect(page.locator('.active-shop-display')).toHaveText(activeName);
  await expect(page.locator('#active-store-name')).toHaveText(activeName);

  await page.setViewportSize({ width: 375, height: 812 });
  for (const scheme of ['light', 'dark']) {
    await page.emulateMedia({ colorScheme: scheme });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
    const samples = await page.evaluate(contrastFor, ['.active-shop-display', '#active-store-name', '#owner-display-name', '#owner-display-address', '#owner-display-upi']);
    expect(samples.every((sample) => sample.found && sample.ratio >= 4.5), JSON.stringify({ scheme, samples })).toBe(true);
  }
});
