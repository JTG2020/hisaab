'use strict';

const { request } = require('@playwright/test');

const BASE_URL = process.env.HISAAB_BASE_URL || 'http://localhost:4173';

module.exports = async function preflight() {
  const context = await request.newContext();
  try {
    const response = await context.get(BASE_URL + '/');
    if (response.status() !== 200) {
      throw new Error('Expected HTTP 200 from ' + BASE_URL + '/ but got ' + response.status());
    }
  } catch (error) {
    throw new Error(
      'Cannot reach ' + BASE_URL + '/ (' + error.message + '). ' +
      'Serve the deployable unit first: python3 -m http.server 4173 --directory app'
    );
  } finally {
    await context.dispose();
  }
};
