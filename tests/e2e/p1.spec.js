'use strict';

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

// CONTRACT.md §3.3 normative machine shape.
const BARE = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/;

const RAVI = { name: 'Ravi Kumar', phone: '9000000101' };
const SUNITA = { name: 'Sunita Devi', phone: '9000000102' };

async function addCustomer(page, name, phone) {
  await page.fill('#new-name', name);
  await page.fill('#new-phone', phone);
  await page.click('#add-customer');
}

async function saveEntry(page, options) {
  const { amount, type = 'credit', date = '', note = '' } = options;
  await page.selectOption('#entry-type', type);
  await page.fill('#entry-amount', amount);
  if (date) {
    await page.fill('#entry-date', date);
  }
  await page.fill('#entry-note', note);
  await page.click('#entry-save');
}

async function rowBalance(page, phone) {
  const node = page.locator('[data-customer="' + phone + '"] [data-balance]');
  return { text: ((await node.textContent()) || '').trim(), attribute: await node.getAttribute('data-balance') };
}

async function machineText(page, selector) {
  return ((await page.locator(selector).textContent()) || '').trim();
}

function externalRequests(requests, origin) {
  return requests.filter((raw) => {
    try {
      const url = new URL(raw);
      return !(url.protocol === 'data:' || url.protocol === 'blob:' || url.origin === origin);
    } catch (error) {
      return true;
    }
  });
}

async function entryDates(page) {
  return page.locator('#entries [data-entry-id]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-date'))
  );
}

async function buildRaviShop(page) {
  await page.goto('/');
  await addCustomer(page, RAVI.name, RAVI.phone);
  await addCustomer(page, SUNITA.name, SUNITA.phone);
  await page.goto('/?customer=' + RAVI.phone);
  await saveEntry(page, { amount: '1500', type: 'credit', date: '2026-10-01', note: 'groceries' });
  await saveEntry(page, { amount: '420', type: 'credit', date: '2026-10-05', note: 'groceries' });
  await saveEntry(page, { amount: '180', type: 'payment', date: '2026-10-10', note: 'paid on UPI' });
  await saveEntry(page, { amount: '670.50', type: 'credit', date: '2026-10-12', note: 'groceries' });
}

