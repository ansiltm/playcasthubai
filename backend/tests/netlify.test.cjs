const { test } = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const app = express();
app.get('/api/probe', (req, res) => res.json({ ip: req.ip }));
app.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
require.cache[require.resolve('../dist/server')] = { exports: { default: app } };
const database = require('../dist/config/database');
database.connectDatabase = async () => {};
require('../dist/middleware/auth').jwtSecret = () => 'test-only';
for (const model of Object.values(require('../dist/models'))) model.init = async () => {};
require('../dist/models/RateLimit').default.init = async () => {};
const { handler } = require('../netlify/api');
function event(path) {
  return { path, httpMethod: 'GET', headers: { 'x-nf-client-connection-ip': '192.0.2.1', 'x-forwarded-for': '198.51.100.9' }, queryStringParameters: {}, body: null, isBase64Encoded: false };
}
test('API rewrite and direct function URL both preserve routing and trusted client IP', async () => {
  for (const path of ['/api/probe', '/.netlify/functions/api/probe']) {
    const context = {};
    const response = await handler(event(path), context);
    assert.equal(response.statusCode, 200);
    assert.equal(JSON.parse(response.body).ip, '192.0.2.1');
    assert.equal(context.callbackWaitsForEmptyEventLoop, false);
  }
});
test('health check supports its rewritten function URL', async () => {
  const response = await handler(event('/.netlify/functions/api/healthz'), {});
  assert.equal(response.statusCode, 200);
});
test('connection failure returns a safe uncached error without leaking secrets', async () => {
  database.connectDatabase = async () => { throw new Error('private database credentials'); };
  // Reload the handler to use the failing connector.
  delete require.cache[require.resolve('../netlify/api')];
  const response = await require('../netlify/api').handler(event('/api/probe'), {});
  assert.equal(response.statusCode, 503);
  assert.equal(response.headers['Cache-Control'], 'no-store');
  assert.doesNotMatch(response.body, /credentials/);
});
