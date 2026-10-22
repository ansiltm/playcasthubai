const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createRequire } = require('node:module');
const axios = require('axios');
const cache = new Map();
function load(file) {
  const full = path.resolve(__dirname, '..', file);
  if (cache.has(full)) return cache.get(full).exports;
  const m = { exports: {} }; cache.set(full, m);
  const native = createRequire(full);
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true } }).outputText;
  new Function('require', 'module', 'exports', compiled)(id => id.startsWith('.') ? load(path.relative(path.resolve(__dirname, '..'), path.resolve(path.dirname(full), id + '.ts'))) : native(id), m, m.exports);
  return m.exports;
}
const { trackRequests } = load('lib/requestLoading.ts');
const { useRequestActivity, beginRequest } = load('lib/requestActivity.ts');
const tick = () => new Promise(resolve => setImmediate(resolve));
test('overlapping requests stay busy until both complete, in either order', async () => {
  const finish = [];
  const client = trackRequests(axios.create({ adapter: config => new Promise(resolve => finish.push(() => resolve({ config, data: {}, status: 200, statusText: 'OK', headers: {} }))) }));
  const a = client.get('/a'); const b = client.get('/b');
  await tick(); assert.equal(useRequestActivity.getState().pending, 2);
  finish[1](); await b; assert.equal(useRequestActivity.getState().pending, 1);
  finish[0](); await a; assert.equal(useRequestActivity.getState().pending, 0);
});
test('HTTP, network and timeout errors always release the loader', async () => {
  for (const code of ['ERR_BAD_RESPONSE', 'ERR_NETWORK', 'ECONNABORTED']) {
    const client = trackRequests(axios.create({ adapter: config => Promise.reject(new axios.AxiosError('failure', code, config)) }));
    await assert.rejects(client.get('/fail'));
    assert.equal(useRequestActivity.getState().pending, 0);
  }
});
test('cancelled requests release the loader', async () => {
  const controller = new AbortController(); controller.abort();
  const client = trackRequests(axios.create());
  await assert.rejects(client.get('/cancel', { signal: controller.signal }));
  assert.equal(useRequestActivity.getState().pending, 0);
});
test('cleanup is idempotent', () => {
  const done = beginRequest(); done(); done();
  assert.equal(useRequestActivity.getState().pending, 0);
});
test('external APIs have a timeout and no store authorization', () => {
  const { externalApi } = load('lib/externalApi.ts');
  assert.equal(externalApi.defaults.timeout, 20000);
  assert.equal(externalApi.defaults.headers.common.Authorization, undefined);
});
