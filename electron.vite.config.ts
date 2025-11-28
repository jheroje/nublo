import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, externalizeDepsPlugin } from 'electron-vite';
import { resolve } from 'path';

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@': resolve(''),
        '@main': resolve('src/main'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    resolve: {
      alias: {
        '@': resolve(''),
        '@preload': resolve('src/preload'),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve(''),
        '@renderer': resolve('src/renderer/src'),
      },
    },
    plugins: [react(), tailwind()],
  },
});
