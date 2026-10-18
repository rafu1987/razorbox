# razorbox

[![CI](https://github.com/rafu1987/razorbox/actions/workflows/ci.yml/badge.svg)](https://github.com/rafu1987/razorbox/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/@rafu1987/razorbox)](https://www.npmjs.com/package/@rafu1987/razorbox)
[![JavaScript Style Guide](https://img.shields.io/badge/code_style-standard-brightgreen.svg)](https://standardjs.com)

Lightweight, dependency-free Vanilla JS lightbox with classic gallery controls. Supports images, galleries, videos (HTML5, YouTube, Vimeo), inline HTML, iframes, Google Maps, and PDFs. Includes smooth crossfade/slide transitions, captions **below** the content, thumbnails, zoom (trackpad pinch, mouse wheel, touch), slideshow, fullscreen, keyboard and touch navigation, and dark/light themes.

CSS is distributed separately; JavaScript never injects a stylesheet. The backdrop fades smoothly on opening; the native scrollbar is hidden without replacing it, and returns after the closing animation finishes.

**[Live demo](https://rafu1987.github.io/razorbox/)**

## Installation

razorbox is in alpha. Until 1.0, every release is published under `latest`.

```bash
yarn add @rafu1987/razorbox
# or
npm install @rafu1987/razorbox
```

The package is ESM-only and ships TypeScript declarations.

## Distribution files

The package contains both versions, with CSS always separate from JS:

- `dist/razorbox.js` and `dist/razorbox.css`: readable
- `dist/razorbox.min.js` and `dist/razorbox.min.css`: minified
- `src/scss/razorbox.scss`: SCSS source, exported as `@rafu1987/razorbox/scss`

The usual imports will be optimized by your application build:

```javascript
import razorbox from '@rafu1987/razorbox'
import '@rafu1987/razorbox/css'
```

If you need the pre-minified assets explicitly:

```javascript
import razorbox from '@rafu1987/razorbox/min'
import '@rafu1987/razorbox/css/min'
```

## Usage

```javascript
import razorbox from '@rafu1987/razorbox'
import '@rafu1987/razorbox/css'

const lightbox = razorbox.bind('[data-razorbox]', {
  transition: 'fade', // or 'slide'
  thumbnails: true,
  theme: 'dark',      // 'light' or 'auto'
  locale: 'auto'      // checks <html lang>, then browser language
})
```

`bind()` delegates clicks from the document, so links added later work without re-binding.

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
<a href="https://www.youtube.com/watch?v=lPYHfdapsEY" data-razorbox>YouTube</a>
<a href="https://vimeo.com/253905163" data-razorbox>Vimeo</a>
```

Autoplay is requested by default (with `videoMuted: false`), but browsers may block autoplay with sound. When that happens (often on iOS), Vimeo starts muted by itself and, with `videoMutedFallback: true` (default), YouTube is started muted too instead of showing its play button. A "Turn on sound" button (label key `unmute`) is then shown over the video; one tap enables sound. Videos stop when the slide changes or the lightbox closes. `videoPrivacy: true` uses `youtube-nocookie.com` and Vimeo's `dnt=1` option. These do not replace consent management for third-party content.

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

### Opening programmatically

```javascript
lightbox.open([
  '/images/01.jpg',
  { src: '/media/demo.mp4', poster: '/media/poster.jpg', caption: 'Clip' },
  { type: 'html', html: '<h2>Trusted markup</h2>' }
], 1)
```

`open()` returns `false` when none of the items is valid (for example a `javascript:` iframe URL).

## API reference

### Options

| Option | Default | Description |
| ------ | ------- | ----------- |
| `selector` | `'[data-razorbox]'` | Trigger selector when passing options as the first constructor argument. |
| `root` | `document` | Element, document or shadow root that trigger clicks are delegated from. |
| `loop` | `true` | Wrap from the last item to the first and back. |
| `thumbnails` | `true` | Enable the thumbnail rail and its toolbar button. |
| `thumbsOpen` | `false` | Show the thumbnail rail when opening. |
| `slideshow` | `true` | Enable the slideshow button. |
| `autoplay` | `false` | Start the slideshow on open (image galleries only). |
| `slideshowInterval` | `3500` | Slideshow delay in milliseconds. |
| `zoom` | `true` | Enable image zoom and pan. |
| `zoomFactor` | `2` | Magnification of the toolbar zoom button. Clicking again returns to fit. |
| `maxZoom` | `8` | Maximum zoom from wheel, trackpad pinch and touch gestures. |
| `wheelZoom` | `true` | Zoom with the mouse wheel and Mac trackpad pinch. |
| `fullscreen` | `true` | Enable the fullscreen button. |
| `keyboard` | `true` | Enable keyboard shortcuts. |
| `closeOnBackdrop` | `true` | Close when clicking outside the content. |
| `captionHtml` | `false` | Render captions as HTML. Only use with trusted captions. |
| `preload` | `1` | Number of neighboring images to preload in each direction. |
| `transition` | `'fade'` | `'fade'` or `'slide'`. |
| `transitionDuration` | `300` | Content transition in milliseconds (0 to 2000). |
| `videoAutoplay` | `true` | Start videos when their slide opens. |
| `videoMuted` | `false` | Start videos muted. |
| `videoMutedFallback` | `true` | If audible YouTube autoplay is blocked, start muted instead of showing the play button. |
| `videoPrivacy` | `true` | Use `youtube-nocookie.com` and Vimeo `dnt=1`. |
| `mapApiKey` | `''` | Google Maps Embed API key. Prefer a referrer-restricted key. |
| `theme` | `'dark'` | `'dark'`, `'light'` or `'auto'` (follows `prefers-color-scheme`). |
| `locale` | `'auto'` | `'auto'`, `'en'`, `'de'` or `'fr'`. |
| `l10n` | `null` | Overrides for individual labels, for example `{ close: 'Close viewer' }`. |
| `onOpen` | `null` | Called after opening. See [Events](#events). |
| `onChange` | `null` | Called after the current item changes. |
| `onClose` | `null` | Called after the closing animation. |

### Data attributes

| Attribute | Description |
| --------- | ----------- |
| `data-razorbox` | Marks a trigger. Triggers with the same value form a gallery. |
| `data-src` | Content URL, if it differs from `href`. |
| `data-type` | `image`, `video`, `youtube`, `vimeo`, `html`, `iframe`, `map` or `pdf`. Detected from the URL when omitted. |
| `data-caption` | Caption shown below the content. |
| `data-alt` | Alternative text. Defaults to the `alt` of the trigger's `<img>`. |
| `data-thumb` | Thumbnail URL. Defaults to the trigger's `<img>`. |
| `data-poster` | Poster image for HTML5 videos. |
| `data-embed-src` | Google Maps `/maps/embed` URL to use instead of the compatibility embed. |

### Methods

| Method | Description |
| ------ | ----------- |
| `razorbox.bind(selector?, options?)` | Creates an instance and starts listening for trigger clicks. |
| `open(items, startIndex = 0)` | Opens an array of items or URLs. Returns `false` if none is valid. |
| `close(immediate = false)` | Closes the lightbox, skipping the animation when `immediate` is `true`. |
| `next()`, `prev()`, `goTo(index)` | Navigate between items. |
| `play()`, `pause()`, `togglePlay()` | Control the slideshow. |
| `toggleZoom()` | Zoom to `zoomFactor`, or back to fit. |
| `toggleThumbnails()` | Show or hide the thumbnail rail. |
| `toggleFullscreen()` | Enter or leave fullscreen. Returns a promise. |
| `destroy()` | Closes the lightbox, removes its DOM and stops listening. |

### Properties

| Property | Description |
| -------- | ----------- |
| `isOpen`, `isPlaying` | Current state. |
| `index`, `items` | Current index and a copy of the normalized items. |
| `locale` | Resolved locale, for example `'de'`. |
| `options` | The merged options. Changes apply the next time the lightbox opens. |
| `razorbox.activeInstance` | The instance that is currently open, or `null`. |

### Events

`onOpen`, `onChange` and `onClose` receive one object:

```javascript
razorbox.bind('[data-razorbox]', {
  onChange ({ instance, index, item, length }) {
    console.log(`${index + 1} of ${length}: ${item.type} ${item.src}`)
  }
})
```

### Keyboard

| Key | Action |
| --- | ------ |
| <kbd>←</kbd> <kbd>→</kbd> | Previous and next item |
| <kbd>Esc</kbd> | Close |
| <kbd>Tab</kbd> | Moves focus between controls; focus stays inside the lightbox |
| <kbd>Space</kbd> | Play or pause the slideshow |
| <kbd>T</kbd> | Show or hide thumbnails |
| <kbd>Z</kbd> | Toggle zoom |
| <kbd>F</kbd> | Toggle fullscreen |

### Localization

English, German and French are bundled, with automatic detection via `<html lang>` (useful for TYPO3), then the browser languages. Override with `locale: 'de'` or `locale: 'fr'`, and change individual labels with `l10n`. Labels may use the placeholders `{number}`, `{total}`, `{type}` and `{alt}`. All keys are listed in [`src/i18n.js`](src/i18n.js).

### Theming

Use `theme: 'dark'`, `'light'` or `'auto'`, and override `--rb-*` custom properties on `.razorbox` for colors and sizes:

```css
.razorbox {
  --rb-background: #0b0b0f;
  --rb-focus-color: #ffcc00;
  --rb-button-size: 48px;
  --rb-thumbnails-height: 96px;
}
```

Available properties: `--rb-background`, `--rb-text-color`, `--rb-caption-color`, `--rb-icon-color`, `--rb-focus-color`, `--rb-toolbar-background`, `--rb-toolbar-hover`, `--rb-toolbar-inset`, `--rb-button-size`, `--rb-arrow-background`, `--rb-arrow-hover`, `--rb-counter-background`, `--rb-media-background`, `--rb-html-background`, `--rb-html-color`, `--rb-thumbnails-background`, `--rb-thumbnails-height`, `--rb-thumb-background`, `--rb-thumb-border`, `--rb-backdrop-duration`, `--rb-transition`.

### Image zoom

Use the mouse wheel over an image or pinch on a MacBook trackpad (Chromium/Firefox and Safari gestures). Zoom centers on the pointer, up to `maxZoom`. The toolbar Zoom button magnifies to `zoomFactor`, and a second click, including after a deep pinch, returns the image to fit. Drag the image to pan; two-finger touch pinch is supported. Set `wheelZoom: false` to disable desktop wheel and trackpad zoom. Browser and OS gesture behavior can vary.

## Accessibility

The lightbox is a labelled modal dialog (`role="dialog"`, `aria-modal="true"`). Opening moves focus to the close button, <kbd>Tab</kbd> is kept inside the dialog, and closing returns focus to the trigger. Every control has a localized label, slide changes are announced through a polite live region, and the thumbnail toggle exposes `aria-expanded` and `aria-controls`. CI runs axe-core (WCAG 2.2 AA and best-practice rules) against image, video, HTML and iframe slides in both themes.

## Development

```bash
yarn install
yarn dev            # demo page with hot reload
yarn build          # dist/ (commit it; CI checks it is current)
yarn release:check  # lint, unit, package, browser and accessibility tests
```

See [CONTRIBUTING.md](CONTRIBUTING.md) for the project layout and all scripts.

## Releasing

Releases are cut locally with [np](https://github.com/sindresorhus/np) and published by GitHub Actions with [npm provenance](https://docs.npmjs.com/generating-provenance-statements).

1. Make sure `main` is clean and up to date.
2. Run `yarn release` and choose the version.
3. np runs `release:check`, then the `version` script writes the new `CHANGELOG.md` section and rebuilds `dist/`. np commits `Release vX.Y.Z`, tags and pushes.
4. The tag triggers the Release workflow. It runs CI, publishes to npm under `latest`, and creates the GitHub release from the changelog section.

The changelog section is generated from the commit subjects since the last tag, grouped by prefix: `[!!!]` (breaking), `[SECURITY]`, `[FEATURE]`, `[BUGFIX]`, `[TASK]` and `[DOCS]`. Release and merge commits are skipped. To write the notes yourself instead, add a `## X.Y.Z` section to `CHANGELOG.md` before releasing and the script leaves it alone.

With [Claude Code](https://claude.com/claude-code), saying "release new version" (or `/release`, `release minor`, `release 0.8.0`) runs the whole procedure, from the checks to verifying the published package. The steps live in [`.claude/skills/release/SKILL.md`](.claude/skills/release/SKILL.md).

## Security

Please report vulnerabilities privately. See [SECURITY.md](SECURITY.md).

## License

MIT.
