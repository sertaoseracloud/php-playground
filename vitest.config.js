import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Chave fictícia para os testes do selo dos certificados (a de verdade só existe no build; veja vite.config.js).
  define: { __CHAVE_CERTIFICADO__: JSON.stringify('chave-dos-testes') },
  test: { testTimeout: 60000, hookTimeout: 120000 },
});
