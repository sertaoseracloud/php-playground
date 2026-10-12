// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import {
  codificarCertificado, extrairCodigo, validarImpresso, montarCadeia, linkPublico, SITE,
} from '../src/certificados.js';
import { resultadoDoLink, resultadoDoImpresso, renderValidador } from '../src/ui/validador.js';
import { lerRota } from '../src/compartilhar.js';

const PHP = { nome: 'Maria da Conceição', modulo: 'php', data: '2026-10-12', cadeia: ['2026-10-01', '2026-10-05'] };
const HTML = { nome: 'Maria da Conceição', modulo: 'html', data: '2026-10-01' };

describe('extrairCodigo', () => {
  const codigo = codificarCertificado(PHP);
  it.each([
    ['link do certificado', `${SITE}#/certificado/${codigo}`],
    ['link do badge do LinkedIn', linkPublico(PHP)],
    ['link do validador', `${SITE}#/validar/${codigo}`],
    ['só o código, com espaços', `  ${codigo}  `],
  ])('%s', (_nome, texto) => {
    expect(extrairCodigo(texto)).toBe(codigo);
  });

  it('texto que não é certificado', () => {
    expect(extrairCodigo('olá, tudo bem?')).toBeNull();
    expect(extrairCodigo('')).toBeNull();
  });
});

describe('validar pelo link', () => {
  it('certificado válido mostra aluno e a cadeia', () => {
    const html = resultadoDoLink(`${SITE}#/certificado/${codificarCertificado(PHP)}`);
    expect(html).toContain('Certificado válido');
    expect(html).toContain('Maria da Conceição');
    expect(html.match(/<li/g)).toHaveLength(3); // HTML → W3.CSS → PHP
  });

  it('link alterado é inválido', () => {
    const outro = codificarCertificado({ ...PHP, nome: 'Outra Pessoa' });
    const dados = JSON.parse(atob(outro.replace(/-/g, '+').replace(/_/g, '/')));
    const original = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(codificarCertificado(PHP).replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0))));
    // selo da Maria com o nome de outra pessoa
    const adulterado = btoa(unescape(encodeURIComponent(JSON.stringify({ ...original, n: dados.n })))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    expect(resultadoDoLink(adulterado)).toContain('Certificado inválido');
  });

  it('texto sem certificado', () => {
    expect(resultadoDoLink('qualquer coisa')).toContain('Não encontrei um certificado');
  });
});

describe('validar certificado impresso', () => {
  const elos = montarCadeia(PHP);
  const impressoPhp = { nome: PHP.nome, modulo: 'php', data: PHP.data, selo: elos[2].hash, anterior: elos[1].hash };

  it('o primeiro da cadeia não precisa de "Anterior"', () => {
    const selo = montarCadeia(HTML)[0].hash;
    expect(validarImpresso({ ...HTML, selo }).valido).toBe(true);
  });

  it('aceita o selo do jeito que está impresso (em grupos, maiúsculas)', () => {
    const emGrupos = impressoPhp.selo.match(/.{16}/g).join(' ').toUpperCase();
    expect(validarImpresso({ ...impressoPhp, selo: emGrupos }).valido).toBe(true);
  });

  it('nome, data ou anterior diferentes não conferem', () => {
    expect(validarImpresso({ ...impressoPhp, nome: 'Maria da Conceicao' }).valido).toBe(false);
    expect(validarImpresso({ ...impressoPhp, data: '2026-10-13' }).valido).toBe(false);
    expect(validarImpresso({ ...impressoPhp, anterior: elos[0].hash }).valido).toBe(false);
  });

  it('avisa o que falta', () => {
    expect(validarImpresso({ ...impressoPhp, anterior: '' }).motivo).toMatch(/Anterior/);
    expect(validarImpresso({ ...impressoPhp, selo: 'abc' }).motivo).toMatch(/64 caracteres/);
    expect(resultadoDoImpresso(impressoPhp)).toContain('Selo confere');
  });
});

describe('página', () => {
  it('rotas #/validar e #/validar/<código>', () => {
    expect(lerRota('#/validar')).toEqual({ tela: 'validar', codigo: '' });
    expect(lerRota('#/validar/abc')).toEqual({ tela: 'validar', codigo: 'abc' });
  });

  it('com código na rota, já mostra o resultado', () => {
    document.body.innerHTML = '<main id="tela"></main>';
    renderValidador(document.getElementById('tela'), codificarCertificado(HTML));
    expect(document.getElementById('saida-link').textContent).toContain('Certificado válido');
    // HTML é o primeiro da cadeia: o campo "Anterior" some quando ele é escolhido
    const form = document.getElementById('form-impresso');
    form.modulo.value = 'html';
    form.modulo.onchange();
    expect(document.getElementById('rotulo-anterior').hidden).toBe(true);
  });
});
