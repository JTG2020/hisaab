'use strict';

const { test, expect } = require('@playwright/test');

const PROMPT = {
  en: 'Discard unsaved shop profile changes?',
  hi: 'दुकान की बिना सहेजी प्रोफ़ाइल के बदलाव छोड़ दें?',
  te: 'సేవ్ చేయని దుకాణ ప్రొఫైల్ మార్పులను వదిలివేయాలా?',
};

const UPDATE_LABEL = {
  en: 'Update Shop',
  hi: 'दुकान अपडेट करें',
  te: 'దుకాణాన్ని నవీకరించండి',
};

async function importShop(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-go');
}

async function addStore(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-add-store');
}

async function makeLogo(page, color) {
  const dataUrl = await page.evaluate((fill) => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const context = canvas.getContext('2d');
    context.fillStyle = fill;
    context.fillRect(0, 0, 64, 64);
    return canvas.toDataURL('image/png');
  }, color);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function switchWithDialog(page, label, accept) {
  let message = '';
  page.once('dialog', async (dialog) => {
    message = dialog.message();
    if (accept) await dialog.accept();
    else await dialog.dismiss();
  });
  await page.selectOption('#store-select', { label });
  await page.waitForTimeout(150);
  return message;
}

async function upiHref(page, phone) {
  return page.locator('[data-customer="' + phone + '"] a[href^="upi://pay?pa="]').getAttribute('href');
}

test('C-61 P12 Update Shop action, success and discard-prompt copy in en/hi/te', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001201' }], entries: [{ phone: '9000001201', type: 'credit', amount: 101, date: '2026-10-01' }] });
  await expect(page.locator('#store-rename')).toHaveText('Update Shop');

  await page.fill('#owner-name', 'Copy Owner');
  await page.click('#store-rename');
  await expect(page.locator('#store-msg')).toHaveText('Shop profile updated.');

  await page.fill('#store-name', 'Second');
  await page.click('#store-create');
  await page.fill('#owner-name', 'Dirty Draft');

  for (const locale of ['en', 'hi', 'te']) {
    await page.selectOption('#lang-switch', locale);
    await expect(page.locator('#store-rename')).toHaveText(UPDATE_LABEL[locale]);
    const message = await switchWithDialog(page, 'My Store', false);
    expect(message, locale + ' discard prompt').toBe(PROMPT[locale]);
    await expect(page.locator('#active-store-name')).toHaveText('Second');
    await expect(page.locator('#owner-name')).toHaveValue('Dirty Draft');
  }
});

test('E2E-P12-01 draft isolation, atomic Update, blank clear, logo preserve, name/logo validation', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001202' }], entries: [{ phone: '9000001202', type: 'credit', amount: 202, date: '2026-10-01' }] });
  expect((await upiHref(page, '9000001202')).startsWith('upi://pay?pa=hisaab@upi&')).toBe(true);

  await page.fill('#owner-name', 'Draft Owner');
  await page.fill('#owner-address', 'Draft Address');
  await page.fill('#shop-upi', 'draft@bank');
  await page.fill('#store-name', 'Renamed Shop');
  await page.setInputFiles('#logo-input', { name: 'draft.png', mimeType: 'image/png', buffer: await makeLogo(page, '#B0006A') });

  // Draft only: no header, logo, UPI link, or Shop-name mutation before Update.
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#owner-display-address')).toHaveText('');
  await expect(page.locator('#owner-display-upi')).toHaveText('Demo UPI ID');
  await expect(page.locator('#shop-logo')).toBeHidden();
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
  expect((await upiHref(page, '9000001202')).startsWith('upi://pay?pa=hisaab@upi&')).toBe(true);

  await page.click('#store-rename');
  await expect(page.locator('#store-msg')).toHaveText('Shop profile updated.');
  await expect(page.locator('#active-store-name')).toHaveText('Renamed Shop');
  await expect(page.locator('#owner-display-name')).toHaveText('Draft Owner');
  await expect(page.locator('#owner-display-address')).toHaveText('Draft Address');
  await expect(page.locator('#owner-display-upi')).toHaveText('draft@bank');
  await expect(page.locator('#shop-logo')).toBeVisible();
  expect((await upiHref(page, '9000001202')).startsWith('upi://pay?pa=draft@bank&')).toBe(true);
  const logoBefore = await page.locator('#shop-logo').getAttribute('src');

  // No new file selected: the stored logo is preserved.
  await page.fill('#owner-name', 'Draft Owner 2');
  await page.click('#store-rename');
  expect(await page.locator('#shop-logo').getAttribute('src')).toBe(logoBefore);

  // Empty text input is committed as an empty saved value.
  await page.fill('#owner-address', '');
  await page.click('#store-rename');
  await expect(page.locator('#owner-display-address')).toHaveText('');

  // Duplicate name rejects the whole update: no partial profile write.
  await page.fill('#store-name', 'Other Shop');
  await page.click('#store-create');
  await page.selectOption('#store-select', { label: 'Renamed Shop' });
  await page.fill('#store-name', 'Other Shop');
  await page.fill('#owner-name', 'Should Not Apply');
  await page.click('#store-rename');
  await expect(page.locator('#store-msg')).toHaveText('A shop with this name already exists.');
  await expect(page.locator('#active-store-name')).toHaveText('Renamed Shop');
  await expect(page.locator('#owner-display-name')).toHaveText('Draft Owner 2');

  // Invalid logo rejects the whole update (empty name input keeps the current name).
  await page.setInputFiles('#logo-input', { name: 'not-image.txt', mimeType: 'text/plain', buffer: Buffer.from('not an image') });
  await page.fill('#store-name', '');
  await page.fill('#owner-name', 'Invalid Logo Owner');
  await page.click('#store-rename');
  await expect(page.locator('#profile-msg')).toHaveText('Choose a valid logo image.');
  await expect(page.locator('#owner-display-name')).toHaveText('Draft Owner 2');
  expect(await page.locator('#shop-logo').getAttribute('src')).toBe(logoBefore);
});

