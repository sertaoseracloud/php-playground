import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-600.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './estilo.css';
import './caminho.css';

import { MotorPHP } from './php/motor.js';
import { lerRota } from './compartilhar.js';
import { iniciarAcessibilidade } from './ui/acessibilidade.js';
import { iniciarRegua, iniciarPausa } from './ui/neuro.js';
import { renderInicio, resumoProgresso } from './ui/inicio.js';
import { criarTelaItem } from './ui/item.js';
import { renderCertificado } from './ui/certificado.js';
import { criarLayout } from './ui/layout.js';
import { iniciarTutorial } from './ui/tutorial.js';
import { $ } from './ui/util.js';

// Antes de tudo: tema e tamanho de texto escolhidos pelo aluno.
const acessibilidade = iniciarAcessibilidade();
iniciarRegua();
iniciarPausa({ ativo: () => acessibilidade.atuais().lembretePausa });

const telaInicio = $('tela-inicio');
const telaItem = $('tela-item');
const telaCertificado = $('tela-certificado');

function mostrarTela(tela) {
  telaInicio.hidden = tela !== telaInicio;
  telaItem.hidden = tela !== telaItem;
  telaCertificado.hidden = tela !== telaCertificado;
}

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
    mostrarTela(telaItem);
    layout.aplicar();
    marcarMenu(rota.id === 'livre' ? 'livre' : '');
    document.title = `${$('item-titulo').textContent} · PHP Playground`;
    return;
  }
  if (rota.tela === 'certificado') {
    const cert = renderCertificado(telaCertificado, rota.codigo, { definirStatus });
    mostrarTela(telaCertificado);
    marcarMenu('');
    document.title = cert ? `Certificado de ${cert.nome} · Sertão será cloud` : 'Certificado · PHP Playground';
    telaCertificado.scrollTop = 0;
    return;
  }
  mostrarTela(telaInicio);
  renderInicio(telaInicio);
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
// Opções como modo foco e lista de tarefas mudam o conteúdo: redesenha a tela aberta.
window.addEventListener('preferencias', () => {
  if (!telaInicio.hidden) renderInicio(telaInicio);
  if (!telaItem.hidden) telaDoItem.redesenharDescricao();
});
atualizarProgressoTopo();
navegar();

iniciarTutorial({ telaAtual: () => (telaItem.hidden ? 'inicio' : 'item') });
