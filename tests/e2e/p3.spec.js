'use strict';

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

const WA_PREFIX = 'https://wa.me/91';
const MAX_SHOT_CHARS = 204800; // contract: stored image under 200 KB of characters

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
  if (date) {
    await page.fill('#entry-date', date);
  }
  await page.fill('#entry-note', note);
}

async function storedEntries(page) {
  return page.evaluate(() => {
    const portfolioRaw = window.localStorage.getItem('hisaab.stores.v1');
    const activeId = window.localStorage.getItem('hisaab.activeStore.v1');
    if (!portfolioRaw) return null;
    const portfolio = JSON.parse(portfolioRaw);
    const active = (portfolio.stores || []).find((store) => store.id === activeId) ||
      (portfolio.stores || [])[0];
    return active && active.ledger ? active.ledger.entries : null;
  });
}

// A real, decodable JPEG built in the page, deliberately noisy so it stays multi-megabyte.
async function makeLargeJpeg(page, width, height) {
  const dataUrl = await page.evaluate((size) => {
    const canvas = document.createElement('canvas');
    canvas.width = size.width;
    canvas.height = size.height;
    const context = canvas.getContext('2d');
    const frame = context.createImageData(size.width, size.height);
    let state = 123456789;
    for (let index = 0; index < frame.data.length; index += 4) {
      state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
      frame.data[index] = state & 255;
      frame.data[index + 1] = (state >>> 8) & 255;
      frame.data[index + 2] = (state >>> 16) & 255;
      frame.data[index + 3] = 255;
    }
    context.putImageData(frame, 0, 0);
    return canvas.toDataURL('image/jpeg', 0.95);
  }, { width, height });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function saveWithFile(page, options, file) {
  await fillEntry(page, options);
  await page.setInputFiles('#shot-input', file);
  await page.click('#entry-save');
}

test('E2E-P3-01 (C-07) reminder href for normal, &, +/%, Telugu, Devanagari, zero and negative balances', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  const shop = {
    shop: 'Reminder Shop',
    customers: [
      { name: 'Ravi Kumar', phone: '9000000101' },
      { name: 'Anna & Sons', phone: '9000000102' },
      { name: 'Plus + Percent %', phone: '9000000103' },
      { name: 'రవి కుమార్', phone: '9000000104' },
      { name: 'रवि कुमार', phone: '9000000105' },
    ],
    entries: [
      { phone: '9000000101', type: 'credit', amount: 670, date: '2026-10-01' },
      { phone: '9000000102', type: 'credit', amount: 100, date: '2026-10-01' },
      { phone: '9000000102', type: 'payment', amount: 100, date: '2026-10-02' },
      { phone: '9000000103', type: 'credit', amount: 100, date: '2026-10-01' },
      { phone: '9000000103', type: 'payment', amount: '350.25', date: '2026-10-02' },
      { phone: '9000000104', type: 'credit', amount: '1500.50', date: '2026-10-01' },
      { phone: '9000000105', type: 'credit', amount: 42, date: '2026-10-01' },
    ],
  };

  await importPaste(page, shop);
  await expect(page.locator('[data-customer]')).toHaveCount(5);

  const expected = new Map([
    ['9000000101', { name: 'Ravi Kumar', rendered: '670' }],
    ['9000000102', { name: 'Anna & Sons', rendered: '0' }],
    ['9000000103', { name: 'Plus + Percent %', rendered: '-250.25' }],
    ['9000000104', { name: 'రవి కుమార్', rendered: '1500.50' }],
    ['9000000105', { name: 'रवि कुमार', rendered: '42' }],
  ]);

  const phones = await page.locator('[data-customer]').evaluateAll((nodes) =>
    nodes.map((node) => node.getAttribute('data-customer'))
  );
  expect(phones.sort()).toEqual(Array.from(expected.keys()).sort());

  for (const [phone, expectation] of expected) {
    const row = page.locator('[data-customer="' + phone + '"]');
    const links = row.locator('a[data-remind="' + phone + '"]');
    await expect(links, phone + ' must have exactly one reminder link').toHaveCount(1);

    const href = await links.getAttribute('href');
    expect(href, phone + ' href prefix').toMatch(new RegExp('^https://wa\\.me/91' + phone + '\\?text='));

    const prefix = WA_PREFIX + phone + '?text=';
    expect(href.startsWith(prefix)).toBe(true);
    const encoded = href.slice(prefix.length);
    expect(encoded.includes('&'), phone + ' must not gain an extra query parameter').toBe(false);
    expect(href.includes('?text=')).toBe(true);

    const decoded = decodeURIComponent(encoded);
    expect(decoded, phone + ' decoded message must contain the full name').toContain(expectation.name);
    expect(decoded, phone + ' decoded message must contain Rs <rendered>').toContain('Rs ' + expectation.rendered);

    // The encoding must be exactly encodeURIComponent of the decoded message
    // (a raw '+' or '&' or double encoding would fail this).
    expect(encodeURIComponent(decoded), phone + ' encoding must round-trip exactly').toBe(encoded);

    // The row balance keeps the same machine number used in the message.
    const balance = (await row.locator('[data-balance]').textContent()).trim();
    expect(balance).toBe(expectation.rendered);
  }

  await expectClean(diagnostics, expect);
});

