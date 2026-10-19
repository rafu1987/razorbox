/* Scroll lock in a real browser. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chromium, sleep, withDemo } from './helpers/browser.mjs'

const skip = !chromium && 'No Chromium binary found.'

// Issue #1: a scroll that is already running when the lightbox opens.
test('the page cannot scroll while razorbox is open', { skip }, t => withDemo(t, async browser => {
  await browser.eval('window.scrollTo({ top: 400, behavior: "instant" }); true')
  await browser.eval('document.querySelector(".gallery-card").click(); true')
  // Programmatic scrolling ignores overflow: hidden, like trackpad momentum in Safari.
  await browser.eval('window.scrollTo({ top: 900, behavior: "instant" }); true')
  await browser.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 475, deltaX: 0, deltaY: 400 })
  await sleep(300)
  assert.equal(await browser.eval('window.scrollY'), 400, 'The page stays where it was when the lightbox opened')
  await browser.eval('window.razorboxDemo.close(true); true')
  await browser.eval('window.scrollTo({ top: 900, behavior: "instant" }); true')
  await sleep(100)
  assert.equal(await browser.eval('window.scrollY'), 900, 'Scrolling works again after closing')
}))
