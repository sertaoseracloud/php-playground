// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { PADRAO, normalizarPreferencias, aplicarPreferencias, TAMANHOS } from '../src/ui/preferencias.js';

describe('normalizarPreferencias', () => {
  it('sem nada salvo usa o padrão', () => {
    expect(normalizarPreferencias(null)).toEqual(PADRAO);
  });

  it('ignora valores inválidos e mantém os válidos', () => {
    expect(normalizarPreferencias({ tema: 'rosa-choque', tamanho: 999, fonteLegivel: true, extra: 1 })).toEqual({
      ...PADRAO,
      fonteLegivel: true,
    });
    expect(normalizarPreferencias({ tema: 'claro', tamanho: TAMANHOS[3] })).toEqual({ ...PADRAO, tema: 'claro', tamanho: TAMANHOS[3] });
  });
});

describe('aplicarPreferencias', () => {
  it('define tema, escala e classes no elemento raiz', () => {
    const raiz = document.createElement('html');
    aplicarPreferencias({ ...PADRAO, tema: 'alto-contraste', tamanho: 125, espacamento: true, sublinharLinks: true }, raiz);
    expect(raiz.dataset.tema).toBe('alto-contraste');
    expect(raiz.style.getPropertyValue('--escala')).toBe('1.25');
    expect(raiz.classList.contains('a11y-espacamento')).toBe(true);
    expect(raiz.classList.contains('a11y-links')).toBe(true);
    expect(raiz.classList.contains('a11y-fonte-legivel')).toBe(false);

    aplicarPreferencias(PADRAO, raiz);
    expect(raiz.classList.contains('a11y-espacamento')).toBe(false);
    expect(raiz.dataset.tema).toBe('dracula');
  });
});
