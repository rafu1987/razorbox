import { test, describe } from 'node:test'
import assert from 'node:assert/strict'
import { numberInRange, contentDuration } from '../../src/utils.js'
import { ICONS, icon, button } from '../../src/icons.js'
import { DEFAULT_OPTIONS } from '../../src/options.js'

describe('numberInRange', () => {
  test('clamps to the range', () => {
    assert.equal(numberInRange(5, 0, 10), 5)
    assert.equal(numberInRange(-1, 0, 10), 0)
    assert.equal(numberInRange(11, 0, 10), 10)
  })
})

describe('contentDuration', () => {
  test('clamps to 0-2000ms and defaults to 300ms', () => {
    assert.equal(contentDuration(450), 450)
    assert.equal(contentDuration('120'), 120)
    assert.equal(contentDuration(-5), 0)
    assert.equal(contentDuration(9000), 2000)
    assert.equal(contentDuration('slow'), 300)
    assert.equal(contentDuration(undefined), 300)
  })
})

describe('icons', () => {
  test('every icon renders as hidden, non-focusable SVG', () => {
    for (const name of Object.keys(ICONS)) {
      const svg = icon(name)
      assert.match(svg, /^<svg [^>]*aria-hidden="true"[^>]*focusable="false"/, name)
      assert.ok(svg.includes(ICONS[name]), name)
    }
  })

  test('buttons carry an accessible label and action', () => {
    const html = button('close', 'Close gallery', icon('close'), 'aria-pressed="false"')
    assert.match(html, /^<button type="button"/)
    assert.ok(html.includes('data-rb-action="close"'))
    assert.ok(html.includes('aria-label="Close gallery"'))
    assert.ok(html.includes('title="Close gallery"'))
    assert.ok(html.includes('aria-pressed="false"'))
  })
})

describe('DEFAULT_OPTIONS', () => {
  test('is frozen', () => {
    assert.equal(Object.isFrozen(DEFAULT_OPTIONS), true)
  })

  test('privacy-friendly and accessible defaults', () => {
    assert.equal(DEFAULT_OPTIONS.videoPrivacy, true)
    assert.equal(DEFAULT_OPTIONS.captionHtml, false)
    assert.equal(DEFAULT_OPTIONS.keyboard, true)
  })
})
