// A trilha completa, na ordem das aulas: HTML → W3.CSS → PHP → PHP + PDO,
// mais o módulo extra de Projetos.
// Cada módulo tem `itens`: lições (tipo 'licao') e problemas (tipo 'problema').
import { moduloHtml } from './html.js';
import { moduloW3 } from './w3css.js';
import { moduloPhp } from './php.js';
import { moduloPdo } from './pdo.js';
import { moduloProjetos } from './projetos/index.js';
import { BANCO_ESCOLA } from './bancos.js';
import { documento, php } from './util.js';

export const modulos = [moduloHtml, moduloW3, moduloPhp, moduloPdo, moduloProjetos];

export const DIFICULDADES = {
  facil: 'Fácil',
  medio: 'Médio',
  dificil: 'Difícil',
};

/** Playground livre: código e banco ficam salvos no navegador. */
export const LIVRE = {
  id: 'livre',
  tipo: 'livre',
  titulo: 'Playground livre',
  banco: BANCO_ESCOLA,
  resumo: `
    <p>Escreva o que quiser. Use o <b>+</b> para criar arquivos e incluí-los com <code>include</code>.</p>
    <p>O banco <code>sqlite:/banco/escola.sqlite</code> fica <b>salvo no seu navegador</b> entre execuções.
    Use <b>Resetar banco</b> para voltar aos dados originais.</p>`,
  arquivos: {
    'index.php': documento(`  <h1 class="w3-text-indigo">Playground livre</h1>

  <ul class="w3-ul w3-border">
  <?php foreach ($pdo->query('SELECT nome FROM cursos') as $curso): ?>
    <li><?= $curso['nome'] ?></li>
  <?php endforeach; ?>
  </ul>`, {
      w3: true,
      classeBody: 'w3-container',
      titulo: 'Playground',
      topo: php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');
?>
`,
    }),
  },
};

export const itens = modulos.flatMap((m) => m.itens.map((item) => ({ ...item, modulo: m.id })));
export const problemas = itens.filter((i) => i.tipo === 'problema');

const porId = new Map([...itens, LIVRE].map((i) => [i.id, i]));
export const buscarItem = (id) => porId.get(id);

/** Item anterior e próximo na trilha (para os botões ‹ ›). */
export function vizinhos(id) {
  const i = itens.findIndex((item) => item.id === id);
  return { anterior: itens[i - 1], proximo: itens[i + 1] };
}
