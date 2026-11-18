'use strict';

const fs = require('fs');
const path = require('path');
const { test, expect } = require('@playwright/test');
const { open, expectClean } = require('../support/diagnostics');
const { contrastFor } = require('../support/contrast');

const SAMPLE = JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', '..', 'sample-data.json'), 'utf8'));
const ARTIFACTS = path.resolve(__dirname, '..', 'artifacts');
fs.mkdirSync(ARTIFACTS, { recursive: true });

async function importPaste(page, value) {
  const text = typeof value === 'string' ? value : JSON.stringify(value);
  await page.locator('#import-box').evaluate((element, next) => {
    element.value = next;
  }, text);
  await page.click('#import-go');
}

async function makeImage(page) {
  const dataUrl = await page.evaluate(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 600;
    const context = canvas.getContext('2d');
    context.fillStyle = '#FFFFFF';
    context.fillRect(0, 0, 800, 600);
    context.fillStyle = '#0A5';
    context.fillRect(80, 80, 640, 440);
    return canvas.toDataURL('image/jpeg', 0.8);
  });
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

// Layout facts read from the DOM only.
function layoutMetrics() {
  const visible = Array.from(document.querySelectorAll('body *')).filter((element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  });
  const wide = visible
    .map((element) => ({
      tag: element.tagName,
      id: element.id,
      right: Math.round(element.getBoundingClientRect().right * 10) / 10,
    }))
    .filter((item) => item.right > 376)
    .slice(0, 8);

  const amountNodes = [document.getElementById('total-outstanding')].concat(
    Array.from(document.querySelectorAll('[data-balance]'))
  );
  const amounts = amountNodes.filter(Boolean).map((node) => ({
    label:
      node.id ||
      (node.closest('[data-customer]') ? node.closest('[data-customer]').getAttribute('data-customer') : ''),
    text: node.textContent.trim(),
    clipped: node.scrollWidth > node.clientWidth + 1,
    right: Math.round(node.getBoundingClientRect().right),
  }));

  const main = document.querySelector('main');
  return {
    innerWidth: window.innerWidth,
    documentScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
    wide,
    amounts,
    rows: document.querySelectorAll('[data-customer]').length,
    overflowX: {
      html: getComputedStyle(document.documentElement).overflowX,
      body: getComputedStyle(document.body).overflowX,
      main: main ? getComputedStyle(main).overflowX : null,
    },
  };
}

function expectNoClipping(metrics) {
  for (const amount of metrics.amounts) {
    expect(amount.text, amount.label + ' must render a machine value').toMatch(/^-?(0|[1-9][0-9]*)(\.[0-9]{2})?$/);
    expect(amount.clipped, amount.label + ' amount is clipped').toBe(false);
    expect(amount.right, amount.label + ' amount overflows the viewport').toBeLessThanOrEqual(376);
  }
}

