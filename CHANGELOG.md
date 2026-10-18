## 0.7.0-alpha.8 - 2026-10-18

### Bug fixes

- Wait for settled layout in mobile geometry test
- Use the published package name in the demo's import snippet

### Tasks

- Generate CHANGELOG.md from commit subjects on release
- Redesign the demo page and show the current version
- Add GitHub and npm logos to the demo header and footer
- Use real photos, videos and a README PDF in the demo
- Generate the demo PDF automatically
- Add platform icons to the demo's video cards and a favicon
- Highlight the demo's code examples and use single-color video icons
- Add a Claude Code release skill
- Use the Pexels waves clip in HD with calm music for the HTML5 demo

## 0.7.0-alpha.7

- Fix missing TypeScript types for the `@rafu1987/razorbox/razorbox.min.js` export.
- Split the source into ES modules (`options`, `i18n`, `icons`, `utils`, `media`). The published bundles and their behavior are unchanged.
- Add unit tests, axe-core accessibility tests and keyboard/focus tests in a real browser.
- Add CI, package linting (publint, Are the Types Wrong) and npm publishing with provenance from GitHub Actions.
- Publish the demo on GitHub Pages.
- Document the full API in the README, and add SECURITY.md and CONTRIBUTING.md.
- Until 1.0, every release is published under the npm `latest` tag.

## 0.7.0-alpha.2

- Vite generates both readable and minified JS/CSS assets in a two-pass library build.
- Added optional minified ES module and CSS package exports without changing the default imports.
- The ES-module minified build uses Terser, while CSS uses Vite's esbuild minifier.
- Source maps remain enabled for both variants. No runtime dependencies or injected styles.

## 0.7.0-alpha.1 - 2026-10-15

- First production-test alpha. Enable wheel and trackpad zoom by default with up to 8x magnification, while the toolbar keeps its 2x zoom and resets from any magnification to fit.
- Support smooth pointer-anchored mouse wheel and ctrl+wheel trackpad pinch in Chromium/Firefox, plus Safari gesturestart/change/end events, without browser page-zoom interference.
- Improve touch pinch centering and two-finger panning; continue supporting touch swipe and mouse dragging.
- Keep the approved v0.6.3 scrollbar and backdrop behavior unchanged.
- Update demo, documentation, and gesture regression tests.

## 0.6.3

- Change the scroll-lock approach: apply `overflow: hidden` to `body`, not the HTML root, and compensate the removed scrollbar width with body margin.
- Remove the v0.6.2 simulated scrollbar entirely (it caused white flashes and mismatched scrollbar widths in different OS color schemes).
- Use a dedicated backdrop fade easing and a 366 ms default duration, starting on the next animation frame rather than waiting for two frames.
- Preserve the existing close sequencing: restore the browser's scrollbar only after the dialog has finished fading out.
- Add Chromium regression checks in emulated dark/light color schemes, including width, margin and backdrop restoration.

## 0.6.2 — 2026-10-15

- Smooth opening fade across the native scrollbar gutter: a temporary, non-interactive track/thumb visual fades together with the backdrop after synchronous scroll locking, preventing the bright right-edge flash.
- Remove the abrupt 55% first-frame backdrop tint; transition the real backdrop opacity from zero.
- Keep existing body margin compensation and the scrollbar restoration timing on close unchanged.
- No new dependencies, no injected stylesheets, no public API changes.

## 0.6.1 - 2026-10-15

- Remove header and caption gradients in dark, light and auto themes. Inset toolbar background remains.
- Render captions below the active media inside the viewport, reserving layout space so they never cover images.
- Couple captions to each slide for correctly synchronized fade/slide transitions.
- Keep existing scrollbar and backdrop transition behavior unchanged.
- Simplify README to package installation and usage, with Yarn and npm examples.

# Changelog

## 0.6.0 — 2026-10-15

