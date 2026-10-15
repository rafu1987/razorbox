import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Two library passes produce readable and minified ES modules plus separate CSS.
export default defineConfig(({ mode }) => {
  const minified = mode === 'minified';
  const name = minified ? 'razorbox.min' : 'razorbox';

  return {
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
  };
});
