// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { verificarRegra, textoVisivel } from '../src/verificacoes.js';

const pagina = (html, extra = {}) => ({ html, erros: '', codigo: '', ...extra });

describe('textoVisivel', () => {
  it('junta espaços e ignora tags', () => {
    expect(textoVisivel('<p>Olá,\n   <b>Ana</b>!</p>')).toBe('Olá, Ana!');
  });
});

describe('verificarRegra', () => {
  it('contem: passa quando o texto aparece na página renderizada', () => {
    expect(verificarRegra({ contem: '4 é par' }, pagina('<p>4 <i>é</i> par</p>')).ok).toBe(true);
    expect(verificarRegra({ contem: '4 é par' }, pagina('<p>4 é ímpar</p>')).ok).toBe(false);
  });

  it('naoContem: falha quando o texto aparece', () => {
    expect(verificarRegra({ naoContem: 'Warning' }, pagina('<b>Warning</b>: x')).ok).toBe(false);
    expect(verificarRegra({ naoContem: 'Warning' }, pagina('<p>ok</p>')).ok).toBe(true);
  });

  it('seletor com min, max e igual', () => {
    const html = '<ul class="w3-ul"><li>a</li><li>b</li><li>c</li></ul>';
    expect(verificarRegra({ seletor: 'ul.w3-ul li', min: 3 }, pagina(html)).ok).toBe(true);
    expect(verificarRegra({ seletor: 'ul.w3-ul li', min: 4 }, pagina(html)).ok).toBe(false);
    expect(verificarRegra({ seletor: 'ul.w3-ul li', igual: 3 }, pagina(html)).ok).toBe(true);
    expect(verificarRegra({ seletor: 'ul.w3-ul li', igual: 2 }, pagina(html)).ok).toBe(false);
    expect(verificarRegra({ seletor: 'ul.w3-ul li', max: 2 }, pagina(html)).ok).toBe(false);
    expect(verificarRegra({ seletor: 'table' }, pagina(html)).ok).toBe(false);
  });

  it('seletor com texto: algum elemento do seletor contém o texto', () => {
    const html = '<head><title> Minha  página </title></head><ul><li>Arroz</li><li>Feijão preto</li></ul>';
    expect(verificarRegra({ seletor: 'title', texto: 'Minha página' }, pagina(html)).ok).toBe(true);
    expect(verificarRegra({ seletor: 'li', texto: 'Feijão' }, pagina(html)).ok).toBe(true);
    const r = verificarRegra({ seletor: 'li', texto: 'Café' }, pagina(html));
    expect(r).toEqual({ ok: false, mensagem: 'Um elemento "li" deve conter "Café"', detalhe: 'nenhum "li" com esse texto' });
    expect(verificarRegra({ seletor: 'h1', texto: 'Oi' }, pagina(html)).detalhe).toBe('nenhum "h1" com esse texto');
  });

  it('seletor sem limites exige pelo menos um elemento', () => {
    expect(verificarRegra({ seletor: 'h1' }, pagina('<h1>Oi</h1>')).ok).toBe(true);
  });

  it('codigo: procura um padrão no código-fonte, sem diferenciar maiúsculas', () => {
    const p = pagina('', { codigo: '<?php FOREACH ($itens as $i) {}' });
    expect(verificarRegra({ codigo: 'foreach\\s*\\(' }, p).ok).toBe(true);
    expect(verificarRegra({ codigo: '\\bfor\\s*\\(' }, p).ok).toBe(false);
  });

  it('semErros: falha com erro do PHP no stderr', () => {
    expect(verificarRegra({ semErros: true }, pagina('<p>ok</p>')).ok).toBe(true);
    expect(verificarRegra({ semErros: true }, pagina('', { erros: 'PHP Warning: x' })).ok).toBe(false);
  });

  it('usa a mensagem da regra e informa o que foi encontrado', () => {
    const r = verificarRegra({ seletor: 'li', igual: 5, msg: 'Mostre 5 itens' }, pagina('<li>a</li>'));
    expect(r).toEqual({ ok: false, mensagem: 'Mostre 5 itens', detalhe: 'encontrei 1 elemento(s) "li"' });
  });

  it('regra desconhecida é um erro de quem escreveu o exercício', () => {
    expect(() => verificarRegra({ outra: 1 }, pagina(''))).toThrow(/regra desconhecida/i);
  });
});
