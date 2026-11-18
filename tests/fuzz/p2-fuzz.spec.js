'use strict';

// F-01: 50 generated shops, imported through the real UI, compared against an
// independent expectation computed here from the contract rules (D4, D9, D10, D11).
// Nothing in this file imports or mirrors app/ code; the money, phone, name, type
// and date rules are re-implemented from CONTRACT.md §3.2 and §4.

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

const SEED = 20261117;
const DATASETS = 50;
const TODAY = '2026-11-15';
const MAX_PAISE = 9000000000000000;

const NAMES = [
  'Ravi Kumar',
  'ravi kumar',
  'Sunita Devi',
  'రవి',
  'रवि',
  'Anna & Sons',
  '  Spaced   Name  ',
  'Zero Entry',
  'Dev & Co',
];
const PHONES = ['9000000101', 9000000102, '9000000103', '9000000104', '9000000105', '919000000106', '+91 9000000107'];
const AMOUNTS = [250, 1000, 'Rs 1,500', '1,500', '670.50', '12.345', '0.05', -250, '₹ 99.99', 250000.5, '0', 0.5, '2,500.75'];
const TYPES = ['credit', 'CREDIT', 'Credit', 'payment', 'PAID', 'paid', 'debit', 'gave', 'udhaar', 'received', 'mystery', ''];
const DATES = ['2026-10-01', '2026-10-01', '2026-10-05', '2026-10-05', '2026-09-30'];
const NOTES = ['groceries', 'paid on UPI', 'రవి నోట్', '', 'x,y"z'];

function mulberry32(seed) {
  let state = seed | 0;
  return function next() {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick(rnd, list) {
  return list[Math.floor(rnd() * list.length)];
}

// --- Independent oracle (CONTRACT §3.2, §3.3, §4, D9, D10, D11) ---------------

function normalizePhone(value) {
  let text = value === null || value === undefined ? '' : String(value).trim();
  if (text.charAt(0) === '+') text = text.slice(1);
  let digits = text.replace(/[^0-9]/g, '');
  if (digits.length === 12 && digits.slice(0, 2) === '91') digits = digits.slice(2);
  return digits;
}

function normalizeName(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'object') return '';
  return String(value).normalize('NFC').replace(/\s+/g, ' ').trim();
}

function parsePaise(raw) {
  if (raw === null || raw === undefined) return 0;
  if (typeof raw === 'object') return 0;
  let text = String(raw);
  text = text.replace(/\u20B9/g, '');
  text = text.replace(/rs/gi, '');
  text = text.replace(/inr/gi, '');
  text = text.replace(/[\s\u00A0]+/g, '');
  text = text.split(',').join('');
  if (text.charAt(0) === '+') text = text.slice(1);
  if (!/^-?[0-9]+(\.[0-9]+)?$/.test(text)) return 0;
  if (text.charAt(0) === '-') text = text.slice(1);
  const dot = text.indexOf('.');
  const integerPart = (dot === -1 ? text : text.slice(0, dot)).replace(/^0+(?=\d)/, '');
  const fraction = dot === -1 ? '' : text.slice(dot + 1);
  let paise = fraction === '' ? 0 : Number(fraction.slice(0, 2).padEnd(2, '0'));
  if (fraction.length > 2 && fraction.charAt(2) >= '5') paise += 1;
  if (integerPart.length > 14) return MAX_PAISE;
  const total = Number(integerPart || '0') * 100 + paise;
  return total > MAX_PAISE ? MAX_PAISE : total;
}

function mapType(raw) {
  const text = raw === null || raw === undefined ? '' : String(raw).trim().toLowerCase();
  if (!text) return 'credit';
  if (text.indexOf('credit') === 0 || text.indexOf('debit') === 0 || text === 'gave' || text === 'udhaar') {
    return 'credit';
  }
  if (text.indexOf('payment') === 0 || text.indexOf('paid') === 0 || text === 'received') {
    return 'payment';
  }
  return 'credit';
}

function render(paise) {
  const sign = paise < 0 ? '-' : '';
  const absolute = Math.abs(paise);
  const rupees = Math.floor(absolute / 100);
  const remainder = absolute % 100;
  return sign + rupees + (remainder === 0 ? '' : '.' + String(remainder).padStart(2, '0'));
}

function expectedShop(shop) {
  const balances = new Map();
  const names = new Map();
  const duplicatePhones = new Set();

  const customers = Array.isArray(shop.customers) ? shop.customers : [];
  for (const record of customers) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
    const phone = normalizePhone(record.phone);
    if (!phone) continue;
    const name = normalizeName(record.name);
    if (!balances.has(phone)) {
      balances.set(phone, 0);
      names.set(phone, name);
      continue;
    }
    if (!name) {
      // A later record with no name keeps the earlier name and warns as a duplicate
      // phone (BUG-2 fix): only when an earlier non-empty name exists.
      if (names.get(phone)) duplicatePhones.add(phone);
      continue;
    }
    {
      const existing = names.get(phone);
      if (existing && existing.toLowerCase() !== name.toLowerCase()) duplicatePhones.add(phone);
      names.set(phone, name);
    }
  }

  const entries = Array.isArray(shop.entries) ? shop.entries : [];
  for (const record of entries) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) continue;
    const phone = normalizePhone(record.phone);
    if (!phone) continue;
    if (!balances.has(phone)) {
      balances.set(phone, 0);
      names.set(phone, 'Customer ' + phone);
    }
    const amount = parsePaise(record.amount);
    balances.set(phone, balances.get(phone) + (mapType(record.type) === 'payment' ? -amount : amount));
  }

  let total = 0;
  for (const value of balances.values()) total += value;

  return { balances, total, duplicatePhones: Array.from(duplicatePhones) };
}

