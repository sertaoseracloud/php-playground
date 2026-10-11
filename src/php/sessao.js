import { PHPRequestHandler, setPhpIniEntries } from '@php-wasm/universal';

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
 */
export async function criarSessao(php) {
  await setPhpIniEntries(php, PHP_INI);
  const handler = new PHPRequestHandler({ phpFactory: async () => php, documentRoot: RAIZ });

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

  async function executar(arquivos, { url, metodo = 'GET', corpo } = {}, banco) {
    limpar(RAIZ);
    for (const [nome, conteudo] of Object.entries(arquivos)) {
      php.writeFile(`${RAIZ}/${nome}`, conteudo);
    }
    await prepararBanco(banco);
    const headers = corpo === undefined ? {} : { 'content-type': 'application/x-www-form-urlencoded' };
    const body = corpo === undefined ? undefined : new TextEncoder().encode(corpo);
    const resposta = await handler.request({
      url: url ?? `/${Object.keys(arquivos)[0] ?? 'index.php'}`,
      method: metodo,
      body,
      headers,
    });
    const resultado = { html: resposta.text, erros: resposta.errors, status: resposta.httpStatusCode };
    if (banco?.devolver && php.fileExists(ARQUIVO_BANCO)) {
      resultado.bancoBytes = php.readFileAsBuffer(ARQUIVO_BANCO);
    }
    return resultado;
  }

  async function inspecionar(banco) {
    await prepararBanco(banco);
    if (!php.fileExists(ARQUIVO_BANCO)) return [];
    const r = await php.run({ code: INSPECIONAR_BANCO });
    return JSON.parse(r.text);
  }

  return { executar, inspecionar };
}
