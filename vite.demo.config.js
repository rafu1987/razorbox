import { defineConfig } from 'vite'
import { cp, rename } from 'node:fs/promises'
import { fileURLToPath, URL } from 'node:url'

// Static build of demo.html for GitHub Pages. The demo links to its media via
// href/data-* attributes, which Vite does not rewrite, so demo/assets is copied
// as-is and demo.html becomes the site's index.html.
const file = path => fileURLToPath(new URL(path, import.meta.url))
const outDir = file('./demo-dist/')

export default defineConfig({
  base: './',
  publicDir: false,
  build: {
    outDir,
    emptyOutDir: true,
    rollupOptions: {
      input: {
        demo: file('./demo.html'),
        iframe: file('./demo/iframe.html')
      }
    }
  },
  plugins: [{
    name: 'razorbox-demo-pages',
    apply: 'build',
    async closeBundle () {
      await cp(file('./demo/assets/'), `${outDir}demo/assets/`, { recursive: true })
      await rename(`${outDir}demo.html`, `${outDir}index.html`)
    }
  }]
})