// --- Dataset generation -------------------------------------------------------

const COVERAGE_SHOP = {
  shop: 'Coverage Shop',
  customers: [
    { name: 'Ravi Kumar', phone: '9000000101' },
    { name: 'Ravi Kumar', phone: '9000000101' },
    { name: 'Ravi K Sharma', phone: '9000000101' },
    { name: 'Same Name', phone: '9000000102' },
    { name: 'Same Name', phone: '9000000103' },
    { name: 'Zero Entry', phone: '9000000104' },
    { name: 'రవి', phone: '919000000105' },
  ],
  entries: [
    { phone: '9000000101', type: 'CREDIT', amount: 'Rs 1,500', date: '2026-10-01' },
    { phone: '9000000101', type: 'debit', amount: '1,500', date: '2026-10-01' },
    { phone: '9000000101', type: 'payment', amount: '670.50', date: '2026-10-03' },
    { phone: '9000000101', type: 'PAID', amount: '12.345', date: '2026-10-03' },
    { phone: '9000000109', type: 'udhaar', amount: 250, date: '2026-10-05' },
    { phone: '9000000102', type: 'mystery', amount: 100 },
    { phone: '9000000103', amount: 10, date: '2026-10-05' },
    { phone: '9000000101', type: 'received', amount: 250000.5, date: '2026-10-05' },
  ],
};

const EMPTY_SHOP = { shop: 'Empty Shop', customers: [], entries: [] };

function randomShop(rnd, index, amounts) {
  const pool = amounts || AMOUNTS;
  const customerCount = Math.floor(rnd() * 7);
  const entryCount = Math.floor(rnd() * 13);
  const customers = [];
  const entries = [];

  for (let i = 0; i < customerCount; i += 1) {
    customers.push({ name: pick(rnd, NAMES), phone: pick(rnd, PHONES) });
  }
  for (let i = 0; i < entryCount; i += 1) {
    const entry = {};
    entry.phone = rnd() < 0.18 ? '90000001' + String(80 + Math.floor(rnd() * 15)) : pick(rnd, PHONES);
    if (rnd() > 0.08) entry.type = pick(rnd, TYPES);
    if (rnd() > 0.1) entry.amount = pick(rnd, pool);
    if (rnd() > 0.2) entry.date = pick(rnd, DATES);
    if (rnd() > 0.4) entry.note = pick(rnd, NOTES);
    entries.push(entry);
  }

  const shop = {};
  if (index % 2 === 0) shop.shop = 'Fuzz Shop ' + index;
  shop.customers = customers;
  shop.entries = entries;
  return shop;
}

function buildDatasets() {
  const shops = [COVERAGE_SHOP, EMPTY_SHOP];
  for (let index = 2; index < DATASETS; index += 1) {
    shops.push(randomShop(mulberry32(SEED + index), index));
  }
  return shops;
}

// --- The run ------------------------------------------------------------------

