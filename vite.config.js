import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';

const stub = fileURLToPath(new URL('./src/php-stub.js', import.meta.url));

// A extensão intl (intl.so + dados ICU, ~43 MB) só é baixada com withIntl,
// que o site não usa. Os imports dela viram um módulo vazio para não irem ao deploy.
const SEM_INTL = /(\/intl\.so\?url|\/icu\.dat)$/;
const VAZIO = 'virtual:sem-intl';
const semIntl = {
  name: 'sem-intl',
  enforce: 'pre',
  resolveId: (id) => (SEM_INTL.test(id) ? VAZIO : null),
  load: (id) => (id === VAZIO ? 'export default "";' : null),
};

export default defineConfig({
  base: './',
  plugins: [semIntl],
  assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
  optimizeDeps: { exclude: ['@php-wasm/web'] },
  resolve: {
    // Só o PHP 8.4 entra no site; as outras versões ocupariam ~300 MB.
    alias: [{ find: /^@php-wasm\/web-(5-2|7-4|8-0|8-1|8-2|8-3|8-5)$/, replacement: stub }],
  },
  worker: { format: 'es', plugins: () => [semIntl] },
  build: { target: 'es2022', chunkSizeWarningLimit: 4000 },
});
