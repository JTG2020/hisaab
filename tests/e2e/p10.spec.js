'use strict';

const { test, expect } = require('@playwright/test');

const copy = {
  en: {
    heading: 'Shop Manager', active: 'Active shop', select: 'Select Shop', name: 'Shop name',
    create: 'Create Shop', rename: 'Update Shop', delete: 'Delete Shop',
    prompt: 'Delete this shop?', confirm: 'Confirm delete', cancel: 'Cancel',
    created: 'Shop created.', renamed: 'Shop profile updated.', deleted: 'Shop deleted.',
    blank: 'Enter a shop name.', tooLong: 'Shop name must be 60 characters or fewer.',
    duplicate: 'A shop with this name already exists.',
    last: 'The last shop cannot be deleted.',
    storage: 'Could not save shop changes.',
  },
  hi: {
    heading: 'दुकान प्रबंधन', active: 'सक्रिय दुकान', select: 'दुकान चुनें', name: 'दुकान का नाम',
    create: 'दुकान बनाएँ', rename: 'दुकान अपडेट करें', delete: 'दुकान हटाएँ',
    prompt: 'क्या इस दुकान को हटाएँ?', confirm: 'हटाने की पुष्टि करें', cancel: 'रद्द करें',
    created: 'दुकान बनाई गई।', renamed: 'दुकान की प्रोफ़ाइल अपडेट की गई।', deleted: 'दुकान हटाई गई।',
    blank: 'दुकान का नाम दर्ज करें।', tooLong: 'दुकान का नाम 60 अक्षरों से अधिक नहीं होना चाहिए।',
    duplicate: 'इस नाम की दुकान पहले से मौजूद है।',
    last: 'आख़िरी दुकान नहीं हटाई जा सकती।',
    storage: 'दुकान के बदलाव सहेजे नहीं जा सके।',
  },
  te: {
    heading: 'దుకాణం నిర్వహణ', active: 'ప్రస్తుత దుకాణం', select: 'దుకాణాన్ని ఎంచుకోండి', name: 'దుకాణం పేరు',
    create: 'దుకాణాన్ని సృష్టించండి', rename: 'దుకాణాన్ని నవీకరించండి', delete: 'దుకాణాన్ని తొలగించండి',
    prompt: 'ఈ దుకాణాన్ని తొలగించాలా?', confirm: 'తొలగింపును నిర్ధారించండి', cancel: 'రద్దు చేయండి',
    created: 'దుకాణం సృష్టించబడింది.', renamed: 'దుకాణం ప్రొఫైల్ నవీకరించబడింది.', deleted: 'దుకాణం తొలగించబడింది.',
    blank: 'దుకాణం పేరు నమోదు చేయండి.', tooLong: 'దుకాణం పేరు 60 అక్షరాలకు మించకూడదు.',
    duplicate: 'ఈ పేరుతో దుకాణం ఇప్పటికే ఉంది.',
    last: 'చివరి దుకాణాన్ని తొలగించలేరు.',
    storage: 'దుకాణం మార్పులను సేవ్ చేయలేకపోయాము.',
  },
};

async function importShop(page, value) {
  await page.locator('#import-box').evaluate((node, text) => { node.value = text; }, JSON.stringify(value));
  await page.click('#import-go');
}

