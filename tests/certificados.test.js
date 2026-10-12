import { describe, it, expect } from 'vitest';
import {
  CERTIFICADOS, EMISSOR, codificarCertificado, decodificarCertificado, idCertificado,
  linkLinkedInPerfil, linkLinkedInPublicar, linkPublico, textoPublicacao, SITE,
} from '../src/certificados.js';
import { modulos } from '../src/conteudo/trilha.js';
import { lerRota } from '../src/compartilhar.js';

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
    expect(decodificarCertificado(codigo)).toEqual({ ...CERT, id: idCertificado(CERT) });
    expect(lerRota(`#/certificado/${codigo}`)).toEqual({ tela: 'certificado', codigo });
  });

  it('id estável no formato SSC-AAAA-XXXXXX', () => {
    expect(idCertificado(CERT)).toMatch(/^SSC-2026-[0-9A-Z]{6}$/);
    expect(idCertificado(CERT)).toBe(idCertificado({ ...CERT }));
    expect(idCertificado(CERT)).not.toBe(idCertificado({ ...CERT, modulo: 'html' }));
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