test('E2E-P1-01 add customers and four entries: exact paise balances, total, amounts, rejections', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  // R1: leading/trailing and repeated internal spaces are trimmed and collapsed.
  await addCustomer(page, '  Ravi   Kumar ', RAVI.phone);
  await addCustomer(page, SUNITA.name, SUNITA.phone);

  await expect(page.locator('[data-customer]')).toHaveCount(2);
  await expect(page.locator('[data-customer="' + RAVI.phone + '"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="' + SUNITA.phone + '"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="' + RAVI.phone + '"]')).toContainText('Ravi Kumar');

  const before = await rowBalance(page, RAVI.phone);
  expect(before).toEqual({ text: '0', attribute: '0' });

  await page.goto('/?customer=' + RAVI.phone);
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');

  // #shot-input must survive a credit entry (CONTRACT §1.5, R5/R2).
  await page.selectOption('#entry-type', 'credit');
  await expect(page.locator('#entry-form #shot-input')).toHaveCount(1);
  await expect(page.locator('#shot-input')).toBeVisible();

  await saveEntry(page, { amount: '1500', type: 'credit', date: '2026-10-01', note: 'groceries' });
  await saveEntry(page, { amount: '420', type: 'credit', date: '2026-10-05', note: 'groceries' });
  await saveEntry(page, { amount: '180', type: 'payment', date: '2026-10-10', note: 'paid on UPI' });
  await saveEntry(page, { amount: '670.50', type: 'credit', date: '2026-10-12', note: 'groceries' });

  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(4);

  // Independent oracle: 150000 + 42000 + 67050 - 18000 = 241050 paise -> "2410.50".
  const expectedBalance = '2410.50';
  const balance = await rowBalance(page, RAVI.phone);
  expect(balance.text).toBe(expectedBalance);
  expect(balance.attribute, '[data-balance] attribute must equal its text').toBe(balance.text);
  expect(balance.text).toMatch(BARE);
  expect(balance.text, 'fractional value renders exactly two decimals').toMatch(/\.\d{2}$/);

  const sunitaBalance = await rowBalance(page, SUNITA.phone);
  expect(sunitaBalance).toEqual({ text: '0', attribute: '0' });
  expect(sunitaBalance.text, 'whole value renders without decimals').not.toContain('.');

  const totalText = await machineText(page, '#total-outstanding');
  expect(totalText).toBe(expectedBalance);
  expect(await page.locator('#total-outstanding').getAttribute('data-value')).toBe(expectedBalance);
  expect(totalText).toMatch(BARE);
  expect(totalText, 'no currency, grouping, or spaces in the machine node').not.toMatch(/[Rs₹,\s+]/);

  const amounts = await page.locator('#entries [data-amount]').evaluateAll((nodes) =>
    nodes.map((node) => ({ text: node.textContent.trim(), attribute: node.getAttribute('data-amount') }))
  );
  expect(amounts.map((amount) => amount.text).sort()).toEqual(['1500', '180', '420', '670.50'].sort());
  for (const amount of amounts) {
    expect(amount.attribute, 'data-amount text and attribute must match').toBe(amount.text);
    expect(amount.text).toMatch(BARE);
  }

  // CONTRACT §1.7 requires #cust-balance to carry data-balance too, so a global
  // [data-balance] scan sees the two rows plus #cust-balance. Row-scoped values are exact.
  expect(await page.locator('[data-balance]').count()).toBe(3);
  const viewBalance = {
    text: await machineText(page, '#cust-balance'),
    attribute: await page.locator('#cust-balance').getAttribute('data-balance'),
  };
  expect(viewBalance).toEqual({ text: expectedBalance, attribute: expectedBalance });

  // Notes render as text, and no entry leaks undefined/null/NaN.
  const viewText = await page.locator('#entries').innerText();
  expect(viewText).toContain('groceries');
  expect(viewText).toContain('paid on UPI');
  expect(viewText).not.toMatch(/undefined|null|NaN/);

  // #shot-input still present after saving a credit entry.
  await expect(page.locator('#shot-input')).toBeVisible();

  // R1: a short phone is rejected with a visible message and no extra row.
  await addCustomer(page, 'Short Phone', '90000001');
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  await expect(page.locator('#new-customer-msg')).toBeVisible();
  const shortMessage = await machineText(page, '#new-customer-msg');
  expect(shortMessage.length).toBeGreaterThan(0);
  expect(shortMessage).toMatch(/10|digit|phone/i);

  // R1: a duplicate phone is rejected with a visible message and no second row.
  await addCustomer(page, 'Another Name', RAVI.phone);
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  await expect(page.locator('[data-customer="' + RAVI.phone + '"]')).toHaveCount(1);
  await expect(page.locator('#new-customer-msg')).toBeVisible();
  const duplicateMessage = await machineText(page, '#new-customer-msg');
  expect(duplicateMessage.length).toBeGreaterThan(0);
  expect(duplicateMessage).toMatch(/exist/i);

  await expectClean(diagnostics, expect);
});

