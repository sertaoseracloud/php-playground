// Menu ☰ do cabeçalho no celular: abre um painel com a navegação e as ferramentas.
// Fecha ao escolher uma opção, ao tocar fora, com Esc e ao mudar de página.
import { $ } from './util.js';

export function iniciarMenu() {
  const botao = $('btn-menu');
  const painel = $('menu-topo');

  const abrir = (aberto) => {
    painel.classList.toggle('aberto', aberto);
    botao.setAttribute('aria-expanded', String(aberto));
    botao.setAttribute('aria-label', aberto ? 'Fechar menu' : 'Abrir menu');
    botao.querySelector('span').textContent = aberto ? '✕' : '☰';
    if (aberto) painel.querySelector('a, button')?.focus();
  };
  const estaAberto = () => painel.classList.contains('aberto');

  botao.addEventListener('click', () => abrir(!estaAberto()));
  painel.addEventListener('click', (e) => {
    if (e.target.closest('a, button')) abrir(false);
  });
  document.addEventListener('click', (e) => {
    if (estaAberto() && !painel.contains(e.target) && !botao.contains(e.target)) abrir(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && estaAberto()) {
      abrir(false);
      botao.focus();
    }
  });
  window.addEventListener('hashchange', () => abrir(false));
  // Voltando para a largura de desktop, o painel não pode ficar "preso" aberto.
  window.matchMedia?.('(min-width: 761px)').addEventListener?.('change', (e) => e.matches && abrir(false));
}
