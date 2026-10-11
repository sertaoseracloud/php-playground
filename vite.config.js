import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const stub = fileURLToPath(new URL('./src/php-stub.js', import.meta.url));

export default defineConfig({
  base: './',
  assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
  optimizeDeps: { exclude: ['@php-wasm/web'] },
  resolve: {
    // Só o PHP 8.4 entra no site; as outras versões ocupariam ~300 MB.
    alias: [{ find: /^@php-wasm\/web-(5-2|7-4|8-0|8-1|8-2|8-3|8-5)$/, replacement: stub }],
  },
  worker: { format: 'es' },
  build: { target: 'es2022', chunkSizeWarningLimit: 4000 },
});
