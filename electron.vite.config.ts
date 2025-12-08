import tailwind from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'electron-vite';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@main': resolve(__dirname, 'src/main'),
        '@common': resolve(__dirname, 'src/common'),
      },
    },
    build: { externalizeDeps: true },
  },
  preload: {
    resolve: {
      alias: {
        '@preload': resolve(__dirname, 'src/preload'),
        '@common': resolve(__dirname, 'src/common'),
      },
    },
    build: {
      externalizeDeps: true,
      rollupOptions: {
        output: {
          format: 'cjs',
          entryFileNames: '[name].js',
        },
      },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve(__dirname, 'src/renderer/src'),
        '@common': resolve(__dirname, 'src/common'),
      },
    },
    plugins: [react(), tailwind()],
  },
});
