'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

// Oracles come from the source brief files, never from app/.
const SAMPLE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-data.json'), 'utf8'));
const SAMPLE_EXPECTED = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-expected.json'), 'utf8'));

const BARE = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/;

// CONTRACT §1.4: the tester may set .value directly and click; the app must read
// the DOM value at click time, never cached state.
async function importPaste(page, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  await page.locator('#import-box').evaluate((element, next) => {
    element.value = next;
  }, text);
  await page.click('#import-go');
}

async function readShop(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-customer]')).map((row) => {
      const balance = row.querySelector('[data-balance]');
      return {
        phone: row.getAttribute('data-customer'),
        text: balance ? balance.textContent.trim() : null,
        attribute: balance ? balance.getAttribute('data-balance') : null,
        rowText: row.textContent.trim(),
      };
    });
    const total = document.getElementById('total-outstanding');
    const message = document.getElementById('import-msg');
    return {
      rows,
      total: total ? total.textContent.trim() : null,
      totalAttribute: total ? total.getAttribute('data-value') : null,
      message: message ? message.textContent.trim() : '',
      bodyText: document.body.textContent,
    };
  });
}

async function rowBalance(page, phone) {
  const node = page.locator('[data-customer="' + phone + '"] [data-balance]');
  return { text: ((await node.textContent()) || '').trim(), attribute: await node.getAttribute('data-balance') };
}

test('E2E-P2-01 (C-04/C-05/C-06/C-34) sample import: 11820, 8 rows, every balance matches sample-expected.json', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await importPaste(page, SAMPLE);

  const shop = await readShop(page);

  expect(shop.total).toBe('11820');
  expect(shop.totalAttribute).toBe('11820');
  expect(shop.total).toMatch(BARE);
  expect(shop.total).not.toMatch(/[Rs₹,\s+]/);

  expect(shop.rows).toHaveLength(8);
  const renderedPhones = shop.rows.map((row) => row.phone).sort();
  const expectedPhones = Object.keys(SAMPLE_EXPECTED.balances).sort();
  expect(renderedPhones).toEqual(expectedPhones);
  expect(SAMPLE_EXPECTED.customers_with_balance).toBe(8);

  for (const [phone, expectedBalance] of Object.entries(SAMPLE_EXPECTED.balances)) {
    const rendered = await rowBalance(page, phone);
    const expected = String(expectedBalance);
    expect(rendered.text, phone + ' balance text').toBe(expected);
    expect(rendered.attribute, phone + ' balance attribute').toBe(expected);
    expect(rendered.text).toMatch(BARE);
    expect(Number(rendered.text)).toBe(expectedBalance);
    expect(rendered.text).not.toMatch(/[.,]/);
  }

  const sum = Object.values(SAMPLE_EXPECTED.balances).reduce((total, value) => total + value, 0);
  expect(sum).toBe(SAMPLE_EXPECTED.total_outstanding);
  expect(Number(shop.total)).toBe(sum);

  // C-34: success message names the shop, the count, and the rendered total.
  expect(shop.message).toContain(SAMPLE.shop);
  expect(shop.message).toContain('8');
  expect(shop.message).toContain('11820');
  expect(shop.message).not.toContain('Could not import');
  expect(shop.message).not.toContain('Warning');

  // Each sample customer's row carries its imported name.
  for (const customer of SAMPLE.customers) {
    await expect(page.locator('[data-customer="' + customer.phone + '"]')).toContainText(customer.name);
  }

  expect(shop.bodyText).not.toMatch(/undefined|NaN/);
  await expectClean(diagnostics, expect);
});