test('E2E-P1-02 reload keeps everything; a storage failure keeps the save in memory with a visible warning', async ({ page }) => {
  await buildRaviShop(page);

  await expect(page.locator('[data-customer]')).toHaveCount(2);
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(4);
  const orderedBefore = await entryDates(page);
  expect(orderedBefore).toEqual(['2026-10-12', '2026-10-10', '2026-10-05', '2026-10-01']);

  const reloaded = await open(page, '/?customer=' + RAVI.phone);

  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect(await rowBalance(page, RAVI.phone)).toEqual({ text: '2410.50', attribute: '2410.50' });
  expect(await rowBalance(page, SUNITA.phone)).toEqual({ text: '0', attribute: '0' });
  expect(await machineText(page, '#total-outstanding')).toBe('2410.50');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(4);
  expect(await entryDates(page)).toEqual(orderedBefore);
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');

  // Force every write to fail (quota / disabled storage) and save one more entry.
  // The patch lives in this document, so it is applied after the reload above and
  // covers the next save without another navigation.
  await page.evaluate(() => {
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });

  await saveEntry(page, { amount: '10', type: 'credit', date: '2026-10-13', note: 'storage test' });

  // In-memory save is kept: 2410.50 + 10 = 2420.50.
  expect(await machineText(page, '#cust-balance')).toBe('2420.50');
  expect(await machineText(page, '#total-outstanding')).toBe('2420.50');
  expect(await rowBalance(page, RAVI.phone)).toEqual({ text: '2420.50', attribute: '2420.50' });
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(5);
  await expect(page.locator('#entries')).toContainText('storage test');

  // N5: a visible warning naming the storage problem, and the app is still usable.
  const storageMessage = page.locator('#storage-msg');
  await expect(storageMessage).toBeVisible();
  const warning = ((await storageMessage.textContent()) || '').trim();
  expect(warning.length, 'visible storage warning').toBeGreaterThan(0);
  expect(warning).toMatch(/storage|save/i);

  await expect(page.locator('[data-customer]')).toHaveCount(2);
  await expect(page.locator('#customers')).toBeVisible();
  expect(reloaded.diagnostics.errors, 'the quota path must not raise console errors').toEqual([]);

  await expectClean(reloaded.diagnostics, expect);
});

test('E2E-P1-03 row link and direct ?customer= both open the same correct view', async ({ page }) => {
  await buildRaviShop(page);
  // A second customer's entry must never appear in Ravi's view.
  await page.goto('/?customer=' + SUNITA.phone);
  await saveEntry(page, { amount: '75', type: 'credit', date: '2026-10-20', note: 'sunita only' });

  await page.goto('/');
  await expect(page.locator('[data-customer]')).toHaveCount(2);

  const rowLink = page.locator('[data-customer="' + RAVI.phone + '"] a[href="?customer=' + RAVI.phone + '"]');
  await expect(rowLink).toHaveCount(1);
  await rowLink.click();

  await expect(page).toHaveURL(new RegExp('customer=' + RAVI.phone));
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');
  expect(await machineText(page, '#cust-balance')).toBe('2410.50');
  expect(await page.locator('#cust-balance').getAttribute('data-balance')).toBe('2410.50');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(4);
  expect(await entryDates(page)).toEqual(['2026-10-12', '2026-10-10', '2026-10-05', '2026-10-01']);
  await expect(page.locator('#entries')).not.toContainText('sunita only');

  for (const selector of ['#total-outstanding', '#import-box', '#import-go', '#shot-input']) {
    await expect(page.locator(selector), selector + ' must stay in the DOM').toHaveCount(1);
  }
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect(await machineText(page, '#total-outstanding'), 'total includes both customers').toBe('2485.50');

  // Direct load must render identically.
  const direct = await open(page, '/?customer=' + RAVI.phone);
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');
  expect(await machineText(page, '#cust-balance')).toBe('2410.50');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(4);
  expect(await entryDates(page)).toEqual(['2026-10-12', '2026-10-10', '2026-10-05', '2026-10-01']);
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect(externalRequests(direct.diagnostics.requests, new URL(page.url()).origin)).toEqual([]);
  await expectClean(direct.diagnostics, expect);
});

test('E2E-P1-04 ?today=2026-11-15 sets the default entry date and the saved data-date', async ({ page }) => {
  await page.goto('/');
  await addCustomer(page, RAVI.name, RAVI.phone);

  const { diagnostics } = await open(page, '/?today=2026-11-15&customer=' + RAVI.phone);

  await expect(page.locator('#entry-date')).toHaveValue('2026-11-15');

  await saveEntry(page, { amount: '100', type: 'credit', note: 'dated by override' });

  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);
  const saved = await page.locator('#entries [data-entry-id]').first().evaluate((node) => ({
    date: node.getAttribute('data-date'),
    amount: node.querySelector('[data-amount]').textContent.trim(),
  }));
  expect(saved).toEqual({ date: '2026-11-15', amount: '100' });
  expect(externalRequests(diagnostics.requests, new URL(page.url()).origin)).toEqual([]);

  await expectClean(diagnostics, expect);
});

