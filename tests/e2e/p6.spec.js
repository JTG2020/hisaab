'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');
const { contrastFor } = require('../support/contrast');

const SAMPLE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-data.json'), 'utf8'));
const SAMPLE_EXPECTED = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-expected.json'), 'utf8'));
const ARTIFACTS = path.resolve(__dirname, '..', 'artifacts');
fs.mkdirSync(ARTIFACTS, { recursive: true });

const BARE = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/;
const CONTRACT_IDS = [
  'total-outstanding', 'new-name', 'new-phone', 'add-customer', 'entry-form', 'entry-type',
  'entry-amount', 'entry-date', 'entry-note', 'entry-save', 'shot-input', 'import-box',
  'import-go', 'import-msg', 'search', 'export-csv', 'lang-switch', 'overdue', 'customers',
];

function normalizePhone(value) {
  let text = String(value === null || value === undefined ? '' : value).trim();
  if (text.charAt(0) === '+') text = text.slice(1);
  let digits = text.replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.slice(0, 2) === '91') digits = digits.slice(2);
  return digits;
}

const SAMPLE_ENTRIES_101 = SAMPLE.entries.filter((entry) => normalizePhone(entry.phone) === '9000000101').length;

async function importPaste(page, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  await page.locator('#import-box').evaluate((element, next) => {
    element.value = next;
  }, text);
  await page.click('#import-go');
}

async function addCustomer(page, name, phone) {
  await page.fill('#new-name', name);
  await page.fill('#new-phone', phone);
  await page.click('#add-customer');
}

async function fillEntry(page, options) {
  const { amount, type = 'credit', date = '', note = '' } = options;
  await page.selectOption('#entry-type', type);
  await page.fill('#entry-amount', amount);
  if (date) await page.fill('#entry-date', date);
  await page.fill('#entry-note', note);
}

async function makeImage(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 700;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 900, 700);
    context.fillStyle = '#0A5';
    context.fillRect(60, 60, 780, 580);
    context.fillStyle = '#000';
    context.font = 'bold 96px sans-serif';
    context.fillText('Rs 100', 120, 380);
    return canvas.toDataURL('image/jpeg', 0.85);
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function machineTotal(page) {
  return ((await page.locator('#total-outstanding').textContent()) || '').trim();
}

