import autoprefixer from 'autoprefixer'

// Vite applies this to every CSS build (library and demo). Autoprefixer adds
// vendor prefixes for the browsers in package.json "browserslist", so the SCSS
// source is written without them.
export default {
  plugins: [autoprefixer()]
}