// Control-boundary contrast against the resolved background, in-page.
function controlContrast() {
  const parse = (value) => {
    const match = /^rgba?\(([^)]+)\)$/.exec(String(value).trim());
    if (!match) return null;
    const parts = match[1].split(/[,\s/]+/).filter(Boolean).map(Number);
    return { rgb: parts.slice(0, 3), alpha: parts.length > 3 ? parts[3] : 1 };
  };
  const luminance = (rgb) => {
    const channel = (value) => {
      const v = value / 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  };
  const ratio = (first, second) => {
    const a = luminance(first);
    const b = luminance(second);
    return Math.round(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)) * 100) / 100;
  };
  const backgroundOf = (element) => {
    let node = element;
    while (node && node.nodeType === 1) {
      const color = parse(getComputedStyle(node).backgroundColor);
      if (color && color.alpha > 0) return color.rgb;
      node = node.parentElement;
    }
    return [255, 255, 255];
  };
  const visible = (element) => {
    const style = getComputedStyle(element);
    const box = element.getBoundingClientRect();
    return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
  };

  const controls = Array.from(
    document.querySelectorAll('input:not([type="hidden"]), select, textarea')
  )
    .filter(visible)
    .map((element) => {
      const style = getComputedStyle(element);
      return {
        id: element.id,
        width: style.borderTopWidth,
        border: style.borderTopColor,
        background: getComputedStyle(element).backgroundColor,
        contrast: ratio(parse(style.borderTopColor).rgb, backgroundOf(element)),
      };
    });

  const ghostElement = document.querySelector('#customers [data-customer] a[href^="?customer="]');
  const ghost = ghostElement
    ? (() => {
        const style = getComputedStyle(ghostElement);
        return {
          border: style.borderTopColor,
          background: style.backgroundColor,
          contrast: ratio(parse(style.borderTopColor).rgb, parse(style.backgroundColor).rgb),
        };
      })()
    : null;

  const shot = document.querySelector('#entries img[data-shot]');
  const thumbnail = shot
    ? (() => {
        const style = getComputedStyle(shot);
        return {
          border: style.borderTopColor,
          background: backgroundOf(shot),
          contrast: ratio(parse(style.borderTopColor).rgb, backgroundOf(shot)),
          width: Math.round(shot.getBoundingClientRect().width),
        };
      })()
    : null;

  return { controls, ghost, thumbnail };
}

test('E2E-P5-01 (R9/N2) sample at 375x812: no sideways scroll, every node reachable, amounts not clipped', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 375, height: 812 });
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await page.goto('/?today=2026-11-15&customer=9000000101');

  const metrics = await page.evaluate(layoutMetrics);
  expect(metrics.innerWidth).toBe(375);
  expect(metrics.rows).toBe(8);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(375);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(375);
  expect(metrics.wide, 'elements whose right edge passes 376px').toEqual([]);
  expectNoClipping(metrics);

  for (const selector of [
    '#total-outstanding',
    '#import-box',
    '#import-go',
    '#shot-input',
    '#overdue',
    '#entries',
    '#lang-switch',
    '#customers',
    '#cust-name',
    '#cust-balance',
  ]) {
    await expect(page.locator(selector), selector + ' must be reachable at 375px').toBeVisible();
  }
  for (const phone of SAMPLE.customers.map((customer) => customer.phone)) {
    await expect(page.locator('[data-customer="' + phone + '"]'), phone + ' row').toBeVisible();
  }

  await page.screenshot({ path: path.join(ARTIFACTS, 'p5-375-light.png'), fullPage: true });
  await expectClean(diagnostics, expect);
});