async function rowBalance(page, phone) {
  const node = page.locator('[data-customer="' + phone + '"] [data-balance]');
  return { text: ((await node.textContent()) || '').trim(), attribute: await node.getAttribute('data-balance') };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let quoted = false;
  let index = 0;
  while (index < text.length) {
    const character = text[index];
    if (quoted) {
      if (character === '"') {
        if (text[index + 1] === '"') {
          field += '"';
          index += 2;
          continue;
        }
        quoted = false;
        index += 1;
        continue;
      }
      field += character;
      index += 1;
      continue;
    }
    if (character === '"') {
      quoted = true;
      index += 1;
      continue;
    }
    if (character === ',') {
      row.push(field);
      field = '';
      index += 1;
      continue;
    }
    if (character === '\r') {
      index += 1;
      continue;
    }
    if (character === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
      index += 1;
      continue;
    }
    field += character;
    index += 1;
  }
  if (field !== '' || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

test('E2E-P6-01 full journey: import, replace, customer, reminder, image, B1–B6, 375, dark, clear, quota, ?today', async ({ page }) => {
  test.setTimeout(300000);
  const { diagnostics } = await open(page, '/');

  // 1. Sample import: the 60-mark surface.
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  expect(await machineTotal(page)).toBe('11820');
  for (const phone of Object.keys(SAMPLE_EXPECTED.balances)) {
    expect(await rowBalance(page, phone)).toEqual({
      text: String(SAMPLE_EXPECTED.balances[phone]),
      attribute: String(SAMPLE_EXPECTED.balances[phone]),
    });
  }

  // 2. A different shop replaces it and survives a reload.
  await importPaste(page, {
    shop: 'Journey Second Shop',
    customers: [
      { name: 'Asha', phone: '9111111111' },
      { name: 'Bala', phone: '9111111112' },
    ],
    entries: [
      { phone: '9111111111', type: 'credit', amount: 1000, date: '2026-10-01' },
      { phone: '9111111112', type: 'payment', amount: '250.50', date: '2026-10-02' },
    ],
  });
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect(await machineTotal(page)).toBe('749.50');
  await page.reload();
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect(await machineTotal(page)).toBe('749.50');
  await expect(page.locator('[data-customer="9000000101"]')).toHaveCount(0);

  // 3. Re-import the sample.
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  expect(await machineTotal(page)).toBe('11820');

  // 4. Customer view.
  await page.goto('/?customer=9000000101');
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(SAMPLE_ENTRIES_101);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('670');

  // 5. Reminder.
  const reminder = page.locator('[data-customer="9000000101"] a[data-remind="9000000101"]');
  await expect(reminder).toHaveCount(1);
  const reminderHref = await reminder.getAttribute('href');
  const reminderPrefix = 'https://wa.me/919000000101?text=';
  expect(reminderHref.startsWith(reminderPrefix)).toBe(true);
  const reminderText = decodeURIComponent(reminderHref.slice(reminderPrefix.length));
  expect(reminderText).toContain('Ravi Kumar');
  expect(reminderText).toContain('Rs 670');
  expect(reminderHref.slice(reminderPrefix.length).includes('&')).toBe(false);
  expect(encodeURIComponent(reminderText)).toBe(reminderHref.slice(reminderPrefix.length));

  // 6. Payment with a screenshot.
  await page.selectOption('#entry-type', 'payment');
  await page.fill('#entry-amount', '100');
  await page.fill('#entry-date', '2026-10-20');
  await page.fill('#entry-note', 'journey payment');
  await page.setInputFiles('#shot-input', { name: 'journey.jpg', mimeType: 'image/jpeg', buffer: await makeImage(page) });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(SAMPLE_ENTRIES_101 + 1, { timeout: 20000 });
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1);
  const shotEntryId = await page
    .locator('#entries [data-entry-id]')
    .filter({ has: page.locator('img[data-shot]') })
    .getAttribute('data-entry-id');
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('570');
  await page.reload();
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(SAMPLE_ENTRIES_101 + 1);
  await expect(page.locator('#entries [data-entry-id="' + shotEntryId + '"] img[data-shot]')).toHaveCount(1);

  // 7. B2: edit 100 -> 150 (image kept), then delete.
  await page.locator('#entries [data-entry-id="' + shotEntryId + '"] button[data-edit-entry]').click();
  await expect(page.locator('#entry-amount')).toHaveValue('100');
  await page.fill('#entry-amount', '150');
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id="' + shotEntryId + '"] [data-amount]')).toHaveText('150');
  await expect(page.locator('#entries [data-entry-id="' + shotEntryId + '"] img[data-shot]')).toHaveCount(1);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('520');
  await page.locator('#entries [data-entry-id="' + shotEntryId + '"] button[data-delete-entry]').click();
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(SAMPLE_ENTRIES_101);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('670');
  await page.reload();
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(SAMPLE_ENTRIES_101);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('670');

  // 8. B1: overdue at a fixed today.
  await page.goto('/?today=2026-11-15');
  const overdue = await page.locator('#overdue [data-overdue]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      phone: node.getAttribute('data-overdue'),
      days: node.querySelector('[data-days]') ? node.querySelector('[data-days]').textContent.trim() : null,
      daysAttribute: node.querySelector('[data-days]')
        ? node.querySelector('[data-days]').getAttribute('data-days')
        : null,
    }))
  );
  expect(overdue).toEqual([
    { phone: '9000000105', days: '61', daysAttribute: '61' },
    { phone: '9000000104', days: '44', daysAttribute: '44' },
    { phone: '9000000108', days: '43', daysAttribute: '43' },
    { phone: '9000000102', days: '42', daysAttribute: '42' },
  ]);
  expect(await page.locator('#overdue [data-customer]').count()).toBe(0);

  // 9. B3: two CSVs from the current state.
  const downloads = [];
  page.on('download', (download) => downloads.push(download));
  await page.click('#export-csv');
  await expect.poll(() => downloads.length, { timeout: 10000 }).toBe(2);
  const csv = new Map();
  for (const download of downloads) {
    const name = download.suggestedFilename();
    const destination = path.join(ARTIFACTS, 'p6-' + name);
    await download.saveAs(destination);
    csv.set(name, fs.readFileSync(destination, 'utf8'));
  }
  expect(Array.from(csv.keys()).sort()).toEqual(['customers.csv', 'entries.csv']);
  const customerRows = parseCsv(csv.get('customers.csv'));
  expect(customerRows[0]).toEqual(['phone', 'name', 'credit', 'payment', 'balance']);
  expect(customerRows).toHaveLength(9);
  for (const row of customerRows.slice(1)) {
    for (const cell of row.slice(2)) {
      expect(cell).toMatch(BARE);
      expect(cell).not.toMatch(/[Rs₹,\s]/);
    }
  }
  const entryRows = parseCsv(csv.get('entries.csv'));
  expect(entryRows[0]).toEqual(['phone', 'type', 'amount', 'date', 'note']);
  expect(entryRows.length, 'one header + one row per sample entry').toBe(SAMPLE.entries.length + 1);
  expect(entryRows.slice(1).every((row) => row.length === 5)).toBe(true);

  // 10. B4: search.
  await page.goto('/');
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  await page.fill('#search', 'sunita');
  const visible = await page.locator('[data-customer]').evaluateAll((nodes) =>
    nodes.filter((node) => !node.hasAttribute('hidden')).map((node) => node.getAttribute('data-customer'))
  );
  expect(visible).toEqual(['9000000102']);
  expect(await machineTotal(page)).toBe('11820');
  await page.fill('#search', '');
  expect(
    await page.locator('[data-customer]').evaluateAll((nodes) => nodes.filter((node) => !node.hasAttribute('hidden')).length)
  ).toBe(8);

  // 11. B5: UPI.
  const upiHref = await page
    .locator('[data-customer="9000000101"] a[href^="upi://pay?pa="]')
    .getAttribute('href');
  const upiQuery = new URLSearchParams(upiHref.slice(upiHref.indexOf('?') + 1));
  expect(upiQuery.get('pa')).toBe('hisaab@upi');
  expect(upiQuery.get('am')).toBe('670');
  expect(upiQuery.get('cu')).toBe('INR');
  expect(upiQuery.get('tn')).toBe('Ravi Kumar');
  expect(upiHref.split('cu=INR').length - 1).toBe(1);

  // 12. B6: language.
  const englishTotal = await machineTotal(page);
  const englishOverdue = (await page.locator('#overdue-title').textContent()).trim();
  await page.selectOption('#lang-switch', 'hi');
  await expect(page.locator('#lang-switch')).toHaveValue('hi');
  expect((await page.locator('#overdue-title').textContent()).trim()).not.toBe(englishOverdue);
  expect(await machineTotal(page)).toBe(englishTotal);
  expect(await rowBalance(page, '9000000101')).toEqual({ text: '670', attribute: '670' });
  await page.selectOption('#lang-switch', 'en');
  expect((await page.locator('#overdue-title').textContent()).trim()).toBe(englishOverdue);

  // 13. 375 px.
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(375);

  // 14. Dark: key text still passes 4.5:1.
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  const darkRatios = await page.evaluate(contrastFor, ['body', '#total-outstanding', '#cust-balance']);
  for (const sample of darkRatios) {
    expect(sample.found, sample.selector + ' must exist in dark mode').toBe(true);
    expect(sample.ratio, sample.selector + ' dark contrast ' + sample.ratio).toBeGreaterThanOrEqual(4.5);
  }
  await page.emulateMedia({ colorScheme: 'light' });

  // 15. Clear storage -> the empty-state contract.
  await page.evaluate(() => window.localStorage.clear());
  await page.goto('/');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  expect(await machineTotal(page)).toBe('0');
  await expect(page.locator('#customers')).toContainText('No customers');
  for (const id of CONTRACT_IDS) {
    await expect(page.locator('#' + id), '#' + id + ' after clearing storage').toHaveCount(1);
  }

  // 16. Forced quota keeps the entry, then a later save persists.
  await page.setViewportSize({ width: 1280, height: 800 });
  await addCustomer(page, 'Quota Journey', '9000000901');
  await page.goto('/?customer=9000000901');
  await page.evaluate(() => {
    window.__hisaabOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await fillEntry(page, { amount: '50', type: 'credit', date: '2026-10-01', note: 'while quota is broken' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('50');
  await expect(page.locator('#storage-msg')).toBeVisible();
  expect(((await page.locator('#storage-msg').textContent()) || '').trim().length).toBeGreaterThan(0);
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__hisaabOriginalSetItem;
  });
  await fillEntry(page, { amount: '25', type: 'credit', date: '2026-10-02', note: 'after recovery' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2);
  await expect(page.locator('#storage-msg')).toHaveText('');
  await page.reload();
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('75');

  // 17. ?today drives the overdue day count.
  await page.goto('/');
  await importPaste(page, SAMPLE);
  await page.goto('/?today=2026-12-01');
  const decemberRows = await page.locator('#overdue [data-overdue]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      phone: node.getAttribute('data-overdue'),
      days: Number(node.querySelector('[data-days]').textContent.trim()),
    }))
  );
  expect(decemberRows).toHaveLength(8);
  expect(decemberRows[0].phone).toBe('9000000105');
  expect(decemberRows[0].days).toBe(77);
  for (let index = 1; index < decemberRows.length; index += 1) {
    expect(decemberRows[index - 1].days).toBeGreaterThanOrEqual(decemberRows[index].days);
  }
  await page.goto('/?today=2026-11-15');
  expect(Number((await page.locator('#overdue [data-days]').first().textContent()).trim())).toBe(61);

  // 18. Nothing noisy happened during the whole journey.
  const origin = new URL(page.url()).origin;
  const external = diagnostics.requests.filter((raw) => {
    try {
      const url = new URL(raw);
      return !(url.protocol === 'data:' || url.protocol === 'blob:' || url.origin === origin);
    } catch (error) {
      return true;
    }
  });
  expect(external, 'no third-party request during the journey').toEqual([]);
  await page.screenshot({ path: path.join(ARTIFACTS, 'p6-journey-end.png') });
  await expectClean(diagnostics, expect);
});

