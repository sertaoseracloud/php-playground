import { describe, it, expect } from 'vitest';
import {
  CERTIFICADOS, EMISSOR, codificarCertificado, decodificarCertificado, idCertificado, hashCertificado,
  linkLinkedInPerfil, linkLinkedInPublicar, linkPublico, textoPublicacao, SITE,
} from '../src/certificados.js';
import { modulos } from '../src/conteudo/trilha.js';
import { lerRota, paraBase64Url, deBase64Url } from '../src/compartilhar.js';

const lerCodigo = (codigo) => JSON.parse(new TextDecoder().decode(deBase64Url(codigo)));
const escreverCodigo = (obj) => paraBase64Url(new TextEncoder().encode(JSON.stringify(obj)));

const CERT = { nome: 'Maria da Conceição', modulo: 'php', data: '2026-10-11' };

describe('certificados', () => {
  it('existe um certificado para cada módulo e um final', () => {
    expect(Object.keys(CERTIFICADOS).sort()).toEqual([...modulos.map((m) => m.id), 'final'].sort());
    for (const c of Object.values(CERTIFICADOS)) {
      expect(c.titulo).toBeTruthy();
      expect(c.conteudos.length).toBeGreaterThan(2);
    }
  });

  it('emitido pela Sertão será cloud, assinado por Cláudio Raposo', () => {
    expect(EMISSOR.organizacao).toBe('Sertão será cloud');
    expect(EMISSOR.responsavel).toBe('Cláudio Raposo');
  });

  it('o código guarda nome, módulo e data (com acentos)', () => {
    const codigo = codificarCertificado(CERT);
    expect(decodificarCertificado(codigo)).toEqual({
      ...CERT, hash: hashCertificado(CERT), id: idCertificado(CERT), selo: 'confere',
    });
    expect(lerRota(`#/certificado/${codigo}`)).toEqual({ tela: 'certificado', codigo });
  });

  it('id estável no formato SSC-AAAA-XXXX-XXXX, tirado do selo', () => {
    expect(idCertificado(CERT)).toMatch(/^SSC-2026-[0-9A-F]{4}-[0-9A-F]{4}$/);
    expect(idCertificado(CERT).replace(/-/g, '').slice(7).toLowerCase()).toBe(hashCertificado(CERT).slice(0, 8));
    expect(idCertificado(CERT)).toBe(idCertificado({ ...CERT }));
    expect(idCertificado(CERT)).not.toBe(idCertificado({ ...CERT, modulo: 'html' }));
  });

  it('selo HMAC-SHA256: muda com data, emissor, empresa, aluno e módulo', () => {
    const hash = hashCertificado(CERT);
    expect(hash).toMatch(/^[0-9a-f]{64}$/);
    for (const mudanca of [{ data: '2026-10-12' }, { nome: 'Maria da Conceicao' }, { modulo: 'html' }]) {
      expect(hashCertificado({ ...CERT, ...mudanca })).not.toBe(hash);
    }
    expect(hashCertificado({ ...CERT, nome: '  Maria da Conceição ' })).toBe(hash); // espaços nas pontas não contam
  });

  it('o link leva o selo, e a palavra secreta nunca aparece', () => {
    const dados = lerCodigo(codificarCertificado(CERT));
    expect(dados.h).toBe(hashCertificado(CERT));
    expect(JSON.stringify(dados).toLowerCase()).not.toMatch(/caf[eé]/);
  });

  it('detecta link alterado e link antigo sem selo', () => {
    const dados = lerCodigo(codificarCertificado(CERT));
    const alterado = decodificarCertificado(escreverCodigo({ ...dados, n: 'Outra Pessoa' }));
    expect(alterado.selo).toBe('nao-confere');
    expect(alterado.hash).toBe(dados.h);
    const antigo = decodificarCertificado(escreverCodigo({ n: CERT.nome, m: CERT.modulo, d: CERT.data }));
    expect(antigo.selo).toBe('ausente');
  });

  it('rejeita códigos inválidos', () => {
    expect(decodificarCertificado('@@@')).toBeNull();
    expect(decodificarCertificado(codificarCertificado({ ...CERT, modulo: 'inexistente' }))).toBeNull();
    expect(decodificarCertificado(codificarCertificado({ ...CERT, nome: '  ' }))).toBeNull();
    expect(decodificarCertificado(codificarCertificado({ ...CERT, data: 'ontem' }))).toBeNull();
  });

  it('links do LinkedIn: adicionar ao perfil e publicar', () => {
    const url = 'https://sertaoseracloud.github.io/php-playground/#/certificado/abc';
    const perfil = new URL(linkLinkedInPerfil(CERT, url));
    expect(perfil.origin + perfil.pathname).toBe('https://www.linkedin.com/profile/add');
    expect(Object.fromEntries(perfil.searchParams)).toEqual({
      startTask: 'CERTIFICATION_NAME',
      name: CERTIFICADOS.php.titulo,
      organizationName: 'Sertão será cloud',
      issueYear: '2026',
      issueMonth: '10',
      certUrl: url,
      certId: idCertificado(CERT),
    });
    const publicar = new URL(linkLinkedInPublicar(CERT, url));
    expect(publicar.origin + publicar.pathname).toBe('https://www.linkedin.com/feed/');
    expect(publicar.searchParams.get('shareActive')).toBe('true');
    expect(publicar.searchParams.get('text')).toBe(textoPublicacao(CERT, url));
  });

  it('link público aponta para a página estática do badge, com o código', () => {
    const link = new URL(linkPublico(CERT));
    expect(link.href.startsWith(`${SITE}badge/php/`)).toBe(true);
    expect(decodificarCertificado(link.searchParams.get('c'))).toMatchObject(CERT);
  });

  it('texto do post cita o badge, o emissor, o link e hashtags', () => {
    const texto = textoPublicacao(CERT, 'https://exemplo/x');
    expect(texto).toContain(`"${CERTIFICADOS.php.titulo}"`);
    expect(texto).toContain('Sertão será cloud');
    expect(texto).toContain('https://exemplo/x');
    expect(texto).toMatch(/#SertaoSeraCloud/);
  });

  it('os números do texto batem com o conteúdo da trilha', () => {
    for (const m of modulos) {
      const problemas = m.itens.filter((i) => i.tipo === 'problema').length;
      if (m.grupos) {
        expect(CERTIFICADOS[m.id].resumo).toContain(`${m.grupos.length} projetos`);
        expect(CERTIFICADOS[m.id].resumo).toContain(`${problemas} etapas`);
      } else {
        expect(CERTIFICADOS[m.id].resumo).toContain(`${problemas} problemas`);
      }
    }
  });
});
