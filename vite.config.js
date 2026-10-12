import { defineConfig } from 'vite';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

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

/**
 * Chave do selo dos certificados (HMAC). A palavra secreta vem da variável de
 * ambiente CERTIFICADO_SEGREDO (no CI, do secret do GitHub) e nunca entra no
 * código nem no site: o bundle recebe só um SHA-256 derivado dela.
 * Sem a variável, o build de produção falha; o modo dev usa um valor próprio e os
 * testes têm a chave deles em vitest.config.js.
 */
function chaveDoCertificado(command) {
  let segredo = process.env.CERTIFICADO_SEGREDO;
  if (!segredo) {
    if (command === 'serve') segredo = 'segredo-de-desenvolvimento';
    else throw new Error('Defina CERTIFICADO_SEGREDO para gerar o build (veja o README, seção Certificados).');
  }
  return createHash('sha256').update(`php-playground:certificado:${segredo}`, 'utf8').digest('hex');
}

export default defineConfig(({ command }) => ({
  base: './',
  plugins: [semIntl],
  define: { __CHAVE_CERTIFICADO__: JSON.stringify(chaveDoCertificado(command)) },
  assetsInclude: [/\.dat$/, /\.wasm$/, /\.so$/, /\.la$/],
  optimizeDeps: { exclude: ['@php-wasm/web'] },
  resolve: {
    // Só o PHP 8.4 entra no site; as outras versões ocupariam ~300 MB.
    alias: [{ find: /^@php-wasm\/web-(5-2|7-4|8-0|8-1|8-2|8-3|8-5)$/, replacement: stub }],
  },
  worker: { format: 'es', plugins: () => [semIntl] },
  build: { target: 'es2022', chunkSizeWarningLimit: 4000 },
}));
