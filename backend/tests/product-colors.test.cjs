const { test } = require('node:test');
const assert = require('node:assert/strict');
const { productData } = require('../dist/routes/products');
const { resolveProductColor } = require('../dist/utils/productColor');
const product = { name: 'Toy', media: [], colors: ['Red', 'Blue'] };
test('checkout rejects missing or unavailable colours and resolves known names', () => {
  assert.throws(() => resolveProductColor(product, ''), { status: 400 });
  assert.throws(() => resolveProductColor(product, 'Green'), { status: 400 });
  assert.equal(resolveProductColor(product, ' blue '), 'Blue');
  assert.equal(resolveProductColor(product, '', true), '');
});
test('invalid colour payloads cannot silently discard existing uploads', async () => {
  for (const value of ['bad-json', '{}', '[null]', '["Red","red"]']) {
    await assert.rejects(() => productData({ body: { colorMediaColors: value }, files: [] }, product), { status: 400 });
  }
  await assert.rejects(() => productData({ body: { colorMedia: '[{"color":"Red","media":["javascript:bad"]}]' }, files: [] }, product), { status: 400 });
});
test('per-colour upload URLs remain associated with their colour', async () => {
  const result = await productData({ body: { colorMediaColors: '["Red","Blue"]', colorMediaExisting_0: 'https://example.com/red.jpg', colorMediaExisting_1: ['https://example.com/blue.jpg', 'https://example.com/blue.mp4'] }, files: [] }, product);
  assert.equal(result.colorMedia[0].color, 'Red');
  assert.equal(result.colorMedia[1].media[1], 'https://example.com/blue.mp4');
});
