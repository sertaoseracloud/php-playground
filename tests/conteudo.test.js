// Roda toda a trilha no PHP 8.4 (WebAssembly para Node), o mesmo motor do navegador.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Window } from 'happy-dom';
import { iniciarPhp } from './php-node.js';
import { corrigir } from '../src/corrigir.js';
import { modulos, itens, problemas, LIVRE, DIFICULDADES } from '../src/conteudo/trilha.js';

globalThis.DOMParser = new Window().DOMParser;

let php;
let sessao;
beforeAll(async () => ({ php, sessao } = await iniciarPhp()));
afterAll(() => php?.exit());

const executar = (arquivos, req, banco, opcoes) => sessao.executar(arquivos, req, banco, opcoes);
const bancoDe = (item) => (item.banco ? { seed: item.banco } : undefined);
const falhas = (r) =>
  r.relatorio.flatMap((t) => t.resultados.filter((x) => !x.ok).map((x) => `[${t.descricao ?? ''}] ${x.mensagem} (${x.detalhe ?? ''})`));

describe('estrutura da trilha', () => {
  it('segue a ordem HTML → W3.CSS → PHP → PDO, com Projetos como módulo extra', () => {
    expect(modulos.map((m) => m.id)).toEqual(['html', 'w3css', 'php', 'pdo', 'projetos']);
  });

  it('tem 10 problemas por módulo principal e ids únicos', () => {
    for (const m of modulos.filter((x) => !x.extra)) {
      expect(m.itens.filter((i) => i.tipo === 'problema'), m.id).toHaveLength(10);
    }
    const ids = [...itens, LIVRE].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(problemas.map((p) => [p.id, p]))('%s tem os campos obrigatórios', (_id, p) => {
    expect(Object.keys(DIFICULDADES)).toContain(p.dificuldade);
    expect(p.enunciado).toBeTruthy();
    expect(p.dica).toBeTruthy();
    expect(p.testes.some((t) => !t.oculto), 'precisa de ao menos um caso visível').toBe(true);
  });
});

describe('projetos', () => {
  const etapas = problemas.filter((p) => p.projeto);

  it('cada etapa parte da solução da etapa anterior', () => {
    for (const etapa of etapas.filter((e) => e.etapaAnterior)) {
      const anterior = problemas.find((p) => p.id === etapa.etapaAnterior);
      expect(etapa.arquivos, etapa.id).toEqual(anterior.solucao);
    }
  });

  it('index.php é sempre o primeiro arquivo', () => {
    for (const etapa of etapas) expect(Object.keys(etapa.solucao)[0], etapa.id).toBe('index.php');
  });
});

describe('lições e playground livre', () => {
  it.each([...itens.filter((i) => i.tipo === 'licao'), LIVRE].map((l) => [l.id, l]))('%s roda sem erros', async (_id, licao) => {
    const r = await executar(licao.arquivos, {}, bancoDe(licao));
    expect(r.erros).toBe('');
    expect(r.status).toBe(200);
    expect(r.html).not.toMatch(/<b>(Warning|Fatal error|Parse error|Deprecated|Notice)<\/b>/);
    // Código PHP vazando para o HTML (ex.: "?>" dentro de um comentário //).
    expect(r.html).not.toMatch(/<\?php|\?>|\becho\b/);
  });
});

describe('problemas', () => {
  it.each(problemas.map((p) => [p.id, p]))('%s: a solução passa em todos os casos', async (_id, problema) => {
    const r = await corrigir(problema, problema.solucao, executar);
    expect(falhas(r)).toEqual([]);
    expect(r.aprovado).toBe(true);
  });

  it.each(problemas.map((p) => [p.id, p]))('%s: o código inicial roda, mas não passa', async (_id, problema) => {
    const inicial = await executar(problema.arquivos, {}, bancoDe(problema));
    expect(inicial.erros).toBe('');
    const r = await corrigir(problema, problema.arquivos, executar);
    expect(r.aprovado).toBe(false);
  });

  it('casos ocultos ficam de fora quando incluirOcultos é false', async () => {
    const p = problemas.find((x) => x.id === 'pdo-contar');
    const visiveis = await corrigir(p, p.solucao, executar, { incluirOcultos: false });
    expect(visiveis.relatorio.every((t) => !t.oculto)).toBe(true);
    const todos = await corrigir(p, p.solucao, executar);
    expect(todos.relatorio.some((t) => t.oculto)).toBe(true);
  });

  it('pdo-contar reprova quem escreve o número fixo no código', async () => {
    const p = problemas.find((x) => x.id === 'pdo-contar');
    const fixo = { 'index.php': p.solucao['index.php'].replace('<?= $total ?>', '8') };
    const r = await corrigir(p, fixo, executar);
    expect(r.relatorio.find((t) => t.oculto).ok).toBe(false);
  });

  it('pdo-filtro-curso reprova SQL concatenado (SQL injection)', async () => {
    const p = problemas.find((x) => x.id === 'pdo-filtro-curso');
    const vulneravel = {
      'index.php': p.solucao['index.php']
        .replace('WHERE cursos.nome = ? ORDER BY alunos.nome', "WHERE cursos.nome = '$curso' ORDER BY alunos.nome")
        .replace('$stmt->execute([$curso]);', '$stmt->execute();'),
    };
    const r = await corrigir(p, vulneravel, executar);
    expect(falhas(r).join()).toMatch(/SQL injection/);
  });

  it('ex-saudacao reprova quem esquece htmlspecialchars', async () => {
    const p = problemas.find((x) => x.id === 'ex-saudacao');
    const semEscape = { 'index.php': p.solucao['index.php'].replace('htmlspecialchars($nome)', '$nome') };
    const r = await corrigir(p, semEscape, executar);
    expect(falhas(r).join()).toMatch(/htmlspecialchars/);
  });
});
