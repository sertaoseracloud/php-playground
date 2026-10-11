import { describe, it, expect } from 'vitest';
import { montarRequisicao, normalizarUrl } from '../src/navegacao.js';
import { codificar, decodificar } from '../src/compartilhar.js';

describe('normalizarUrl', () => {
  it.each([
    ['', '/index.php'],
    ['/', '/index.php'],
    ['?n=4', '/index.php?n=4'],
    ['index.php?n=4', '/index.php?n=4'],
    ['/outra.php', '/outra.php'],
  ])('"%s" vira "%s"', (entrada, saida) => {
    expect(normalizarUrl(entrada)).toBe(saida);
  });
});

describe('montarRequisicao', () => {
  it('formulário GET sem action substitui a query string da página atual', () => {
    const req = montarRequisicao('/index.php?nome=velho', {
      tipo: 'form', metodo: 'GET', acao: '', campos: [['nome', 'Ana Paula'], ['idade', '20']],
    });
    expect(req).toEqual({ url: '/index.php?nome=Ana+Paula&idade=20', metodo: 'GET' });
  });

  it('formulário POST envia o corpo codificado e mantém a URL', () => {
    const req = montarRequisicao('/index.php', {
      tipo: 'form', metodo: 'POST', acao: 'salvar.php', campos: [['c[]', 'x'], ['c[]', 'y']],
    });
    expect(req).toEqual({ url: '/salvar.php', metodo: 'POST', corpo: 'c%5B%5D=x&c%5B%5D=y' });
  });

  it('link relativo com query string', () => {
    expect(montarRequisicao('/index.php', { tipo: 'link', metodo: 'GET', acao: '?pagina=2', campos: [] }))
      .toEqual({ url: '/index.php?pagina=2', metodo: 'GET' });
    expect(montarRequisicao('/index.php', { tipo: 'link', metodo: 'GET', acao: 'sobre.php', campos: [] }))
      .toEqual({ url: '/sobre.php', metodo: 'GET' });
  });
});

describe('compartilhar', () => {
  it('codifica e decodifica arquivos com acentos e símbolos', () => {
    const estado = { item: 'livre', arquivos: { 'index.php': '<?php echo "Olá, ção! & <b>"; ?>' } };
    expect(decodificar('#' + codificar(estado))).toEqual(estado);
  });

  it('hash simples aponta para um item', () => {
    expect(decodificar('#ex-tabuada')).toEqual({ item: 'ex-tabuada' });
    expect(decodificar('')).toBeNull();
  });

  it('ignora links corrompidos', () => {
    expect(decodificar('#s=@@@')).toBeNull();
    expect(decodificar('#s=' + btoa('{"a":{"x":1}}'))).toBeNull();
  });
});
