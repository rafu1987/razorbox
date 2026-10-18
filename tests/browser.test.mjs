/* Real-browser integration test of the demo page. Uses Chromium's CDP and Node built-ins. */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { writeFile } from 'node:fs/promises'
import { chromium, sleep, waitUntil, withDemo } from './helpers/browser.mjs'

test('gallery, thumbs, zoom, playback, keyboard, second gallery and close', { skip: !chromium && 'No Chromium binary found.' }, t => withDemo(t, async browser => {
  assert.equal(await browser.eval('document.querySelectorAll("[data-razorbox=atlas]").length'), 6)
  assert.equal(await browser.eval('document.querySelectorAll("[data-razorbox=details]").length'), 3)
  assert.equal(await browser.eval('document.querySelectorAll("[data-razorbox=motion]").length'), 3)
  assert.equal(await browser.eval('document.querySelectorAll("[data-razorbox=extras]").length'), 4)
  assert.equal(await browser.eval('document.querySelectorAll("[data-example-tab]").length'), 9)
  assert.equal(await browser.eval('Boolean(document.querySelector("[data-example-tab=map]"))'), true)
  assert.equal(await browser.eval('Boolean(document.querySelector("[data-example-tab=pdf]"))'), true)
  await browser.eval('document.querySelector("[data-example-tab=youtube]").click()')
  assert.equal(await browser.eval('document.querySelector("[data-example-panel=youtube]").hidden'), false)
  assert.equal(await browser.eval('document.querySelector("[data-example-panel=gallery]").hidden'), true)
  assert.equal(await browser.eval('document.querySelector("[data-example-panel=youtube] code").textContent.includes("lPYHfdapsEY")'), true)

  if (process.env.RAZORBOX_PAGE_SCREENSHOT) {
    const preview = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(process.env.RAZORBOX_PAGE_SCREENSHOT, Buffer.from(preview.data, 'base64'))
  }
  if (process.env.RAZORBOX_EXAMPLES_SCREENSHOT) {
    await browser.eval('document.querySelector("#examples").scrollIntoView({block:"start",behavior:"instant"})')
    await sleep(180)
    const examplesShot = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(process.env.RAZORBOX_EXAMPLES_SCREENSHOT, Buffer.from(examplesShot.data, 'base64'))
    await browser.eval('window.scrollTo({top:0,behavior:"instant"})')
  }
  const baseline = await browser.eval(`(() => {
    const html = document.documentElement;
    return { width: html.clientWidth, inner: innerWidth, heroX: document.querySelector('.hero').getBoundingClientRect().left };
  })()`)
  // The lock uses BODY overflow and a separate backdrop opacity
  // transition. Verify that the native scrollbar is NOT simulated via DOM.
  const openingInitial = await browser.eval(`(() => {
    document.querySelector('.gallery-card').click();
    const root = document.querySelector('.razorbox');
    return {
      rootBackground: getComputedStyle(root).backgroundColor,
      backdropOpacity: Number(getComputedStyle(root.querySelector('.razorbox__backdrop')).opacity),
      fakeScrollbar: Boolean(root.querySelector('.razorbox__scrollbar-veil')),
      bodyLocked: document.body.classList.contains('razorbox-scroll-lock'),
      rootLocked: document.documentElement.classList.contains('razorbox-scroll-lock'),
      bodyOverflow: getComputedStyle(document.body).overflow
    };
  })()`)
  assert.equal(openingInitial.rootBackground, 'rgba(0, 0, 0, 0)')
  assert.equal(openingInitial.backdropOpacity, 0, 'Backdrop must start transparent')
  assert.equal(openingInitial.fakeScrollbar, false, 'Never reconstruct the OS scrollbar with DOM elements')
  assert.equal(openingInitial.bodyLocked, true, 'Scroll lock must be on BODY')
  assert.equal(openingInitial.rootLocked, false, 'Do not toggle overflow on the HTML root')
  assert.equal(openingInitial.bodyOverflow, 'hidden', 'Body lock must hide native scrollbar')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox").classList.contains("is-entered")'))
  await sleep(110)
  const openingMid = await browser.eval('Number(getComputedStyle(document.querySelector(".razorbox__backdrop")).opacity)')
  assert.ok(openingMid > 0 && openingMid < 1, 'Backdrop should be mid-fade at 110ms')
  await waitUntil(() => browser.eval('Number(getComputedStyle(document.querySelector(".razorbox__backdrop")).opacity) >= .999'))
  await waitUntil(() => browser.eval('Boolean(window.razorboxDemo.isOpen && document.querySelector(".razorbox__slide.is-loaded"))'))
  assert.equal(await browser.eval('document.querySelector(".razorbox__counter").textContent'), '1 / 6')
  assert.equal(await browser.eval('document.querySelector(".razorbox__caption").textContent'), 'Golden Hour - Warm dunes after sunset')
  // Captions should occupy their own row beneath the actual image, not
  // overlap it or paint a gradient behind the overlay controls.
  const initialCaptionLayout = await browser.eval(`(() => {
    const slide = document.querySelector('.razorbox__slide.is-active');
    const img = slide.querySelector('.razorbox__image').getBoundingClientRect();
    const captionEl = slide.querySelector('.razorbox__caption');
    const caption = captionEl.getBoundingClientRect();
    const container = slide.getBoundingClientRect();
    return {
      imgBottom: img.bottom, captionTop: caption.top, captionBottom: caption.bottom,
      viewportBottom: container.bottom,
      captionPosition: getComputedStyle(captionEl).position,
      captionBackground: getComputedStyle(captionEl).backgroundImage,
      headerBackground: getComputedStyle(document.querySelector('.razorbox__header')).backgroundImage
    };
  })()`)
  assert.ok(initialCaptionLayout.captionTop >= initialCaptionLayout.imgBottom - 1, 'Caption must follow the image vertically')
  assert.ok(initialCaptionLayout.captionBottom <= initialCaptionLayout.viewportBottom + 1, 'Caption must fit inside the viewport')
  assert.equal(initialCaptionLayout.captionPosition, 'relative')
  assert.equal(initialCaptionLayout.captionBackground, 'none')
  assert.equal(initialCaptionLayout.headerBackground, 'none')
  assert.equal(await browser.eval('document.querySelector(".razorbox__thumbs-track").children.length'), 6)
  await waitUntil(() => browser.eval('getComputedStyle(document.querySelector(".razorbox")).visibility === "visible"'))
  // The opening fades only the backdrop, not the dialog container.
  const backdrop = await browser.eval(`(() => {
    const root = document.querySelector('.razorbox');
    return {
      backdropTransition: getComputedStyle(root.querySelector('.razorbox__backdrop')).transitionProperty,
      base: getComputedStyle(root).backgroundColor,
      locked: document.body.classList.contains('razorbox-scroll-lock')
    };
  })()`)
  assert.equal(backdrop.backdropTransition.includes('opacity'), true)
  assert.equal(backdrop.locked, true)
  assert.equal(backdrop.base, 'rgba(0, 0, 0, 0)', 'Root must not flash with an initial tint')
  assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox")).opacity'), '1')
  assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox")).transitionDuration'), '0s')
  const scrollLockMetrics = await browser.eval(`(() => ({
    width: document.documentElement.clientWidth,
    heroX: document.querySelector('.hero').getBoundingClientRect().left,
    gutter: getComputedStyle(document.documentElement).scrollbarGutter,
    bodyMargin: parseFloat(getComputedStyle(document.body).marginRight) || 0,
    lightboxRight: document.querySelector('.razorbox').getBoundingClientRect().right,
    backdropRight: document.querySelector('.razorbox__backdrop').getBoundingClientRect().right,
    rightmostElement: Boolean(document.elementFromPoint(innerWidth - 2, 100)?.closest('.razorbox'))
  }))()`)
  if (baseline.inner > baseline.width) {
    assert.ok(scrollLockMetrics.width >= baseline.width, 'The scrollbar must disappear without keeping a reserved root gutter')
    assert.ok(Math.abs(scrollLockMetrics.heroX - baseline.heroX) <= 1, `Page moved horizontally: before ${baseline.heroX}, after ${scrollLockMetrics.heroX}`)
    assert.ok(scrollLockMetrics.bodyMargin >= baseline.inner - baseline.width - 1, 'Body needs measured margin compensation')
  }
  assert.equal(scrollLockMetrics.gutter, 'auto', 'Demo uses native root gutter behavior')
  assert.ok(Math.abs(scrollLockMetrics.lightboxRight - baseline.inner) <= 1, 'Lightbox must cover former scrollbar track')
  assert.ok(Math.abs(scrollLockMetrics.backdropRight - baseline.inner) <= 1, 'Backdrop must cover former scrollbar track')
  assert.equal(scrollLockMetrics.rightmostElement, true, 'Lightbox must be hit-testable at far-right edge')
  const visualLayout = await browser.eval(`(() => {
    const r = selector => document.querySelector(selector).getBoundingClientRect();
    const header = r('.razorbox__header');
    const bar = r('.razorbox__toolbar');
    const stage = r('.razorbox__stage');
    const imageSlide = r('.razorbox__slide');
    const arrow = r('.razorbox__arrow');
    const overlay = document.querySelector('.razorbox');
    return { inset: bar.top - header.top, rightInset: overlay.getBoundingClientRect().right - bar.right,
      imageTop: imageSlide.top, stageTop: stage.top,
      toolbarBackground: getComputedStyle(document.querySelector('.razorbox__toolbar')).backgroundColor,
      arrowBackground: getComputedStyle(document.querySelector('.razorbox__arrow')).backgroundColor,
      slidePaddingTop: getComputedStyle(document.querySelector('.razorbox__slide')).paddingTop };
  })()`)
  assert.ok(visualLayout.inset >= 4 && visualLayout.rightInset >= 4, 'Toolbar needs a small inset')
  assert.equal(visualLayout.slidePaddingTop, '0px', 'Images should start at viewport top')
  assert.equal(visualLayout.imageTop, visualLayout.stageTop)
  assert.equal(visualLayout.arrowBackground, visualLayout.toolbarBackground, 'Arrow contrast should match controls')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("razorbox--fade")'), true)
  assert.equal(await browser.eval('document.querySelector(".razorbox").dataset.theme'), 'dark')
  assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox__thumbs")).overflowX'), 'hidden')
  assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox__thumbs-scroller")).touchAction'), 'pan-x')
  assert.equal(await browser.eval('document.querySelector(".razorbox__toolbar [data-rb-action]").dataset.rbAction'), 'zoom')
  assert.equal(await browser.eval('document.querySelector(".razorbox__toolbar [data-rb-action]:nth-child(2)").dataset.rbAction'), 'play')
  // On desktop too, thumbnail rail is under the image, never on the right.
  const thumbGeometry = await browser.eval(`(() => {
    const panel = document.querySelector('.razorbox__thumbs').getBoundingClientRect();
    const stage = document.querySelector('.razorbox__viewport').getBoundingClientRect();
    return { panelWidth: panel.width, stageWidth: stage.width, panelTop: panel.top, stageBottom: stage.bottom };
  })()`)
  assert.equal(thumbGeometry.panelWidth, thumbGeometry.stageWidth)
  assert.ok(Math.abs(thumbGeometry.panelTop - thumbGeometry.stageBottom) <= 115)

  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-thumbs-open")'), true)
  await browser.eval('document.querySelector("[data-rb-action=thumbs]").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-thumbs-open")'), false)
  await browser.eval('document.querySelector("[data-rb-action=thumbs]").click()')
  await browser.eval('document.querySelector("[data-rb-action=next]").click()')
  assert.equal(await browser.eval('window.razorboxDemo.index'), 1)
  await waitUntil(() => browser.eval('document.querySelector(".razorbox--fade .razorbox__slide.is-active")?.classList.contains("from-right")'))
  assert.equal(await browser.eval('document.querySelector(".razorbox--fade .razorbox__slide.is-active")?.style.transform || ""'), '')
  assert.equal(await browser.eval('getComputedStyle(document.querySelector(".razorbox--fade .razorbox__slide.is-active")).transform'), 'matrix(1, 0, 0, 1, 0, 0)')
  const overlapping = await waitUntil(() => browser.eval(`(() => {
    const outgoing = document.querySelector('.razorbox--fade .razorbox__slide.is-leaving');
    const incoming = document.querySelector('.razorbox--fade .razorbox__slide.is-active');
    if (!outgoing || !incoming) return null;
    return {
      oldTransform: getComputedStyle(outgoing).transform,
      newTransform: getComputedStyle(incoming).transform,
      oldOpacity: Number(getComputedStyle(outgoing).opacity),
      newOpacity: Number(getComputedStyle(incoming).opacity),
      oldCaption: outgoing.querySelector('.razorbox__caption')?.textContent,
      newCaption: incoming.querySelector('.razorbox__caption')?.textContent
    };
  })()`), 1600)
  assert.equal(overlapping.oldTransform, 'matrix(1, 0, 0, 1, 0, 0)')
  assert.equal(overlapping.newTransform, 'matrix(1, 0, 0, 1, 0, 0)')
  assert.ok(overlapping.oldOpacity >= 0 && overlapping.newOpacity >= 0)
  assert.equal(overlapping.oldCaption, 'Golden Hour - Warm dunes after sunset')
  assert.equal(overlapping.newCaption, 'Northern Peaks - Frozen ridgelines in pale blue')
  assert.equal(await browser.eval('document.querySelector(".razorbox__counter").textContent'), '2 / 6')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox__slide.is-active").classList.contains("is-loaded")'))
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-zoomed")'), true)
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-zoomed")'), false)
  await browser.eval('document.querySelector("[data-rb-action=play]").click()')
  assert.equal(await browser.eval('window.razorboxDemo.isPlaying'), true)
  await browser.eval('document.querySelector("[data-rb-action=play]").click()')
  assert.equal(await browser.eval('window.razorboxDemo.isPlaying'), false)
  await browser.eval('document.querySelector(".razorbox__slide.is-active .razorbox__image").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-zoomed")'), true)
  await browser.eval('document.querySelector(".razorbox__slide.is-active .razorbox__image").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-zoomed")'), false)

  // Desktop zoom: wheel and Chromium/Firefox ctrl+wheel trackpad pinches
  // should be smooth, pointer-centered, and capable of going past the 2x
  // toolbar magnification. The toolbar must always reset deep zoom to fit.
  assert.equal(await browser.eval('document.getElementById("option-wheel").checked'), true)
  const firstWheel = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const rect = img.getBoundingClientRect();
    const x = rect.left + rect.width / 2 + 75;
    const y = rect.top + rect.height / 2 + 40;
    const originalX = (x - rect.left) / rect.width;
    const originalY = (y - rect.top) / rect.height;
    const event = new WheelEvent('wheel', {bubbles:true, cancelable:true, deltaY:-90, clientX:x, clientY:y});
    img.dispatchEvent(event);
    const after = img.getBoundingClientRect();
    return {
      prevented: event.defaultPrevented,
      zoom: box._zoom,
      anchorXError: Math.abs((x - after.left) / after.width - originalX),
      anchorYError: Math.abs((y - after.top) / after.height - originalY)
    };
  })()`)
  assert.equal(firstWheel.prevented, true)
  assert.ok(firstWheel.zoom > 1 && firstWheel.zoom < 2)
  assert.ok(firstWheel.anchorXError < 0.005, `Wheel zoom shifted its X anchor (${firstWheel.anchorXError})`)
  assert.ok(firstWheel.anchorYError < 0.005, `Wheel zoom shifted its Y anchor (${firstWheel.anchorYError})`)
  const deepWheel = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const rect = img.getBoundingClientRect();
    for (let i = 0; i < 18; i++) img.dispatchEvent(new WheelEvent('wheel', {
      bubbles:true, cancelable:true, deltaY:-120,
      clientX:rect.left+rect.width/2, clientY:rect.top+rect.height/2
    }));
    return {scale:box._zoom, max:box.options.maxZoom};
  })()`)
  assert.ok(deepWheel.scale > 2, 'Mouse wheel should zoom farther than the toolbar control')
  assert.ok(deepWheel.scale <= deepWheel.max)
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('window.razorboxDemo._zoom'), 1, 'Toolbar resets wheel magnification to fit')

  const trackpad = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const r = img.getBoundingClientRect();
    const event = new WheelEvent('wheel', {bubbles:true, cancelable:true, ctrlKey:true,
      deltaY:-18, clientX:r.left+r.width/2, clientY:r.top+r.height/2});
    img.dispatchEvent(event);
    return {prevented:event.defaultPrevented, zoom:box._zoom};
  })()`)
  assert.equal(trackpad.prevented, true, 'Trackpad pinch must not zoom the browser page')
  assert.ok(trackpad.zoom > 1 && trackpad.zoom < 2, 'Small trackpad deltas should produce smooth scale changes')
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('window.razorboxDemo._zoom'), 1)

  // Safari uses gesturestart/change/end rather than ctrl+wheel.
  const safari = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const r = img.getBoundingClientRect();
    const dispatch = (type, scale) => {
      const event = new Event(type, {bubbles:true, cancelable:true});
      event.scale = scale;
      event.clientX = r.left+r.width/2;
      event.clientY = r.top+r.height/2;
      img.dispatchEvent(event);
      return event.defaultPrevented;
    };
    const start = dispatch('gesturestart', 1);
    const change = dispatch('gesturechange', 4.5);
    const scale = box._zoom;
    const end = dispatch('gestureend', 4.5);
    return {start,change,end,scale};
  })()`)
  assert.ok(safari.start && safari.change && safari.end, 'Safari pinch events must prevent browser zoom')
  assert.ok(safari.scale > 2 && safari.scale <= 8, 'Safari pinch can zoom beyond toolbar magnification')
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('window.razorboxDemo._zoom'), 1)

  const disabledWheel = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    box.options.wheelZoom = false;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const event = new WheelEvent('wheel', {bubbles:true, cancelable:true, deltaY:-100});
    img.dispatchEvent(event);
    const result = {prevented:event.defaultPrevented, zoom:box._zoom};
    box.options.wheelZoom = true;
    return result;
  })()`)
  assert.equal(disabledWheel.prevented, false)
  assert.equal(disabledWheel.zoom, 1)

  // Existing mobile pointer pinch is still supported with the higher cap.
  const pointerPinch = await browser.eval(`(() => {
    const box = window.razorboxDemo;
    const img = document.querySelector('.razorbox__slide.is-active .razorbox__image');
    const r = img.getBoundingClientRect();
    const cx = r.left+r.width/2, cy = r.top+r.height/2;
    const fire = (type, pointerId, x) => img.dispatchEvent(new PointerEvent(type, {
      bubbles:true, pointerType:'touch', pointerId, button:0, clientX:x, clientY:cy
    }));
    fire('pointerdown', 100, cx-40);
    fire('pointerdown', 101, cx+40);
    fire('pointermove', 101, cx+160);
    const scale = box._zoom;
    fire('pointerup', 101, cx+160);
    fire('pointerup', 100, cx-40);
    return scale;
  })()`)
  assert.ok(pointerPinch > 2, 'Two-finger touch pinch should continue to zoom')
  await browser.eval('document.querySelector("[data-rb-action=zoom]").click()')
  assert.equal(await browser.eval('window.razorboxDemo._zoom'), 1)

  if (process.env.RAZORBOX_SCREENSHOT) {
    await sleep(450)
    const shot = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(process.env.RAZORBOX_SCREENSHOT, Buffer.from(shot.data, 'base64'))
  }

  await browser.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  assert.equal(await browser.eval('innerWidth'), 390)
  await waitUntil(() => browser.eval('Math.abs(parseFloat(getComputedStyle(document.querySelector(".razorbox__viewport")).bottom) - 96) < 1'))
  if (process.env.RAZORBOX_MOBILE_SCREENSHOT) {
    await sleep(350)
    const mobile = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(process.env.RAZORBOX_MOBILE_SCREENSHOT, Buffer.from(mobile.data, 'base64'))
  }
  for (const width of [390, 320]) {
    await browser.call('Emulation.setDeviceMetricsOverride', { width, height: 844, deviceScaleFactor: 1, mobile: true })
    const geometry = await browser.eval(`(() => {
      const count = document.querySelector('.razorbox__counter').getBoundingClientRect();
      const toolbar = document.querySelector('.razorbox__toolbar').getBoundingClientRect();
      const slide = document.querySelector('.razorbox__slide.is-active');
      const image = slide.querySelector('.razorbox__image').getBoundingClientRect();
      const caption = slide.querySelector('.razorbox__caption').getBoundingClientRect();
      const arrow = document.querySelector('.razorbox__arrow--prev').getBoundingClientRect();
      return { countRight: count.right, toolbarLeft: toolbar.left, imageTop: image.top, imageBottom: image.bottom,
        captionTop: caption.top, captionBottom: caption.bottom, slideBottom: slide.getBoundingClientRect().bottom,
        arrowCenterY: arrow.top + arrow.height / 2, arrowLeft: arrow.left };
    })()`)
    assert.ok(geometry.countRight <= geometry.toolbarLeft, `Mobile toolbar overlaps counter at ${width}px`)
    assert.ok(geometry.arrowCenterY >= geometry.imageTop && geometry.arrowCenterY <= geometry.imageBottom, `Mobile navigation arrow is not over image at ${width}px`)
    assert.ok(geometry.arrowLeft >= 0)
    assert.ok(geometry.captionTop >= geometry.imageBottom - 1, `Caption overlaps image at ${width}px`)
    assert.ok(geometry.captionBottom <= geometry.slideBottom + 1, `Caption overflows viewport at ${width}px`)
  }
  await browser.call('Emulation.setDeviceMetricsOverride', { width: 390, height: 844, deviceScaleFactor: 1, mobile: true })
  const beforeSwipe = await browser.eval('window.razorboxDemo.index')
  await browser.eval(`(() => {
    const stage = document.querySelector('.razorbox__stage');
    for (const [type, x] of [['pointerdown', 260], ['pointermove', 170], ['pointerup', 125]]) {
      stage.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType: 'touch', pointerId: 47, button: 0, clientX: x, clientY: 405 }));
    }
  })()`)
  assert.equal(await browser.eval('window.razorboxDemo.index'), beforeSwipe + 1)

  await browser.eval('document.querySelector("[data-rb-action=close]").click()')
  await waitUntil(() => browser.eval('!window.razorboxDemo.isOpen && !document.body.classList.contains("razorbox-scroll-lock")'))
  await browser.eval('document.querySelector(".secondary-grid a").click()')
  assert.equal(await browser.eval('document.querySelector(".razorbox__counter").textContent'), '1 / 3')
  await browser.eval('document.dispatchEvent(new KeyboardEvent("keydown", {key:"ArrowRight", bubbles:true}))')
  assert.equal(await browser.eval('document.querySelector(".razorbox__counter").textContent'), '2 / 3')
  await browser.eval('document.dispatchEvent(new KeyboardEvent("keydown", {key:"Escape", bubbles:true}))')
  assert.equal(await browser.eval('window.razorboxDemo.isOpen'), false)

  // Switching the playground option selects the real full-frame slide effect.
  await browser.eval(`(() => {
    const select = document.getElementById('option-transition');
    select.value = 'slide';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    document.querySelector('.gallery-card').click();
  })()`)
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("razorbox--slide")'), true)
  await waitUntil(() => browser.eval('document.querySelector(".razorbox__slide.is-active")?.classList.contains("is-loaded")'))
  await browser.eval('window.razorboxDemo.next()')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox__slide.is-active")?.classList.contains("from-right")'))
  assert.equal(await browser.eval('document.querySelector(".razorbox--slide .razorbox__slide.is-active").getAttribute("class").includes("from-right")'), true)
  await browser.eval('window.razorboxDemo.close(true)')

  // HTML5 playback is unmuted by default; this test browser opts into audible autoplay.
  await browser.call('Emulation.setDeviceMetricsOverride', { width: 1440, height: 950, deviceScaleFactor: 1, mobile: false })
  await browser.eval('document.querySelector(".media-grid .media-card").click()')
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__video"))'))
  assert.equal(await browser.eval('document.querySelector(".razorbox__video").muted'), false)
  const videoGeometry = await browser.eval(`(() => {
    const media = document.querySelector('.razorbox__media').getBoundingClientRect();
    const viewport = document.querySelector('.razorbox__viewport').getBoundingClientRect();
    return { mediaWidth: media.width, mediaHeight: media.height, viewportWidth: viewport.width, viewportHeight: viewport.height };
  })()`)
  assert.ok(videoGeometry.mediaWidth <= videoGeometry.viewportWidth)
  assert.ok(videoGeometry.mediaHeight <= videoGeometry.viewportHeight)
  const videoCaptionLayout = await browser.eval(`(() => {
    const slide = document.querySelector('.razorbox__slide.is-active');
    return {
      mediaBottom: slide.querySelector('.razorbox__media').getBoundingClientRect().bottom,
      captionTop: slide.querySelector('.razorbox__caption').getBoundingClientRect().top,
      captionBottom: slide.querySelector('.razorbox__caption').getBoundingClientRect().bottom,
      viewportBottom: slide.getBoundingClientRect().bottom
    };
  })()`)
  assert.ok(videoCaptionLayout.captionTop >= videoCaptionLayout.mediaBottom - 1, 'Media caption must not overlap the video')
  assert.ok(videoCaptionLayout.captionBottom <= videoCaptionLayout.viewportBottom + 1, 'Media caption must remain inside viewport')
  assert.equal(await browser.eval('document.querySelector("[data-rb-action=zoom]").hidden'), true)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__video") && !document.querySelector(".razorbox__video").paused)'), 9000)
  await browser.eval('window.razorboxDemo.next()')
  assert.equal(await browser.eval('document.querySelector(".razorbox__video")?.paused'), true)
  await waitUntil(() => browser.eval('document.querySelector(".razorbox__iframe")?.src.includes("youtube-nocookie.com/embed/lPYHfdapsEY" )'))
  // Playback starts through the player API (keeps the iOS user gesture), never via autoplay=1.
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe").src.includes("autoplay=1")'), false)
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe").src.includes("enablejsapi=1")'), true)
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__iframe").src).searchParams.has("mute")'), false)
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__iframe").src).hostname'), 'www.youtube-nocookie.com')
  await browser.eval('window.razorboxDemo.next()')
  await waitUntil(() => browser.eval('document.querySelector(".razorbox__iframe")?.src.includes("player.vimeo.com/video/253905163" )'))
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe").src.includes("muted=0")'), true)
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__iframe").src).searchParams.get("dnt")'), '1')
  await browser.eval('window.razorboxDemo.close(true)')
  assert.equal(await browser.eval('document.querySelectorAll(".razorbox__iframe, .razorbox__video").length'), 0)

  // A normal or already-embedded YouTube URL must not override privacy mode;
  // an unlisted Vimeo hash must be retained with dnt=1.
  await browser.eval(`(() => {
    window.razorboxDemo.open([
      {src:'https://www.youtube.com/embed/lPYHfdapsEY?autoplay=0'},
      {src:'https://vimeo.com/253905163?h=abcdef12'}
    ]);
  })()`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__iframe[src]"))'))
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__iframe").src).hostname'), 'www.youtube-nocookie.com')
  assert.equal(await browser.eval('document.querySelector(".razorbox__thumbs-track img[src*=ytimg]") === null'), true,
    'Provider thumbnails should not make unexpected network requests')
  await browser.eval('window.razorboxDemo.next()')
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active .razorbox__iframe[src*=player]"))'))
  const privateVimeo = await browser.eval(`(() => {
    const url = new URL(document.querySelector('.razorbox__slide.is-active .razorbox__iframe').src);
    return {host:url.hostname, hash:url.searchParams.get('h'), dnt:url.searchParams.get('dnt')};
  })()`)
  assert.deepEqual(privateVimeo, { host: 'player.vimeo.com', hash: 'abcdef12', dnt: '1' })
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval(`(() => {
    window.razorboxDemo.options.videoPrivacy = false;
    window.razorboxDemo.open([{src:'https://youtu.be/lPYHfdapsEY'}]);
  })()`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__iframe[src]"))'))
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__iframe").src).hostname'), 'www.youtube.com')
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval('window.razorboxDemo.options.videoPrivacy = true')
  await browser.eval(`window.razorboxDemo.open([
    {type:'iframe',src:'https://www.youtube.com/embed/lPYHfdapsEY'},
    {type:'iframe',src:'https://player.vimeo.com/video/253905163?autoplay=0'}
  ])`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active .razorbox__iframe[src]"))'))
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__slide.is-active .razorbox__iframe").src).hostname'), 'www.youtube-nocookie.com',
    'Even explicit iframe type must not bypass YouTube privacy mode')
  await browser.eval('window.razorboxDemo.next()')
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active .razorbox__iframe[src*=player]"))'))
  assert.equal(await browser.eval('new URL(document.querySelector(".razorbox__slide.is-active .razorbox__iframe").src).searchParams.get("dnt")'), '1',
    'Even explicit iframe type must not bypass Vimeo privacy mode')
  await browser.eval('window.razorboxDemo.close(true)')

  // Inline HTML is moved (not cloned), and restored with its original state.
  await browser.eval('document.querySelector("[data-razorbox=extras][data-type=html]").click()')
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__media--html #demo-inline-content"))'))
  assert.equal(await browser.eval('document.getElementById("demo-inline-content").hidden'), false)
  assert.equal(await browser.eval('document.querySelector(".razorbox__html input").id'), 'demo-inline-input')
  await browser.eval('document.querySelector("#demo-inline-input").value = "Persists after close"')
  await browser.eval('window.razorboxDemo.next()')
  assert.equal(await browser.eval('document.getElementById("demo-inline-content").hidden'), true)
  assert.equal(await browser.eval('document.getElementById("demo-inline-content").getAttribute("style")'), 'display: none')
  assert.equal(await browser.eval('document.getElementById("demo-inline-input").value'), 'Persists after close')
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__iframe")?.src.includes("/demo/iframe.html"))'))
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe").dataset.rbProvider'), 'iframe')
  await browser.eval('window.razorboxDemo.close(true)')
  assert.equal(await browser.eval('document.querySelectorAll(".razorbox__iframe").length'), 0)

  // Automatic localization prefers the page language (TYPO3 HTML lang)
  // and accepts region variants. Built-in translations also cover error UI.
  await browser.eval(`(() => {
    document.documentElement.lang = 'de-AT';
    const picker = document.getElementById('option-locale');
    picker.value = 'auto';
    picker.dispatchEvent(new Event('change', {bubbles: true}));
    window.razorboxDemo.open([{src:'data:image/png;base64,invalid',type:'image'}]);
  })()`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__error:not([hidden])"))'))
  assert.equal(await browser.eval('window.razorboxDemo.locale'), 'de')
  assert.equal(await browser.eval('document.querySelector("[data-rb-action=close]").getAttribute("aria-label")'), 'Galerie schließen')
  assert.equal(await browser.eval('document.querySelector(".razorbox__error:not([hidden])").textContent'), 'Der Inhalt konnte nicht geladen werden.')
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval(`(() => {
    document.documentElement.lang = 'fr-CH';
    window.razorboxDemo.options.l10n = { close: 'Quitter la galerie' };
    window.razorboxDemo.open([{src: document.querySelector('.gallery-card').href}]);
  })()`)
  assert.equal(await browser.eval('window.razorboxDemo.locale'), 'fr')
  assert.equal(await browser.eval('document.querySelector("[data-rb-action=close]").title'), 'Quitter la galerie')
  assert.equal(await browser.eval('document.querySelector("[data-rb-action=next]").getAttribute("aria-label")'), 'Élément suivant')
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval(`(() => {
    document.documentElement.lang = 'en';
    window.razorboxDemo.options.l10n = null;
    const picker = document.getElementById('option-locale');
    picker.value = 'de';
    picker.dispatchEvent(new Event('change', {bubbles: true}));
    window.razorboxDemo.open([{src: document.querySelector('.gallery-card').href}]);
  })()`)
  assert.equal(await browser.eval('window.razorboxDemo.locale'), 'de', 'Explicit language override should win')
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval(`(() => {
    document.getElementById('option-locale').value = 'auto';
    document.getElementById('option-locale').dispatchEvent(new Event('change', {bubbles: true }));
  })()`)

  // Standard Maps links become recognized maps, not images. Without a key
  // a compatible q=... embed is attempted, with an always-visible link.
  const map = 'https://www.google.com/maps/search/?api=1&query=Empire+State+Building&query_place_id=ChIJaXQRs6lZwokRY6EFpJnhNNE'
  await browser.eval(`window.razorboxDemo.open([{src: ${JSON.stringify(map)}}])`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active .razorbox__iframe[src]"))'))
  assert.equal(await browser.eval('window.razorboxDemo.items[0].type'), 'map')
  assert.deepEqual(await browser.eval(`(() => {
    const url = new URL(document.querySelector('.razorbox__slide.is-active .razorbox__iframe').src);
    return { host:url.host, q:url.searchParams.get('q'), output:url.searchParams.get('output') };
  })()`), { host: 'maps.google.com', q: 'Empire State Building', output: 'embed' })
  assert.equal(await browser.eval('document.querySelector(".razorbox__external-link").target'), '_blank')
  await browser.eval('window.razorboxDemo.close(true)')

  // Official API mode honors a place ID and the page language.
  await browser.eval(`(() => {
    document.documentElement.lang = 'fr';
    window.razorboxDemo.options.mapApiKey = 'TEST_KEY';
    window.razorboxDemo.open([{src:${JSON.stringify(map)}}]);
  })()`)
  assert.deepEqual(await browser.eval(`(() => {
    const url = new URL(document.querySelector('.razorbox__slide.is-active .razorbox__iframe').src);
    return {path:url.pathname, key:url.searchParams.get('key'), q:url.searchParams.get('q'),lang:url.searchParams.get('language')};
  })()`), {
    path: '/maps/embed/v1/place', key: 'TEST_KEY', q: 'place_id:ChIJaXQRs6lZwokRY6EFpJnhNNE', lang: 'fr'
  })
  await browser.eval('window.razorboxDemo.close(true)')
  // Direct embed URLs work without any API key.
  await browser.eval(`(() => {
    window.razorboxDemo.options.mapApiKey = '';
    window.razorboxDemo.open([{src:'https://www.google.com/maps/embed?pb=test'}]);
  })()`)
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe")?.src'), 'https://www.google.com/maps/embed?pb=test')
  await browser.eval('window.razorboxDemo.close(true)')

  // PDFs automatically use the browser's viewer, with an always-accessible
  // link for disabled viewers, CSP restrictions, and download-only servers.
  await browser.eval(`(() => {
    window.razorboxDemo.open([{src:'./demo/assets/razorbox-demo.pdf'}]);
  })()`)
  assert.equal(await browser.eval('window.razorboxDemo.items[0].type'), 'pdf')
  assert.equal(await browser.eval('document.querySelector(".razorbox__media--pdf") !== null'), true)
  assert.equal(await browser.eval('document.querySelector(".razorbox__iframe").src.endsWith(".pdf")'), true)
  assert.equal(await browser.eval('document.querySelector(".razorbox__external-link").textContent'), 'Ouvrir le PDF dans un nouvel onglet')
  assert.equal(await browser.eval('document.querySelector(".razorbox__external-link").rel'), 'noopener noreferrer')
  await browser.eval('window.razorboxDemo.close(true)')
  await browser.eval('document.documentElement.lang = "en"')

  // CSS-variable themes and trusted programmatic HTML.
  await browser.eval(`(() => {
    const select = document.getElementById('option-theme');
    select.value = 'light';
    select.dispatchEvent(new Event('change', { bubbles: true }));
    window.razorboxDemo.open([{ type:'html', html:'<h2 id="programmatic">Works</h2>' }]);
  })()`)
  assert.equal(await browser.eval('document.querySelector(".razorbox").dataset.theme'), 'light')
  assert.equal(await browser.eval('document.querySelector("#programmatic").textContent'), 'Works')
  assert.equal(await browser.eval('document.querySelector("[data-rb-action=zoom]").hidden'), true)
  await browser.eval('window.razorboxDemo.close(true)')
  if (process.env.RAZORBOX_LIGHT_SCREENSHOT) {
    await browser.eval('document.querySelector(".gallery-card").click()')
    await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active.is-loaded"))'))
    await sleep(380)
    const lightShot = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(process.env.RAZORBOX_LIGHT_SCREENSHOT, Buffer.from(lightShot.data, 'base64'))
    await browser.eval('window.razorboxDemo.close(true)')
  }

  // A long thumbnail rail can be dragged, and the drag should not click a thumbnail.
  await browser.eval(`(() => {
    const src = document.querySelector('.gallery-card').href;
    window.razorboxDemo.open(Array.from({length: 23}, (_,i) => ({src,caption:'Frame '+i,thumb:src})));
  })()`)
  await waitUntil(() => browser.eval('Boolean(document.querySelector(".razorbox__slide.is-active"))'))
  await browser.eval('window.razorboxDemo.toggleThumbnails()')
  const rail = await browser.eval(`(() => {
    const bar = document.querySelector('.razorbox__thumbs-scroller');
    bar.scrollLeft = 140;
    for (const [type,x] of [['pointerdown',380],['pointermove',270],['pointerup',240]]) {
      bar.dispatchEvent(new PointerEvent(type, {bubbles:true, pointerType:'mouse', pointerId:58, button:0, clientX:x, clientY:900}));
    }
    return {scrollWidth:bar.scrollWidth, clientWidth:bar.clientWidth, left:bar.scrollLeft, index:window.razorboxDemo.index};
  })()`)
  assert.ok(rail.scrollWidth > rail.clientWidth, 'Thumbnail rail must be horizontally scrollable')
  assert.ok(rail.left >= 200, 'Mouse drag should move thumbnail rail')
  await browser.eval('document.querySelector(".razorbox__thumb:nth-child(3)").click()')
  assert.equal(await browser.eval('window.razorboxDemo.index'), rail.index, 'A drag must not activate a thumbnail')
  await sleep(380)
  await browser.eval('document.querySelector(".razorbox__thumb:nth-child(3)").click()')
  assert.equal(await browser.eval('window.razorboxDemo.index'), 2, 'A normal click should activate a thumbnail')
  await browser.eval('window.razorboxDemo.close(true)')

  // Closing respects the actual CSS transition duration, even when a site
  // overrides it. The scrollbar remains locked until the fade has finished.
  await browser.eval(`(() => {
    window.razorboxDemo.open([{src:document.querySelector('.gallery-card').href}]);
    document.querySelector('.razorbox').style.setProperty('--rb-transition', '650ms');
    window.razorboxDemo.close();
  })()`)
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-closing")'), true)
  await sleep(300)
  assert.equal(await browser.eval('document.body.classList.contains("razorbox-scroll-lock")'), true,
    'Scroll should remain locked for a custom 650ms closing fade')
  await waitUntil(() => browser.eval('!document.body.classList.contains("razorbox-scroll-lock")'), 2000)
  assert.equal(await browser.eval('document.querySelector(".razorbox").hidden'), true)
  assert.equal(await browser.eval('document.querySelector(".razorbox").classList.contains("is-closing")'), false)
  // Regression for the system dark/light variants of the native scrollbar.
  // Neither color scheme may introduce a fake track, extra scrollbar width,
  // or restore scrolling before the close animation completes.
  const previousTheme = await browser.eval('window.razorboxDemo.options.theme')
  for (const scheme of ['dark', 'light']) {
    await browser.call('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-color-scheme', value: scheme }] })
    const variant = await browser.eval(`(() => {
      document.documentElement.style.colorScheme = '${scheme}';
      window.razorboxDemo.options.theme = 'auto';
      const before = {
        width: document.documentElement.clientWidth,
        margin: getComputedStyle(document.body).marginRight,
        scrollY: window.scrollY,
        heroX: document.querySelector('.hero').getBoundingClientRect().left
      };
      window.razorboxDemo.open([{ src: document.querySelector('.gallery-card').href }]);
      const overlay = document.querySelector('.razorbox');
      return {
        before,
        after: {
          width: document.documentElement.clientWidth,
          heroX: document.querySelector('.hero').getBoundingClientRect().left,
          bodyOverflow: getComputedStyle(document.body).overflow,
          scrollbarVisuals: overlay.querySelectorAll('.razorbox__scrollbar-veil, .razorbox__scrollbar-thumb').length,
          backdropEase: getComputedStyle(overlay.querySelector('.razorbox__backdrop')).transitionTimingFunction
        }
      };
    })()`)
    if (process.env.RAZORBOX_SCROLL_DEBUG) {
      const img = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      await writeFile(`${process.env.RAZORBOX_SCROLL_DEBUG}-${scheme}-opening.png`, Buffer.from(img.data, 'base64'))
    }
    assert.equal(variant.after.scrollbarVisuals, 0, `${scheme}: no replacement native scrollbar`)
    assert.equal(variant.after.bodyOverflow, 'hidden', `${scheme}: body must be scroll locked`)
    assert.ok(Math.abs(variant.after.heroX - variant.before.heroX) <= 1, `${scheme}: content must not jump on opening`)
    assert.ok(variant.after.width >= variant.before.width, `${scheme}: no second reserved scrollbar gutter`)
    await waitUntil(() => browser.eval('Number(getComputedStyle(document.querySelector(".razorbox__backdrop")).opacity) > 0.95'))
    if (process.env.RAZORBOX_SCROLL_DEBUG) {
      const img = await browser.call('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
      await writeFile(`${process.env.RAZORBOX_SCROLL_DEBUG}-${scheme}-open.png`, Buffer.from(img.data, 'base64'))
    }
    await browser.eval('window.razorboxDemo.close()')
    await waitUntil(() => browser.eval('!document.body.classList.contains("razorbox-scroll-lock")'))
    const restored = await browser.eval(`(() => ({
      width: document.documentElement.clientWidth,
      margin: getComputedStyle(document.body).marginRight,
      scrollY: window.scrollY,
      heroX: document.querySelector('.hero').getBoundingClientRect().left
    }))()`)
    assert.ok(Math.abs(restored.width - variant.before.width) <= 1, `${scheme}: native scrollbar returns at original width`)
    assert.ok(Math.abs(restored.heroX - variant.before.heroX) <= 1, `${scheme}: content returns to original position`)
    assert.equal(restored.margin, variant.before.margin, `${scheme}: original body margin restored`)
  }
  await browser.eval(`document.documentElement.style.removeProperty('color-scheme'); window.razorboxDemo.options.theme = ${JSON.stringify(previousTheme)}`)
  await browser.call('Emulation.setEmulatedMedia', { features: [] })
  // Destroy midway through closing must also release the page lock.
  await browser.eval(`(() => {
    window.razorboxDemo.open([{src:document.querySelector('.gallery-card').href}]);
    window.razorboxDemo.close();
    window.razorboxDemo.destroy();
  })()`)
  assert.equal(await browser.eval('document.body.classList.contains("razorbox-scroll-lock")'), false)

  // Never accept script/data URLs as iframes.
  assert.equal(await browser.eval('window.razorboxDemo.open([{type:"iframe",src:"javascript:alert(1)"}])'), false)
  assert.equal(await browser.eval('window.razorboxDemo.open([{type:"iframe",src:"data:text/html,hello"}])'), false)
}))
