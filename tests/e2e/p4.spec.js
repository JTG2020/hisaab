'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

const SAMPLE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-data.json'), 'utf8'));
const SAMPLE_EXPECTED = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-expected.json'), 'utf8'));

const ARTIFACTS = path.resolve(__dirname, '..', 'artifacts');
fs.mkdirSync(ARTIFACTS, { recursive: true });

const BARE = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/;

// --- helpers -----------------------------------------------------------------

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

async function makeImage(page, text, width = 900, height = 700) {
  const dataUrl = await page.evaluate((input) => {
    const canvas = document.createElement('canvas');
    canvas.width = input.width;
    canvas.height = input.height;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, input.width, input.height);
    context.fillStyle = '#111111';
    context.font = 'bold 120px sans-serif';
    context.fillText(input.text, 60, Math.round(input.height / 2));
    return canvas.toDataURL('image/jpeg', 0.9);
  }, { text, width, height });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

// RFC 4180 parser: quoted fields, doubled quotes, embedded commas/newlines.
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

async function visiblePhones(page) {
  return page.locator('[data-customer]').evaluateAll((nodes) =>
    nodes
      .filter((node) => !node.hasAttribute('hidden') && node.getClientRects().length > 0)
      .map((node) => node.getAttribute('data-customer'))
      .sort()
  );
}

function moneySnapshot(cells, label) {
  for (const cell of cells) {
    expect(cell, label + ' must be a bare machine number').toMatch(BARE);
    expect(cell, label + ' must not carry currency or grouping').not.toMatch(/[Rs₹,\s]/);
  }
}

// --- B1 ----------------------------------------------------------------------

test('E2E-P4-01 (C-14/C-28) overdue: 4 sample rows in day order, bare data-days, no data-customer, no-payment excluded, empty state', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await page.goto('/?today=2026-11-15');

  await expect(page.locator('#overdue')).toBeVisible();
  const heading = (await page.locator('#overdue h1, #overdue h2, #overdue h3').first().textContent()).trim();
  expect(heading).toContain('Overdue');
  expect(heading).toContain('30+ days');

  const rows = await page.locator('#overdue [data-overdue]').evaluateAll((nodes) =>
    nodes.map((node) => ({
      phone: node.getAttribute('data-overdue'),
      days: node.querySelector('[data-days]')
        ? node.querySelector('[data-days]').textContent.trim()
        : null,
      daysAttribute: node.querySelector('[data-days]')
        ? node.querySelector('[data-days]').getAttribute('data-days')
        : null,
    }))
  );

  // Independent day arithmetic against ?today=2026-11-15:
  // 105 last payment 2026-09-15 -> 61; 104 2026-10-02 -> 44; 108 2026-10-03 -> 43; 102 2026-10-04 -> 42.
  expect(rows).toEqual([
    { phone: '9000000105', days: '61', daysAttribute: '61' },
    { phone: '9000000104', days: '44', daysAttribute: '44' },
    { phone: '9000000108', days: '43', daysAttribute: '43' },
    { phone: '9000000102', days: '42', daysAttribute: '42' },
  ]);
  expect(await page.locator('#overdue [data-customer]').count(), 'no data-customer inside #overdue').toBe(0);
  expect(await page.locator('#overdue [data-overdue]').count()).toBe(4);
  for (const row of rows) {
    expect(row.days).toMatch(/^\d+$/);
    expect(Number(row.days)).toBeGreaterThanOrEqual(30);
  }
  await expect(page.locator('#overdue-empty')).toBeHidden();

  await page.locator('#overdue').screenshot({ path: path.join(ARTIFACTS, 'p4-overdue.png') });

  // A customer with no payment at all is never listed; a positive balance with an old payment is.
  await importPaste(page, {
    shop: 'Overdue Edges',
    customers: [
      { name: 'No Pay', phone: '9000000201' },
      { name: 'Paid Long Ago', phone: '9000000202' },
    ],
    entries: [
      { phone: '9000000201', type: 'credit', amount: 100, date: '2026-09-01' },
      { phone: '9000000202', type: 'credit', amount: 100, date: '2026-09-01' },
      { phone: '9000000202', type: 'payment', amount: 10, date: '2026-09-10' },
    ],
  });
  await page.goto('/?today=2026-11-15');
  await expect(page.locator('#overdue [data-overdue]')).toHaveCount(1);
  expect(await page.locator('#overdue [data-overdue]').getAttribute('data-overdue')).toBe('9000000202');
  expect((await page.locator('#overdue [data-days]').textContent()).trim()).toBe('66');
  expect(await page.locator('#overdue [data-overdue="9000000201"]').count()).toBe(0);

  // Nobody overdue -> empty-state line, zero rows.
  await importPaste(page, {
    customers: [{ name: 'Recent Payer', phone: '9000000203' }],
    entries: [
      { phone: '9000000203', type: 'credit', amount: 100, date: '2026-10-01' },
      { phone: '9000000203', type: 'payment', amount: 10, date: '2026-11-01' },
    ],
  });
  await page.goto('/?today=2026-11-15');
  await expect(page.locator('#overdue [data-overdue]')).toHaveCount(0);
  await expect(page.locator('#overdue-empty')).toBeVisible();
  expect(((await page.locator('#overdue-empty').textContent()) || '').trim().length).toBeGreaterThan(0);

  await expectClean(diagnostics, expect);
});

