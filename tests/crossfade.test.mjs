/* The crossfade must never let the translucent backdrop or the page show through the images. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { chromium, sleep, waitUntil, withDemo } from './helpers/browser.mjs'

// Goes from image `from` to the next one and samples both slides every frame.
// Coverage is how opaque the overlapping image area is: with plus-lighter the
// opacities add up; with normal blending it is a + b * (1 - a).
async function sampleTransition (browser, transition, from) {
  await browser.eval(`(() => {
    window.razorboxDemo.options.transition = ${JSON.stringify(transition)}
    window.razorboxDemo._ui.classList.toggle('razorbox--slide', ${JSON.stringify(transition)} === 'slide')
    window.razorboxDemo.goTo(${from})
    return true
  })()`)
  await sleep(900)
  return browser.eval(`(async () => {
    window.razorboxDemo.next()
    const samples = []
    const start = performance.now()
    while (performance.now() - start < 1000) {
      await new Promise(resolve => requestAnimationFrame(resolve))
      const incoming = document.querySelector('.razorbox__slide.is-active')
      const outgoing = document.querySelector('.razorbox__slide.is-leaving')
      if (!incoming || !outgoing) continue
      const a = Number(getComputedStyle(incoming).opacity)
      const b = Number(getComputedStyle(outgoing).opacity)
      const additive = getComputedStyle(incoming).mixBlendMode === 'plus-lighter'
      const caption = outgoing.querySelector('.razorbox__caption')
      samples.push({
        a,
        b,
        coverage: additive ? Math.min(1, a + b) : a + b * (1 - a),
        oldCaption: caption ? Number(getComputedStyle(caption).opacity) : 0
      })
    }
    return {
      frames: samples.length,
      minCoverage: Math.min(...samples.map(s => s.coverage)),
      // Highest outgoing opacity once the incoming image is (almost) fully shown.
      lingering: Math.max(0, ...samples.filter(s => s.a >= 0.95).map(s => s.b)),
      oldCaption: Math.max(0, ...samples.slice(Math.ceil(samples.length / 2)).map(s => s.oldCaption))
    }
  })()`)
}

test('crossfade keeps the images opaque and fades both images in sync', { skip: !chromium && 'No Chromium binary found.' }, t => withDemo(t, async browser => {
  await browser.eval('document.querySelector(".gallery-card").click(); true')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox").classList.contains("is-entered")'))
  await sleep(700)

  // Images 5 -> 6 of the first gallery have different aspect ratios, so the
  // wider outgoing image sticks out beside the incoming one.
  const fade = await sampleTransition(browser, 'fade', 4)
  assert.ok(fade.frames >= 3, `Too few transition frames sampled (${fade.frames})`)
  // Fading both slides with normal blending dropped to 0.75 and let the page show through.
  assert.ok(fade.minCoverage >= 0.98, `Crossfade lets the background show through (coverage ${fade.minCoverage.toFixed(3)})`)
  // Holding the outgoing slide opaque instead left its edges visible after the new image was in.
  assert.ok(fade.lingering <= 0.1, `Outgoing image still visible after the incoming one is shown (opacity ${fade.lingering.toFixed(2)})`)
  assert.equal(fade.oldCaption, 0, 'The outgoing caption must not show behind the incoming one')

  const slide = await sampleTransition(browser, 'slide', 0)
  assert.ok(slide.frames >= 3, `Too few transition frames sampled (${slide.frames})`)
  assert.ok(slide.minCoverage >= 0.999, 'Slide transition keeps both slides fully opaque')
}))
