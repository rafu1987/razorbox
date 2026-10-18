/* Accessibility checks in a real browser: axe-core rules plus real keyboard input via CDP. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { chromium, sleep, waitUntil, withDemo } from './helpers/browser.mjs'

const axeSource = await readFile(createRequire(import.meta.url).resolve('axe-core/axe.min.js'), 'utf8')

const KEYS = {
  Tab: { code: 'Tab', windowsVirtualKeyCode: 9 },
  Escape: { code: 'Escape', windowsVirtualKeyCode: 27 },
  ArrowRight: { code: 'ArrowRight', windowsVirtualKeyCode: 39 },
  ArrowLeft: { code: 'ArrowLeft', windowsVirtualKeyCode: 37 }
}

// Trusted key events, so the browser moves focus natively like a real user.
async function press (browser, key, { shift = false } = {}) {
  const params = { key, ...KEYS[key], modifiers: shift ? 8 : 0 }
  await browser.call('Input.dispatchKeyEvent', { type: 'keyDown', ...params })
  await browser.call('Input.dispatchKeyEvent', { type: 'keyUp', ...params })
}

const activeElement = browser => browser.eval(`(() => {
  const el = document.activeElement;
  return {
    inside: Boolean(el?.closest('.razorbox')),
    action: el?.getAttribute('data-rb-action') || '',
    tag: el?.tagName || ''
  };
})()`)

async function axeViolations (browser) {
  // Wait until the fade-in is complete so contrast is measured on final colors.
  await waitUntil(() => browser.eval('Number(getComputedStyle(document.querySelector(".razorbox__backdrop")).opacity) >= .999'))
  await sleep(350)
  return browser.eval(`axe.run(document.querySelector('.razorbox'), {
    runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] },
    rules: { region: { enabled: false } }
  }).then(result => result.violations.map(v => v.id + ': ' + v.help + ' (' + v.nodes.map(n => n.target.join(' ')).join(', ') + ')'))`)
}

async function openFirstGallery (browser) {
  await browser.eval(`(() => {
    const trigger = document.querySelector('.gallery-card');
    trigger.focus();
    trigger.click();
    return true;
  })()`)
  await waitUntil(() => browser.eval('document.querySelector(".razorbox").classList.contains("is-entered")'))
}

async function closeWithEscape (browser) {
  await press(browser, 'Escape')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox").hidden'))
}

test('lightbox accessibility: dialog semantics, axe rules, focus management and keyboard', { skip: !chromium && 'No Chromium binary found.' }, t => withDemo(t, async browser => {
  await browser.call('Emulation.setFocusEmulationEnabled', { enabled: true })
  await browser.eval(`${axeSource}; true`)

  await t.test('opening moves focus into a labelled modal dialog', async () => {
    await openFirstGallery(browser)
    const dialog = await browser.eval(`(() => {
      const root = document.querySelector('.razorbox');
      return { role: root.getAttribute('role'), modal: root.getAttribute('aria-modal'), label: root.getAttribute('aria-label') };
    })()`)
    assert.deepEqual({ role: dialog.role, modal: dialog.modal }, { role: 'dialog', modal: 'true' })
    assert.ok(dialog.label, 'Dialog needs an accessible name')
    assert.deepEqual(await activeElement(browser), { inside: true, action: 'close', tag: 'BUTTON' })
  })

  await t.test('image gallery has no axe violations', async () => {
    assert.deepEqual(await axeViolations(browser), [])
  })

  await t.test('thumbnail panel has no axe violations and exposes its state', async () => {
    const expanded = () => browser.eval('document.querySelector("[data-rb-action=thumbs]").getAttribute("aria-expanded")')
    const panelHidden = () => browser.eval('document.querySelector(".razorbox__thumbs").getAttribute("aria-hidden")')
    const initial = await expanded()
    assert.ok(['true', 'false'].includes(initial))
    assert.equal(await panelHidden(), initial === 'true' ? 'false' : 'true', 'Panel aria-hidden must mirror aria-expanded')
    const controls = await browser.eval('document.querySelector("[data-rb-action=thumbs]").getAttribute("aria-controls")')
    assert.equal(await browser.eval(`Boolean(document.getElementById(${JSON.stringify(controls)}))`), true, 'aria-controls must point at the thumbnail panel')
    for (const state of initial === 'true' ? ['false', 'true'] : ['true', 'false']) {
      await browser.eval('document.querySelector("[data-rb-action=thumbs]").click()')
      assert.equal(await expanded(), state)
      assert.equal(await panelHidden(), state === 'true' ? 'false' : 'true')
      assert.deepEqual(await axeViolations(browser), [], `thumbnails expanded=${state}`)
    }
  })

  await t.test('Tab and Shift+Tab keep focus inside the dialog', async () => {
    await browser.eval('document.querySelector("[data-rb-action=close]").focus()')
    const count = await browser.eval('document.querySelectorAll(\'.razorbox button:not([hidden]), .razorbox a[href], .razorbox [tabindex]:not([tabindex="-1"])\').length')
    for (let i = 0; i < count + 3; i++) {
      await press(browser, 'Tab')
      assert.equal((await activeElement(browser)).inside, true, `Tab #${i + 1} left the dialog`)
    }
    for (let i = 0; i < count + 3; i++) {
      await press(browser, 'Tab', { shift: true })
      assert.equal((await activeElement(browser)).inside, true, `Shift+Tab #${i + 1} left the dialog`)
    }
  })

  await t.test('arrow keys navigate and the change is announced', async () => {
    await browser.eval('document.querySelector("[data-rb-action=close]").focus()')
    const before = await browser.eval('window.razorboxDemo.index')
    const statusBefore = await browser.eval('document.querySelector("[data-rb-status]").textContent')
    await press(browser, 'ArrowRight')
    assert.equal(await browser.eval('window.razorboxDemo.index'), before + 1)
    const status = await browser.eval('document.querySelector("[data-rb-status]").textContent')
    assert.ok(status && status !== statusBefore, 'role=status must announce the new slide')
    await press(browser, 'ArrowLeft')
    assert.equal(await browser.eval('window.razorboxDemo.index'), before)
  })

  await t.test('Escape closes and returns focus to the trigger', async () => {
    await closeWithEscape(browser)
    assert.equal(await browser.eval('document.activeElement === document.querySelector(".gallery-card")'), true)
    assert.equal(await browser.eval('document.body.classList.contains("razorbox-scroll-lock")'), false)
  })

  await t.test('light theme has no axe violations', async () => {
    const previousTheme = await browser.eval('window.razorboxDemo.options.theme')
    await browser.eval('window.razorboxDemo.options.theme = "light"')
    await openFirstGallery(browser)
    assert.deepEqual(await axeViolations(browser), [])
    await closeWithEscape(browser)
    await browser.eval(`window.razorboxDemo.options.theme = ${JSON.stringify(previousTheme)}`)
  })

  await t.test('inline HTML and iframe slides have no axe violations', async () => {
    for (const items of [
      '[{type:"html",html:"<h2>Inline</h2><p>Accessible content</p>"}]',
      '[{type:"iframe",src:"/demo/iframe.html"}]',
      '[{src:"/demo/assets/demo-motion.mp4",caption:"Video"}]'
    ]) {
      await browser.eval(`window.razorboxDemo.open(${items})`)
      await waitUntil(() => browser.eval('document.querySelector(".razorbox").classList.contains("is-entered")'))
      assert.deepEqual(await axeViolations(browser), [], items)
      await closeWithEscape(browser)
    }
  })
}))