test('E2E-P6-02 duplicate phone: later empty name keeps the earlier name and warns; later non-empty name wins; exact duplicate is silent', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  // 1. Later empty name: earlier non-empty name kept, duplicate warning with the phone.
  await importPaste(page, {
    shop: 'Empty Name Case',
    customers: [
      { name: 'Ravi Kumar', phone: '9000000001' },
      { name: '', phone: '9000000001' },
    ],
    entries: [{ phone: '9000000001', type: 'credit', amount: 100, date: '2026-10-01' }],
  });

  const rows = await page.locator('[data-customer]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      phone: node.getAttribute('data-customer'),
      name: node.querySelector('.customer-name') ? node.querySelector('.customer-name').textContent.trim() : null,
      balance: node.querySelector('[data-balance]') ? node.querySelector('[data-balance]').textContent.trim() : null,
    }))
  );
  const message = ((await page.locator('#import-msg').textContent()) || '').trim();

  expect(rows).toHaveLength(1);
  expect(rows[0]).toEqual({ phone: '9000000001', name: 'Ravi Kumar', balance: '100' });
  expect(message).toContain('duplicate');
  expect(message).toContain('9000000001');
  expect(message).not.toContain('Could not import');
  expect(await machineTotal(page)).toBe('100');
  await expect(page.locator('#import-msg')).toBeVisible();

  // 2. A later non-empty name still wins, with the duplicate warning.
  await importPaste(page, {
    shop: 'Later Name Wins',
    customers: [
      { name: 'First Name', phone: '9000000002' },
      { name: 'Second Name', phone: '9000000002' },
    ],
    entries: [{ phone: '9000000002', type: 'credit', amount: 10, date: '2026-10-01' }],
  });
  await expect(page.locator('[data-customer="9000000002"]')).toHaveCount(1);
  await expect(page.locator('[data-customer="9000000002"]')).toContainText('Second Name');
  const laterMessage = ((await page.locator('#import-msg').textContent()) || '').trim();
  expect(laterMessage).toContain('duplicate');
  expect(laterMessage).toContain('9000000002');
  expect((await rowBalance(page, '9000000002')).text).toBe('10');

  // 3. An exact duplicate (same name and phone) is still silent.
  await importPaste(page, {
    shop: 'Exact Duplicate',
    customers: [
      { name: 'Same Person', phone: '9000000003' },
      { name: 'Same Person', phone: '9000000003' },
    ],
    entries: [{ phone: '9000000003', type: 'credit', amount: 5, date: '2026-10-01' }],
  });
  await expect(page.locator('[data-customer="9000000003"]')).toHaveCount(1);
  const exactMessage = ((await page.locator('#import-msg').textContent()) || '').trim();
  expect(exactMessage).not.toContain('duplicate');
  expect((await rowBalance(page, '9000000003')).text).toBe('5');
  expect(await machineTotal(page)).toBe('5');

  fs.writeFileSync(
    path.join(ARTIFACTS, 'p6-empty-name-duplicate.txt'),
    'empty-name case rows: ' + JSON.stringify(rows) + '\n' +
      'empty-name message: ' + JSON.stringify(message) + '\n' +
      'later-name message: ' + JSON.stringify(laterMessage) + '\n' +
      'exact-duplicate message: ' + JSON.stringify(exactMessage) + '\n'
  );

  await expectClean(diagnostics, expect);
});

