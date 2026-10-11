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

  it('erro no seed vira exceção clara', async () => {
    await expect(sessao.executar({ 'index.php': '' }, {}, { seed: 'CREATE TABLE (' })).rejects.toThrow(/script do banco/);
  });
});