test('E2E-P2-02 (I-01) a second import replaces the first shop and reload keeps the second', async ({ page }) => {
  await open(page, '/');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  expect((await readShop(page)).total).toBe('11820');

  const secondShop = {
    shop: 'Second Shop',
    customers: [
      { name: 'Asha', phone: '9111111111' },
      { name: 'Bala', phone: '9111111112' },
    ],
    entries: [
      { phone: '9111111111', type: 'credit', amount: 1000, date: '2026-10-01' },
      { phone: '9111111112', type: 'payment', amount: '250.50', date: '2026-10-02' },
    ],
  };

  await importPaste(page, secondShop);
  await expect(page.locator('[data-customer]')).toHaveCount(2);

  const replaced = await readShop(page);
  expect(replaced.rows.map((row) => row.phone).sort()).toEqual(['9111111111', '9111111112']);
  expect(await rowBalance(page, '9111111111')).toEqual({ text: '1000', attribute: '1000' });
  expect(await rowBalance(page, '9111111112')).toEqual({ text: '-250.50', attribute: '-250.50' });
  expect(replaced.total).toBe('749.50');
  expect(replaced.totalAttribute).toBe('749.50');
  expect(replaced.message).toContain('Second Shop');

  // No first-shop row, balance, or total survives the replace.
  for (const phone of Object.keys(SAMPLE_EXPECTED.balances)) {
    await expect(page.locator('[data-customer="' + phone + '"]')).toHaveCount(0);
  }

  const reloaded = await open(page, '/');
  const afterReload = await readShop(page);
  expect(afterReload.rows.map((row) => row.phone).sort()).toEqual(['9111111111', '9111111112']);
  expect(afterReload.total).toBe('749.50');
  expect(await rowBalance(page, '9111111111')).toEqual({ text: '1000', attribute: '1000' });
  expect(await rowBalance(page, '9111111112')).toEqual({ text: '-250.50', attribute: '-250.50' });

  await expectClean(reloaded.diagnostics, expect);
});

test('E2E-P2-03 (C-33/I-10) malformed JSON keeps state; missing lists warn; empty arrays render an empty shop', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  expect((await readShop(page)).total).toBe('11820');

  // Malformed JSON: readable error, previous shop untouched, no crash.
  await importPaste(page, '{"customers": [');
  let shop = await readShop(page);
  expect(shop.message).toContain('Could not import');
  expect(shop.rows).toHaveLength(8);
  expect(shop.total).toBe('11820');
  expect(await rowBalance(page, '9000000101')).toEqual({ text: '670', attribute: '670' });

  // A JSON value that is not an object is also refused without a state change.
  await importPaste(page, '[1,2,3]');
  shop = await readShop(page);
  expect(shop.message).toContain('Could not import');
  expect(shop.rows).toHaveLength(8);
  expect(shop.total).toBe('11820');

  // Missing lists: treated as empty, import succeeds, warning shown.
  await importPaste(page, { shop: 'Only A Name' });
  shop = await readShop(page);
  expect(shop.message).not.toContain('Could not import');
  expect(shop.message).toContain('Warning');
  expect(shop.rows).toHaveLength(0);
  expect(shop.total).toBe('0');
  await expect(page.locator('#import-msg')).toBeVisible();

  // Non-array lists: same treatment.
  await importPaste(page, { shop: 'Bad Lists', customers: 'nope', entries: 42 });
  shop = await readShop(page);
  expect(shop.message).toContain('Warning');
  expect(shop.rows).toHaveLength(0);
  expect(shop.total).toBe('0');

  // Empty arrays: empty shop, total 0, no crash.
  await importPaste(page, { customers: [], entries: [] });
  shop = await readShop(page);
  expect(shop.rows).toHaveLength(0);
  expect(shop.total).toBe('0');
  expect(shop.message).not.toContain('Could not import');
  await expect(page.locator('#customers')).toContainText('No customers yet');

  await expectClean(diagnostics, expect);
});