test('E2E-P5-02 (R9/N2) adversarial 200-customer shop at 375x812: all rows in DOM, long text wraps, thumbnail safe', async ({ page }) => {
  test.setTimeout(240000);
  await page.setViewportSize({ width: 375, height: 812 });

  const longName = 'రవి'.repeat(15); // 45 characters
  const longNote = 'న'.repeat(100);
  const customers = [];
  const entries = [];
  for (let index = 0; index < 200; index += 1) {
    const phone = String(9000010000 + index);
    customers.push({ name: longName + ' ' + index, phone });
    entries.push({ phone, type: 'credit', amount: '250000.50', date: '2026-10-01', note: longNote + index });
    if (index % 5 === 0) {
      entries.push({ phone, type: 'payment', amount: 300000, date: '2026-10-05', note: longNote });
    }
  }

  const { diagnostics } = await open(page, '/');
  await importPaste(page, { shop: 'Adversarial Shop', customers, entries });
  await expect(page.locator('[data-customer]')).toHaveCount(200);

  // One real payment screenshot so a thumbnail exists in the adversarial state.
  await page.goto('/?customer=9000010000');
  await page.selectOption('#entry-type', 'payment');
  await page.fill('#entry-amount', '100');
  await page.fill('#entry-date', '2026-10-10');
  await page.fill('#entry-note', 'thumbnail');
  await page.setInputFiles('#shot-input', { name: 'shot.jpg', mimeType: 'image/jpeg', buffer: await makeImage(page) });
  await page.click('#entry-save');
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1, { timeout: 20000 });

  const metrics = await page.evaluate(layoutMetrics);
  expect(metrics.rows, 'no pagination or virtualisation: all 200 rows stay in the DOM').toBe(200);
  expect(metrics.documentScrollWidth).toBeLessThanOrEqual(375);
  expect(metrics.bodyScrollWidth).toBeLessThanOrEqual(375);
  expect(metrics.wide, 'elements whose right edge passes 376px').toEqual([]);
  expectNoClipping(metrics);
  expect(metrics.amounts.some((amount) => amount.text === '249900.50' || amount.text === '250000.50')).toBe(true);

  const wrapped = await page.evaluate(() => {
    const row = document.querySelector('[data-customer="9000010000"]');
    const name = row ? row.querySelector('.customer-name') : null;
    const note =
      Array.from(document.querySelectorAll('#entries .entry-note')).find(
        (element) => element.textContent.length >= 100
      ) || null;
    const shot = document.querySelector('#entries img[data-shot]');
    const measure = (element) =>
      element
        ? {
            clipped: element.scrollWidth > element.clientWidth + 1,
            width: Math.round(element.getBoundingClientRect().width),
            right: Math.round(element.getBoundingClientRect().right),
          }
        : null;
    return {
      name: measure(name),
      note: measure(note),
      shot: shot
        ? {
            width: Math.round(shot.getBoundingClientRect().width),
            right: Math.round(shot.getBoundingClientRect().right),
            maxWidth: getComputedStyle(shot).maxWidth,
          }
        : null,
      noteTextLength: note ? note.textContent.length : 0,
      nameTextLength: name ? name.textContent.length : 0,
    };
  });

  expect(wrapped.nameTextLength).toBeGreaterThanOrEqual(40);
  expect(wrapped.noteTextLength).toBeGreaterThanOrEqual(100);
  expect(wrapped.name.clipped, 'a 45-character unicode name must wrap').toBe(false);
  expect(wrapped.note.clipped, 'a 100-character unbroken unicode note must wrap').toBe(false);
  expect(wrapped.shot, 'thumbnail must render').toBeTruthy();
  expect(wrapped.shot.width).toBeLessThanOrEqual(64);
  expect(wrapped.shot.right).toBeLessThanOrEqual(376);
  expect(wrapped.shot.maxWidth).toBe('100%');

  await page.screenshot({ path: path.join(ARTIFACTS, 'p5-375-adversarial.png') });
  fs.writeFileSync(
    path.join(ARTIFACTS, 'p5-adversarial-metrics.txt'),
    [
      'rows: ' + metrics.rows,
      'documentScrollWidth: ' + metrics.documentScrollWidth,
      'bodyScrollWidth: ' + metrics.bodyScrollWidth,
      'name (45 chars): ' + JSON.stringify(wrapped.name),
      'note (100 chars): ' + JSON.stringify(wrapped.note),
      'thumbnail: ' + JSON.stringify(wrapped.shot),
    ].join('\n')
  );
  await expectClean(diagnostics, expect);
});

