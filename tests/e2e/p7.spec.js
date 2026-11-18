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

async function importPaste(page, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  await page.locator('#import-box').evaluate((element, next) => {
    element.value = next;
  }, text);
  await page.click('#import-go');
}

async function importFile(page, name, text, mimeType) {
  await page.setInputFiles('#import-file', {
    name,
    mimeType: mimeType || (name.endsWith('.csv') ? 'text/csv' : 'application/json'),
    buffer: Buffer.from(text, 'utf8'),
  });
  // The app reads the file asynchronously and resets the input only after the import
  // (success or refusal) has been applied, so an empty file list is the completion signal.
  await expect
    .poll(() => page.$eval('#import-file', (element) => element.files.length), { timeout: 15000 })
    .toBe(0);
}

async function readShop(page) {
  return page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll('[data-customer]')).map((row) => {
      const balance = row.querySelector('[data-balance]');
      return {
        phone: row.getAttribute('data-customer'),
        name: row.querySelector('.customer-name') ? row.querySelector('.customer-name').textContent.trim() : null,
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
}

async function makeLogo(page, color) {
  const dataUrl = await page.evaluate((fill) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext('2d');
    context.fillStyle = fill;
    context.fillRect(0, 0, 320, 320);
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(160, 160, 90, 0, Math.PI * 2);
    context.fill();
    return canvas.toDataURL('image/png');
  }, color);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function makeShot(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 900;
    canvas.height = 700;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 900, 700);
    context.fillStyle = '#0A5';
    context.fillRect(60, 60, 780, 580);
    return canvas.toDataURL('image/jpeg', 0.85);
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

function expectedUpi(name, amount) {
  return 'upi://pay?pa=hisaab@upi&am=' + amount + '&cu=INR&tn=' + encodeURIComponent(name);
}

// --- E2E-P7-01: JSON file import --------------------------------------------

test('E2E-P7-01 JSON import via #import-file, #import-choose and empty #import-go; paste still imports', async ({ page }) => {
  test.setTimeout(90000);
  const { diagnostics } = await open(page, '/');

  await expect(page.locator('#import-file')).toBeHidden();
  await expect(page.locator('#import-choose')).toBeVisible();

  // #import-choose opens the picker; the chosen JSON file imports the sample.
  const chooserByButton = page.waitForEvent('filechooser');
  await page.click('#import-choose');
  const buttonChooser = await chooserByButton;
  await buttonChooser.setFiles({
    name: 'sample.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(SAMPLE), 'utf8'),
  });

  await expect(page.locator('[data-customer]')).toHaveCount(8, { timeout: 15000 });
  let shop = await readShop(page);
  expect(shop.total).toBe('11820');
  expect(shop.totalAttribute).toBe('11820');
  expect(shop.message).toContain(SAMPLE.shop);
  for (const [phone, balance] of Object.entries(SAMPLE_EXPECTED.balances)) {
    const row = shop.rows.find((entry) => entry.phone === phone);
    expect(row, phone + ' row').toBeTruthy();
    expect(row.text).toBe(String(balance));
    expect(row.attribute).toBe(String(balance));
  }

  // An empty #import-go opens the same picker.
  await page.fill('#import-box', '');
  const chooserByGo = page.waitForEvent('filechooser');
  await page.click('#import-go');
  const goChooser = await chooserByGo;
  await goChooser.setFiles({
    name: 'second.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({
      shop: 'File Second Shop',
      customers: [
        { name: 'Asha', phone: '9111111111' },
        { name: 'Bala', phone: '9111111112' },
      ],
      entries: [
        { phone: '9111111111', type: 'credit', amount: 1000, date: '2026-10-01' },
        { phone: '9111111112', type: 'payment', amount: '250.50', date: '2026-10-02' },
      ],
    }), 'utf8'),
  });

  await expect(page.locator('[data-customer]')).toHaveCount(2, { timeout: 15000 });
  shop = await readShop(page);
  expect(shop.total).toBe('749.50');
  expect(shop.rows.map((row) => row.phone).sort()).toEqual(['9111111111', '9111111112']);

  await page.reload();
  await expect(page.locator('[data-customer]')).toHaveCount(2);
  expect((await readShop(page)).total).toBe('749.50');

  // A non-empty #import-go still imports the pasted text.
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  expect((await readShop(page)).total).toBe('11820');

  await expectClean(diagnostics, expect);
});

// --- E2E-P7-02: CSV import ---------------------------------------------------

