// @vitest-environment happy-dom
import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { PASSOS, PROBLEMA_DO_TUTORIAL } from '../src/ui/tutorial-passos.js';
import { renderInicio } from '../src/ui/inicio.js';
import { buscarItem } from '../src/conteudo/trilha.js';

beforeAll(() => {
  const html = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
  document.body.innerHTML = html
    .slice(html.indexOf('<body>') + 6, html.indexOf('</body>'))
    .replace(/<script[\s\S]*?<\/script>/g, '');
  renderInicio(document.getElementById('tela-inicio'));
});

describe('tutorial', () => {
  it.each(PASSOS.filter((p) => p.alvo).map((p) => [p.titulo, p.alvo]))('o alvo do passo "%s" existe (%s)', (_t, alvo) => {
    expect(document.querySelector(alvo)).not.toBeNull();
  });

  it('todo passo tem título e texto', () => {
    for (const p of PASSOS) {
      expect(p.titulo).toBeTruthy();
      expect(p.texto).toBeTruthy();
    }
  });

  it('o problema usado no tutorial existe', () => {
    expect(buscarItem(PROBLEMA_DO_TUTORIAL)?.tipo).toBe('problema');
  });
});