test('E2E-P5-03 (N3) contrast in light and dark: text >= 4.5:1, large text and control borders >= 3:1', async ({ page }) => {
  test.setTimeout(120000);
  await page.setViewportSize({ width: 375, height: 812 });
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await page.goto('/?customer=9000000101');

  // A thumbnail so its border can be sampled too.
  await page.selectOption('#entry-type', 'payment');
  await page.fill('#entry-amount', '100');
  await page.fill('#entry-date', '2026-10-10');
  await page.setInputFiles('#shot-input', { name: 'shot.jpg', mimeType: 'image/jpeg', buffer: await makeImage(page) });
  await page.click('#entry-save');
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1, { timeout: 20000 });

  const textSamples = [
    'body',
    '#total-outstanding',
    '#cust-balance',
    '#customers [data-customer] [data-balance]',
    'label[for="search"]',
    'label[for="new-name"]',
    '#total-human',
    '#import-go',
    '#customers [data-customer] a[href^="?customer="]',
    '#search',
    '#import-box',
    '#lang-switch',
    '#overdue [data-days]',
    '#entries .entry-note',
    '#cust-name',
  ];

  const textStyles = () =>
    page.evaluate((selectors) =>
      selectors.map((selector) => {
        const element = document.querySelector(selector);
        if (!element) return { selector, found: false };
        const style = getComputedStyle(element);
        return {
          selector,
          found: true,
          fontSize: parseFloat(style.fontSize),
          fontWeight: Number(style.fontWeight) || 400,
        };
      }), textSamples);

  const isLarge = (item) => item.fontSize >= 24 || (item.fontSize >= 18.66 && item.fontWeight >= 700);

  async function audit(mode) {
    const scheme = await page.evaluate(() => getComputedStyle(document.documentElement).colorScheme);
    expect(scheme, mode + ': color-scheme').toContain('light');
    expect(scheme, mode + ': color-scheme').toContain('dark');

    const ratios = await page.evaluate(contrastFor, textSamples);
    const sizes = await textStyles();
    const report = [];
    for (let index = 0; index < ratios.length; index += 1) {
      const sample = ratios[index];
      expect(sample.found, mode + ': ' + sample.selector + ' must exist').toBe(true);
      const large = isLarge(sizes[index]);
      const threshold = large ? 3 : 4.5;
      report.push(mode + ' ' + sample.selector + ' = ' + sample.ratio + (large ? ' (large, min 3)' : ' (min 4.5)'));
      expect(
        sample.ratio,
        mode + ': ' + sample.selector + ' contrast ' + sample.ratio + ' (' + sample.color + ' on ' + sample.background + ')'
      ).toBeGreaterThanOrEqual(threshold);
    }

    const borders = await page.evaluate(controlContrast);
    expect(borders.controls.length, mode + ': form controls sampled').toBeGreaterThan(3);
    for (const control of borders.controls) {
      expect(control.width, mode + ': #' + control.id + ' must have a visible border').not.toBe('0px');
      report.push(mode + ' #' + control.id + ' border = ' + control.contrast);
      expect(
        control.contrast,
        mode + ': #' + control.id + ' border contrast ' + control.contrast + ' (' + control.border + ' on ' + control.background + ')'
      ).toBeGreaterThanOrEqual(3);
    }

    expect(borders.ghost, mode + ': ghost row link').toBeTruthy();
    report.push(mode + ' ghost-link border = ' + borders.ghost.contrast);
    expect(borders.ghost.contrast, mode + ': ghost row link border contrast').toBeGreaterThanOrEqual(3);

    expect(borders.thumbnail, mode + ': thumbnail').toBeTruthy();
    report.push(mode + ' thumbnail border = ' + borders.thumbnail.contrast);
    expect(
      borders.thumbnail.contrast,
      mode + ': thumbnail border contrast ' + borders.thumbnail.contrast
    ).toBeGreaterThanOrEqual(3);
    expect(borders.thumbnail.width, mode + ': thumbnail width').toBeLessThanOrEqual(64);

    const placeholder = await page.evaluate(() => {
      const input = document.querySelector('#search');
      return getComputedStyle(input, '::placeholder').color;
    });
    expect(placeholder, mode + ': placeholder colour').toMatch(/^rgb/);

    return report;
  }

  const light = await audit('light');
  await page.emulateMedia({ colorScheme: 'dark' });
  await page.reload();
  await expect(page.locator('#entries img[data-shot]')).toHaveCount(1);
  const dark = await audit('dark');

  await page.screenshot({ path: path.join(ARTIFACTS, 'p5-contrast-dark.png'), fullPage: false });
  fs.writeFileSync(path.join(ARTIFACTS, 'p5-contrast.txt'), light.join('\n') + '\n' + dark.join('\n'));
  await expectClean(diagnostics, expect);
});

