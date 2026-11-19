'use strict';

const { expect } = require('@playwright/test');

async function setProfile(page, profile) {
  await page.fill('#owner-name', profile.ownerName);
  await page.fill('#owner-address', profile.address);
  await page.fill('#shop-upi', profile.upi);
  await page.setInputFiles('#logo-input', {
    name: profile.logoName,
    mimeType: 'image/png',
    buffer: await makeLogo(page, profile.logoColor),
  });
  await page.click('#store-rename');
  await expect(page.locator('#shop-logo')).toBeVisible({ timeout: 20000 });
  await expect.poll(() => page.locator('#shop-logo').evaluate((image) => image.naturalWidth)).toBeGreaterThan(0);
  return readVisibleProfile(page);
}

async function makeLogo(page, color) {
  const dataUrl = await page.evaluate((fill) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320;
    canvas.height = 320;
    const context = canvas.getContext('2d');
    context.fillStyle = fill;
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#FFFFFF';
    context.beginPath();
    context.arc(160, 160, 90, 0, Math.PI * 2);
    context.fill();
    return canvas.toDataURL('image/png');
  }, color);
  return Buffer.from(dataUrl.split(',')[1], 'base64');
}

async function readVisibleProfile(page) {
  return page.evaluate(() => ({
    ownerName: document.querySelector('#owner-display-name').textContent.trim(),
    address: document.querySelector('#owner-display-address').textContent.trim(),
    upi: document.querySelector('#owner-display-upi').textContent.trim(),
    logo: document.querySelector('#shop-logo').getAttribute('src'),
    brand: document.querySelector('#brand-theme').textContent,
    accent: getComputedStyle(document.documentElement).getPropertyValue('--accent').trim(),
  }));
}

async function expectVisibleProfile(page, profile, expected) {
  await expect(page.locator('#owner-display-name')).toHaveText(profile.ownerName);
  await expect(page.locator('#owner-display-address')).toHaveText(profile.address);
  await expect(page.locator('#owner-display-upi')).toHaveText(profile.upi);
  await expect(page.locator('#shop-upi')).toHaveValue(profile.upi);
  await expect(page.locator('#shop-logo')).toBeVisible();
  await expect(page.locator('#shop-logo')).toHaveAttribute('src', expected.logo);
  expect(await page.locator('#brand-theme').evaluate((style) => style.textContent)).toBe(expected.brand);
  expect(await page.locator('html').evaluate((root) => getComputedStyle(root).getPropertyValue('--accent').trim())).toBe(expected.accent);
  expect(expected.logo).toMatch(/^data:image\//);
  expect(expected.brand).toContain('--accent:');
}

module.exports = { expectVisibleProfile, readVisibleProfile, setProfile };