- Separately animated backdrop fade while keeping the root overlay opaque enough to mask scrollbar-gutter flashes; timing via `--rb-backdrop-duration`.
- Built-in English, German and French control/error/ARIA translations. `locale: 'auto'` prioritizes `<html lang>` and then browser languages; optional `locale` and `l10n` overrides; no extra locale files.
- Automatic Google Maps URL recognition with keyless best-effort search embeds and always-visible external link; official Embed API via `mapApiKey`, or direct Google Maps embed URLs via `data-embed-src`.
- Automatic PDF recognition (`.pdf` or explicit `data-type="pdf"`), browser-native preview, and open-in-new-tab fallback.
- Generic, localized content loading error; HTML5 media error handling.
- Yarn commands in README and demo examples for Google Maps / PDF, along with a bundled local sample PDF and language selector.

## 0.5.0 — Privacy-enhanced embeds and no-flash scrollbar lock

- Enabled privacy-enhanced provider embeds by default (`videoPrivacy: true`): YouTube via `www.youtube-nocookie.com` and Vimeo via `dnt=1` on `player.vimeo.com`.
- Kept provider URLs normalized regardless of the source YouTube/Vimeo link (including explicit iframe items); Vimeo unlisted hashes stay intact.
- Removed automatic external YouTube thumbnail requests, avoiding premature third-party image loads.
- Scrollbar compensation now uses the measured body margin-right and restoring the original inline value.
- Removed root fade-in so the backdrop covers the scrollbar track immediately, before document scrolling is locked.
- Restored scrolling at the real close transition's end, including support for custom transition durations, with a timer fallback.
- Fixed destroying an instance during its closing transition leaving scrolling locked.
- Updated documentation, demo snippets, type declarations, and browser tests.


## 0.4.0 — 2026-10-14

- Lowercase `razorbox` JavaScript class, default/named exports, demo imports and declaration types.
- No white gutter on scroll lock: measured body padding compensation + full-viewport backdrop, with clean restoration on close.
- Inset toolbar over a subtly shaded full-width header, arrows matched to the toolbar background, edge-to-edge image slides.
- Demo has seven visible, copyable code examples for all media types and gallery/JS initialization.
- Removed the separate `vite.demo.config.js`; Vite is an internal build tool only.
- Updated browser regression tests for full backdrop coverage, counter/toolbar spacing and copyable markup.

## 0.3.0 — 2026-10-14

- Use lowercase **razorbox** as the project name (the constructor became lowercase in 0.4.0).
- Redesign toolbar, icon shapes, header counter and navigation arrows with a classic desktop/mobile lightbox arrangement.
- Prevent control/counter overlap on mobile and overlay circular navigation arrows on mobile images.
- Add real thumbnail clipping via an outer `overflow: hidden` panel and an inner touch/trackpad/mouse-draggable horizontal scroller; suppress clicks following a drag.
- Add `type: 'html'` for original inline DOM content with proper restoration, or trusted programmatic HTML; and `type: 'iframe'` for trusted HTTP(S) pages.
- Add CSS-variable dark/light/system modes via `theme` option.
- Change `videoMuted` default from `true` to **`false`** (audible autoplay may be blocked by browsers).
- Update demo URLs to YouTube `lPYHfdapsEY` and Vimeo `253905163`.
- Replace demo MP4 with a short MP4/AAC containing an original soft ambient chord.
- Prevent page layout jumps on classic scrollbars using `scrollbar-gutter: stable` with a measured fallback.
- Update README, TS declarations, browser tests and demo, retaining separate JS and CSS assets.

## 0.2.0 — 2026-10-14

- Add overlapping image crossfade and optional slide transitions with configurable duration.
- Add HTML5 video, YouTube and Vimeo autoplay and stop-on-close.
- Move thumbnail bar below the main image; switch Zoom/Play order.
- Add the video demo and remove the obsolete Python asset generator.

## 0.1.0 — initial release

- Vanilla JavaScript lightbox with separate CSS, gallery groupings, captions, thumbnails, slideshow, fullscreen and image zoom.
