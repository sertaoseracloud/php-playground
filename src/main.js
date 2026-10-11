import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-600.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './estilo.css';

import { MotorPHP } from './php/motor.js';
import { lerRota } from './compartilhar.js';
import { iniciarAcessibilidade } from './ui/acessibilidade.js';
import { renderInicio, resumoProgresso } from './ui/inicio.js';
import { criarTelaItem } from './ui/item.js';
import { criarLayout } from './ui/layout.js';
import { iniciarTutorial } from './ui/tutorial.js';
import { $ } from './ui/util.js';

// Antes de tudo: tema e tamanho de texto escolhidos pelo aluno.
iniciarAcessibilidade();

const telaInicio = $('tela-inicio');
const telaItem = $('tela-item');

const definirStatus = (texto) => { $('status').textContent = texto; };

function atualizarProgressoTopo() {
  const { resolvidos, total } = resumoProgresso();
  $('progresso-topo').textContent = `✅ ${resolvidos}/${total}`;
}

// Declarado antes do motor: ele avisa "carregando" já no construtor.
let telaDoItem;

const motor = new MotorPHP({
  aoMudarEstado(situacao, erro) {
    if (situacao === 'carregando') definirStatus('Carregando o PHP… (só demora na primeira vez)');
    else if (situacao === 'pronto') definirStatus('PHP 8.4 pronto');
    else definirStatus(`Não foi possível carregar o PHP: ${erro}`);
    telaDoItem?.aoMudarEstadoPhp(situacao === 'pronto');
  },
});

const layout = criarLayout();
telaDoItem = criarTelaItem({ motor, layout, definirStatus, aoMudarProgresso: atualizarProgressoTopo });

function marcarMenu(nome) {
  document.querySelectorAll('[data-menu]').forEach((a) => {
    a.classList.toggle('ativo', a.dataset.menu === nome);
    if (a.dataset.menu === nome) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
}

function navegar() {
  const rota = lerRota(location.hash);
  if (rota.tela === 'item' && telaDoItem.abrir(rota.id, rota.arquivos)) {
    telaInicio.hidden = true;
    telaItem.hidden = false;
    layout.aplicar();
    marcarMenu(rota.id === 'livre' ? 'livre' : '');
    document.title = `${$('item-titulo').textContent} · PHP Playground`;
    return;
  }
  renderInicio(telaInicio);
  telaItem.hidden = true;
  telaInicio.hidden = false;
  marcarMenu('inicio');
  document.title = 'PHP Playground';
}

// Atalhos fora do editor (dentro dele, o próprio editor trata).
document.addEventListener('keydown', (e) => {
  if (telaItem.hidden || !(e.ctrlKey || e.metaKey) || e.key !== 'Enter' || e.defaultPrevented) return;
  if (document.querySelector('dialog[open]')) return;
  e.preventDefault();
  $(e.shiftKey ? 'btn-enviar' : 'btn-executar').click();
});

window.addEventListener('hashchange', navegar);
atualizarProgressoTopo();
navegar();

iniciarTutorial({ telaAtual: () => (telaItem.hidden ? 'inicio' : 'item') });
