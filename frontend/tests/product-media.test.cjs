const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');
const { createRequire } = require('node:module');
const React = require('react');
const { renderToString } = require('react-dom/server');
function load(file) {
  const full = path.resolve(__dirname, '..', file);
  const nativeRequire = createRequire(full);
  const compiled = ts.transpileModule(fs.readFileSync(full, 'utf8'), { compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true } }).outputText;
  const m = { exports: {} };
  const customRequire = id => {
    if (id === 'next/navigation') return { useParams: () => ({ id: 'test' }), useRouter: () => ({ push() {} }) };
    if (id.startsWith('.')) {
      for (const ext of ['.ts', '.tsx']) {
        const candidate = path.resolve(path.dirname(full), id + ext);
        if (fs.existsSync(candidate)) return load(path.relative(path.resolve(__dirname, '..'), candidate));
      }
    }
    return nativeRequire(id);
  };
  new Function('require', 'module', 'exports', compiled)(customRequire, m, m.exports);
  return m.exports;
}
const media = load('lib/productMedia.ts');
const movie = 'https://res.cloudinary.com/demo/video/upload/v1/blue.mov';
const product = { media: ['https://example.com/general.jpg'], colors: ['Red', 'Blue', 'Green'], colorMedia: [{ color: 'Red', media: ['https://example.com/red.jpg'] }, { color: 'Blue', media: [movie] }] };
test('detail initial loading render does not crash on a null product', () => {
  assert.match(renderToString(React.createElement(load('app/products/[id]/page.tsx').default)), /Loading product/);
});
test('null and absent products have no cover', () => {
  assert.equal(media.productCover(null), undefined);
  assert.deepEqual(media.productMedia(undefined), []);
});
test('selected colour determines gallery and cart cover, including video-only colours', () => {
  assert.deepEqual(media.productMedia(product, ' red '), ['https://example.com/red.jpg']);
  const cover = media.productCover(product, 'Blue');
  assert.match(cover, /blue\.jpg$/);
  assert.equal(media.isVideoMedia(cover), false);
  assert.equal(media.productCover(product, 'Green'), 'https://example.com/general.jpg');
});
test('colour-only products show a listing cover without borrowing a different selected colour', () => {
  const p = { ...product, media: [] };
  assert.equal(media.productCover(p), 'https://example.com/red.jpg');
  assert.equal(media.productCover(p, 'Green'), undefined);
  assert.equal(media.colorHasMedia(p, 'Green'), false);
});
test('invalid media entries are ignored and variant colour names can provide options', () => {
  assert.deepEqual(media.productMedia({ media: [null, 3, '', 'https://example.com/a.jpg'] }), ['https://example.com/a.jpg']);
  assert.deepEqual(media.productColors({ colorMedia: product.colorMedia }), ['Red', 'Blue']);
});