// --- B2 ----------------------------------------------------------------------

test('E2E-P4-02 (C-36) edit 500->800 and delete: amounts, balances, total, id, image, reload, other customer untouched', async ({ page }) => {
  test.setTimeout(90000);
  const phone = '9000000301';
  const other = '9000000302';

  await page.goto('/');
  await addCustomer(page, 'Edit Tester', phone);
  await addCustomer(page, 'Other Person', other);

  await page.goto('/?customer=' + phone);
  const image = await makeImage(page, '500');
  await fillEntry(page, { amount: '500', type: 'payment', date: '2026-10-10', note: 'original' });
  await page.setInputFiles('#shot-input', { name: 'pay.jpg', mimeType: 'image/jpeg', buffer: image });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });

  const entryId = await page.locator('#entries [data-entry-id]').first().getAttribute('data-entry-id');
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1);

  await page.goto('/?customer=' + other);
  await fillEntry(page, { amount: '200', type: 'credit', date: '2026-10-01', note: 'other customer' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);

  await page.goto('/?customer=' + phone);
  await expect(page.locator('#entries [data-entry-id] button[data-edit-entry]')).toHaveCount(1);
  await expect(page.locator('#entries [data-entry-id] button[data-delete-entry]')).toHaveCount(1);

  // Edit amount, date and note; the stored screenshot must survive.
  await page.locator('#entries [data-entry-id="' + entryId + '"] button[data-edit-entry]').click();
  await expect(page.locator('#entry-amount')).toHaveValue('500');
  await page.fill('#entry-amount', '800');
  await page.fill('#entry-date', '2026-10-20');
  await page.fill('#entry-note', 'edited note');
  await page.click('#entry-save');

  await expect(page.locator('#entries [data-amount]')).toHaveText('800');
  expect(await page.locator('#entries [data-amount]').getAttribute('data-amount')).toBe('800');
  expect(await page.locator('#entries [data-entry-id]').first().getAttribute('data-entry-id')).toBe(entryId);
  await expect(page.locator('#entries [data-entry-id="' + entryId + '"] img[data-shot]')).toHaveCount(1);
  expect(await page.locator('#entries [data-entry-id="' + entryId + '"]').getAttribute('data-date')).toBe('2026-10-20');
  await expect(page.locator('#entries [data-entry-id="' + entryId + '"]')).toContainText('edited note');

  const balance = page.locator('[data-customer="' + phone + '"] [data-balance]');
  expect((await balance.textContent()).trim()).toBe('-800');
  expect(await balance.getAttribute('data-balance')).toBe('-800');
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('-800');
  expect(await page.locator('#cust-balance').getAttribute('data-balance')).toBe('-800');
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe('-600');
  // The other customer's balance never moved: 200 + (-800) = -600.
  const otherBalance = page.locator('[data-customer="' + other + '"] [data-balance]');
  expect((await otherBalance.textContent()).trim()).toBe('200');

  const reloaded = await open(page, '/?customer=' + phone);
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);
  expect(await page.locator('#entries [data-entry-id]').first().getAttribute('data-entry-id')).toBe(entryId);
  await expect(page.locator('#entries [data-amount]')).toHaveText('800');
  await expect(page.locator('#entries [data-entry-id="' + entryId + '"] img[data-shot]')).toHaveCount(1);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('-800');
  expect((await page.locator('[data-customer="' + other + '"] [data-balance]').textContent()).trim()).toBe('200');

  // Delete: the entry disappears, balances and total drop, and it persists.
  await page.locator('#entries [data-entry-id="' + entryId + '"] button[data-delete-entry]').click();
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(0);
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('0');
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe('200');
  expect((await page.locator('[data-customer="' + other + '"] [data-balance]').textContent()).trim()).toBe('200');

  const afterDelete = await open(page, '/?customer=' + phone);
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(0);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('0');
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe('200');

  await expectClean(reloaded.diagnostics, expect);
  await expectClean(afterDelete.diagnostics, expect);
});