test('E2E-P1-05 375x812 with long unicode name, long unicode note, and a fractional amount', async ({ page }) => {
  const longName = 'రవి'.repeat(40);
  const longNote = 'న'.repeat(100);
  const phone = '9000000109';

  await page.goto('/');
  await addCustomer(page, longName, phone);
  await page.goto('/?customer=' + phone);
  await saveEntry(page, { amount: '670.50', type: 'credit', date: '2026-10-12', note: longNote });

  await page.setViewportSize({ width: 375, height: 812 });
  const { diagnostics } = await open(page, '/?customer=' + phone);

  const measured = await page.evaluate(() => {
    const visible = Array.from(document.querySelectorAll('body *')).filter((element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    });
    const offenders = visible
      .map((element) => ({ tag: element.tagName, id: element.id, right: element.getBoundingClientRect().right }))
      .filter((item) => item.right > 376);
    return {
      documentWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      offenders: offenders.slice(0, 5),
    };
  });

  expect(measured.documentWidth).toBeLessThanOrEqual(375);
  expect(measured.bodyWidth).toBeLessThanOrEqual(375);
  expect(measured.offenders, 'elements wider than the viewport').toEqual([]);

  const amounts = await page.evaluate(() => {
    const nodes = [document.getElementById('total-outstanding'), ...document.querySelectorAll('[data-balance]')];
    return nodes.map((node) => ({
      id: node.id || node.getAttribute('data-customer') || 'balance',
      text: node.textContent.trim(),
      clipped: node.scrollWidth > node.clientWidth + 1,
      right: Math.round(node.getBoundingClientRect().right),
    }));
  });
  expect(amounts.length).toBeGreaterThan(1);
  for (const amount of amounts) {
    expect(amount.clipped, amount.id + ' must not be clipped').toBe(false);
    expect(amount.right, amount.id + ' must stay inside the viewport').toBeLessThanOrEqual(376);
  }
  expect(amounts.some((amount) => amount.text === '670.50')).toBe(true);

  // The long unicode note must be present and wrap, not disappear.
  await expect(page.locator('#entries')).toContainText(longNote);

  await expectClean(diagnostics, expect);
});

