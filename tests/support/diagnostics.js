'use strict';

// Independent, app-agnostic observation helpers.
// Nothing here reads app/** source or app globals; it only watches the browser.

async function install(page) {
  await page.addInitScript(() => {
    window.__hisaabDiag = { rejections: [] };
    window.addEventListener('unhandledrejection', (event) => {
      window.__hisaabDiag.rejections.push(String(event.reason));
    });
  });
}

function watch(page) {
  const errors = [];
  const failedRequests = [];
  const requests = [];

  page.on('console', (message) => {
    if (message.type() === 'error') errors.push('console.error: ' + message.text());
  });
  page.on('pageerror', (error) => errors.push('pageerror: ' + error.message));
  page.on('request', (req) => requests.push(req.url()));
  page.on('requestfailed', (req) => {
    const failure = req.failure();
    failedRequests.push(req.url() + ' :: ' + (failure ? failure.errorText : 'requestfailed'));
  });
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(response.status() + ' ' + response.url());
  });

  return {
    errors,
    failedRequests,
    requests,
    async rejections() {
      return page.evaluate(() => (window.__hisaabDiag ? window.__hisaabDiag.rejections : []));
    },
  };
}

// Boots a page with diagnostics attached before the first byte of app script runs.
async function open(page, url) {
  await install(page);
  const diagnostics = watch(page);
  const response = await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(150);
  return { response, diagnostics };
}

async function expectClean(diagnostics, expect) {
  expect(diagnostics.errors, 'console errors / uncaught exceptions').toEqual([]);
  expect(diagnostics.failedRequests, 'failed or 4xx/5xx requests').toEqual([]);
  expect(await diagnostics.rejections(), 'unhandled promise rejections').toEqual([]);
}

module.exports = { install, watch, open, expectClean };