test('E2E-P2-04 (I-04/I-05/I-06/I-07/U-02/U-03) dedupe, unknown phone, zero entries, decorated amounts, type casing', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  const shop = {
    shop: 'Edge Shop',
    customers: [
      { name: 'Ravi Kumar', phone: '9000000101' },
      { name: 'Ravi Kumar', phone: '9000000101' },
      { name: 'Ravi K Sharma', phone: '9000000101' },
      { name: 'Same Name', phone: '9000000102' },
      { name: 'Same Name', phone: '9000000103' },
      { name: 'Zero Entry', phone: '9000000104' },
    ],
    entries: [
      { phone: '9000000101', type: 'CREDIT', amount: 'Rs 1,500', date: '2026-10-01', note: 'a' },
      { phone: '9000000101', type: 'Credit', amount: '1,500', date: '2026-10-02', note: 'b' },
      { phone: '9000000101', type: 'payment', amount: '670.50', date: '2026-10-03', note: 'c' },
      { phone: '9000000101', type: 'PAID', amount: '12.345', date: '2026-10-04', note: 'd' },
      { phone: '9000000101', type: 'credit', amount: 5, date: '2026-10-08', note: 'tie 1' },
      { phone: '9000000101', type: 'credit', amount: 7, date: '2026-10-08', note: 'tie 2' },
      { phone: '9000000105', type: 'udhaar', amount: 250, date: '2026-10-05', note: 'unknown phone' },
      { phone: '9000000102', type: 'mystery', amount: 100, date: '2026-10-06', note: 'unknown type' },
      { phone: '9000000103', amount: 10, date: '2026-10-07', note: 'missing type' },
    ],
  };

  await importPaste(page, shop);

  const rendered = await readShop(page);

  // Rows: 101 (last name kept), 102, 103, 104 (zero entries), 105 (auto-created).
  expect(rendered.rows).toHaveLength(5);
  expect(rendered.rows.map((row) => row.phone).sort()).toEqual([
    '9000000101',
    '9000000102',
    '9000000103',
    '9000000104',
    '9000000105',
  ]);
  await expect(page.locator('[data-customer="9000000101"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000101"]')).toContainText('Ravi K Sharma');
  await expect(page.locator('[data-customer="9000000105"]')).toContainText('Customer 9000000105');

  // Independent paise arithmetic:
  // 101: 1500 + 1500 - 670.50 - 12.35 + 5 + 7 = 2329.15
  // 102: 100 (unknown type -> credit); 103: 10 (missing type -> credit); 104: 0; 105: 250
  expect(await rowBalance(page, '9000000101')).toEqual({ text: '2329.15', attribute: '2329.15' });
  expect(await rowBalance(page, '9000000102')).toEqual({ text: '100', attribute: '100' });
  expect(await rowBalance(page, '9000000103')).toEqual({ text: '10', attribute: '10' });
  expect(await rowBalance(page, '9000000104')).toEqual({ text: '0', attribute: '0' });
  expect(await rowBalance(page, '9000000105')).toEqual({ text: '250', attribute: '250' });
  expect(rendered.total).toBe('2689.15');
  expect(rendered.totalAttribute).toBe('2689.15');

  // Duplicate warning names the phone; unknown and missing types warn too.
  expect(rendered.message).toContain('duplicate');
  expect(rendered.message).toContain('9000000101');
  expect(rendered.message).toMatch(/unknown type/i);
  expect(rendered.message).toMatch(/missing or empty type/i);

  // Entries newest date first; equal dates keep the newest insertion first.
  await page.goto('/?customer=9000000101');
  const order = await page.locator('#entries [data-entry-id]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      date: node.getAttribute('data-date'),
      amount: node.querySelector('[data-amount]')
        ? node.querySelector('[data-amount]').textContent.trim()
        : null,
      attribute: node.querySelector('[data-amount]')
        ? node.querySelector('[data-amount]').getAttribute('data-amount')
        : null,
    }))
  );
  expect(order).toEqual([
    { date: '2026-10-08', amount: '7', attribute: '7' },
    { date: '2026-10-08', amount: '5', attribute: '5' },
    { date: '2026-10-04', amount: '12.35', attribute: '12.35' },
    { date: '2026-10-03', amount: '670.50', attribute: '670.50' },
    { date: '2026-10-02', amount: '1500', attribute: '1500' },
    { date: '2026-10-01', amount: '1500', attribute: '1500' },
  ]);
  for (const entry of order) {
    expect(entry.amount).toMatch(BARE);
    expect(entry.amount).not.toMatch(/[Rs₹,\s]/);
  }

  await expect(page.locator('#entries')).not.toContainText('undefined');
  await expect(page.locator('#entries')).not.toContainText('NaN');
  await expectClean(diagnostics, expect);
});

test('E2E-P2-05 imported sample at 375x812: no sideways scroll, balances not clipped', async ({ page }) => {
  await open(page, '/');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);

  await page.setViewportSize({ width: 375, height: 812 });
  const { diagnostics } = await open(page, '/');

  const measured = await page.evaluate(() => {
    const balances = Array.from(document.querySelectorAll('[data-customer] [data-balance]')).map((node) => ({
      phone: node.closest('[data-customer]').getAttribute('data-customer'),
      clipped: node.scrollWidth > node.clientWidth + 1,
      right: Math.round(node.getBoundingClientRect().right),
    }));
    return {
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      rows: document.querySelectorAll('[data-customer]').length,
      balances,
    };
  });

  expect(measured.rows).toBe(8);
  expect(measured.documentWidth).toBeLessThanOrEqual(375);
  expect(measured.bodyWidth).toBeLessThanOrEqual(375);
  for (const balance of measured.balances) {
    expect(balance.clipped, balance.phone + ' balance must not be clipped').toBe(false);
    expect(balance.right, balance.phone + ' balance must stay inside the viewport').toBeLessThanOrEqual(376);
  }

  await expectClean(diagnostics, expect);
});