test('E2E-P1-06 money parsing and rendering through the entry form (D4, N4)', async ({ page }) => {
  const phone = '9000000101';
  await page.goto('/');
  await addCustomer(page, RAVI.name, phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  async function amounts() {
    return page.locator('#entries [data-amount]').evaluateAll((nodes) =>
      nodes.map((node) => ({ text: node.textContent.trim(), attribute: node.getAttribute('data-amount') }))
    );
  }
  async function balance() {
    return (await machineText(page, '#cust-balance'));
  }

  // Strips Rs / spaces / commas: "Rs 1,500" -> 1500, a whole value with no decimals.
  await saveEntry(page, { amount: 'Rs 1,500', type: 'credit', date: '2026-10-01' });
  expect((await amounts()).map((entry) => entry.text)).toEqual(['1500']);
  expect((await amounts())[0].attribute).toBe('1500');
  expect(await balance()).toBe('1500');
  expect(await balance()).not.toContain('.');

  // More than two decimals rounds to the nearest paise: "12.345" -> 12.35 (never the rupee).
  await saveEntry(page, { amount: '12.345', type: 'credit', date: '2026-10-02' });
  expect(await balance()).toBe('1512.35');

  // Two digits of paise render exactly: 5 paise -> 0.05.
  await saveEntry(page, { amount: '0.05', type: 'credit', date: '2026-10-03' });
  expect(await balance()).toBe('1512.40');
  const rendered = await amounts();
  expect(rendered.map((entry) => entry.text)).toEqual(expect.arrayContaining(['0.05', '12.35', '1500']));
  for (const entry of rendered) {
    expect(entry.text).toMatch(BARE);
    expect(entry.attribute).toBe(entry.text);
  }

  // Magnitude is used and the direction comes from the type: "-250" credit -> 250.
  await saveEntry(page, { amount: '-250', type: 'credit', date: '2026-10-04' });
  expect(await balance()).toBe('1762.40');

  // A payment subtracts: 50 -> 1712.40.
  await saveEntry(page, { amount: '50', type: 'payment', date: '2026-10-05' });
  expect(await balance()).toBe('1712.40');

  // Rejected inputs: empty, non-numeric, zero -> visible message, no new entry.
  const countBefore = await page.locator('#entries [data-entry-id]').count();
  for (const bad of ['', 'abc', '0']) {
    await page.fill('#entry-amount', bad);
    await page.click('#entry-save');
    await expect(page.locator('#entry-msg')).toBeVisible();
    const message = await machineText(page, '#entry-msg');
    expect(message.length, 'visible rejection message for "' + bad + '"').toBeGreaterThan(0);
    await expect(page.locator('#entries [data-entry-id]')).toHaveCount(countBefore);
    expect(await balance()).toBe('1712.40');
  }

  await expectClean(diagnostics, expect);
});

test('E2E-P1-07 entries with equal dates keep the newest-saved first (R4, U-04)', async ({ page }) => {
  const phone = '9000000110';
  await page.goto('/');
  await addCustomer(page, 'Same Date', phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  await saveEntry(page, { amount: '100', type: 'credit', date: '2026-10-05', note: 'first' });
  await saveEntry(page, { amount: '200', type: 'credit', date: '2026-10-05', note: 'second' });
  await saveEntry(page, { amount: '300', type: 'credit', date: '2026-10-05', note: 'third' });
  await saveEntry(page, { amount: '50', type: 'credit', date: '2026-10-06', note: 'newest date' });

  const order = await page.locator('#entries [data-entry-id]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      date: node.getAttribute('data-date'),
      amount: node.querySelector('[data-amount]').textContent.trim(),
    }))
  );

  expect(order).toEqual([
    { date: '2026-10-06', amount: '50' },
    { date: '2026-10-05', amount: '300' },
    { date: '2026-10-05', amount: '200' },
    { date: '2026-10-05', amount: '100' },
  ]);
  expect(await machineText(page, '#cust-balance')).toBe('650');

  await expectClean(diagnostics, expect);
});

test('E2E-P1-08 a later successful save clears the storage warning and persists (N5)', async ({ page }) => {
  const phone = '9000000111';
  await page.goto('/');
  await addCustomer(page, 'Storage Recovery', phone);

  const { diagnostics } = await open(page, '/?customer=' + phone);

  await page.evaluate(() => {
    window.__hisaabOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await saveEntry(page, { amount: '10', type: 'credit', date: '2026-10-01', note: 'while broken' });
  await expect(page.locator('#storage-msg')).toBeVisible();
  expect(((await machineText(page, '#storage-msg')) || '').length).toBeGreaterThan(0);
  expect(await machineText(page, '#total-outstanding')).toBe('10');

  await page.evaluate(() => {
    Storage.prototype.setItem = window.__hisaabOriginalSetItem;
  });
  await saveEntry(page, { amount: '5', type: 'credit', date: '2026-10-02', note: 'after recovery' });

  expect(await machineText(page, '#storage-msg')).toBe('');
  expect(await machineText(page, '#total-outstanding')).toBe('15');

  const reloaded = await open(page, '/?customer=' + phone);
  expect(await machineText(page, '#total-outstanding')).toBe('15');
  expect(await machineText(page, '#cust-balance')).toBe('15');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2);

  await expectClean(diagnostics, expect);
  await expectClean(reloaded.diagnostics, expect);
});