// --- B3 ----------------------------------------------------------------------

test('E2E-P4-03 (C-29) CSV export: exact headers, one row each, newest-first entries, RFC-4180 quoting, current state', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);

  const shop = {
    shop: 'CSV Shop',
    customers: [
      { name: 'Plain Person', phone: '9000000401' },
      { name: 'Doe, Jane', phone: '9000000402' },
      { name: 'Quote "Q" Person', phone: '9000000403' },
    ],
    entries: [
      { phone: '9000000401', type: 'credit', amount: '1500', date: '2026-10-01', note: 'groceries' },
      { phone: '9000000401', type: 'payment', amount: '250.50', date: '2026-10-05', note: 'paid, on UPI' },
      { phone: '9000000402', type: 'credit', amount: '670.50', date: '2026-10-05', note: 'line one\nline two' },
      { phone: '9000000403', type: 'payment', amount: '100', date: '2026-10-05', note: 'said "thanks"' },
    ],
  };
  await importPaste(page, shop);
  await expect(page.locator('[data-customer]')).toHaveCount(3);

  const downloads = [];
  page.on('download', (download) => downloads.push(download));

  await page.click('#export-csv');
  await expect.poll(() => downloads.length, { timeout: 10000 }).toBe(2);

  const byName = new Map();
  for (const download of downloads) {
    const name = download.suggestedFilename();
    const destination = path.join(ARTIFACTS, 'p4-' + name);
    await download.saveAs(destination);
    byName.set(name, { text: fs.readFileSync(destination, 'utf8'), path: destination });
  }

  expect(Array.from(byName.keys()).sort()).toEqual(['customers.csv', 'entries.csv']);
  const customersCsv = byName.get('customers.csv').text;
  const entriesCsv = byName.get('entries.csv').text;

  const customerRows = parseCsv(customersCsv);
  expect(customerRows[0]).toEqual(['phone', 'name', 'credit', 'payment', 'balance']);
  expect(customerRows).toHaveLength(4);
  expect(customerRows.slice(1)).toEqual([
    ['9000000401', 'Plain Person', '1500', '250.50', '1249.50'],
    ['9000000402', 'Doe, Jane', '670.50', '0', '670.50'],
    ['9000000403', 'Quote "Q" Person', '0', '100', '-100'],
  ]);
  for (const row of customerRows.slice(1)) moneySnapshot(row.slice(2), 'customers.csv ' + row[0]);
  expect(customersCsv).toContain('"Doe, Jane"');
  expect(customersCsv).toContain('"Quote ""Q"" Person"');
  expect(customersCsv).not.toMatch(/Rs|₹/);

  const entryRows = parseCsv(entriesCsv);
  expect(entryRows[0]).toEqual(['phone', 'type', 'amount', 'date', 'note']);
  expect(entryRows).toHaveLength(5);
  expect(entryRows.slice(1)).toEqual([
    ['9000000403', 'payment', '100', '2026-10-05', 'said "thanks"'],
    ['9000000402', 'credit', '670.50', '2026-10-05', 'line one\nline two'],
    ['9000000401', 'payment', '250.50', '2026-10-05', 'paid, on UPI'],
    ['9000000401', 'credit', '1500', '2026-10-01', 'groceries'],
  ]);
  for (const row of entryRows.slice(1)) moneySnapshot([row[2]], 'entries.csv ' + row[0]);
  expect(entriesCsv).toContain('"paid, on UPI"');
  expect(entriesCsv).toContain('"said ""thanks"""');
  expect(entriesCsv).toContain('"line one\nline two"');
  expect(entriesCsv).not.toMatch(/Rs|₹/);

  // Current state, never the sample that was imported first.
  for (const phone of Object.keys(SAMPLE_EXPECTED.balances)) {
    expect(customersCsv).not.toContain(phone);
    expect(entriesCsv).not.toContain(phone);
  }
  await expect(page.locator('#export-msg')).toBeVisible();
  await page.screenshot({ path: path.join(ARTIFACTS, 'p4-csv.png') });

  await expectClean(diagnostics, expect);
});

