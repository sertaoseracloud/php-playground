import { describe, it, expect } from 'vitest';
import { montarRequisicao, normalizarUrl, paraOPreview } from '../src/navegacao.js';
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
    expect(lerRota('')).toEqual({ tela: 'landing' });
    expect(lerRota('#/')).toEqual({ tela: 'landing' });
    expect(lerRota('#/trilha')).toEqual({ tela: 'inicio' });
    expect(lerRota('#conteudo')).toEqual({ tela: 'landing' });
  });

  it('endereço que não existe avisa em vez de cair na landing', () => {
    expect(lerRota('#/qualquer-coisa')).toEqual({ tela: 'nao-encontrada' });
    expect(lerRota('#/s/@@@')).toEqual({ tela: 'nao-encontrada', motivo: 'link' });
  });

  it('item da trilha e playground livre', () => {
    expect(lerRota(linkItem('pdo-contar'))).toEqual({ tela: 'item', id: 'pdo-contar' });
    expect(lerRota('#/livre')).toEqual({ tela: 'item', id: 'livre' });
  });

  it('código compartilhado', () => {
    const estado = { item: 'html-links', arquivos: { 'index.html': '<a href="#">x</a>' } };
    expect(lerRota(linkCompartilhado(estado))).toEqual({ tela: 'item', id: 'html-links', arquivos: estado.arquivos });
  });
});

describe('paraOPreview', () => {
  // A W3.CSS do w3schools bloqueia a pintura até chegar: o preview usa uma cópia local embutida.
  it('troca o link da W3.CSS por uma cópia embutida e mantém o resto da página', () => {
    const html = '<head><link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css"><title>Oi</title></head><body><p>x</p></body>';
    const preview = paraOPreview(html);
    expect(preview).not.toContain('w3schools.com');
    expect(preview).toContain('<style data-w3css>');
    expect(preview).toContain('.w3-container');
    expect(preview).toContain('<title>Oi</title></head><body><p>x</p></body>');
  });

  it('vale para outras versões e outras formas de escrever o link', () => {
    for (const link of [
      "<link href='https://www.w3schools.com/w3css/4/w3.css' rel='stylesheet'>",
      '<LINK REL="stylesheet" HREF="//www.w3schools.com/w3css/5/w3.css" />',
      '<link rel="stylesheet" href="http://www.w3schools.com/w3css/w3.css">',
    ]) {
      expect(paraOPreview(link)).toMatch(/^<style data-w3css>[\s\S]*<\/style>$/);
    }
  });

  it('não mexe em outras folhas de estilo', () => {
    const html = '<link rel="stylesheet" href="estilo.css"><link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Lato">';
    expect(paraOPreview(html)).toBe(html);
  });
});
