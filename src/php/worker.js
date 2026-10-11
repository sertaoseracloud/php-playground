// Roda o PHP fora da thread da página: um laço infinito trava só o worker,
// que o playground encerra e recria (veja motor.js).
import { PHP } from '@php-wasm/universal';
import { loadWebRuntime } from '@php-wasm/web';
import { criarExecutor } from './sessao.js';

const executor = (async () => criarExecutor(new PHP(await loadWebRuntime('8.4'))))();

executor.then(
  () => postMessage({ tipo: 'pronto' }),
  (erro) => postMessage({ tipo: 'falha', erro: String(erro?.message ?? erro) }),
);

onmessage = async ({ data }) => {
  const executar = await executor;
  try {
    const resposta = await executar(data.arquivos, data.req);
    postMessage({ tipo: 'resposta', id: data.id, ...resposta });
  } catch (erro) {
    postMessage({ tipo: 'resposta', id: data.id, html: '', erros: String(erro?.message ?? erro), status: 500 });
  }
};