// --- B4 ----------------------------------------------------------------------

test('E2E-P4-04 (C-30) search filters by name and phone, keeps total and state, restores on clear and reload', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);

  await expect(page.locator('#search')).toHaveValue('');
  expect((await visiblePhones(page)).length).toBe(8);
  const totalBefore = (await page.locator('#total-outstanding').textContent()).trim();
  expect(totalBefore).toBe('11820');

  await page.fill('#search', 'sunita');
  expect(await visiblePhones(page)).toEqual(['9000000102']);
  await expect(page.locator('#search-empty'), 'a matching query must not show the empty state').toBeHidden();
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe(totalBefore);
  await expect(page.locator('#import-box')).toBeVisible();
  await expect(page.locator('#import-go')).toBeVisible();

  await page.fill('#search', 'SUNITA');
  expect(await visiblePhones(page)).toEqual(['9000000102']);

  await page.fill('#search', '0104');
  expect(await visiblePhones(page)).toEqual(['9000000104']);

  await page.fill('#search', 'zzz-no-match');
  expect(await visiblePhones(page)).toEqual([]);
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe(totalBefore);
  expect(await page.locator('[data-customer]').count(), 'rows are hidden, never removed').toBe(8);
  await expect(page.locator('#search-empty'), 'a no-match query must show the empty state').toBeVisible();
  expect(((await page.locator('#search-empty').textContent()) || '').trim().length).toBeGreaterThan(0);
  await expect(page.locator('#search-empty')).toContainText('No customers');

  await page.fill('#search', '');
  expect((await visiblePhones(page)).length).toBe(8);
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe(totalBefore);
  await expect(page.locator('#search-empty'), 'clearing the query must hide the empty state').toBeHidden();

  const reloaded = await open(page, '/');
  expect((await visiblePhones(page)).length).toBe(8);
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe(totalBefore);

  await expectClean(reloaded.diagnostics, expect);
});

// --- B5 ----------------------------------------------------------------------

test('E2E-P4-05 (C-35) UPI pay links: one per row, am = max(balance,0), cu=INR once, tn decodes, default and shop VPA', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await importPaste(page, {
    shop: 'UPI Shop',
    customers: [
      { name: 'Ravi Kumar', phone: '9000000501' },
      { name: 'Anna & Sons', phone: '9000000502' },
      { name: 'Minus Person', phone: '9000000503' },
    ],
    entries: [
      { phone: '9000000501', type: 'credit', amount: 670, date: '2026-10-01' },
      { phone: '9000000502', type: 'credit', amount: 100, date: '2026-10-01' },
      { phone: '9000000502', type: 'payment', amount: 100, date: '2026-10-02' },
      { phone: '9000000503', type: 'payment', amount: '250.25', date: '2026-10-02' },
    ],
  });
  await expect(page.locator('[data-customer]')).toHaveCount(3);

  const expected = new Map([
    ['9000000501', { name: 'Ravi Kumar', amount: '670' }],
    ['9000000502', { name: 'Anna & Sons', amount: '0' }],
    ['9000000503', { name: 'Minus Person', amount: '0' }],
  ]);

  for (const [phone, expectation] of expected) {
    const row = page.locator('[data-customer="' + phone + '"]');
    const links = row.locator('a[href^="upi://pay?pa="]');
    await expect(links, phone + ' must have exactly one UPI link').toHaveCount(1);

    const href = await links.getAttribute('href');
    expect(href.startsWith('upi://pay?pa=')).toBe(true);
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    expect(query.get('pa')).toBe('hisaab@upi');
    expect(query.get('am')).toBe(expectation.amount);
    expect(query.get('cu')).toBe('INR');
    expect(query.get('tn')).toBe(expectation.name);
    expect(href.split('cu=INR').length - 1, 'cu=INR exactly once').toBe(1);
    expect(query.get('am')).toMatch(BARE);
  }

  await expect(page.locator('#upi-demo-note')).toBeVisible();
  await page.locator('#customers').screenshot({ path: path.join(ARTIFACTS, 'p4-upi.png') });
  fs.writeFileSync(
    path.join(ARTIFACTS, 'p4-upi-hrefs.txt'),
    await page.locator('[data-customer] a[href^="upi://pay?pa="]').evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute('href')).join('\n')
    )
  );

  // A shop VPA replaces the documented default for every row and hides the demo note.
  await page.fill('#shop-upi', 'myshop@bank');
  await page.dispatchEvent('#shop-upi', 'change');
  for (const phone of expected.keys()) {
    const href = await page.locator('[data-customer="' + phone + '"] a[href^="upi://pay?pa="]').getAttribute('href');
    const query = new URLSearchParams(href.slice(href.indexOf('?') + 1));
    expect(query.get('pa')).toBe('myshop@bank');
  }
  await expect(page.locator('#upi-demo-note')).toBeHidden();

  await expectClean(diagnostics, expect);
});

