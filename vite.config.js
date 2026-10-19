import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import { demoVersion } from './demo/version-plugin.js'

// Vite's dev server does not watch its own outDir, so dist/razorbox.css would
// stay as it was when `yarn dev` started. In dev, demo.html loads the SCSS
// source instead: style changes apply without a build and hot-reload. The demo
// build and the browser tests keep using dist/razorbox.css.
const devStyles = () => ({
  name: 'razorbox-dev-styles',
  apply: 'serve',
  transformIndexHtml: html => html.replace('href="./dist/razorbox.css"', 'href="/src/scss/razorbox.scss"')
})

// Two library passes produce readable and minified ES modules plus separate CSS.
export default defineConfig(({ mode }) => {
  const minified = mode === 'minified'
  const name = minified ? 'razorbox.min' : 'razorbox'

  return {
    // `yarn dev` serves demo.html with this config.
    plugins: [demoVersion(), devStyles()],
    build: {
      lib: {
        entry: fileURLToPath(new URL('./src/index.js', import.meta.url)),
        formats: ['es'],
        fileName: name,
        cssFileName: name
      },
      target: 'es2020',
      outDir: 'dist',
      emptyOutDir: !minified,
      minify: minified ? 'terser' : false,
      cssMinify: minified ? 'esbuild' : false,
      sourcemap: true
    }
  }
})