test('E2E-P12-02 Create Shop from the current draft, empty ledger, no logo inheritance', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001203' }], entries: [{ phone: '9000001203', type: 'credit', amount: 303, date: '2026-10-01' }] });

  await page.fill('#owner-name', 'Created Owner');
  await page.fill('#owner-address', 'Created Address');
  await page.fill('#shop-upi', 'created@upi');
  await page.setInputFiles('#logo-input', { name: 'created.png', mimeType: 'image/png', buffer: await makeLogo(page, '#0055CC') });
  await page.fill('#store-name', 'Draft Shop');
  await page.click('#store-create');

  await expect(page.locator('#active-store-name')).toHaveText('Draft Shop');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#total-outstanding')).toHaveText('0');
  await expect(page.locator('#owner-display-name')).toHaveText('Created Owner');
  await expect(page.locator('#owner-display-address')).toHaveText('Created Address');
  await expect(page.locator('#owner-display-upi')).toHaveText('created@upi');
  await expect(page.locator('#shop-logo')).toBeVisible();
  await expect(page.locator('#shop-upi')).toHaveValue('created@upi');

  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000001203"] [data-balance]')).toHaveText('303');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#shop-logo')).toBeHidden();

  await page.selectOption('#store-select', { label: 'Draft Shop' });
  await expect(page.locator('#owner-display-name')).toHaveText('Created Owner');
  await expect(page.locator('#shop-logo')).toBeVisible();

  // Create with no selected logo: blank text draft, never another Shop's logo.
  await page.fill('#store-name', 'No Logo Shop');
  await page.fill('#owner-name', '');
  await page.fill('#owner-address', '');
  await page.fill('#shop-upi', '');
  await page.click('#store-create');
  await expect(page.locator('#active-store-name')).toHaveText('No Logo Shop');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  await expect(page.locator('#shop-logo')).toBeHidden();
});

test('E2E-P12-03 dirty switch cancel/confirm, P9 activation guard, delete confirmation intact', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001204' }], entries: [{ phone: '9000001204', type: 'credit', amount: 404, date: '2026-10-01' }] });
  await page.fill('#store-name', 'Second');
  await page.click('#store-create');
  await page.fill('#owner-name', 'Dirty Owner');
  await expect(page.locator('#owner-display-name')).toHaveText('Your shop');

  // Cancel keeps the active Shop and the draft.
  const cancelMessage = await switchWithDialog(page, 'My Store', false);
  expect(cancelMessage).toBe(PROMPT.en);
  await expect(page.locator('#active-store-name')).toHaveText('Second');
  await expect(page.locator('#owner-name')).toHaveValue('Dirty Owner');

  // Confirm discards the draft, switches, and loads saved values.
  const confirmMessage = await switchWithDialog(page, 'My Store', true);
  expect(confirmMessage).toBe(PROMPT.en);
  await expect(page.locator('#active-store-name')).toHaveText('My Store');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('[data-customer="9000001204"] [data-balance]')).toHaveText('404');

  // P9 add-import activation also respects the dirty guard.
  await page.selectOption('#store-select', { label: 'Second' });
  await page.fill('#owner-name', 'Dirty Again');
  const optionsBefore = await page.locator('#store-select option').count();
  let addCancel = '';
  page.once('dialog', async (dialog) => { addCancel = dialog.message(); await dialog.dismiss(); });
  await addStore(page, { shop: 'Imported Third', customers: [{ name: 'Third User', phone: '9000001205' }], entries: [{ phone: '9000001205', type: 'credit', amount: 505, date: '2026-10-02' }] });
  await page.waitForTimeout(200);
  expect(addCancel).toBe(PROMPT.en);
  await expect(page.locator('#active-store-name')).toHaveText('Second');
  await expect(page.locator('#store-select option')).toHaveCount(optionsBefore);
  await expect(page.locator('#owner-name')).toHaveValue('Dirty Again');

  page.once('dialog', async (dialog) => { await dialog.accept(); });
  await addStore(page, { shop: 'Imported Third', customers: [{ name: 'Third User', phone: '9000001205' }], entries: [{ phone: '9000001205', type: 'credit', amount: 505, date: '2026-10-02' }] });
  await expect(page.locator('#active-store-name')).toHaveText('Imported Third');
  await expect(page.locator('[data-customer="9000001205"] [data-balance]')).toHaveText('505');

  // P8 inline delete confirmation is unchanged.
  const optionsNow = await page.locator('#store-select option').count();
  await page.click('#store-delete');
  await expect(page.locator('.store-confirmation')).toBeVisible();
  await page.click('#store-cancel-delete');
  await expect(page.locator('#store-select option')).toHaveCount(optionsNow);
  await page.click('#store-delete');
  await page.click('#store-confirm-delete');
  await expect(page.locator('#store-select option')).toHaveCount(optionsNow - 1);
});
