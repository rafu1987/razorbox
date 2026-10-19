/* Scroll lock, arrow placement and backdrop in a real browser. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chromium, sleep, waitUntil, withDemo } from './helpers/browser.mjs'

const skip = !chromium && 'No Chromium binary found.'

async function openCard (browser, selector) {
  await browser.eval(`document.querySelector(${JSON.stringify(selector)}).click(); true`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active.is-loaded"))'))
  // Let the backdrop, the slide and the arrows settle.
  await sleep(600)
}

async function close (browser) {
  await browser.eval('window.razorboxDemo.close(true); true')
}

// Vertical distance between the arrows' center and the active content's center.
const arrowOffset = `(() => {
  const slide = document.querySelector('.razorbox__slide.is-active')
  const content = slide.querySelector('.razorbox__media, .razorbox__image').getBoundingClientRect()
  const arrow = document.querySelector('.razorbox__arrow--next').getBoundingClientRect()
  return { content: Math.abs((arrow.top + arrow.height / 2) - (content.top + content.height / 2)) }
})()`

// Issue #1: a scroll that is already running when the lightbox opens.
test('the page cannot scroll while razorbox is open', { skip }, t => withDemo(t, async browser => {
  await browser.eval('window.scrollTo({ top: 400, behavior: "instant" }); true')
  await browser.eval('document.querySelector(".gallery-card").click(); true')
  // Programmatic scrolling ignores overflow: hidden, like trackpad momentum in Safari.
  await browser.eval('window.scrollTo({ top: 900, behavior: "instant" }); true')
  await browser.call('Input.dispatchMouseEvent', { type: 'mouseWheel', x: 720, y: 475, deltaX: 0, deltaY: 400 })
  await sleep(300)
  assert.equal(await browser.eval('window.scrollY'), 400, 'The page stays where it was when the lightbox opened')
  await close(browser)
  await browser.eval('window.scrollTo({ top: 900, behavior: "instant" }); true')
  await sleep(100)
  assert.equal(await browser.eval('window.scrollY'), 900, 'Scrolling works again after closing')
}))

// Issue #3: content sits above the viewport's center, most visibly on phones.
test('the arrows are centered on every content type', { skip }, t => withDemo(t, async browser => {
  for (const selector of ['.media-card[data-type=video]', '.media-card[data-type=html]', '.media-card[data-type=iframe]', '.media-card[data-type=map]', '.media-card[href$=".pdf"]']) {
    await openCard(browser, selector)
    const offset = await browser.eval(arrowOffset)
    assert.ok(offset.content <= 1, `${selector}: arrows ${offset.content.toFixed(1)}px off the content's center`)
    await close(browser)
  }

  // The arrows follow when the thumbnails shrink the viewport.
  await openCard(browser, '.media-card[data-type=html]')
  await browser.eval('window.razorboxDemo.toggleThumbnails(); true')
  await sleep(700)
  const withThumbs = await browser.eval(arrowOffset)
  assert.ok(withThumbs.content <= 1, `Arrows ${withThumbs.content.toFixed(1)}px off the content's center with thumbnails`)
  await close(browser)

  // On a portrait phone, a landscape image and its caption leave room above and below.
  await browser.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 3, mobile: true })
  for (const selector of ['.gallery-card', '.media-card[data-type=video]', '.media-card[data-type=html]']) {
    await openCard(browser, selector)
    const offset = await browser.eval(arrowOffset)
    assert.ok(offset.content <= 1, `Phone, ${selector}: arrows ${offset.content.toFixed(1)}px off the content's center`)
    await close(browser)
  }
}))

// Issue #2: a denser backdrop, in both themes.
test('the backdrop is dense enough to hide the page', { skip }, t => withDemo(t, async browser => {
  const previousTheme = await browser.eval('window.razorboxDemo.options.theme')
  for (const [theme, expected] of [['dark', 'rgba(19, 19, 21, 0.95)'], ['light', 'rgba(247, 247, 250, 0.95)']]) {
    await browser.eval(`window.razorboxDemo.options.theme = ${JSON.stringify(theme)}; true`)
    await openCard(browser, '.gallery-card')
    assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox__backdrop")).backgroundColor'), expected, `${theme}: backdrop`)
    await close(browser)
  }
  await browser.eval(`window.razorboxDemo.options.theme = ${JSON.stringify(previousTheme)}; true`)
}))
