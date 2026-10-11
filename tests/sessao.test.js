import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { iniciarPhp } from './php-node.js';

let php;
let sessao;
beforeAll(async () => ({ php, sessao } = await iniciarPhp()));
afterAll(() => php?.exit());

const SEED = `
CREATE TABLE alunos (id INTEGER PRIMARY KEY, nome TEXT NOT NULL, nota REAL);
INSERT INTO alunos (nome, nota) VALUES ('Ana', 8.5), ('Bruno', 6);
`;

const LISTAR = `<?php
$db = new PDO('sqlite:/banco/escola.sqlite');
foreach ($db->query('SELECT nome FROM alunos ORDER BY id') as $l) echo $l['nome'], ';';
`;

describe('sessao', () => {
  it('serve um arquivo .html estático pela URL do primeiro arquivo', async () => {
    const r = await sessao.executar({ 'index.html': '<h1>Oi</h1>' });
    expect(r.status).toBe(200);
    expect(r.html).toBe('<h1>Oi</h1>');
  });

  it('cria o banco a partir do seed a cada execução', async () => {
    const inserir = { 'index.php': LISTAR.replace('foreach', "$db->exec(\"INSERT INTO alunos (nome) VALUES ('Caio')\");\nforeach") };
    const primeira = await sessao.executar(inserir, {}, { seed: SEED });
    expect(primeira.html).toBe('Ana;Bruno;Caio;');
    const segunda = await sessao.executar(inserir, {}, { seed: SEED });
    expect(segunda.html).toBe('Ana;Bruno;Caio;');
  });

  it('sem banco, a pasta /banco fica vazia', async () => {
    const r = await sessao.executar({ 'index.php': "<?php var_dump(file_exists('/banco/escola.sqlite'));" });
    expect(r.html).toContain('bool(false)');
  });

  it('devolve e restaura os bytes do banco (modo livre)', async () => {
    const inserir = { 'index.php': "<?php (new PDO('sqlite:/banco/escola.sqlite'))->exec(\"INSERT INTO alunos (nome) VALUES ('Duda')\");" };
    const r = await sessao.executar(inserir, {}, { seed: SEED, devolver: true });
    expect(r.bancoBytes).toBeInstanceOf(Uint8Array);
    const depois = await sessao.executar({ 'index.php': LISTAR }, {}, { bytes: r.bancoBytes });
    expect(depois.html).toBe('Ana;Bruno;Duda;');
  });

  it('inspeciona tabelas, colunas e linhas', async () => {
    const tabelas = await sessao.inspecionar({ seed: SEED });
    expect(tabelas).toEqual([
      {
        nome: 'alunos',
        colunas: [
          { nome: 'id', tipo: 'INTEGER', pk: true },
          { nome: 'nome', tipo: 'TEXT', pk: false },
          { nome: 'nota', tipo: 'REAL', pk: false },
        ],
        total: 2,
        linhas: [[1, 'Ana', 8.5], [2, 'Bruno', 6]],
      },
    ]);
  });

  it('$_SESSION continua entre requisições da mesma sessão e zera numa sessão nova', async () => {
    const contador = { 'index.php': "<?php session_start(); $_SESSION['n'] = ($_SESSION['n'] ?? 0) + 1; echo $_SESSION['n'];" };
    expect((await sessao.executar(contador, {}, undefined, { novaSessao: true })).html).toBe('1');
    expect((await sessao.executar(contador, {}, undefined, { novaSessao: false })).html).toBe('2');
    expect((await sessao.executar(contador, {}, undefined, { novaSessao: false })).html).toBe('3');
    expect((await sessao.executar(contador, {}, undefined, { novaSessao: true })).html).toBe('1');
  });

  it('segue redirecionamentos (POST → Location → GET) mantendo a sessão', async () => {
    const arquivos = {
      'index.php': "<?php session_start(); echo 'Olá, ' . ($_SESSION['usuario'] ?? 'visitante');",
      'login.php': "<?php session_start(); $_SESSION['usuario'] = $_POST['nome']; header('Location: index.php?ok=1'); exit;",
    };
    const r = await sessao.executar(arquivos, { url: '/login.php', metodo: 'POST', corpo: 'nome=Ana' }, undefined, { novaSessao: true });
    expect(r.html).toBe('Olá, Ana');
    expect(r.status).toBe(200);
    expect(r.url).toBe('/index.php?ok=1');
  });

  it('manterBanco preserva o que foi gravado (navegação no preview)', async () => {
    const inserir = { 'index.php': LISTAR.replace('foreach', "if (isset($_GET['novo'])) $db->exec(\"INSERT INTO alunos (nome) VALUES ('Eva')\");\nforeach") };
    await sessao.executar(inserir, { url: '/index.php?novo=1' }, { seed: SEED });
    const depois = await sessao.executar(inserir, {}, { seed: SEED }, { manterBanco: true });
    expect(depois.html).toBe('Ana;Bruno;Eva;');
    const zerado = await sessao.executar(inserir, {}, { seed: SEED });
    expect(zerado.html).toBe('Ana;Bruno;');
  });

  it('contextos separados não misturam banco nem sessão (preview × testes)', async () => {
    const app = {
      'index.php': LISTAR.replace('<?php', "<?php session_start(); echo ($_SESSION['quem'] ?? '-') . '|';"),
      'entrar.php': "<?php session_start(); $_SESSION['quem'] = $_GET['q']; (new PDO('sqlite:/banco/escola.sqlite'))->exec(\"INSERT INTO alunos (nome) VALUES ('\" . $_GET['q'] . \"')\"); header('Location: index.php'); exit;",
    };
    const preview = await sessao.executar(app, { url: '/entrar.php?q=Pri' }, { seed: SEED }, { contexto: 'preview' });
    expect(preview.html).toBe('Pri|Ana;Bruno;Pri;');

    const teste = await sessao.executar(app, { url: '/entrar.php?q=Tes' }, { seed: SEED }, { contexto: 'testes' });
    expect(teste.html).toBe('Tes|Ana;Bruno;Tes;');

    // Volta ao preview: o banco e a sessão do preview continuam intactos.
    const deVolta = await sessao.executar(app, {}, { seed: SEED }, { contexto: 'preview', novaSessao: false, manterBanco: true });
    expect(deVolta.html).toBe('Pri|Ana;Bruno;Pri;');
    const tabelas = await sessao.inspecionar({ seed: SEED }, { contexto: 'preview', manterBanco: true });
    expect(tabelas[0].total).toBe(3);
  });

  it('password_hash e password_verify estão disponíveis', async () => {
    const r = await sessao.executar({ 'index.php': "<?php $h = password_hash('1234', PASSWORD_DEFAULT); var_dump(password_verify('1234', $h), password_verify('x', $h));" });
    expect(r.html).toContain('bool(true)');
    expect(r.html).toContain('bool(false)');
  });

  it('erro no seed vira exceção clara', async () => {
    await expect(sessao.executar({ 'index.php': '' }, {}, { seed: 'CREATE TABLE (' })).rejects.toThrow(/script do banco/);
  });
});
