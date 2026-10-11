// Roda o PHP fora da thread da página: um laço infinito trava só o worker,
// que o playground encerra e recria (veja motor.js).
import { PHP } from '@php-wasm/universal';
import { loadWebRuntime } from '@php-wasm/web';
import { criarSessao } from './sessao.js';

const sessao = (async () => criarSessao(new PHP(await loadWebRuntime('8.4'))))();

sessao.then(
  () => postMessage({ tipo: 'pronto' }),
  (erro) => postMessage({ tipo: 'falha', erro: String(erro?.message ?? erro) }),
);

onmessage = async ({ data }) => {
  const { executar, inspecionar } = await sessao;
  try {
    const resultado = data.acao === 'inspecionar'
      ? { tabelas: await inspecionar(data.banco, data.opcoes) }
      : await executar(data.arquivos, data.req, data.banco, data.opcoes);
    postMessage({ tipo: 'resposta', id: data.id, ...resultado });
  } catch (erro) {
    postMessage({ tipo: 'resposta', id: data.id, erroInterno: String(erro?.message ?? erro) });
  }
};
