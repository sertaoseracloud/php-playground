import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-600.css';
import '@fontsource/fira-code/latin-700.css';
import './estilo.css';

import { MotorPHP } from './php/motor.js';
import { lerRota } from './compartilhar.js';
import { renderInicio, resumoProgresso } from './ui/inicio.js';
import { criarTelaItem } from './ui/item.js';
import { $ } from './ui/util.js';

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

telaDoItem = criarTelaItem({ motor, definirStatus, aoMudarProgresso: atualizarProgressoTopo });

function marcarMenu(nome) {
  document.querySelectorAll('[data-menu]').forEach((a) => a.classList.toggle('ativo', a.dataset.menu === nome));
}

function navegar() {
  const rota = lerRota(location.hash);
  if (rota.tela === 'item' && telaDoItem.abrir(rota.id, rota.arquivos)) {
    telaInicio.hidden = true;
    telaItem.hidden = false;
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

window.addEventListener('hashchange', navegar);
atualizarProgressoTopo();
navegar();
