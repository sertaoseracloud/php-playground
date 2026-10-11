// @vitest-environment happy-dom
import { describe, it, expect } from 'vitest';
import { corrigir } from '../src/corrigir.js';

describe('corrigir com passos', () => {
  it('roda os passos em sequência: o 1º abre sessão e banco novos, os outros continuam', async () => {
    const chamadas = [];
    const executar = async (_arquivos, req, banco, opcoes) => {
      chamadas.push({ url: req.url, metodo: req.metodo, banco: banco?.seed, ...opcoes });
      return { html: `<p>${req.url}</p>`, erros: '' };
    };
    const problema = {
      banco: 'SQL',
      testes: [{
        descricao: 'login e publicar',
        passos: [
          { url: '/login.php', metodo: 'POST', corpo: 'x=1' },
          { url: '/novo.php', metodo: 'POST', corpo: 'y=2', regras: [{ contem: '/novo.php' }] },
          { url: '/index.php', regras: [{ contem: '/index.php' }, { naoContem: 'erro' }] },
        ],
      }],
    };
    const r = await corrigir(problema, { 'index.php': '' }, executar);
    expect(chamadas).toEqual([
      { url: '/login.php', metodo: 'POST', banco: 'SQL', novaSessao: true, manterBanco: false, contexto: 'testes' },
      { url: '/novo.php', metodo: 'POST', banco: 'SQL', novaSessao: false, manterBanco: true, contexto: 'testes' },
      { url: '/index.php', metodo: undefined, banco: 'SQL', novaSessao: false, manterBanco: true, contexto: 'testes' },
    ]);
    expect(r.aprovado).toBe(true);
    expect(r.relatorio[0].resultados).toHaveLength(3);
  });

  it('um passo que falha reprova o caso', async () => {
    const executar = async () => ({ html: '<p>nada</p>', erros: '' });
    const r = await corrigir(
      { testes: [{ passos: [{ url: '/a' }, { url: '/b', regras: [{ contem: 'feed' }] }] }] },
      { 'index.php': '' },
      executar,
    );
    expect(r.aprovado).toBe(false);
  });
});
