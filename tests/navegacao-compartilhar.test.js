import { describe, it, expect } from 'vitest';
import { montarRequisicao, normalizarUrl } from '../src/navegacao.js';
import { codificar, decodificar, lerRota, linkItem, linkCompartilhado } from '../src/compartilhar.js';

describe('normalizarUrl', () => {
  it.each([
    ['', '/index.php', 'index.php'],
    ['/', '/index.php', 'index.php'],
    ['?n=4', '/index.php?n=4', 'index.php'],
    ['index.php?n=4', '/index.php?n=4', 'index.php'],
    ['/outra.php', '/outra.php', 'index.php'],
    ['', '/index.html', 'index.html'],
    ['?x=1', '/index.html?x=1', 'index.html'],
  ])('"%s" vira "%s" (arquivo principal %s)', (entrada, saida, principal) => {
    expect(normalizarUrl(entrada, principal)).toBe(saida);
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
    expect(decodificar(codificar(estado))).toEqual(estado);
  });

  it('ignora códigos corrompidos', () => {
    expect(decodificar('@@@')).toBeNull();
    expect(decodificar(btoa('{"a":{"x":1}}'))).toBeNull();
  });
});

describe('rotas', () => {
  it('início', () => {
    expect(lerRota('')).toEqual({ tela: 'inicio' });
    expect(lerRota('#/')).toEqual({ tela: 'inicio' });
    expect(lerRota('#/qualquer-coisa')).toEqual({ tela: 'inicio' });
  });

  it('item da trilha e playground livre', () => {
    expect(lerRota(linkItem('pdo-contar'))).toEqual({ tela: 'item', id: 'pdo-contar' });
    expect(lerRota('#/livre')).toEqual({ tela: 'item', id: 'livre' });
  });

  it('código compartilhado', () => {
    const estado = { item: 'html-links', arquivos: { 'index.html': '<a href="#">x</a>' } };
    expect(lerRota(linkCompartilhado(estado))).toEqual({ tela: 'item', id: 'html-links', arquivos: estado.arquivos });
    expect(lerRota('#/s/@@@')).toEqual({ tela: 'inicio' });
  });
});
