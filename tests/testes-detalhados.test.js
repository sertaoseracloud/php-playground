// @vitest-environment happy-dom
// Casos de teste detalhados: cada verificação diz a categoria, o que a página tinha e,
// se falhar, o motivo e uma dica; cada caso diz o cenário (requisições), o erro e o tempo.
import { describe, it, expect } from 'vitest';
import { corrigir } from '../src/corrigir.js';
import { detalharRegra, categoriaDe } from '../src/verificacoes.js';
import { problemas } from '../src/conteudo/trilha.js';

const HTML = '<h1>Tarefas</h1><ul><li>Estudar HTML</li><li>Fazer exercícios de PHP</li></ul><p>Total: 2 tarefas</p>';
const pagina = { html: HTML, erros: '', codigo: '<?php\n$stmt = $pdo->prepare("SELECT * FROM tarefas");\n' };

describe('verificação detalhada', () => {
  it('texto da página: mostra o trecho onde aparece (também quando passa)', () => {
    const d = detalharRegra({ contem: 'Total: 2' }, pagina);
    expect(d).toMatchObject({ ok: true, categoria: 'Texto da página' });
    expect(d.obtido).toContain('Total: 2 tarefas');
    expect(d.dica).toBeUndefined();
  });

  it('texto que falta: mostra o começo da página e a dica', () => {
    const d = detalharRegra({ contem: 'Total: 3' }, pagina);
    expect(d.ok).toBe(false);
    expect(d.obtido).toMatch(/^a página mostra: “Tarefas/);
    expect(d.dica).toMatch(/acentos, maiúsculas e espaços/);
  });

  it('elementos: quantos e quais textos', () => {
    expect(detalharRegra({ seletor: 'li', igual: 3 }, pagina)).toMatchObject({ ok: false, categoria: 'Elemento HTML', obtido: '2 elemento(s) "li"' });
    expect(detalharRegra({ seletor: 'li', texto: 'Estudar' }, pagina).obtido).toBe('“Estudar HTML”, “Fazer exercícios de PHP”');
    expect(detalharRegra({ seletor: 'table', min: 1 }, pagina).obtido).toBe('nenhum elemento "table"');
  });

  it('código: mostra a linha que casou', () => {
    expect(detalharRegra({ codigo: 'prepare' }, pagina).obtido).toBe('linha: $stmt = $pdo->prepare("SELECT * FROM tarefas");');
    expect(detalharRegra({ codigo: 'foreach' }, pagina).obtido).toBe('não aparece no código');
  });

  it('erro do PHP: a dica manda corrigir o erro primeiro', () => {
    const quebrada = { html: '', erros: 'PHP Fatal error:  Uncaught Error: Call to undefined function x() in /www/index.php:3', codigo: '' };
    expect(detalharRegra({ semErros: true }, quebrada).obtido).toMatch(/^PHP Fatal error/);
    expect(detalharRegra({ contem: 'Tarefas' }, quebrada)).toMatchObject({ obtido: 'a página saiu vazia' });
    expect(detalharRegra({ contem: 'Tarefas' }, quebrada).dica).toMatch(/corrija esse erro primeiro/);
  });

  it('toda regra usada nos exercícios tem categoria', () => {
    const regras = problemas.flatMap((p) => p.testes.flatMap((t) => (t.passos ?? [t]).flatMap((x) => x.regras ?? [])));
    expect(regras.filter((g) => categoriaDe(g) === 'Verificação')).toEqual([]);
  });
});

describe('caso de teste detalhado', () => {
  it('traz as requisições, se o banco é outro, o primeiro erro e o tempo', async () => {
    const executar = async (_a, req) => ({ html: `<p>${req.url}</p>`, erros: req.metodo === 'POST' ? 'Warning: Undefined variable $x in /www/login.php on line 2\n' : '' });
    const problema = {
      banco: 'SQL',
      testes: [{
        banco: 'OUTRO SQL',
        passos: [
          { url: 'login.php', metodo: 'POST', corpo: 'usuario=ana&senha=1234', regras: [{ semErros: true }] },
          { url: 'index.php?pagina=2', regras: [{ contem: 'index.php' }] },
        ],
      }],
    };
    const { relatorio } = await corrigir(problema, { 'index.php': '' }, executar);
    expect(relatorio[0]).toMatchObject({
      cenario: [{ metodo: 'POST', url: 'login.php', corpo: 'usuario=ana&senha=1234' }, { metodo: 'GET', url: 'index.php?pagina=2' }],
      bancoProprio: true,
      erroExecucao: 'Warning: Undefined variable $x in /www/login.php on line 2',
    });
    expect(relatorio[0].ms).toBeGreaterThan(0);
    expect(relatorio[0].resultados.map((r) => r.categoria)).toEqual(['Execução', 'Texto da página']);
  });
});
