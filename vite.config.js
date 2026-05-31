import { defineConfig } from 'vite';
import { resolve } from 'path';

function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(31, h) + str.charCodeAt(i) | 0;
  }
  return Math.abs(h).toString(36).slice(0, 5);
}

export default defineConfig({
  root: 'src',
  publicDir: resolve(__dirname, 'public'),
  preprocessorOptions: {
    scss: {
      api: 'modern-compiler'
    }
  },
  css: {
    modules: {
      generateScopedName(name, filename) {
        const component = filename.replace(/\\/g, '/').split('/').slice(-2)[0];
        return '_' + hash(`${component}_${name}`);
      }
    }
  },
  build: {
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    rollupOptions: {
      input: {
        page: resolve(__dirname, 'src/page.html'),
        content: resolve(__dirname, 'src/content.js'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: '[name].[ext]'
      }
    }
  },
  resolve: {
    alias: {
      '@gleam': resolve(__dirname, 'build/dev/javascript'),
      '@src': resolve(__dirname, 'src'),
      '@components': resolve(__dirname, 'src/components'),
      '@utils': resolve(__dirname, 'src/utils'),
    }
  }
});