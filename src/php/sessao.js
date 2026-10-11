import { HttpCookieStore, PHPRequestHandler, setPhpIniEntries } from '@php-wasm/universal';

export const RAIZ = '/www';
export const PASTA_BANCO = '/banco';
export const ARQUIVO_BANCO = '/banco/escola.sqlite';

// Mostra erros e avisos do PHP na própria página, como num servidor de desenvolvimento.
const PHP_INI = {
  display_errors: '1',
  display_startup_errors: '1',
  error_reporting: 'E_ALL',
  html_errors: '1',
  'date.timezone': 'America/Sao_Paulo',
};

const CRIAR_BANCO = `<?php
$db = new PDO('sqlite:${ARQUIVO_BANCO}');
$db->exec(file_get_contents('${PASTA_BANCO}/.seed.sql'));
`;

// Lista as tabelas do banco com colunas e até 50 linhas, em JSON (aba "Banco").
const INSPECIONAR_BANCO = `<?php
$db = new PDO('sqlite:${ARQUIVO_BANCO}');
$tabelas = [];
$nomes = $db->query("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY rowid")
            ->fetchAll(PDO::FETCH_COLUMN);
foreach ($nomes as $nome) {
    $colunas = [];
    foreach ($db->query("PRAGMA table_info(\\"$nome\\")") as $c) {
        $colunas[] = ['nome' => $c['name'], 'tipo' => $c['type'], 'pk' => (bool) $c['pk']];
    }
    $tabelas[] = [
        'nome' => $nome,
        'colunas' => $colunas,
        'total' => (int) $db->query("SELECT COUNT(*) FROM \\"$nome\\"")->fetchColumn(),
        'linhas' => $db->query("SELECT * FROM \\"$nome\\" LIMIT 50")->fetchAll(PDO::FETCH_NUM),
    ];
}
echo json_encode($tabelas);
`;

/**
 * Recebe uma instância de PHP (web ou node) e devolve as operações usadas pelo
 * playground. `banco` pode ser { seed: 'SQL' } (cria um banco novo a partir do
 * script) ou { bytes: Uint8Array } (restaura um banco salvo). Sem `banco`, a
 * pasta /banco fica vazia.
 *
 * Opções de `executar`:
 * - `novaSessao` (padrão true): começa sem cookies, ou seja, sem $_SESSION.
 *   false continua a sessão anterior (login → publicar → ver o feed).
 * - `manterBanco` (padrão false): não recria o banco; usa o que já está em
 *   /banco. É o que o preview faz quando o aluno clica em links e formulários.
 * - `contexto` (padrão 'principal'): cada contexto tem o próprio banco e os
 *   próprios cookies. O preview e os casos de teste usam contextos diferentes,
 *   então rodar os testes não bagunça o que o aluno está vendo no preview.
 */
const REDIRECIONAMENTOS = [301, 302, 303, 307, 308];

export async function criarSessao(php) {
  await setPhpIniEntries(php, PHP_INI);
  // Um handler por sessão: cada um tem o próprio "pote" de cookies (PHPSESSID).
  const criarHandler = () => new PHPRequestHandler({
    phpFactory: async () => php,
    documentRoot: RAIZ,
    cookieStore: new HttpCookieStore(),
  });
  const handlers = new Map();

  // O arquivo do banco é sempre /banco/escola.sqlite (é o que o código do aluno abre).
  // Ao trocar de contexto, o banco atual é guardado e o do outro contexto é restaurado.
  const GUARDA = '/.contextos';
  php.mkdir(GUARDA);
  let contextoAtual = 'principal';
  function trocarContexto(contexto) {
    if (contexto === contextoAtual) return;
    const guardar = `${GUARDA}/${contextoAtual}.sqlite`;
    if (php.fileExists(ARQUIVO_BANCO)) php.writeFile(guardar, php.readFileAsBuffer(ARQUIVO_BANCO));
    else if (php.fileExists(guardar)) php.unlink(guardar);
    limpar(PASTA_BANCO);
    const restaurar = `${GUARDA}/${contexto}.sqlite`;
    if (php.fileExists(restaurar)) php.writeFile(ARQUIVO_BANCO, php.readFileAsBuffer(restaurar));
    contextoAtual = contexto;
  }

  function limpar(pasta) {
    if (php.isDir(pasta)) php.rmdir(pasta, { recursive: true });
    php.mkdir(pasta);
  }

  async function prepararBanco(banco) {
    limpar(PASTA_BANCO);
    if (!banco) return;
    if (banco.bytes) {
      php.writeFile(ARQUIVO_BANCO, banco.bytes);
      return;
    }
    php.writeFile(`${PASTA_BANCO}/.seed.sql`, banco.seed);
    try {
      const r = await php.run({ code: CRIAR_BANCO });
      if (r.errors) throw new Error(r.errors);
    } catch (erro) {
      const detalhe = String(erro?.message ?? erro).match(/SQLSTATE[^\n]*/)?.[0] ?? erro;
      throw new Error(`Erro no script do banco: ${detalhe}`);
    } finally {
      php.unlink(`${PASTA_BANCO}/.seed.sql`);
    }
  }

  async function executar(arquivos, req = {}, banco, { novaSessao = true, manterBanco = false, contexto = 'principal' } = {}) {
    trocarContexto(contexto);
    limpar(RAIZ);
    for (const [nome, conteudo] of Object.entries(arquivos)) {
      php.writeFile(`${RAIZ}/${nome}`, conteudo);
    }
    if (!manterBanco || !php.fileExists(ARQUIVO_BANCO)) await prepararBanco(banco);
    if (novaSessao || !handlers.has(contexto)) handlers.set(contexto, criarHandler());
    const handler = handlers.get(contexto);

    let url = req.url ?? `/${Object.keys(arquivos)[0] ?? 'index.php'}`;
    let metodo = req.metodo ?? 'GET';
    let corpo = req.corpo;
    let resposta;
    const erros = [];
    // Segue header('Location: ...') como um navegador, até 5 vezes.
    for (let saltos = 0; ; saltos++) {
      resposta = await handler.request({
        url,
        method: metodo,
        body: corpo === undefined ? undefined : new TextEncoder().encode(corpo),
        headers: corpo === undefined ? {} : { 'content-type': 'application/x-www-form-urlencoded' },
      });
      if (resposta.errors) erros.push(resposta.errors);
      const destino = resposta.headers?.location?.[0];
      if (!REDIRECIONAMENTOS.includes(resposta.httpStatusCode) || !destino || saltos === 5) break;
      const proxima = new URL(destino, `http://localhost${url}`);
      url = proxima.pathname + proxima.search;
      metodo = 'GET';
      corpo = undefined;
    }

    const resultado = { html: resposta.text, erros: erros.join(''), status: resposta.httpStatusCode, url };
    if (banco?.devolver && php.fileExists(ARQUIVO_BANCO)) {
      resultado.bancoBytes = php.readFileAsBuffer(ARQUIVO_BANCO);
    }
    return resultado;
  }

  async function inspecionar(banco, { manterBanco = false, contexto = 'principal' } = {}) {
    trocarContexto(contexto);
    if (!manterBanco || !php.fileExists(ARQUIVO_BANCO)) await prepararBanco(banco);
    if (!php.fileExists(ARQUIVO_BANCO)) return [];
    const r = await php.run({ code: INSPECIONAR_BANCO });
    return JSON.parse(r.text);
  }

  return { executar, inspecionar };
}
