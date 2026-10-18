import { readFileSync } from 'node:fs'

// Replaces __RAZORBOX_VERSION__ in the demo HTML with the package.json version,
// in both `yarn dev` and the GitHub Pages build.
export function demoVersion () {
  const { version } = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'))
  return {
    name: 'razorbox-demo-version',
    transformIndexHtml: {
      order: 'pre',
      handler: html => html.replaceAll('__RAZORBOX_VERSION__', version)
    }
  }
}
