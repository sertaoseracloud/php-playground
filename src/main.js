import '@fontsource/fira-code/latin-400.css';
import '@fontsource/fira-code/latin-500.css';
import '@fontsource/fira-code/latin-600.css';
import '@fontsource/fira-code/latin-700.css';
import '@fontsource/atkinson-hyperlegible/latin-400.css';
import '@fontsource/atkinson-hyperlegible/latin-700.css';
import './estilo.css';
import './caminho.css';
import './landing.css';

import { MotorPHP } from './php/motor.js';
import { lerRota } from './compartilhar.js';
import { iniciarAcessibilidade } from './ui/acessibilidade.js';
import { iniciarRegua, iniciarPausa } from './ui/neuro.js';
import { renderPrivacidade, iniciarAvisoPrivacidade } from './ui/privacidade.js';
import { renderLanding } from './ui/landing.js';
import { renderValidador } from './ui/validador.js';
import { iniciarMenu } from './ui/menu.js';
import { renderInicio, resumoProgresso } from './ui/inicio.js';
import { criarTelaItem } from './ui/item.js';
import { renderCertificado } from './ui/certificado.js';
import { criarLayout } from './ui/layout.js';
import { iniciarTutorial } from './ui/tutorial.js';
import { $ } from './ui/util.js';
import { definirPagina, PRINCIPAL, NOME } from './seo.js';
import { buscarItem, modulos } from './conteudo/trilha.js';

// Antes de tudo: tema e tamanho de texto escolhidos pelo aluno.
const acessibilidade = iniciarAcessibilidade();
iniciarMenu();
iniciarRegua();
iniciarPausa({ ativo: () => acessibilidade.atuais().lembretePausa });

const telaInicio = $('tela-inicio');
const telaItem = $('tela-item');
const telaCertificado = $('tela-certificado');
const telaPrivacidade = $('tela-privacidade');
const telaLanding = $('tela-landing');
const telaValidador = $('tela-validador');

function mostrarTela(tela) {
  telaInicio.hidden = tela !== telaInicio;
  telaItem.hidden = tela !== telaItem;
  telaCertificado.hidden = tela !== telaCertificado;
  telaPrivacidade.hidden = tela !== telaPrivacidade;
  telaLanding.hidden = tela !== telaLanding;
  telaValidador.hidden = tela !== telaValidador;
}

const definirStatus = (texto) => { $('status').textContent = texto; };

function atualizarProgressoTopo() {
  const { resolvidos, total, licoesLidas, totalLicoes } = resumoProgresso();
  const topo = $('progresso-topo');
  topo.innerHTML = `✅ ${resolvidos}/${total}<span class="rotulo-progresso"> exercícios</span>`;
  topo.title = `${resolvidos} de ${total} exercícios resolvidos · ${licoesLidas} de ${totalLicoes} lições lidas`;
  topo.setAttribute('aria-label', topo.title);
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
  // A landing vem pré-renderizada no HTML; daqui em diante quem mostra/esconde as telas é o JS.
  document.documentElement.classList.remove('rota-interna');
  const rota = lerRota(location.hash);
  if (rota.tela === 'item' && telaDoItem.abrir(rota.id, rota.arquivos)) {
    mostrarTela(telaItem);
    layout.aplicar();
    marcarMenu(rota.id === 'livre' ? 'livre' : '');
    const item = buscarItem(rota.id);
    const modulo = modulos.find((m) => m.id === item?.modulo);
    definirPagina({
      titulo: `${$('item-titulo').textContent} · ${NOME}`,
      descricao: rota.id === 'livre'
        ? 'Playground livre de PHP com banco SQLite: escreva e rode PHP, HTML e W3.CSS direto no navegador.'
        : `${item?.tipo === 'licao' ? 'Lição' : 'Exercício'} de ${modulo?.titulo ?? 'PHP'}: ${item?.titulo}. Escreva o código, execute e veja os testes na hora.`,
    });
    return;
  }
  if (rota.tela === 'landing') {
    renderLanding(telaLanding);
    mostrarTela(telaLanding);
    marcarMenu('');
    definirPagina(PRINCIPAL);
    telaLanding.scrollTop = 0;
    return;
  }
  if (rota.tela === 'validar') {
    renderValidador(telaValidador, rota.codigo);
    mostrarTela(telaValidador);
    marcarMenu('validar');
    definirPagina({
      titulo: `Validar certificado · ${NOME}`,
      descricao: 'Confira se um certificado ou badge do PHP Playground, emitido pela Sertão será cloud, é autêntico.',
    });
    telaValidador.scrollTop = 0;
    return;
  }
  if (rota.tela === 'privacidade') {
    renderPrivacidade(telaPrivacidade, { definirStatus });
    mostrarTela(telaPrivacidade);
    marcarMenu('privacidade');
    definirPagina({ titulo: `Privacidade e cookies · ${NOME}`, descricao: 'Sem cookies e sem rastreamento: como o PHP Playground trata seus dados e atende à LGPD.' });
    telaPrivacidade.scrollTop = 0;
    return;
  }
  if (rota.tela === 'certificado') {
    const cert = renderCertificado(telaCertificado, rota.codigo, { definirStatus });
    mostrarTela(telaCertificado);
    marcarMenu('');
    definirPagina({ titulo: cert ? `Certificado de ${cert.nome} · Sertão será cloud` : `Certificado · ${NOME}` });
    telaCertificado.scrollTop = 0;
    return;
  }
  mostrarTela(telaInicio);
  renderInicio(telaInicio);
  marcarMenu('inicio');
  definirPagina({ titulo: `Trilha · ${NOME}`, descricao: 'A trilha do HTML ao banco de dados: módulos que desbloqueiam aos 70%, XP, níveis e certificados.' });
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

iniciarAvisoPrivacidade();
iniciarTutorial({ telaAtual: () => (!telaItem.hidden ? 'item' : !telaInicio.hidden ? 'inicio' : 'outra') });