// --- B6 ----------------------------------------------------------------------

test('E2E-P4-06 (C-13/N-06) language switch translates labels and leaves every id, attribute, name, date, money text and href byte-identical', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  await page.goto('/?customer=9000000101');
  await expect(page.locator('#cust-name')).toHaveText('Ravi Kumar');
  await page.fill('#import-box', '{"sentinel":true}');

  const snapshot = () =>
    page.evaluate(() => {
      const text = (selector) => {
        const node = document.querySelector(selector);
        return node ? node.textContent.trim() : null;
      };
      const attribute = (selector, name) => {
        const node = document.querySelector(selector);
        return node ? node.getAttribute(name) : null;
      };
      return {
        total: { text: text('#total-outstanding'), value: attribute('#total-outstanding', 'data-value') },
        rows: Array.from(document.querySelectorAll('[data-customer]'))
          .map((row) => {
            const balance = row.querySelector('[data-balance]');
            const reminder = row.querySelector('[data-remind]');
            const upi = row.querySelector('a[href^="upi://pay?pa="]');
            return {
              phone: row.getAttribute('data-customer'),
              balance: balance ? [balance.textContent.trim(), balance.getAttribute('data-balance')] : null,
              reminder: reminder ? reminder.getAttribute('href') : null,
              upi: upi ? upi.getAttribute('href') : null,
              open: row.querySelector('a[href^="?customer="]')
                ? row.querySelector('a[href^="?customer="]').getAttribute('href')
                : null,
            };
          })
          .sort((left, right) => (left.phone < right.phone ? -1 : 1)),
        entryTypes: Array.from(document.querySelectorAll('#entry-type option')).map((option) => option.value),
        entryCustomerValues: Array.from(document.querySelectorAll('#entry-customer option')).map((option) => option.value),
        entries: Array.from(document.querySelectorAll('#entries [data-entry-id]')).map((entry) => ({
          id: entry.getAttribute('data-entry-id'),
          type: entry.getAttribute('data-type'),
          date: entry.getAttribute('data-date'),
          amount: entry.querySelector('[data-amount]')
            ? [entry.querySelector('[data-amount]').textContent.trim(), entry.querySelector('[data-amount]').getAttribute('data-amount')]
            : null,
          note: entry.querySelector('.entry-note') ? entry.querySelector('.entry-note').textContent : null,
        })),
        langValues: Array.from(document.querySelectorAll('#lang-switch option')).map((option) => option.value),
        importBox: document.getElementById('import-box').value,
        custName: text('#cust-name'),
        custBalance: [text('#cust-balance'), attribute('#cust-balance', 'data-balance')],
        ids: [
          'total-outstanding', 'new-name', 'new-phone', 'add-customer', 'entry-form', 'entry-type',
          'entry-amount', 'entry-date', 'entry-note', 'entry-save', 'shot-input', 'import-box',
          'import-go', 'import-msg', 'search', 'export-csv', 'lang-switch', 'overdue', 'customers',
        ].map((id) => document.querySelectorAll('#' + id).length),
      };
    });

  const english = await snapshot();
  const englishLabels = {
    overdue: (await page.locator('#overdue-title').textContent()).trim(),
    addCustomer: (await page.locator('#add-customer').textContent()).trim(),
    save: (await page.locator('#entry-save').textContent()).trim(),
    search: (await page.locator('label[for="search"]').textContent()).trim(),
    demoNote: (await page.locator('#upi-demo-note').textContent()).trim(),
  };
  expect(await page.locator('#lang-switch')).toHaveValue('en');
  expect(englishLabels.overdue).toContain('Overdue');
  expect(englishLabels.save).toBe('Save');
  // BUG-1 regression: the demo UPI note is a visible label and must be the English
  // string on `en`, then translate like every other label.
  await expect(page.locator('#upi-demo-note')).toBeVisible();
  expect(englishLabels.demoNote).toBe('Demo UPI ID \u2014 set your shop UPI ID');

  const labels = {};
  for (const language of ['hi', 'te']) {
    await page.selectOption('#lang-switch', language);
    await expect(page.locator('#lang-switch')).toHaveValue(language);

    const current = {
      overdue: (await page.locator('#overdue-title').textContent()).trim(),
      addCustomer: (await page.locator('#add-customer').textContent()).trim(),
      save: (await page.locator('#entry-save').textContent()).trim(),
      search: (await page.locator('label[for="search"]').textContent()).trim(),
      demoNote: (await page.locator('#upi-demo-note').textContent()).trim(),
    };
    labels[language] = current;
    expect(current.overdue, language + ' overdue heading must translate').not.toBe(englishLabels.overdue);
    expect(current.save, language + ' save label must translate').not.toBe(englishLabels.save);
    expect(current.addCustomer, language + ' add-customer label must translate').not.toBe(englishLabels.addCustomer);
    expect(current.search, language + ' search label must translate').not.toBe(englishLabels.search);
    expect(current.demoNote.length, language + ' demo UPI note must not be empty').toBeGreaterThan(0);
    expect(current.demoNote, language + ' demo UPI note must translate (BUG-1 regression)').not.toBe(
      englishLabels.demoNote
    );
    expect(current.overdue).toContain('Overdue');

    // Everything machine-readable is byte-identical to English.
    expect(await snapshot(), language + ' must not change ids, attributes, names, dates, money or hrefs').toEqual(english);

    await page.screenshot({ path: path.join(ARTIFACTS, 'p4-lang-' + language + '.png') });
  }

  fs.writeFileSync(
    path.join(ARTIFACTS, 'p4-lang-labels.txt'),
    [
      'en: ' + JSON.stringify(englishLabels),
      'hi: ' + JSON.stringify(labels.hi),
      'te: ' + JSON.stringify(labels.te),
    ].join('\n')
  );

  const reloaded = await open(page, '/');
  expect(await page.locator('#lang-switch')).toHaveValue('en');
  expect((await page.locator('#entry-save').textContent()).trim()).toBe('Save');
  expect((await page.locator('#overdue-title').textContent()).trim()).toContain('Overdue');

  await expectClean(diagnostics, expect);
  await expectClean(reloaded.diagnostics, expect);
});

