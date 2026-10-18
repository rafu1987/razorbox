import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import razorbox, { razorbox as Namedrazorbox } from '../dist/razorbox.js'
import razorboxMin, { razorbox as NamedrazorboxMin } from '../dist/razorbox.min.js'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

test('ES module exports are available without browser globals', () => {
  assert.equal(typeof razorbox.bind, 'function')
  assert.equal(typeof razorbox.prototype.toggleThumbnails, 'function')
  assert.equal(razorbox, Namedrazorbox)
})

test('JS and CSS are independent, and exports resolve to real artifacts', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const js = await readFile(path.join(root, 'dist/razorbox.js'), 'utf8')
  const css = await readFile(path.join(root, 'dist/razorbox.css'), 'utf8')
  assert.equal(pkg.exports['./css'], './dist/razorbox.css')
  assert.ok(css.includes('.razorbox__toolbar'))
  assert.ok(css.includes('.razorbox.is-thumbs-open'))
  assert.ok(!js.includes("createElement('style')"))
  assert.ok(!js.includes('import \'./scss/'))
})

test('minified exports and CSS variants are available independently', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  const minJs = await readFile(path.join(root, 'dist/razorbox.min.js'), 'utf8')
  const minCss = await readFile(path.join(root, 'dist/razorbox.min.css'), 'utf8')
  const originalJs = await readFile(path.join(root, 'dist/razorbox.js'), 'utf8')
  const originalCss = await readFile(path.join(root, 'dist/razorbox.css'), 'utf8')

  assert.equal(razorboxMin, NamedrazorboxMin)
  assert.equal(typeof razorboxMin.bind, 'function')
  assert.equal(pkg.exports['./min'].import, './dist/razorbox.min.js')
  assert.equal(pkg.exports['./css/min'], './dist/razorbox.min.css')
  assert.ok(minJs.length < originalJs.length)
  assert.ok(minCss.length < originalCss.length)
  assert.ok(minCss.includes('.razorbox__toolbar'))
  assert.ok(!minJs.includes("createElement('style')"))
  assert.match(pkg.scripts.build, /--mode readable.*--mode minified/)
})

test('grouped data-attribute triggers select only matching gallery images', () => {
  class FakeElement {
    constructor (group, src, caption, thumb) { this.attrs = { 'data-razorbox': group, href: src, 'data-caption': caption }; this.thumb = thumb }
    getAttribute (key) { return this.attrs[key] ?? null }
    hasAttribute (key) { return key in this.attrs }
    querySelector (key) { return key === 'img' ? { currentSrc: this.thumb, src: this.thumb, alt: 'A landscape' } : null }
    closest () { return this }
  }
  const first = new FakeElement('alpha', '/images/a.svg', 'A', '/images/a-small.svg')
  const second = new FakeElement('alpha', '/images/b.svg', 'B', '/images/b-small.svg')
  const other = new FakeElement('beta', '/images/c.svg', 'C', '/images/c-small.svg')
  const nodes = [first, second, other]
  const originalDocument = globalThis.document
  const originalElement = globalThis.Element
  const fakeDocument = { addEventListener () {}, removeEventListener () {}, contains: node => nodes.includes(node), querySelectorAll: () => nodes }
  globalThis.document = fakeDocument
  globalThis.Element = FakeElement
  try {
    const box = new razorbox('[data-razorbox]') // eslint-disable-line new-cap
    assert.equal(box.options.wheelZoom, true, 'Wheel/trackpad zoom should be enabled by default')
    assert.equal(box.options.maxZoom, 8, 'Gestures should zoom beyond the toolbar 2x level')
    assert.equal(box.options.zoomFactor, 2, 'Toolbar zoom level should stay at 2x')
    let result
    box.open = (items, start) => { result = { items, start } }
    let prevented = false
    box._onTriggerClick({ target: second, button: 0, preventDefault () { prevented = true } })
    assert.equal(prevented, true)
    assert.equal(result.start, 1)
    assert.deepEqual(result.items.map(item => item.caption), ['A', 'B'])
    assert.equal(result.items[0].thumb, '/images/a-small.svg')
    box.destroy()
  } finally {
    globalThis.document = originalDocument
    globalThis.Element = originalElement
  }
})

test('build script preserves published type declarations', async () => {
  const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'))
  assert.ok(pkg.scripts.build.includes('copy-types.mjs'))
  const source = await readFile(path.join(root, 'src/razorbox.d.ts'), 'utf8')
  const bundled = await readFile(path.join(root, 'dist/razorbox.d.ts'), 'utf8')
  assert.equal(source, bundled)
})
