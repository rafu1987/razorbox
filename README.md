# razorbox

Lightweight, dependency-free Vanilla JS lightbox with Fancybox-inspired controls. Supports images, galleries, videos (HTML5, YouTube, Vimeo), inline HTML, iframes, Google Maps, and PDFs. Includes smooth crossfade/slide transitions, captions **below** the content, thumbnails, zoom (trackpad pinch, mouse wheel, touch), slideshow, fullscreen, keyboard and touch navigation, and dark/light themes.

CSS is distributed separately; JavaScript never injects a stylesheet. The backdrop fades smoothly on opening; the native scrollbar is hidden without replacing it, and returns after the closing animation finishes.

## Installation

Once **razorbox** is published to npm:

**Yarn**

```bash
yarn add razorbox
```

**npm**

```bash
npm install razorbox
```

If you publish it under the npm scope **`@rafu1987/razorbox`**, use that full name in the commands and imports instead. The GitHub repository shorthand `rafu1987/razorbox` is different from an npm registry package name. Neither registry release is published by this project archive.

## Distribution files

`yarn build` (or `npm run build`) produces both versions, with CSS always separate from JS:

- `dist/razorbox.js` and `dist/razorbox.css` — readable
- `dist/razorbox.min.js` and `dist/razorbox.min.css` — minified

The usual Vite imports stay unchanged and will be optimized by your application build:

```javascript
import razorbox from 'razorbox'
import 'razorbox/css'
```

If you need the pre-minified assets explicitly:

```javascript
import razorbox from 'razorbox/min'
import 'razorbox/css/min'
```

## Usage

```javascript
import razorbox from 'razorbox'
import 'razorbox/css'

razorbox.bind('[data-razorbox]', {
  transition: 'fade', // or 'slide'
  thumbnails: true,
  thumbsOpen: false,
  theme: 'dark',    // 'light' or 'auto'
  locale: 'auto'    // checks <html lang>, then browser language
})
```

### Images and galleries

Links sharing the same `data-razorbox` value form a gallery. Captions appear **below the image** (not on top of it), inside the lightbox viewport.

```html
<a href="/images/01.jpg" data-razorbox="gallery" data-caption="First picture">
  <img src="/images/01-thumb.jpg" alt="Landscape">
</a>
<a href="/images/02.jpg" data-razorbox="gallery" data-caption="Second picture">
  <img src="/images/02-thumb.jpg" alt="Coast">
</a>
```

### HTML5 video, YouTube and Vimeo

```html
<a href="/media/demo.mp4" data-razorbox data-type="video" data-poster="/media/poster.jpg">HTML5 video</a>
<a href="https://www.youtube.com/watch?v=lPYHfdapsEY" data-razorbox> YouTube </a>
<a href="https://vimeo.com/253905163" data-razorbox> Vimeo </a>
```

Autoplay is requested by default (with `videoMuted: false`), but browsers may block autoplay with sound. Videos stop when the slide changes or the lightbox closes. `videoPrivacy: true` uses `youtube-nocookie.com` and Vimeo's `dnt=1` option. These do not replace consent management for third-party content.

### Inline HTML and iframes

```html
<a href="#my-content" data-razorbox data-type="html">Open content</a>
<div id="my-content" hidden><h2>Hello!</h2><p>Inline content.</p></div>

<a href="/embedded-page.html" data-razorbox data-type="iframe">Open iframe</a>
```

For programmatically supplied trusted HTML, use `lightbox.open([{ type: 'html', html: '<p>Hello</p>' }])` on a bound instance. Existing inline elements are restored when closed.

### Google Maps and PDFs

```html
<a href="https://www.google.com/maps/search/?api=1&amp;query=Empire+State+Building" data-razorbox>Google Map</a>
<a href="/files/brochure.pdf" data-razorbox>PDF preview</a>
```

Maps support embed URLs or `mapApiKey` for the official Maps Embed API; ordinary Maps links use a compatibility embed and include an external Google Maps link. PDFs use the browser's native viewer with an open-in-new-tab fallback. Third-party iframes may require consent and appropriate CSP settings.

## Options

```javascript
const lightbox = razorbox.bind('[data-razorbox]', {
  loop: true,
  thumbnails: true,
  thumbsOpen: false,
  slideshow: true,
  slideshowInterval: 3500,
  zoom: true,
  wheelZoom: true,
  zoomFactor: 2,
  maxZoom: 8,
  fullscreen: true,
  transition: 'fade',
  transitionDuration: 300,
  videoAutoplay: true,
  videoMuted: false,
  videoPrivacy: true,
  captionHtml: false,
  theme: 'dark',
  locale: 'auto'
})
```

`lightbox.open(items, index)` opens an array of items. Other methods include `close()`, `next()`, `prev()`, `goTo(index)`, `toggleZoom()`, `togglePlay()`, `toggleThumbnails()` and `destroy()`.


**Image zoom:** Use the mouse wheel over an image or pinch on a MacBook trackpad (Chromium/Firefox and Safari gestures). Zoom centers on the pointer, up to `maxZoom` (default 8x). The toolbar Zoom button magnifies to `zoomFactor` (default 2x), and a second click - including after a deep pinch - returns the image to fit. Drag the image to pan; two-finger touch pinch remains supported. Set `wheelZoom: false` to disable desktop wheel/trackpad zoom. Browser and OS gesture behavior can vary.

**Languages:** English, German and French are bundled with automatic detection via `<html lang>` (especially suitable for TYPO3). Override with `locale: 'de'` or `locale: 'fr'`. Customize individual labels via `l10n: { close: 'Close viewer' }`.

**Theming:** Use `theme: 'dark'`, `'light'` or `'auto'` and override `--rb-*` CSS custom properties for colors and sizes.

The included `demo.html` contains working examples and copyable snippets for all content types.

## License

MIT.
