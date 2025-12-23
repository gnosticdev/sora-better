import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  webExt: {
    binaries: {
      chrome: '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser'
    },
  },
  debug: true,
  modules: ['@wxt-dev/module-solid'],
  manifest: {
    name: 'Sora Better',
    permissions: ['tabs', 'storage'],
  },
  srcDir: 'src',
  vite: () => ({
    plugins: [tailwindcss()],
  }),

});