test('E2E-P6-03 post-G6 UX: search empty state, customer picker, add-entry button', async ({ page }) => {
  test.setTimeout(90000);
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);

  const visiblePhones = () =>
    page.locator('[data-customer]').evaluateAll((nodes) =>
      nodes
        .filter((node) => !node.hasAttribute('hidden') && node.getClientRects().length > 0)
        .map((node) => node.getAttribute('data-customer'))
        .sort()
    );

  // 1. A matching name query: one row, no empty state, total untouched.
  await page.fill('#search', 'ravi');
  expect(await visiblePhones()).toEqual(['9000000101']);
  await expect(page.locator('#search-empty')).toBeHidden();
  expect(await machineTotal(page)).toBe('11820');

  // 2. A no-match query: zero visible rows, empty state visible, DOM intact, total untouched.
  await page.fill('#search', 'zzz-no-match');
  expect(await visiblePhones()).toEqual([]);
  await expect(page.locator('#search-empty')).toBeVisible();
  await expect(page.locator('#search-empty')).toContainText('No customers');
  expect(await page.locator('[data-customer]').count(), 'rows are hidden, never removed').toBe(8);
  expect(await machineTotal(page)).toBe('11820');

  // 3. Clearing restores every row and hides the empty state.
  await page.fill('#search', '');
  expect((await visiblePhones()).length).toBe(8);
  await expect(page.locator('#search-empty')).toBeHidden();

  // 4. The picker lists the placeholder plus every customer.
  expect(await page.locator('#entry-customer option').count()).toBe(9);

  // 5. Save through the picker on the list page.
  await page.selectOption('#entry-customer', '9000000101');
  await fillEntry(page, { amount: '10', type: 'credit', date: '2026-10-01', note: 'picker entry' });
  await page.click('#entry-save');
  await expect(page.locator('[data-customer="9000000101"] [data-balance]')).toHaveText('680');
  expect(await rowBalance(page, '9000000101')).toEqual({ text: '680', attribute: '680' });
  expect(await machineTotal(page)).toBe('11830');
  await page.reload();
  expect(await rowBalance(page, '9000000101')).toEqual({ text: '680', attribute: '680' });
  expect(await machineTotal(page)).toBe('11830');

  // 6. Add-entry button targets its row's customer, scrolls to the form and focuses the amount.
  const addButton = page.locator('button[data-add-entry-for="9000000102"]');
  await expect(page.locator('[data-customer="9000000102"] button[data-add-entry-for="9000000102"]')).toHaveCount(1);
  await addButton.click();
  expect(await page.locator('#entry-customer').inputValue()).toBe('9000000102');
  expect(
    await page.evaluate(() => (document.activeElement ? document.activeElement.id : null)),
    '#entry-amount must receive focus'
  ).toBe('entry-amount');
  const formTop = await page.locator('#entry-form').evaluate((element) => element.getBoundingClientRect().top);
  expect(formTop, 'the form must be scrolled into view').toBeLessThan(812);

  await fillEntry(page, { amount: '5', type: 'credit', date: '2026-10-02', note: 'add-entry button' });
  await page.click('#entry-save');
  // sample-expected.json gives 9000000102 a balance of 3470; +5 = 3475, and 11830 + 5 = 11835.
  await expect(page.locator('[data-customer="9000000102"] [data-balance]')).toHaveText('3475');
  expect(await rowBalance(page, '9000000102')).toEqual({ text: '3475', attribute: '3475' });
  expect(await machineTotal(page)).toBe('11835');
  await expect(page.locator('#entry-customer')).toHaveValue('9000000102');

  // 7. At 375 px the add-entry button is a real tap target and nothing scrolls sideways.
  await page.setViewportSize({ width: 375, height: 812 });
  const box = await page
    .locator('button[data-add-entry-for="9000000102"]')
    .evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return { height: rect.height, right: rect.right, width: rect.width };
    });
  expect(box.height, 'add-entry button height').toBeGreaterThanOrEqual(40);
  expect(box.width).toBeGreaterThan(0);
  expect(box.right).toBeLessThanOrEqual(376);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(375);

  await page.screenshot({ path: path.join(ARTIFACTS, 'p6-ux-375.png') });
  fs.writeFileSync(
    path.join(ARTIFACTS, 'p6-ux-fix.txt'),
    [
      'search ravi: 1 visible row (9000000101), #search-empty hidden, total 11820',
      'search zzz-no-match: 0 visible, #search-empty visible, 8 rows in DOM, total 11820',
      'clear: 8 visible, #search-empty hidden',
      '#entry-customer options after import: 9',
      'picker save credit 10 -> 9000000101 balance 680, total 11830, persists on reload',
      'add-entry 9000000102 -> select value 9000000102, focus ' + 'entry-amount' + ', credit 5 -> balance 3475, total 11835',
      '375 px add-entry button: ' + JSON.stringify(box),
    ].join('\n')
  );

  await expectClean(diagnostics, expect);
});