test('C-59 P10 exact English and localized manager copy', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#store-manager h2')).toHaveText(copy.en.heading);
  await expect(page.locator('.store-active-line')).toContainText(copy.en.active);
  await expect(page.locator('label[for="store-select"]')).toHaveText(copy.en.select);
  await expect(page.locator('label[for="store-name"]')).toHaveText(copy.en.name);
  await expect(page.locator('#store-create')).toHaveText(copy.en.create);
  await expect(page.locator('#store-rename')).toHaveText(copy.en.rename);
  await expect(page.locator('#store-delete')).toHaveText(copy.en.delete);
  await page.click('#store-delete');
  await expect(page.locator('.store-confirmation')).toContainText(copy.en.prompt);
  await expect(page.locator('#store-confirm-delete')).toHaveText(copy.en.confirm);
  await expect(page.locator('#store-cancel-delete')).toHaveText(copy.en.cancel);

  for (const locale of ['hi', 'te']) {
    await page.selectOption('#lang-switch', locale);
    await expect(page.locator('#store-manager h2')).toHaveText(copy[locale].heading);
    await expect(page.locator('.store-active-line')).toContainText(copy[locale].active);
    await expect(page.locator('label[for="store-select"]')).toHaveText(copy[locale].select);
    await expect(page.locator('label[for="store-name"]')).toHaveText(copy[locale].name);
    await expect(page.locator('#store-create')).toHaveText(copy[locale].create);
    await expect(page.locator('#store-rename')).toHaveText(copy[locale].rename);
    await expect(page.locator('#store-delete')).toHaveText(copy[locale].delete);
    await expect(page.locator('.store-confirmation')).toContainText(copy[locale].prompt);
    await expect(page.locator('#store-confirm-delete')).toHaveText(copy[locale].confirm);
    await expect(page.locator('#store-cancel-delete')).toHaveText(copy[locale].cancel);
  }

  await page.selectOption('#lang-switch', 'en');
  await page.fill('#store-name', 'P10 One');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText(copy.en.created);
  await page.fill('#store-name', 'P10 One');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText(copy.en.duplicate);
  await page.fill('#store-name', 'P10 Renamed');
  await page.click('#store-rename');
  await expect(page.locator('#store-msg')).toHaveText(copy.en.renamed);

  for (const locale of ['en', 'hi', 'te']) {
    await page.selectOption('#lang-switch', locale);
    await page.fill('#store-name', '');
    await page.click('#store-create');
    await expect(page.locator('#store-msg')).toHaveText(copy[locale].blank);
    await page.fill('#store-name', 'A'.repeat(61));
    await page.click('#store-create');
    await expect(page.locator('#store-msg')).toHaveText(copy[locale].tooLong);
    await page.fill('#store-name', 'P10 Renamed');
    await page.click('#store-create');
    await expect(page.locator('#store-msg')).toHaveText(copy[locale].duplicate);
  }

  for (const locale of ['en', 'hi', 'te']) {
    await page.reload();
    await page.selectOption('#lang-switch', locale);
    await page.evaluate(() => {
      window.__originalSetItem = Storage.prototype.setItem;
      Storage.prototype.setItem = function () {
        throw new DOMException('Quota', 'QuotaExceededError');
      };
    });
    await page.fill('#store-name', `Storage ${locale}`);
    await page.click('#store-create');
    await expect(page.locator('#store-msg')).toHaveText(copy[locale].storage);
    await page.evaluate(() => {
      Storage.prototype.setItem = window.__originalSetItem;
      delete window.__originalSetItem;
    });
  }
});

test('E2E-P10-01 exact status confirmation and all three locales', async ({ page }) => {
  await page.goto('/');
  for (const locale of ['hi', 'te', 'en']) {
    await page.selectOption('#lang-switch', locale);
    await page.fill('#store-name', '');
    await page.click('#store-create');
    await expect(page.locator('#store-msg')).toHaveText(copy[locale].blank);
  }
  await page.fill('#store-name', 'P10 Telugu');
  await page.click('#store-create');
  await page.fill('#store-name', 'P10 Telugu');
  await page.click('#store-create');
  await expect(page.locator('#store-msg')).toHaveText(copy.en.duplicate);
  await page.click('#store-delete');
  await expect(page.locator('.store-confirmation')).toContainText(copy.en.prompt);
  await page.click('#store-cancel-delete');
  await page.click('#store-delete');
  await page.click('#store-confirm-delete');
  await expect(page.locator('#store-msg')).toHaveText(copy.en.deleted);
});

