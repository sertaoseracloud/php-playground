// Roda todos os exemplos e exercícios no PHP 8.4 (WebAssembly para Node),
// o mesmo motor que o navegador usa.
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { Window } from 'happy-dom';
import { PHP } from '@php-wasm/universal';
import { loadNodeRuntime } from '@php-wasm/node';
import { criarExecutor } from '../src/php/sessao.js';
import { corrigir } from '../src/corrigir.js';
import { exemplos } from '../src/conteudo/exemplos.js';
import { exercicios } from '../src/conteudo/exercicios.js';

globalThis.DOMParser = new Window().DOMParser;

let php;
let executar;

beforeAll(async () => {
  php = new PHP(await loadNodeRuntime('8.4', { emscriptenOptions: { processId: 1 } }));
  executar = await criarExecutor(php);
});

afterAll(() => php?.exit());

const falhas = (r) =>
  r.relatorio.flatMap((t) => t.resultados.filter((x) => !x.ok).map((x) => `${t.descricao ?? ''} ${x.mensagem} (${x.detalhe ?? ''})`));

describe('exemplos', () => {
  it('têm ids únicos', () => {
    const ids = [...exemplos, ...exercicios].map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(exemplos.map((e) => [e.id, e]))('%s roda sem erros', async (_id, exemplo) => {
    const r = await executar(exemplo.arquivos, {});
    expect(r.erros).toBe('');
    expect(r.status).toBe(200);
    expect(r.html).not.toMatch(/<b>(Warning|Fatal error|Parse error|Deprecated|Notice)<\/b>/);
    // Código PHP vazando para o HTML (ex.: "?>" dentro de um comentário //).
    expect(r.html).not.toMatch(/<\?php|\?>|\becho\b/);
  });

  it('formulário POST valida e aceita campos repetidos (assuntos[])', async () => {
    const exemplo = exemplos.find((e) => e.id === 'formulario-post');
    const invalido = await executar(exemplo.arquivos, { metodo: 'POST', corpo: 'email=x&mensagem=oi' });
    expect(invalido.html).toContain('Informe um e-mail válido.');
    const valido = await executar(exemplo.arquivos, {
      metodo: 'POST',
      corpo: 'email=a%40b.com&mensagem=mensagem+longa&assuntos%5B%5D=D%C3%BAvida&assuntos%5B%5D=Elogio',
    });
    expect(valido.html).toContain('Mensagem recebida! Assuntos: Dúvida, Elogio.');
  });

  it('formulário GET lê $_GET', async () => {
    const exemplo = exemplos.find((e) => e.id === 'formulario-get');
    const r = await executar(exemplo.arquivos, { url: '/index.php?nome=Ana&idade=20' });
    expect(r.html).toContain('Você é maior');
  });
});

describe('exercícios', () => {
  it.each(exercicios.map((e) => [e.id, e]))('%s: a solução passa', async (_id, exercicio) => {
    const r = await corrigir(exercicio, exercicio.solucao, executar);
    expect(falhas(r)).toEqual([]);
    expect(r.aprovado).toBe(true);
  });

  it.each(exercicios.map((e) => [e.id, e]))('%s: o código inicial roda, mas ainda não passa', async (_id, exercicio) => {
    const inicial = await executar(exercicio.arquivos, {});
    expect(inicial.erros).toBe('');
    const r = await corrigir(exercicio, exercicio.arquivos, executar);
    expect(r.aprovado).toBe(false);
  });

  it('exercício 6 reprova quem esquece htmlspecialchars', async () => {
    const exercicio = exercicios.find((e) => e.id === 'ex-saudacao');
    const semEscape = {
      'index.php': exercicio.solucao['index.php'].replace('htmlspecialchars($nome)', '$nome'),
    };
    const r = await corrigir(exercicio, semEscape, executar);
    expect(r.aprovado).toBe(false);
    expect(falhas(r).join()).toMatch(/htmlspecialchars/);
  });
});
