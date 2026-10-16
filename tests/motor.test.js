// MotorPHP: o worker do PHP só nasce na primeira necessidade (a landing e a trilha não baixam o PHP).
import { describe, it, expect } from 'vitest';
import { MotorPHP } from '../src/php/motor.js';

/** Worker falso: responde "pronto" e devolve a ação pedida. */
function workerFalso() {
  const w = {
    postMessage(m) { setTimeout(() => w.onmessage({ data: { tipo: 'resposta', id: m.id, acao: m.acao } })); },
    terminate() {},
  };
  setTimeout(() => w.onmessage({ data: { tipo: 'pronto' } }));
  return w;
}

const contador = () => {
  const criados = [];
  return { criados, criarWorker: () => { const w = workerFalso(); criados.push(w); return w; } };
};

describe('MotorPHP sob demanda', () => {
  it('não abre o worker antes de precisar', () => {
    const { criados, criarWorker } = contador();
    new MotorPHP({ criarWorker });
    expect(criados).toHaveLength(0);
  });

  it('garantir abre uma vez só, e executar espera o carregamento', async () => {
    const { criados, criarWorker } = contador();
    const motor = new MotorPHP({ criarWorker });
    const a = motor.garantir();
    const b = motor.garantir();
    const r = await motor.executar({ 'index.php': '<?php echo 1;' });
    await Promise.all([a, b]);
    expect(criados).toHaveLength(1);
    expect(r.acao).toBe('executar');
  });

  it('o estado carregando só é avisado ao garantir', async () => {
    const estados = [];
    const motor = new MotorPHP({ criarWorker: () => workerFalso(), aoMudarEstado: (s) => estados.push(s) });
    expect(estados).toEqual([]);
    await motor.garantir();
    expect(estados).toEqual(['carregando', 'pronto']);
  });
});