test('E2E-P7-02 CSV import: primary schema, quoted fields, customers-only, entries-only, malformed and empty', async ({ page }) => {
  test.setTimeout(90000);
  const { diagnostics } = await open(page, '/');

  // Primary schema: BOM, CRLF, comma/quote/newline inside quoted fields, filename-derived shop.
  const primary =
    '\uFEFFphone,name,type,amount,date,note\r\n' +
    '9000000601,"Doe, Jane",credit,"1,500",2026-10-01,"said ""hi"""\r\n' +
    '9000000601,"Doe, Jane",payment,250.50,2026-10-02,"line one\nline two"\r\n' +
    '9000000602,Plain,credit,670.50,2026-10-03,note\r\n';
  await importFile(page, 'shop-a.csv', primary);

  await expect(page.locator('[data-customer]')).toHaveCount(2, { timeout: 15000 });
  let shop = await readShop(page);
  expect(shop.rows.map((row) => row.phone).sort()).toEqual(['9000000601', '9000000602']);
  expect(shop.rows.find((row) => row.phone === '9000000601')).toMatchObject({
    name: 'Doe, Jane',
    text: '1249.50',
    attribute: '1249.50',
  });
  expect(shop.rows.find((row) => row.phone === '9000000602')).toMatchObject({
    name: 'Plain',
    text: '670.50',
    attribute: '670.50',
  });
  expect(shop.total).toBe('1920');
  expect(shop.totalAttribute).toBe('1920');
  expect(shop.message).toContain('shop-a');
  expect(shop.bodyText).toContain('Doe, Jane');

  // Customers-only fallback, with a shop column and a quoted comma in the name.
  const customersOnly = 'phone,name,shop\n9000000603,"Ana, Maria",Shop B\n9000000604,Bob,Shop B\n';
  await importFile(page, 'customers.csv', customersOnly);
  await expect(page.locator('[data-customer]')).toHaveCount(2, { timeout: 15000 });
  shop = await readShop(page);
  expect(shop.rows.map((row) => row.phone).sort()).toEqual(['9000000603', '9000000604']);
  expect(shop.rows.every((row) => row.text === '0')).toBe(true);
  expect(shop.total).toBe('0');
  expect(shop.message).toContain('Shop B');

  // Entries-only fallback: the unknown phone is auto-created and counted.
  const entriesOnly = 'phone,type,amount,date,note\n9000000605,credit,100,2026-10-01,auto\n';
  await importFile(page, 'entries.csv', entriesOnly);
  await expect(page.locator('[data-customer]')).toHaveCount(1, { timeout: 15000 });
  shop = await readShop(page);
  expect(shop.rows[0]).toMatchObject({ phone: '9000000605', name: 'Customer 9000000605', text: '100', attribute: '100' });
  expect(shop.total).toBe('100');

  // Malformed CSV keeps the previous shop untouched.
  await importFile(page, 'broken.csv', 'phone,name\n9000000606,"unterminated\n');
  shop = await readShop(page);
  expect(shop.message).toContain('Could not import');
  expect(shop.rows).toHaveLength(1);
  expect(shop.rows[0].phone).toBe('9000000605');
  expect(shop.total).toBe('100');

  // Header-only CSV becomes an empty shop with a warning.
  await importFile(page, 'empty.csv', 'phone,name\n');
  shop = await readShop(page);
  expect(shop.rows).toHaveLength(0);
  expect(shop.total).toBe('0');
  expect(shop.message).toContain('Warning');
  expect(shop.message).not.toContain('Could not import');

  // A CSV without a phone column is refused.
  await importFile(page, 'nophone.csv', 'name,amount\nRavi,100\n');
  shop = await readShop(page);
  expect(shop.message).toContain('Could not import');
  expect(shop.rows).toHaveLength(0);

  await expectClean(diagnostics, expect);
});

// --- E2E-P7-03: reminder contains the UPI URI -------------------------------

