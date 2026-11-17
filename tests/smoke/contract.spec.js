'use strict';

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');

// CONTRACT.md §3.3 normative machine shape.
const BARE = /^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/;

// CONTRACT.md §2 "Always rendered" ids (the empty-state message is asserted via #customers).
const ALWAYS_RENDERED = [
  'total-outstanding',
  'new-name',
  'new-phone',
  'add-customer',
  'entry-form',
  'entry-type',
  'entry-amount',
  'entry-date',
  'entry-note',
  'entry-save',
  'shot-input',
  'import-box',
  'import-go',
  'import-msg',
  'search',
  'export-csv',
  'lang-switch',
  'overdue',
  'customers',
];

const DATA_DEPENDENT = [
  '[data-customer]',
  '[data-customer="9000000101"]',
  'a[data-remind]',
  'img[data-shot]',
  '[data-entry-id]',
  '[data-amount]',
  '[data-days]',
  '[data-overdue]',
  '[data-overdue="9000000101"]',
  'a[href^="upi://pay?pa="]',
];

test('C-01 #total-outstanding resolves on load with text 0', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  const total = page.locator('#total-outstanding');
  await expect(total).toHaveCount(1);
  await expect(total).toBeVisible();
  await expect(total).toHaveText('0');
  await expectClean(diagnostics, expect);
});

test('C-02 #import-box and #import-go are visible at first paint', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await expect(page.locator('#import-box')).toBeVisible();
  await expect(page.locator('#import-go')).toBeVisible();
  await expectClean(diagnostics, expect);
});

test('C-03 #shot-input exists inside the payment form at first paint', async ({ page }) => {
  const { diagnostics } = await open(page, '/');
  await expect(page.locator('#entry-form #shot-input')).toHaveCount(1);
  await expect(page.locator('#shot-input')).toBeVisible();
  await expectClean(diagnostics, expect);
});

test('C-09 every CONTRACT §2 node resolves and is visible before interaction', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  for (const id of ALWAYS_RENDERED) {
    await expect(page.locator('#' + id), '#' + id + ' must resolve to one element').toHaveCount(1);
  }

  const blocked = await page.evaluate((ids) => {
    return ids.filter((id) => {
      const element = document.getElementById(id);
      if (!element) return true;
      if (element.closest('dialog, [hidden], details:not([open])')) return true;
      const style = getComputedStyle(element);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return true;
      const box = element.getBoundingClientRect();
      return box.width <= 0 || box.height <= 0;
    });
  }, ALWAYS_RENDERED);

  expect(blocked, 'nodes hidden, gated, or zero-box').toEqual([]);
  await expectClean(diagnostics, expect);
});

test('C-10 #total-outstanding text and data-value are exactly 0 (bare), Rs lives in a sibling', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  const node = page.locator('#total-outstanding');
  const text = (await node.textContent()).trim();
  const attribute = await node.getAttribute('data-value');

  expect(text).toBe('0');
  expect(attribute).toBe('0');
  expect(text).toMatch(BARE);
  expect(text).not.toMatch(/[Rs₹,\s+]|\.00/);
  expect(attribute).toMatch(BARE);

  const human = await node.evaluate((element) => {
    const parentText = element.parentElement ? element.parentElement.textContent : '';
    return { inside: element.textContent, parent: parentText };
  });
  expect(human.inside).not.toContain('Rs');
  expect(human.parent).toContain('Rs');

  await expectClean(diagnostics, expect);
});

