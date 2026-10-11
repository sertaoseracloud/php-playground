// PHP 8.4 em WebAssembly para Node: o mesmo motor que o navegador usa.
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
import { criarSessao } from '../src/php/sessao.js';

export async function iniciarPhp() {
  const php = new PHP(await loadNodeRuntime('8.4', { emscriptenOptions: { processId: 1 } }));
  return { php, sessao: await criarSessao(php) };
}