test('E2E-P7-03 reminder message carries name, Rs balance and the exact UPI URI; owner UPI applies', async ({ page }) => {
  test.setTimeout(60000);
  const { diagnostics } = await open(page, '/');

  await importPaste(page, {
    shop: 'Reminder UPI',
    customers: [
      { name: 'Ravi Kumar', phone: '9000000701' },
      { name: 'రవి కుమార్', phone: '9000000702' },
    ],
    entries: [
      { phone: '9000000701', type: 'credit', amount: 670, date: '2026-10-01' },
      { phone: '9000000702', type: 'credit', amount: '1500.50', date: '2026-10-01' },
    ],
  });
  await expect(page.locator('[data-customer]')).toHaveCount(2);

  const cases = [
    { phone: '9000000701', name: 'Ravi Kumar', amount: '670' },
    { phone: '9000000702', name: 'రవి కుమార్', amount: '1500.50' },
  ];

  async function readReminder(phone) {
    const link = page.locator('[data-customer="' + phone + '"] a[data-remind="' + phone + '"]');
    await expect(link).toHaveCount(1);
    const href = await link.getAttribute('href');
    const prefix = 'https://wa.me/91' + phone + '?text=';
    expect(href.startsWith(prefix)).toBe(true);
    const encoded = href.slice(prefix.length);
    expect(encoded.includes('&'), 'the wa.me text must be a single encoded parameter').toBe(false);
    expect(encodeURIComponent(decodeURIComponent(encoded))).toBe(encoded);
    return { href, text: decodeURIComponent(encoded) };
  }

  for (const item of cases) {
    const reminder = await readReminder(item.phone);
    expect(reminder.text).toContain(item.name);
    expect(reminder.text).toContain('Rs ' + item.amount);
    const uri = expectedUpi(item.name, item.amount);
    expect(reminder.text).toContain(uri);
    expect(reminder.text.split('cu=INR').length - 1, 'cu=INR exactly once').toBe(1);

    const anchors = page.locator('[data-customer="' + item.phone + '"] a[href^="upi://pay?pa="]');
    await expect(anchors, 'exactly one UPI anchor per row').toHaveCount(1);
    expect(await anchors.getAttribute('href')).toBe(uri);
  }

  // The owner UPI replaces the default in both the anchor and the reminder message.
  await page.fill('#shop-upi', 'myshop@bank');
  await page.dispatchEvent('#shop-upi', 'change');
  for (const item of cases) {
    const reminder = await readReminder(item.phone);
    expect(reminder.text).toContain('upi://pay?pa=myshop@bank&am=' + item.amount + '&cu=INR&tn=' + encodeURIComponent(item.name));
    const href = await page.locator('[data-customer="' + item.phone + '"] a[href^="upi://pay?pa="]').getAttribute('href');
    expect(href.startsWith('upi://pay?pa=myshop@bank&')).toBe(true);
  }

  await expectClean(diagnostics, expect);
});

// --- E2E-P7-04: profile, logo and brand --------------------------------------