test('C-11 #import-box is a textarea, #import-go a button, #shot-input a file input accepting image/*', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  expect(await page.locator('#import-box').evaluate((element) => element.tagName)).toBe('TEXTAREA');
  expect(await page.locator('#import-go').evaluate((element) => element.tagName)).toBe('BUTTON');
  expect(await page.locator('#import-box').isVisible()).toBe(true);
  expect(await page.locator('#import-go').isVisible()).toBe(true);

  const shot = await page.locator('#shot-input').evaluate((element) => ({
    tagName: element.tagName,
    type: element.getAttribute('type'),
    accept: element.getAttribute('accept'),
    visible: element.getBoundingClientRect().width > 0 && element.getBoundingClientRect().height > 0,
    inForm: !!element.closest('form'),
  }));

  expect(shot).toEqual({
    tagName: 'INPUT',
    type: 'file',
    accept: 'image/*',
    visible: true,
    inForm: true,
  });

  await expectClean(diagnostics, expect);
});

test('C-12 #entry-type options are exactly credit and payment', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await expect(page.locator('#entry-type')).toBeVisible();
  const values = await page.locator('#entry-type').evaluate((element) =>
    Array.from(element.options).map((option) => option.value)
  );
  expect(values).toEqual(['credit', 'payment']);

  await expectClean(diagnostics, expect);
});

test('C-13 #lang-switch is a select with exactly en, hi, te and defaults to en', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  const switchTag = await page.locator('#lang-switch').evaluate((element) => element.tagName);
  expect(switchTag).toBe('SELECT');
  await expect(page.locator('#lang-switch')).toBeVisible();

  const values = await page.locator('#lang-switch').evaluate((element) =>
    Array.from(element.options).map((option) => option.value)
  );
  expect(values).toEqual(['en', 'hi', 'te']);

  await expect(page.locator('#lang-switch')).toHaveValue('en');
  const selected = await page.locator('#lang-switch').evaluate((element) => {
    const option = element.options[element.selectedIndex];
    return option ? option.value : null;
  });
  expect(selected).toBe('en');

  await expectClean(diagnostics, expect);
});

test('C-14 #overdue heading contains Overdue and 30+ days, with an empty-state line', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await expect(page.locator('#overdue')).toBeVisible();

  const section = await page.locator('#overdue').evaluate((element) => {
    const heading = element.querySelector('h1, h2, h3, h4, h5, h6');
    const headingText = heading ? heading.textContent.trim() : '';
    const fullText = (element.innerText || '').trim();
    return { headingText, rest: fullText.split(headingText).join('').trim() };
  });

  expect(section.headingText).toContain('Overdue');
  expect(section.headingText).toContain('30+ days');
  expect(section.rest.length, 'visible empty-state line inside #overdue').toBeGreaterThan(0);

  await expectClean(diagnostics, expect);
});

test('C-15 #customers shows a visible empty-state message and no rows', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  await expect(page.locator('#customers')).toBeVisible();
  const emptyText = await page.locator('#customers').evaluate((element) => (element.innerText || '').trim());
  expect(emptyText.length).toBeGreaterThan(0);
  await expect(page.locator('#customers [data-customer]')).toHaveCount(0);

  await expectClean(diagnostics, expect);
});

test('C-16 empty storage renders zero data-dependent nodes', async ({ page }) => {
  const { diagnostics } = await open(page, '/');

  for (const selector of DATA_DEPENDENT) {
    await expect(page.locator(selector), 'expected zero matches for ' + selector).toHaveCount(0);
  }
  await expect(page.locator('#total-outstanding')).toHaveText('0');

  await expectClean(diagnostics, expect);
});

test('C-39 first paint raises no console error, failed request, or rejection', async ({ page }) => {
  const routes = ['/', '/?customer=9000000101', '/?today=2026-11-15', '/?today=not-a-date'];

  for (const route of routes) {
    await page.goto('about:blank');
    const { response, diagnostics } = await open(page, route);
    expect(response.status(), route).toBe(200);

    for (const id of ALWAYS_RENDERED) {
      await expect(page.locator('#' + id), route + ' -> #' + id).toHaveCount(1);
    }
    await expect(page.locator('#total-outstanding'), route + ' -> total').toHaveText('0');

    await expectClean(diagnostics, expect);
  }
});
