# Contributing

Thanks for helping improve razorbox. Bug reports, fixes and focused feature
proposals are welcome. For larger changes, open an issue first so we can agree
on the approach before you invest time.

## Setup

Requires Node.js 22 or newer and Yarn 1.

```bash
yarn install   # also installs the pre-commit hook
yarn dev       # demo page with hot reload at /demo.html
```

## Project layout

| Path | Contents |
| ---- | -------- |
| `src/razorbox.js` | The lightbox class: DOM, events, gestures, playback |
| `src/media.js` | URL validation, provider detection, item normalization, embed URLs |
| `src/i18n.js` | Bundled translations and locale detection |
| `src/options.js`, `src/icons.js`, `src/utils.js` | Defaults, SVG icons, small helpers |
| `src/scss/` | Stylesheet, published separately from the JS |
| `src/razorbox.d.ts` | Hand-written TypeScript declarations |
| `demo.html`, `demo/` | Demo page, also used by the browser tests. Photo and video credits are in `demo/assets/photos/CREDITS.md` |
| `tests/unit/` | Fast Node tests for the pure modules |
| `tests/browser.test.mjs`, `tests/a11y.test.mjs` | Headless Chrome tests, incl. axe-core |

Keep logic that does not need the DOM in the pure modules so it can be unit
tested.

## Checks

| Command | What it does |
| ------- | ------------ |
| `yarn lint:js` / `yarn lint:js:fix` | [Standard](https://standardjs.com) style |
| `yarn lint:css` / `yarn lint:css:fix` | Stylelint for the SCSS |
| `yarn test` | Unit tests and package export tests |
| `yarn test:coverage` | Unit tests with a coverage report and minimums |
| `yarn test:browser` | Browser and accessibility tests (needs Chrome or Chromium) |
| `yarn lint:package` | publint and Are the Types Wrong on the packed package |
| `yarn release:check` | Everything above, as run before a release |
| `yarn build:demo` | Static build of the demo page for GitHub Pages |
| `yarn build:demo-pdf` | Re-renders the demo's README PDF; run it after README changes |

The browser tests look for Chrome in the usual Linux and macOS locations. Set
`CHROMIUM_PATH` to use another binary.

A pre-commit hook runs Standard and Stylelint with `--fix` on staged files.
Fix remaining findings in the code rather than adding disable comments.

## Pull requests

- Branch from `main` and keep each PR focused on one change.
- Add or update tests for behavior changes, and update `src/razorbox.d.ts`
  and the README when the public API changes.
- Run `yarn build` and commit `dist/`. CI fails if `dist/` does not match a
  fresh build.
- Start commit subjects with a prefix: `[FEATURE]`, `[BUGFIX]`, `[TASK]`,
  `[DOCS]` or `[SECURITY]`, plus `[!!!]` for breaking changes (for example
  `[!!!][FEATURE] Rename option`). `CHANGELOG.md` is generated from them
  at release time, so write subjects for users to read.
- New UI must stay keyboard accessible and pass the axe checks in
  `tests/a11y.test.mjs`.

## Releases

Maintainers release with `yarn release`. See the README's
[Releasing](README.md#releasing) section.