test('E2E-P7-04 profile and logo: header, persistence, brand contrast light/dark, default palette, 375, quota', async ({ page }) => {
  test.setTimeout(120000);
  const { diagnostics } = await open(page, '/');

  // Default palette with no profile.
  expect(await page.locator('#brand-theme').textContent()).toBe('');
  await importPaste(page, SAMPLE);
  await expect(page.locator('[data-customer]')).toHaveCount(8);
  const defaultRatios = await page.evaluate(contrastFor, ['#import-go']);
  expect(defaultRatios[0].ratio, 'default accent text contrast').toBeGreaterThanOrEqual(4.5);

  // Upload a strongly coloured logo.
  await page.setInputFiles('#logo-input', { name: 'logo.png', mimeType: 'image/png', buffer: await makeLogo(page, '#B0006A') });
  await expect(page.locator('#shop-logo')).toBeVisible({ timeout: 20000 });
  const logo = await page.evaluate(() => {
    const image = document.getElementById('shop-logo');
    return { src: image.getAttribute('src'), naturalWidth: image.naturalWidth, naturalHeight: image.naturalHeight };
  });
  expect(logo.src.startsWith('data:image/')).toBe(true);
  expect(Math.max(logo.naturalWidth, logo.naturalHeight), 'logo stored at 128 px long edge or less').toBeLessThanOrEqual(128);
  expect(await page.locator('#brand-theme').textContent()).toContain('--accent');

  // Owner details and UPI.
  await page.fill('#owner-name', 'Sharma Store');
  await page.fill('#owner-address', '12 Market Road');
  await page.fill('#shop-upi', 'profile@bank');
  await page.dispatchEvent('#shop-upi', 'change');

  await expect(page.locator('#owner-display-name')).toHaveText('Sharma Store');
  await expect(page.locator('#owner-display-address')).toHaveText('12 Market Road');
  await expect(page.locator('#owner-display-upi')).toHaveText('profile@bank');
  for (const phone of ['9000000101', '9000000102']) {
    const href = await page.locator('[data-customer="' + phone + '"] a[href^="upi://pay?pa="]').getAttribute('href');
    expect(href.startsWith('upi://pay?pa=profile@bank&')).toBe(true);
  }

  // Collect brand contrast for the accent button and every header line, then run
  // the remaining functional checks before asserting (so one failure does not hide them).
  const brandSamples = [
    '#import-go',
    '#owner-display-name',
    '#owner-display-address',
    '#owner-display-upi',
    '#customers [data-customer] a[href^="?customer="]',
  ];
  const lightRatios = await page.evaluate(contrastFor, brandSamples);
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  const darkRatios = await page.evaluate(contrastFor, brandSamples);
  await page.emulateMedia({ colorScheme: 'light' });
  await page.reload();

  // 375 px with the logo in the header.
  await page.setViewportSize({ width: 375, height: 812 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
  expect(await page.evaluate(() => document.body.scrollWidth)).toBeLessThanOrEqual(375);
  await expect(page.locator('#shop-logo')).toBeVisible();
  await page.screenshot({ path: path.join(ARTIFACTS, 'p7-profile-375.png') });

  // Quota failure while saving a new logo: no crash, warning, logo still shown in-tab.
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.evaluate(() => {
    window.__hisaabOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });
  await page.setInputFiles('#logo-input', { name: 'logo2.png', mimeType: 'image/png', buffer: await makeLogo(page, '#0055CC') });
  await expect(page.locator('#profile-msg')).toBeVisible({ timeout: 20000 });
  expect(((await page.locator('#profile-msg').textContent()) || '').trim().length).toBeGreaterThan(0);
  const secondLogo = await page.locator('#shop-logo').evaluate((image) => image.getAttribute('src'));
  expect(secondLogo.startsWith('data:image/')).toBe(true);
  expect(secondLogo).not.toBe(logo.src);
  await expect(page.locator('#customers')).toBeVisible();
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__hisaabOriginalSetItem;
  });

  const report = [];
  const violations = [];
  for (const [mode, ratios] of [['light', lightRatios], ['dark', darkRatios]]) {
    for (const sample of ratios) {
      expect(sample.found, mode + ': ' + sample.selector + ' must exist').toBe(true);
      report.push(mode + ' ' + sample.selector + ' = ' + sample.ratio + ' (' + sample.color + ' on ' + sample.background + ')');
      if (sample.ratio < 4.5) {
        violations.push(mode + ' ' + sample.selector + ' = ' + sample.ratio + ' (' + sample.color + ' on ' + sample.background + ')');
      }
    }
  }
  fs.writeFileSync(path.join(ARTIFACTS, 'p7-brand-contrast.txt'), report.join('\n') + '\n');
  expect(violations, 'brand text contrast below 4.5:1').toEqual([]);

  await expectClean(diagnostics, expect);
});

// --- E2E-P7-05: OCR honesty --------------------------------------------------

test('E2E-P7-05 OCR honesty: hint says manual, no OCR asset or request, upload neither prefills nor blocks', async ({ page }) => {
  test.setTimeout(60000);
  const phone = '9000000801';
  await page.goto('/');
  await page.fill('#new-name', 'OCR Honesty');
  await page.fill('#new-phone', phone);
  await page.click('#add-customer');
  const { diagnostics } = await open(page, '/?customer=' + phone);

  const hint = ((await page.locator('#shot-ocr-hint').textContent()) || '').trim();
  await expect(page.locator('#shot-ocr-hint')).toBeVisible();
  expect(hint, 'the hint must say the amount is entered manually').toMatch(/manual/i);
  expect(hint, 'the hint must mention the screenshot being saved').toMatch(/screenshot/i);

  const requestsBefore = diagnostics.requests.length;
  await page.selectOption('#entry-type', 'payment');
  await page.setInputFiles('#shot-input', { name: 'shot.jpg', mimeType: 'image/jpeg', buffer: await makeShot(page) });
  await page.waitForTimeout(1200);

  expect(await page.inputValue('#entry-amount'), 'no OCR engine may prefill the amount').toBe('');
  await expect(page.locator('#entry-save')).toBeEnabled();
  const newRequests = diagnostics.requests.slice(requestsBefore);
  const ocrRequests = newRequests.filter((raw) => /ocr|tesseract/i.test(raw));
  expect(ocrRequests, 'no OCR asset or endpoint may be requested').toEqual([]);

  await page.fill('#entry-amount', '1500');
  await page.fill('#entry-date', '2026-10-10');
  await page.fill('#entry-note', 'manual amount');
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1);
  expect((await page.locator('#entries [data-amount]').first().textContent()).trim()).toBe('1500');

  fs.writeFileSync(
    path.join(ARTIFACTS, 'p7-ocr.txt'),
    'hint: ' + JSON.stringify(hint) + '\nprefill after upload: ""\nmanual save amount: 1500\nscreenshot attached: 1\n'
  );
  await expectClean(diagnostics, expect);
});