test('E2E-P10-02 top selector bottom action group and top-left owner display', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const layout = await page.evaluate(() => {
    const selectLabel = document.querySelector('label[for="store-select"]').getBoundingClientRect();
    const select = document.querySelector('#store-select').getBoundingClientRect();
    const name = document.querySelector('#store-name').getBoundingClientRect();
    const actions = document.querySelector('.store-name-actions').getBoundingClientRect();
    const workspace = document.querySelector('#store-workspace').getBoundingClientRect();
    const owner = document.querySelector('.shop-profile').getBoundingClientRect();
    return { selectTop: selectLabel.top, selectBottom: select.bottom, nameTop: name.top, actionsBottom: actions.bottom, workspaceTop: workspace.top, workspaceBottom: workspace.bottom, ownerLeft: owner.left, ownerTop: owner.top };
  });
  expect(layout.selectBottom).toBeLessThan(layout.nameTop);
  expect(layout.actionsBottom).toBeLessThanOrEqual(layout.workspaceBottom + 1);
  expect(layout.ownerLeft).toBeLessThanOrEqual(187.5);
  expect(layout.ownerTop).toBeLessThan(layout.workspaceTop);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});

test('E2E-P10-03 manual blank profile draft isolation and explicit Update', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001001' }], entries: [{ phone: '9000001001', type: 'credit', amount: 101, date: '2026-10-01' }] });
  await page.fill('#store-name', 'Manual B');
  await page.click('#store-create');
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#owner-name')).toHaveValue('');
  await expect(page.locator('#owner-address')).toHaveValue('');
  await expect(page.locator('#shop-upi')).toHaveValue('');
  await page.fill('#owner-name', 'B Owner');
  await page.fill('#owner-address', 'B Address');
  await page.fill('#shop-upi', 'b@upi');
  // P12: draft edits never mutate the header or generated links before Update.
  await expect(page.locator('#owner-display-name')).not.toHaveText('B Owner');
  await expect(page.locator('#owner-display-address')).not.toHaveText('B Address');
  await expect(page.locator('#owner-display-upi')).not.toHaveText('b@upi');
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('Manual B');
  await expect(page.locator('#owner-display-name')).not.toHaveText('B Owner');
  await expect(page.locator('#owner-name')).toHaveValue('');
  await page.fill('#owner-name', 'B Owner');
  await page.fill('#owner-address', 'B Address');
  await page.fill('#shop-upi', 'b@upi');
  await page.click('#store-rename');
  await expect(page.locator('#owner-display-name')).toHaveText('B Owner');
  await expect(page.locator('#owner-display-address')).toHaveText('B Address');
  await expect(page.locator('#owner-display-upi')).toHaveText('b@upi');
  await page.reload();
  await expect(page.locator('#active-store-name')).toHaveText('Manual B');
  await expect(page.locator('#owner-display-name')).toHaveText('B Owner');
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000001001"] [data-balance]')).toHaveText('101');
  await page.selectOption('#store-select', { label: 'Manual B' });
  await expect(page.locator('[data-customer]')).toHaveCount(0);
  await expect(page.locator('#owner-display-name')).toHaveText('B Owner');
});

test('E2E-P10-04 P0-P9 Shop import delete and store isolation regression', async ({ page }) => {
  await page.goto('/');
  await importShop(page, { shop: 'A', customers: [{ name: 'A User', phone: '9000001002' }], entries: [{ phone: '9000001002', type: 'credit', amount: 102, date: '2026-10-02' }] });
  await page.fill('#store-name', 'North');
  await page.click('#store-create');
  await importShop(page, { shop: 'North Ledger', customers: [{ name: 'North User', phone: '9000001003' }], entries: [{ phone: '9000001003', type: 'credit', amount: 103, date: '2026-10-03' }] });
  await expect(page.locator('[data-customer="9000001003"] [data-balance]')).toHaveText('103');
  await page.selectOption('#store-select', { label: 'My Store' });
  await expect(page.locator('[data-customer="9000001002"] [data-balance]')).toHaveText('102');
  await page.selectOption('#store-select', { label: 'North' });
  await page.fill('#store-name', 'South');
  await page.click('#store-rename');
  await expect(page.locator('#active-store-name')).toHaveText('South');
  await page.click('#store-delete');
  await page.click('#store-cancel-delete');
  await expect(page.locator('#store-select option')).toHaveCount(2);
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ colorScheme: 'dark' });
  await expect(page.locator('#store-manager')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(375);
});