// --- B7 ----------------------------------------------------------------------

test('E2E-P4-07 (C-38) OCR fallback: upload does not block or overwrite; manual amount saves', async ({ page }) => {
  test.setTimeout(60000);
  const phone = '9000000701';
  await page.goto('/');
  await addCustomer(page, 'OCR Fallback', phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  const image = await makeImage(page, '1500');

  await expect(page.locator('#entry-save')).toBeEnabled();
  await page.setInputFiles('#shot-input', { name: 'amount.png', mimeType: 'image/png', buffer: image });

  // Bounded wait: no OCR engine is required (D5). The field may stay empty; if it
  // is prefilled, it must be the OCR value, never something else.
  await page.waitForTimeout(1500);
  const afterUpload = await page.inputValue('#entry-amount');
  expect(['', '1500']).toContain(afterUpload);
  await expect(page.locator('#entry-save')).toBeEnabled();
  await expect(page.locator('#entry-save')).toBeVisible();

  // Typing before an upload must never be overwritten.
  await page.fill('#entry-amount', '999');
  await page.setInputFiles('#shot-input', { name: 'amount-again.png', mimeType: 'image/png', buffer: image });
  await page.waitForTimeout(1500);
  expect(await page.inputValue('#entry-amount')).toBe('999');
  await expect(page.locator('#entry-save')).toBeEnabled();

  await page.screenshot({ path: path.join(ARTIFACTS, 'p4-ocr-fallback.png') });
  fs.writeFileSync(
    path.join(ARTIFACTS, 'p4-ocr-fallback.txt'),
    'OCR prefill after upload: ' + JSON.stringify(afterUpload) + '\n' +
      'Typed value preserved: "999"\n' +
      'Engine: none shipped (D5 manual fallback); #entry-save stayed enabled\n'
  );

  await page.selectOption('#entry-type', 'payment');
  await page.fill('#entry-date', '2026-10-10');
  await page.fill('#entry-note', 'manual amount');
  await page.click('#entry-save');

  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });
  const amount = await page.locator('#entries [data-amount]').first().evaluate((node) => ({
    text: node.textContent.trim(),
    attribute: node.getAttribute('data-amount'),
  }));
  expect(amount).toEqual({ text: '999', attribute: '999' });

  await expectClean(diagnostics, expect);
});