test('F-01 50-shop fuzz: every balance and the total equal the independent computation', async ({ page }) => {
  test.setTimeout(240000);

  const shops = buildDatasets();
  expect(shops).toHaveLength(DATASETS);

  // Evidence that the generated set actually covers the hostile mixes F-01 names.
  const coverage = {
    shops: shops.length,
    customers: 0,
    entries: 0,
    duplicatePhoneShops: 0,
    negativeBalanceRows: 0,
    zeroBalanceRows: 0,
    unknownPhoneEntries: 0,
    unicodeNames: 0,
    stringAmounts: 0,
    missingAmounts: 0,
    missingTypes: 0,
    missingDates: 0,
    negativeTotalShops: 0,
    emptyShops: 0,
  };
  for (const shop of shops) {
    const customers = Array.isArray(shop.customers) ? shop.customers : [];
    const entries = Array.isArray(shop.entries) ? shop.entries : [];
    const expected = expectedShop(shop);
    coverage.customers += customers.length;
    coverage.entries += entries.length;
    if (expected.duplicatePhones.length) coverage.duplicatePhoneShops += 1;
    if (expected.total < 0) coverage.negativeTotalShops += 1;
    if (expected.balances.size === 0) coverage.emptyShops += 1;
    for (const balance of expected.balances.values()) {
      if (balance < 0) coverage.negativeBalanceRows += 1;
      if (balance === 0) coverage.zeroBalanceRows += 1;
    }
    for (const customer of customers) {
      if (/[^\x00-\x7F]/.test(String(customer.name))) coverage.unicodeNames += 1;
    }
    const known = new Set(customers.map((customer) => normalizePhone(customer.phone)).filter(Boolean));
    for (const entry of entries) {
      if (!known.has(normalizePhone(entry.phone))) coverage.unknownPhoneEntries += 1;
      if (typeof entry.amount === 'string') coverage.stringAmounts += 1;
      if (!('amount' in entry)) coverage.missingAmounts += 1;
      if (!('type' in entry)) coverage.missingTypes += 1;
      if (!('date' in entry)) coverage.missingDates += 1;
    }
  }
  console.log('F-01 seed ' + SEED + ' datasets ' + DATASETS + ' :: ' + JSON.stringify(coverage));

  const { diagnostics } = await open(page, '/?today=' + TODAY);

  for (let index = 0; index < shops.length; index += 1) {
    const shop = shops[index];
    const expected = expectedShop(shop);
    const payload = JSON.stringify(shop);

    await page.evaluate((text) => {
      document.getElementById('import-box').value = text;
      document.getElementById('import-go').click();
    }, payload);

    const rendered = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[data-customer]')).map((row) => {
        const balance = row.querySelector('[data-balance]');
        return {
          phone: row.getAttribute('data-customer'),
          text: balance ? balance.textContent.trim() : null,
          attribute: balance ? balance.getAttribute('data-balance') : null,
        };
      });
      const total = document.getElementById('total-outstanding');
      const message = document.getElementById('import-msg');
      return {
        rows,
        total: total.textContent.trim(),
        totalAttribute: total.getAttribute('data-value'),
        message: message ? message.textContent.trim() : '',
        bodyText: document.body.textContent,
      };
    });

    const label = 'dataset ' + index + ' (seed ' + SEED + ')';

    expect(rendered.message, label + ' must not reject a valid shop').not.toContain('Could not import');
    expect(rendered.rows.length, label + ' row count must equal the customer count').toBe(expected.balances.size);
    expect(rendered.bodyText, label + ' must not leak NaN/undefined').not.toMatch(/undefined|NaN/);

    const renderedPhones = rendered.rows.map((row) => row.phone).sort();
    expect(renderedPhones, label + ' row keys').toEqual(Array.from(expected.balances.keys()).sort());

    for (const row of rendered.rows) {
      const expectedBalance = expected.balances.get(row.phone);
      expect(typeof expectedBalance, label + ' unexpected row ' + row.phone).toBe('number');
      const expectedText = render(expectedBalance);
      expect(row.text, label + ' ' + row.phone + ' balance text').toBe(expectedText);
      expect(row.attribute, label + ' ' + row.phone + ' balance attribute').toBe(expectedText);
    }

    const expectedTotal = render(expected.total);
    expect(rendered.total, label + ' total').toBe(expectedTotal);
    expect(rendered.totalAttribute, label + ' total data-value').toBe(expectedTotal);

    for (const phone of expected.duplicatePhones) {
      expect(rendered.message, label + ' duplicate warning for ' + phone).toContain('duplicate');
      expect(rendered.message, label + ' duplicate warning names ' + phone).toContain(phone);
    }
    if (expected.duplicatePhones.length === 0) {
      expect(rendered.message, label + ' must not warn about duplicates').not.toContain('duplicate');
    }

    expect(rendered.total, label + ' machine shape').toMatch(/^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/);
    expect(rendered.total, label + ' no decoration').not.toMatch(/[Rs₹,\s+]/);
  }

  await expectClean(diagnostics, expect);
});


