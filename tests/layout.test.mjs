/* Scroll lock, arrow placement, backdrop and inline HTML theme in a real browser. */
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

// Issues #2 and #4: a denser backdrop and inline HTML in the theme's colors.
test('backdrop and inline HTML follow the theme', { skip }, t => withDemo(t, async browser => {
  const previousTheme = await browser.eval('window.razorboxDemo.options.theme')
  const read = `(() => {
    const panel = getComputedStyle(document.querySelector('.razorbox__media--html'))
    const input = getComputedStyle(document.querySelector('.razorbox #demo-inline-input'))
    return {
      backdrop: getComputedStyle(document.querySelector('.razorbox__backdrop')).backgroundColor,
      panel: panel.backgroundColor,
      scheme: panel.colorScheme,
      text: panel.color,
      input: input.color
    }
  })()`
  for (const [theme, expected] of [
    ['dark', { backdrop: 'rgba(19, 19, 21, 0.95)', panel: 'rgb(30, 30, 33)', scheme: 'dark', text: 'rgb(236, 236, 239)' }],
    ['light', { backdrop: 'rgba(247, 247, 250, 0.95)', panel: 'rgb(255, 255, 255)', scheme: 'light', text: 'rgb(36, 37, 42)' }]
  ]) {
    await browser.eval(`window.razorboxDemo.options.theme = ${JSON.stringify(theme)}; true`)
    await openCard(browser, '.media-card[data-type=html]')
    const actual = await browser.eval(read)
    assert.equal(actual.backdrop, expected.backdrop, `${theme}: backdrop`)
    assert.equal(actual.panel, expected.panel, `${theme}: HTML panel background`)
    assert.equal(actual.scheme, expected.scheme, `${theme}: HTML panel color-scheme`)
    assert.equal(actual.text, expected.text, `${theme}: HTML panel text`)
    assert.equal(actual.input, expected.text, `${theme}: inline form fields use the panel's text color`)
    await close(browser)
  }
  await browser.eval(`window.razorboxDemo.options.theme = ${JSON.stringify(previousTheme)}; true`)
}))

// Phones in landscape: the desktop padding, the caption and the thumbnail
// rail left a video about 80px tall.
test('content fills short landscape screens and the rail makes room', { skip }, t => withDemo(t, async browser => {
  const size = (width, height) => browser.call('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 3, mobile: true })
  const state = `(() => {
    const slide = document.querySelector('.razorbox__slide.is-active')
    const media = slide.querySelector('.razorbox__media').getBoundingClientRect()
    const caption = slide.querySelector('.razorbox__caption')
    return {
      height: media.height,
      ratio: media.width / media.height,
      caption: caption ? getComputedStyle(caption).display : 'none',
      thumbs: document.querySelector('.razorbox').classList.contains('is-thumbs-open')
    }
  })()`
  await browser.eval('window.razorboxDemo.options.thumbsOpen = true; true')
  await size(844, 390)
  for (const selector of ['.media-card[data-type=video]', '.media-card[href*=youtube]', '.media-card[href*=vimeo]']) {
    await openCard(browser, selector)
    const video = await browser.eval(state)
    assert.equal(video.height, 390, `${selector}: the player takes the full height`)
    assert.ok(Math.abs(video.ratio - 16 / 9) < 0.01, `${selector}: the player stays 16:9`)
    assert.equal(video.caption, 'none', `${selector}: no caption over the video controls`)
    assert.equal(video.thumbs, false, `${selector}: the rail starts hidden on a short screen`)
    await close(browser)
  }
  for (const selector of ['.media-card[data-type=html]', '.media-card[data-type=iframe]', '.media-card[href$=".pdf"]']) {
    await openCard(browser, selector)
    const content = await browser.eval(state)
    assert.ok(content.height >= 280, `${selector}: ${content.height}px of 390px for the content`)
    await close(browser)
  }

  // Turning the phone hides the rail and brings it back.
  await size(390, 844)
  await openCard(browser, '.media-card[data-type=video]')
  assert.equal((await browser.eval(state)).thumbs, true, 'Portrait shows the rail')
  await size(844, 390)
  await sleep(400)
  assert.equal((await browser.eval(state)).thumbs, false, 'Landscape hides the rail')
  await size(390, 844)
  await sleep(400)
  assert.equal((await browser.eval(state)).thumbs, true, 'Back in portrait, the rail returns')

  // Showing it by hand on a short screen survives Safari's toolbar resizing the viewport.
  await size(844, 390)
  await sleep(400)
  await browser.eval('window.razorboxDemo.toggleThumbnails(); true')
  await size(844, 340)
  await sleep(400)
  assert.equal((await browser.eval(state)).thumbs, true, 'A manually opened rail stays open')
  await close(browser)
}))
