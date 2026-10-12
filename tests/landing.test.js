// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import { renderLanding, numerosDaTrilha } from '../src/ui/landing.js';
import { modulos, problemas } from '../src/conteudo/trilha.js';

describe('landing page', () => {
  beforeEach(() => localStorage.clear());

  it('os números vêm do conteúdo da trilha', () => {
    const n = numerosDaTrilha();
    expect(n.exercicios).toBe(problemas.length);
    expect(n.modulos).toBe(modulos.length);
    expect(n.projetos).toBe(6);
    expect(n.certificados).toBe(modulos.length + 1);
  });

  it('mostra todos os módulos, os badges e leva para a trilha', () => {
    const el = document.createElement('main');
    renderLanding(el);
    expect(el.querySelectorAll('.modulo-card')).toHaveLength(modulos.length);
    expect(el.querySelectorAll('.vitrine-badges svg')).toHaveLength(modulos.length + 1);
    expect(el.querySelector('.hero-acoes a').getAttribute('href')).toBe('#/trilha');
    expect(el.querySelector('a[href="#/privacidade"]')).not.toBeNull();
  });

  it('quem já começou vê "Continuar"', () => {
    localStorage.setItem('php-playground:progresso', JSON.stringify({ [problemas[0].id]: 'resolvido' }));
    const el = document.createElement('main');
    renderLanding(el);
    expect(el.querySelector('.hero-acoes a').textContent).toContain('Continuar');
  });
});