// --- F-02: 200-shop hardening fuzz ------------------------------------------
// Same oracle as F-01, plus: a 200-customer shop, a later empty-name duplicate,
// a clamped value, large amounts and a wider hostile mix.

const P6_SEED = 20261118;
const P6_DATASETS = 200;
const P6_AMOUNTS = AMOUNTS.concat(['5000000.75', 99999999, '3,00,000.50']);

const P6_COVERAGE_SHOP = {
  shop: 'P6 Coverage',
  customers: [
    { name: 'Ravi Kumar', phone: '9000000101' },
    { name: 'Ravi Kumar', phone: '9000000101' }, // exact duplicate
    { name: 'Ravi K Sharma', phone: '9000000101' }, // same phone, different name
    { name: '', phone: '9000000101' }, // later empty name (P6 hardening)
    { name: 'Same Name', phone: '9000000102' },
    { name: 'Same Name', phone: '9000000103' }, // same name, different phones
    { name: 'Zero Entry', phone: '9000000104' },
    { name: 'రవి', phone: '919000000105' }, // 12-digit 91-prefixed phone
    { name: '', phone: '9000000106' }, // empty name only
  ],
  entries: [
    { phone: '9000000101', type: 'CREDIT', amount: '99999999999999999', date: '2026-10-01' }, // clamped
    { phone: '9000000101', type: 'payment', amount: '670.50', date: '2026-10-03' },
    { phone: '9000000101', type: 'credit', amount: 5, date: '2026-10-08' },
    { phone: '9000000101', type: 'credit', amount: 7, date: '2026-10-08' }, // same-date tie
    { phone: '9000000109', type: 'udhaar', amount: 250, date: '2026-10-05' }, // unknown phone
    { phone: '9000000102', type: 'mystery', amount: '5000000.75' }, // unknown type, missing date
    { phone: '9000000103', amount: 10, date: '2026-10-05' }, // missing type
    { phone: '9000000106', type: 'received', amount: 99999999, date: '2026-10-05' },
  ],
};

function build200Shop() {
  const longName = 'రవి'.repeat(14) + 'x'; // 43 characters
  const longNote = 'న'.repeat(100);
  const customers = [];
  const entries = [];
  for (let index = 0; index < 200; index += 1) {
    const phone = String(9000020000 + index);
    customers.push({ name: longName + index, phone });
    if (index % 10 === 0) continue; // zero-entry customer
    entries.push({
      phone,
      type: index % 3 === 0 ? 'payment' : 'credit',
      amount: index % 2 === 0 ? '250000.50' : 5000000.75,
      date: '2026-10-05',
      note: longNote,
    });
  }
  customers.push({ name: 'Duplicate Name', phone: '9000020000' }); // same phone, different name
  customers.push({ name: '', phone: '9000020001' }); // later empty name
  entries.push({ phone: '9000029999', type: 'credit', amount: 77, date: '2026-10-05' }); // unknown phone
  return { shop: 'P6 200 Customers', customers, entries };
}

function buildP6Datasets() {
  const shops = [P6_COVERAGE_SHOP, EMPTY_SHOP, build200Shop()];
  for (let index = 3; index < P6_DATASETS; index += 1) {
    shops.push(randomShop(mulberry32(P6_SEED + index), index, P6_AMOUNTS));
  }
  return shops;
}