test('E2E-P3-02 (I-03/N-03) payment with a 3 MB+ image: thumbnail in the right entry, stored under 200 KB, survives reload', async ({ page }) => {
  test.setTimeout(90000);
  const phone = '9000000101';
  await page.goto('/');
  await addCustomer(page, 'Image Tester', phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  const original = await makeLargeJpeg(page, 2600, 2000);
  expect(original.length, 'generated JPEG must be at least 3 MB').toBeGreaterThanOrEqual(3 * 1024 * 1024);

  await saveWithFile(
    page,
    { amount: '300', type: 'payment', date: '2026-10-10', note: 'with photo' },
    { name: 'receipt.jpg', mimeType: 'image/jpeg', buffer: original }
  );

  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });
  const paymentId = await page.locator('#entries [data-entry-id]').first().getAttribute('data-entry-id');

  const shots = page.locator('#entries img[data-shot]');
  await expect(shots).toHaveCount(1);
  await expect(page.locator('#entries [data-entry-id="' + paymentId + '"] img[data-shot]')).toHaveCount(1);

  const src = await shots.first().getAttribute('src');
  expect(src.startsWith('data:image/'), 'thumbnail src must be a data: image').toBe(true);

  const entries = await storedEntries(page);
  const payment = entries.find((entry) => entry.id === paymentId);
  expect(payment, 'stored payment entry').toBeTruthy();
  expect(typeof payment.shot).toBe('string');
  expect(payment.shot.startsWith('data:image/')).toBe(true);
  expect(payment.shot.length, 'stored data URL must be under 200 KB of characters').toBeLessThan(MAX_SHOT_CHARS);
  expect(payment.shot.length).toBeGreaterThan(1000);
  console.log(
    'E2E-P3-02 image sizes: original ' + original.length + ' bytes, stored ' + payment.shot.length + ' chars'
  );

  // Reload keeps the image on the same entry.
  const reloaded = await open(page, '/?customer=' + phone);
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);
  await expect(page.locator('#entries [data-entry-id="' + paymentId + '"] img[data-shot]')).toHaveCount(1);
  const reloadedSrc = await page.locator('#entries img[data-shot]').getAttribute('src');
  expect(reloadedSrc).toBe(src);
  await expect(page.locator('#entry-form #shot-input')).toHaveCount(1);
  await expect(page.locator('#shot-input')).toBeVisible();

  // A later credit entry must not inherit the image.
  await fillEntry(page, { amount: '100', type: 'credit', date: '2026-10-11', note: 'no photo' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2);
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1);
  await expect(page.locator('#entries [data-type="credit"] img[data-shot]')).toHaveCount(0);

  await expectClean(diagnostics, expect);
  await expectClean(reloaded.diagnostics, expect);
});

test('E2E-P3-03 credit with an image and payment without one both save with no img[data-shot]', async ({ page }) => {
  test.setTimeout(60000);
  const phone = '9000000102';
  await page.goto('/');
  await addCustomer(page, 'No Photo', phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  const image = await makeLargeJpeg(page, 900, 700);

  await saveWithFile(
    page,
    { amount: '100', type: 'credit', date: '2026-10-01', note: 'credit with file' },
    { name: 'credit.jpg', mimeType: 'image/jpeg', buffer: image }
  );
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator('#entries [data-type="credit"]')).toHaveCount(1);
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);

  await fillEntry(page, { amount: '50', type: 'payment', date: '2026-10-02', note: 'payment no file' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2);
  await expect(page.locator('#entries [data-type="payment"]')).toHaveCount(1);
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);

  // Entries themselves are correct.
  const amounts = await page.locator('#entries [data-amount]').evaluateAll((nodes) =>
    nodes.map((node) => ({ text: node.textContent.trim(), attribute: node.getAttribute('data-amount') }))
  );
  expect(amounts.map((entry) => entry.text).sort()).toEqual(['100', '50']);
  for (const amount of amounts) expect(amount.attribute).toBe(amount.text);

  await expect(page.locator('#entry-form #shot-input')).toHaveCount(1);
  await expect(page.locator('#shot-input')).toBeVisible();

  await expectClean(diagnostics, expect);
});

