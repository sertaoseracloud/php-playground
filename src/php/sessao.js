import { PHPRequestHandler, setPhpIniEntries } from '@php-wasm/universal';

export const RAIZ = '/www';

// Mostra erros e avisos do PHP na própria página, como num servidor de desenvolvimento.
const PHP_INI = {
  display_errors: '1',
  display_startup_errors: '1',
  error_reporting: 'E_ALL',
  html_errors: '1',
  'date.timezone': 'America/Sao_Paulo',
};

/**
 * Recebe uma instância de PHP (web ou node) e devolve uma função que grava os
 * arquivos do aluno em /www e atende uma requisição HTTP simulada.
 */
export async function criarExecutor(php) {
  await setPhpIniEntries(php, PHP_INI);
  const handler = new PHPRequestHandler({ phpFactory: async () => php, documentRoot: RAIZ });

  return async function executar(arquivos, { url = '/index.php', metodo = 'GET', corpo } = {}) {
    if (php.isDir(RAIZ)) php.rmdir(RAIZ, { recursive: true });
    php.mkdir(RAIZ);
    for (const [nome, conteudo] of Object.entries(arquivos)) {
      php.writeFile(`${RAIZ}/${nome}`, conteudo);
    }
    const headers = corpo === undefined ? {} : { 'content-type': 'application/x-www-form-urlencoded' };
    const body = corpo === undefined ? undefined : new TextEncoder().encode(corpo);
    const resposta = await handler.request({ url, method: metodo, body, headers });
    return { html: resposta.text, erros: resposta.errors, status: resposta.httpStatusCode };
  };
}