test('F-02 200-shop fuzz (hardening): every balance and total equal the independent computation', async ({ page }) => {
  test.setTimeout(300000);

  const shops = buildP6Datasets();
  expect(shops).toHaveLength(P6_DATASETS);

  const coverage = {
    shops: shops.length,
    customers: 0,
    entries: 0,
    duplicatePhoneShops: 0,
    emptyNameDuplicateRecords: 0,
    clampedEntries: 0,
    negativeBalanceRows: 0,
    zeroBalanceRows: 0,
    unknownPhoneEntries: 0,
    unicodeNames: 0,
    stringAmounts: 0,
    missingAmounts: 0,
    missingTypes: 0,
    missingDates: 0,
    negativeTotalShops: 0,
    emptyShops: 0,
    customersInLargestShop: 0,
  };
  for (const shop of shops) {
    const customers = Array.isArray(shop.customers) ? shop.customers : [];
    const entries = Array.isArray(shop.entries) ? shop.entries : [];
    const expected = expectedShop(shop);
    coverage.customers += customers.length;
    coverage.entries += entries.length;
    coverage.customersInLargestShop = Math.max(coverage.customersInLargestShop, customers.length);
    if (expected.duplicatePhones.length) coverage.duplicatePhoneShops += 1;
    if (expected.total < 0) coverage.negativeTotalShops += 1;
    if (expected.balances.size === 0) coverage.emptyShops += 1;
    for (const balance of expected.balances.values()) {
      if (balance < 0) coverage.negativeBalanceRows += 1;
      if (balance === 0) coverage.zeroBalanceRows += 1;
    }
    const seen = new Set();
    for (const customer of customers) {
      if (/[^\x00-\x7F]/.test(String(customer.name))) coverage.unicodeNames += 1;
      const phone = normalizePhone(customer.phone);
      if (phone && seen.has(phone) && String(customer.name || '').trim() === '') {
        coverage.emptyNameDuplicateRecords += 1;
      }
      if (phone) seen.add(phone);
    }
    const known = new Set(customers.map((customer) => normalizePhone(customer.phone)).filter(Boolean));
    for (const entry of entries) {
      if (!known.has(normalizePhone(entry.phone))) coverage.unknownPhoneEntries += 1;
      if (typeof entry.amount === 'string') coverage.stringAmounts += 1;
      if (!('amount' in entry)) coverage.missingAmounts += 1;
      if (!('type' in entry)) coverage.missingTypes += 1;
      if (!('date' in entry)) coverage.missingDates += 1;
      if (parsePaise(entry.amount) === MAX_PAISE) coverage.clampedEntries += 1;
    }
  }
  console.log('F-02 seed ' + P6_SEED + ' datasets ' + P6_DATASETS + ' :: ' + JSON.stringify(coverage));

  const { diagnostics } = await open(page, '/?today=' + TODAY);

  for (let index = 0; index < shops.length; index += 1) {
    const shop = shops[index];
    const expected = expectedShop(shop);
    const payload = JSON.stringify(shop);

    await page.evaluate((text) => {
      document.getElementById('import-box').value = text;
      document.getElementById('import-go').click();
    }, payload);

    const rendered = await page.evaluate(() => {
      const rows = Array.from(document.querySelectorAll('[data-customer]')).map((row) => {
        const balance = row.querySelector('[data-balance]');
        return {
          phone: row.getAttribute('data-customer'),
          text: balance ? balance.textContent.trim() : null,
          attribute: balance ? balance.getAttribute('data-balance') : null,
        };
      });
      const total = document.getElementById('total-outstanding');
      const message = document.getElementById('import-msg');
      return {
        rows,
        total: total.textContent.trim(),
        totalAttribute: total.getAttribute('data-value'),
        message: message ? message.textContent.trim() : '',
        bodyText: document.body.textContent,
      };
    });

    const label = 'F-02 dataset ' + index + ' (seed ' + P6_SEED + ')';

    expect(rendered.message, label + ' must not reject a valid shop').not.toContain('Could not import');
    expect(rendered.rows.length, label + ' row count must equal the customer count').toBe(expected.balances.size);
    expect(rendered.bodyText, label + ' must not leak NaN/undefined').not.toMatch(/undefined|NaN/);

    const renderedPhones = rendered.rows.map((row) => row.phone).sort();
    expect(renderedPhones, label + ' row keys').toEqual(Array.from(expected.balances.keys()).sort());

    for (const row of rendered.rows) {
      const expectedBalance = expected.balances.get(row.phone);
      expect(typeof expectedBalance, label + ' unexpected row ' + row.phone).toBe('number');
      const expectedText = render(expectedBalance);
      expect(row.text, label + ' ' + row.phone + ' balance text').toBe(expectedText);
      expect(row.attribute, label + ' ' + row.phone + ' balance attribute').toBe(expectedText);
    }

    const expectedTotal = render(expected.total);
    expect(rendered.total, label + ' total').toBe(expectedTotal);
    expect(rendered.totalAttribute, label + ' total data-value').toBe(expectedTotal);
    expect(rendered.total, label + ' machine shape').toMatch(/^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/);
    expect(rendered.total, label + ' no decoration').not.toMatch(/[Rs₹,\s+]/);

    for (const phone of expected.duplicatePhones) {
      expect(rendered.message, label + ' duplicate warning for ' + phone).toContain('duplicate');
      expect(rendered.message, label + ' duplicate warning names ' + phone).toContain(phone);
    }
    if (expected.duplicatePhones.length === 0) {
      expect(rendered.message, label + ' must not warn about duplicates').not.toContain('duplicate');
    }
  }

  await expectClean(diagnostics, expect);
});