test('E2E-P3-04 (I-08/N-03) quota failure saves the payment without the image and warns; a later save persists', async ({ page }) => {
  test.setTimeout(90000);
  const phone = '9000000103';
  await page.goto('/');
  await addCustomer(page, 'Quota Tester', phone);
  await page.goto('/?customer=' + phone);
  await fillEntry(page, { amount: '1000', type: 'credit', date: '2026-10-01', note: 'starting credit' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1);

  const image = await makeLargeJpeg(page, 2000, 1600);
  await page.evaluate(() => {
    window.__hisaabOriginalSetItem = Storage.prototype.setItem;
    Storage.prototype.setItem = function setItem() {
      throw new DOMException('Quota exceeded', 'QuotaExceededError');
    };
  });

  await saveWithFile(
    page,
    { amount: '300', type: 'payment', date: '2026-10-02', note: 'photo while broken' },
    { name: 'quota.jpg', mimeType: 'image/jpeg', buffer: image }
  );

  // The payment is saved even though the image could not be stored.
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2, { timeout: 20000 });
  await expect(page.locator('#entries [data-type="payment"]')).toHaveCount(1);
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);

  const storageMessage = page.locator('#storage-msg');
  await expect(storageMessage).toBeVisible();
  expect(((await storageMessage.textContent()) || '').trim().length).toBeGreaterThan(0);

  const entryMessage = ((await page.locator('#entry-msg').textContent()) || '').trim();
  expect(entryMessage.length).toBeGreaterThan(0);
  expect(entryMessage).toMatch(/screenshot|photo|image/i);

  // Nothing is lost: the payment is already reflected in memory (1000 - 300 = 700).
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('700');

  // Restore storage, save another payment, and confirm the whole state persists.
  await page.evaluate(() => {
    Storage.prototype.setItem = window.__hisaabOriginalSetItem;
  });
  await fillEntry(page, { amount: '50', type: 'payment', date: '2026-10-03', note: 'after recovery' });
  await page.click('#entry-save');
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(3);
  await expect(page.locator('#storage-msg')).toHaveText('');

  const reloaded = await open(page, '/?customer=' + phone);
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(3);
  expect((await page.locator('#cust-balance').textContent()).trim()).toBe('650');
  expect((await page.locator('#total-outstanding').textContent()).trim()).toBe('650');
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);

  await expectClean(reloaded.diagnostics, expect);
});

test('E2E-P3-05 a non-image file and an undecodable image save the entry without a photo and warn', async ({ page }) => {
  test.setTimeout(60000);
  const phone = '9000000104';
  await page.goto('/');
  await addCustomer(page, 'Bad Files', phone);
  const { diagnostics } = await open(page, '/?customer=' + phone);

  await saveWithFile(
    page,
    { amount: '70', type: 'payment', date: '2026-10-01', note: 'text file' },
    { name: 'notes.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image at all') }
  );
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(1, { timeout: 20000 });
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);
  const firstWarning = ((await page.locator('#entry-msg').textContent()) || '').trim();
  expect(firstWarning).toMatch(/screenshot|photo|image/i);

  await saveWithFile(
    page,
    { amount: '20', type: 'payment', date: '2026-10-02', note: 'broken png' },
    { name: 'broken.png', mimeType: 'image/png', buffer: Buffer.from('this is not a PNG stream') }
  );
  await expect(page.locator('#entries [data-entry-id]')).toHaveCount(2, { timeout: 20000 });
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(0);
  const secondWarning = ((await page.locator('#entry-msg').textContent()) || '').trim();
  expect(secondWarning).toMatch(/screenshot|photo|image/i);

  // Both entries are saved, the form remains usable, and nothing crashed.
  const amounts = await page.locator('#entries [data-amount]').evaluateAll((nodes) =>
    nodes.map((node) => node.textContent.trim())
  );
  expect(amounts.sort()).toEqual(['20', '70']);
  await expect(page.locator('#shot-input')).toBeVisible();
  await expect(page.locator('#entry-save')).toBeEnabled();

  await expectClean(diagnostics, expect);
});