test('E2E-P5-04 (N2/N3) tap targets >= 40px, no overflow masking, no fixed/sticky overlay', async ({ page }) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 375, height: 812 });
  const { diagnostics } = await open(page, '/');
  await importPaste(page, SAMPLE);
  await page.goto('/?customer=9000000101');

  const audit = await page.evaluate(() => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const box = element.getBoundingClientRect();
      return box.width > 0 && box.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
    };

    const controls = Array.from(
      document.querySelectorAll('a[href], button, input:not([type="hidden"]), select, textarea')
    )
      .filter(visible)
      .map((element) => ({
        tag: element.tagName,
        id: element.id,
        label: (element.textContent || element.getAttribute('placeholder') || '').trim().slice(0, 24),
        height: Math.round(element.getBoundingClientRect().height * 10) / 10,
      }));

    const overlays = Array.from(document.querySelectorAll('body *'))
      .filter((element) => ['fixed', 'sticky'].includes(getComputedStyle(element).position) && visible(element))
      .map((element) => {
        const box = element.getBoundingClientRect();
        return { tag: element.tagName, id: element.id, top: box.top, bottom: box.bottom, height: box.height };
      });

    const importSection = document.querySelector('#import-box').closest('section').getBoundingClientRect();
    const rows = document.querySelectorAll('[data-customer]');
    const lastRow = rows[rows.length - 1].getBoundingClientRect();

    const masks = ['html', 'body', 'main'].map((tag) => {
      const element = tag === 'html' ? document.documentElement : document.querySelector(tag);
      return { tag, overflowX: getComputedStyle(element).overflowX };
    });

    return {
      controls,
      overlays,
      importSection: { top: importSection.top, bottom: importSection.bottom },
      lastRow: { top: lastRow.top, bottom: lastRow.bottom },
      masks,
    };
  });

  expect(audit.controls.length, 'interactive controls found').toBeGreaterThan(25);
  const undersized = audit.controls.filter((control) => control.height < 40);
  expect(undersized, 'controls under 40px: ' + JSON.stringify(undersized)).toEqual([]);
  const minimum = Math.min(...audit.controls.map((control) => control.height));
  expect(minimum).toBeGreaterThanOrEqual(40);
  expect(minimum, 'the design token targets 44px; 40px is the hard floor').toBeGreaterThanOrEqual(40);

  for (const mask of audit.masks) {
    expect(mask.overflowX, mask.tag + ' must not mask horizontal overflow').not.toBe('hidden');
    expect(mask.overflowX, mask.tag + ' must not use overflow-x: clip to mask overflow').not.toBe('clip');
  }

  // No fixed/sticky bar exists in this build; if one is added it must not cover
  // the import section or the last customer row.
  for (const overlay of audit.overlays) {
    const coversImport = overlay.bottom > audit.importSection.top && overlay.top < audit.importSection.bottom;
    const coversLastRow = overlay.bottom > audit.lastRow.top && overlay.top < audit.lastRow.bottom;
    expect(coversImport, overlay.tag + '#' + overlay.id + ' must not cover the import section').toBe(false);
    expect(coversLastRow, overlay.tag + '#' + overlay.id + ' must not cover the last customer row').toBe(false);
  }

  await page.screenshot({ path: path.join(ARTIFACTS, 'p5-tap-targets.png') });
  fs.writeFileSync(
    path.join(ARTIFACTS, 'p5-tap-targets.txt'),
    'controls sampled: ' + audit.controls.length + '\n' +
      'min height: ' + minimum + 'px\n' +
      'fixed/sticky overlays: ' + audit.overlays.length + '\n' +
      'overflow-x: ' + JSON.stringify(audit.masks)
  );

  await expectClean(diagnostics, expect);
});
