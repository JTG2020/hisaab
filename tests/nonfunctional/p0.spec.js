'use strict';

const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');
const { contrastFor } = require('../support/contrast');

test.describe('375x812 viewport', () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test('C-20 document scrollWidth is 375 or less at empty state', async ({ page }) => {
    const { diagnostics } = await open(page, '/');

    const measured = await page.evaluate(() => ({
      innerWidth: window.innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyScrollWidth: document.body.scrollWidth,
    }));

    expect(measured.innerWidth).toBe(375);
    expect(measured.scrollWidth).toBeLessThanOrEqual(375);
    expect(measured.bodyScrollWidth).toBeLessThanOrEqual(375);

    await expectClean(diagnostics, expect);
  });
});

test.describe('prefers-color-scheme: dark', () => {
  test.use({ colorScheme: 'dark' });

  test('C-21 dark baseline keeps key nodes visible and text at >= 4.5:1', async ({ page }) => {
    const { diagnostics } = await open(page, '/');

    const colorScheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(colorScheme).toContain('dark');

    for (const selector of ['#total-outstanding', '#import-box', '#shot-input', '#customers', '#overdue', '#lang-switch']) {
      await expect(page.locator(selector), selector + ' must be visible in dark mode').toBeVisible();
    }

    const sampled = await page.evaluate(contrastFor, [
      'body',
      '#total-outstanding',
      '#overdue h2',
      '#customers > :first-child',
      '#search',
      '#import-box',
      '#lang-switch',
    ]);

    for (const sample of sampled) {
      expect(sample.found, sample.selector + ' must exist').toBe(true);
      expect(typeof sample.ratio, sample.selector + ' must expose a measurable colour').toBe('number');
      expect(
        sample.ratio,
        sample.selector + ' contrast ' + sample.ratio + ' (' + sample.color + ' on ' + sample.background + ')'
      ).toBeGreaterThanOrEqual(4.5);
    }

    await expectClean(diagnostics, expect);
  });
});

test('C-22 no external network request on load (same-origin or data: only)', async ({ page, baseURL }) => {
  const { diagnostics } = await open(page, '/');
  await page.waitForLoadState('networkidle');

  const origin = new URL(baseURL).origin;
  const requests = diagnostics.requests;
  expect(requests.length).toBeGreaterThan(0);

  const external = requests.filter((raw) => {
    let url;
    try {
      url = new URL(raw);
    } catch (error) {
      return true;
    }
    return !(url.protocol === 'data:' || url.protocol === 'blob:' || url.origin === origin);
  });

  expect(external, 'requests outside ' + origin).toEqual([]);
  expect(requests.some((raw) => raw.startsWith(origin)), 'the app itself must be fetched').toBe(true);

  await expectClean(diagnostics, expect);
});
