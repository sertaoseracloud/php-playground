// Painel "♿ Acessibilidade": tema, tamanho do texto, fonte legível, espaçamento,
// links/foco e animações. As mudanças valem na hora e ficam salvas.
import { TEMAS, TAMANHOS, OPCOES, PADRAO, normalizarPreferencias, aplicarPreferencias } from './preferencias.js';
import { lerPreferencia, gravarPreferencia } from '../progresso.js';
import { $ } from './util.js';

export function iniciarAcessibilidade() {
  let prefs = normalizarPreferencias(lerPreferencia('acessibilidade'));
  // Sem escolha salva, respeita "reduzir movimento" do sistema operacional.
  if (!lerPreferencia('acessibilidade') && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    prefs.reduzirMovimento = true;
  }
  aplicarPreferencias(prefs);

  const dialogo = $('dialogo-a11y');
  const temas = $('a11y-temas');
  const opcoes = $('a11y-opcoes');
  const tamanho = $('a11y-tamanho');

  temas.innerHTML = Object.entries(TEMAS).map(([valor, rotulo]) => `
    <label class="opcao-tema" data-amostra="${valor}">
      <input type="radio" name="tema" value="${valor}">
      <span class="amostra" aria-hidden="true"></span> ${rotulo}
    </label>`).join('');
  opcoes.innerHTML = Object.entries(OPCOES).map(([chave, rotulo]) => `
    <label class="opcao-check"><input type="checkbox" name="${chave}"> ${rotulo}</label>`).join('');

  function sincronizar() {
    temas.querySelectorAll('input').forEach((i) => { i.checked = i.value === prefs.tema; });
    opcoes.querySelectorAll('input').forEach((i) => { i.checked = prefs[i.name]; });
    tamanho.value = `${prefs.tamanho}%`;
    tamanho.textContent = `${prefs.tamanho}%`;
    $('a11y-menor').disabled = prefs.tamanho === TAMANHOS[0];
    $('a11y-maior').disabled = prefs.tamanho === TAMANHOS.at(-1);
  }

  function mudar(novas) {
    prefs = { ...prefs, ...novas };
    aplicarPreferencias(prefs);
    gravarPreferencia('acessibilidade', prefs);
    sincronizar();
  }

  temas.addEventListener('change', (e) => mudar({ tema: e.target.value }));
  opcoes.addEventListener('change', (e) => mudar({ [e.target.name]: e.target.checked }));
  const passo = (delta) => {
    const i = TAMANHOS.indexOf(prefs.tamanho) + delta;
    if (TAMANHOS[i]) mudar({ tamanho: TAMANHOS[i] });
  };
  $('a11y-menor').onclick = () => passo(-1);
  $('a11y-maior').onclick = () => passo(1);
  $('a11y-padrao').onclick = () => mudar({ ...PADRAO });

  $('btn-acessibilidade').onclick = () => {
    sincronizar();
    dialogo.showModal();
  };
  // Clicar fora da janela fecha.
  dialogo.addEventListener('click', (e) => {
    if (e.target === dialogo) dialogo.close();
  });

  sincronizar();
}

/** Botão "🔊 Ouvir": lê o texto do painel de descrição com a voz do navegador. */
export function iniciarLeitura(botao, obterTexto) {
  if (!('speechSynthesis' in window)) {
    botao.hidden = true;
    return { parar() {} };
  }
  const parar = () => {
    speechSynthesis.cancel();
    botao.setAttribute('aria-pressed', 'false');
    botao.textContent = '🔊 Ouvir';
  };
  botao.onclick = () => {
    if (speechSynthesis.speaking) {
      parar();
      return;
    }
    const fala = new SpeechSynthesisUtterance(obterTexto());
    fala.lang = 'pt-BR';
    const voz = speechSynthesis.getVoices().find((v) => v.lang?.toLowerCase().startsWith('pt'));
    if (voz) fala.voice = voz;
    fala.onend = parar;
    fala.onerror = parar;
    speechSynthesis.speak(fala);
    botao.setAttribute('aria-pressed', 'true');
    botao.textContent = '⏹ Parar';
  };
  return { parar };
}
