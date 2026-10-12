// Validador de certificados (#/validar e #/validar/<código>).
//   1. Colar o link: certificado, badge do LinkedIn ou só o código. Recalcula a cadeia inteira.
//   2. Certificado impresso/PDF: nome, certificado, data, selo e hash anterior digitados.
// A conferência acontece no navegador de quem valida; nada é enviado a servidor.
import {
  CERTIFICADOS, EMISSOR, ORDEM, anteriores, decodificarCertificado, extrairCodigo, validarImpresso, linkCertificado,
} from '../certificados.js';
import { esc, $ } from './util.js';

const dataPorExtenso = (data) => new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
const dataCurta = (data) => new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
const curto = (hash) => `${hash.slice(0, 8)}…${hash.slice(-4)}`;

const SITUACAO = {
  confere: { classe: 'valido', titulo: '✅ Certificado válido', texto: 'O selo confere e a cadeia de certificados está completa e íntegra.' },
  'nao-confere': { classe: 'invalido', titulo: '⚠️ Certificado inválido', texto: 'O selo não confere: os dados do link foram alterados depois da emissão, ou a cadeia está incompleta.' },
  ausente: { classe: 'antigo', titulo: 'ℹ️ Link de versão antiga', texto: 'Este link é de antes do selo ou da cadeia de certificados e não pode ser verificado. Peça ao aluno um link novo, gerado pela trilha.' },
};

/** Resultado da validação por link, em HTML. */
export function resultadoDoLink(texto) {
  const codigo = extrairCodigo(texto);
  if (!codigo) {
    return `<div class="resultado-validacao invalido" role="status"><h2>Não encontrei um certificado aqui</h2>
      <p>Cole o link do certificado (…#/certificado/…), o link do badge do LinkedIn (…/badge/…?c=…) ou o código.</p></div>`;
  }
  const cert = decodificarCertificado(codigo);
  if (!cert) {
    return `<div class="resultado-validacao invalido" role="status"><h2>⚠️ Código ilegível</h2>
      <p>O link está incompleto ou foi alterado. Confira se copiou o link inteiro.</p></div>`;
  }
  const s = SITUACAO[cert.selo];
  const def = CERTIFICADOS[cert.modulo];
  const blocos = cert.selo === 'confere'
    ? [...cert.cadeia, { modulo: cert.modulo, data: cert.data, hash: cert.hash, anterior: cert.anterior }] : [];
  return `
    <div class="resultado-validacao ${s.classe}" role="status">
      <h2>${s.titulo}</h2>
      <p>${s.texto}</p>
      <dl class="dados-validacao">
        <div><dt>Aluno</dt><dd>${esc(cert.nome)}</dd></div>
        <div><dt>Certificado</dt><dd>${esc(def.titulo)}</dd></div>
        <div><dt>Concluído em</dt><dd>${dataPorExtenso(cert.data)}</dd></div>
        <div><dt>Emissor</dt><dd>${esc(EMISSOR.organizacao)} · ${esc(EMISSOR.responsavel)}</dd></div>
        ${cert.selo !== 'ausente' ? `<div><dt>Código</dt><dd><code>${esc(cert.id)}</code></dd></div>
        <div class="largo"><dt>Selo</dt><dd><code class="hash-longo">${esc(cert.hash)}</code></dd></div>` : ''}
      </dl>
      ${blocos.length > 1 ? `
        <h3>🔗 Cadeia de certificados</h3>
        <ol class="cadeia">
          ${blocos.map((b) => `
            <li class="${b.modulo === cert.modulo ? 'atual' : ''}">
              <b>${esc(CERTIFICADOS[b.modulo].titulo)}</b>
              <span>${dataCurta(b.data)}</span>
              <code title="${esc(b.hash)}">${esc(curto(b.hash))}</code>
              <small>${b.anterior ? `anterior: <code>${esc(curto(b.anterior))}</code>` : 'primeiro da cadeia'}</small>
            </li>`).join('')}
        </ol>` : ''}
      ${cert.selo === 'confere' ? `<p><a class="btn btn-roxo btn-pequeno" href="${linkCertificado(cert)}">Abrir o certificado</a></p>` : ''}
    </div>`;
}

/** Resultado da validação de um certificado impresso, em HTML. */
export function resultadoDoImpresso(dados) {
  const { valido, motivo } = validarImpresso(dados);
  return `
    <div class="resultado-validacao ${valido ? 'valido' : 'invalido'}" role="status">
      <h2>${valido ? '✅ Selo confere' : '⚠️ Não confere'}</h2>
      <p>${esc(motivo)}</p>
      ${valido && anteriores(dados.modulo).length ? `<p class="nota-validacao">Este é o ${ORDEM.indexOf(dados.modulo) + 1}º certificado da
        cadeia. Para conferir também os anteriores, peça o link do certificado e use a opção "Colar o link".</p>` : ''}
    </div>`;
}

export function renderValidador(el, codigoInicial = '') {
  el.innerHTML = `
    <article class="pagina-texto validador">
      <p class="voltar-trilha"><a href="#/">← Página inicial</a></p>
      <h1>🔎 Validar certificado</h1>
      <p>Confira se um certificado ou badge da <b>${esc(EMISSOR.organizacao)}</b> é autêntico. Cada certificado tem um
        <b>selo</b> (HMAC-SHA256) calculado com a data, o emissor, a empresa, o aluno e o módulo, e, a partir do
        segundo, com o hash do certificado anterior (uma cadeia, como num blockchain).</p>

      <section class="cartao-validacao" aria-labelledby="val-link">
        <h2 id="val-link">1. Colar o link</h2>
        <form id="form-link" class="form-validacao">
          <label for="campo-link">Link do certificado, link do badge do LinkedIn ou código</label>
          <textarea id="campo-link" rows="3" spellcheck="false" placeholder="https://sertaoseracloud.github.io/php-playground/#/certificado/…"></textarea>
          <button class="btn btn-verde">🔎 Validar</button>
        </form>
        <div id="saida-link" aria-live="polite"></div>
      </section>

      <section class="cartao-validacao" aria-labelledby="val-impresso">
        <h2 id="val-impresso">2. Certificado impresso ou em PDF</h2>
        <p class="a11y-ajuda">Digite os dados exatamente como aparecem no certificado (inclusive acentos). O selo e o
          "Anterior" ficam no rodapé, embaixo da data.</p>
        <form id="form-impresso" class="form-validacao grade-validacao">
          <label>Nome do aluno <input name="nome" autocomplete="off" required></label>
          <label>Certificado
            <select name="modulo" required>
              ${ORDEM.map((id) => `<option value="${id}">${esc(CERTIFICADOS[id].titulo)}</option>`).join('')}
            </select>
          </label>
          <label>Concluído em <input name="data" type="date" required></label>
          <label class="largo">Selo (64 caracteres) <input name="selo" spellcheck="false" autocomplete="off" required></label>
          <label class="largo" id="rotulo-anterior">Anterior (64 caracteres) <input name="anterior" spellcheck="false" autocomplete="off"></label>
          <button class="btn btn-verde">🔎 Validar</button>
        </form>
        <div id="saida-impresso" aria-live="polite"></div>
      </section>

      <p class="nota-validacao">A conferência acontece no seu navegador, sem enviar nada a servidor. Ela detecta
        certificados alterados; como o site não tem servidor, ela não substitui um registro oficial de emissão.</p>
    </article>`;

  const campoLink = $('campo-link');
  const saidaLink = $('saida-link');
  $('form-link').onsubmit = (e) => {
    e.preventDefault();
    saidaLink.innerHTML = resultadoDoLink(campoLink.value);
  };

  const form = $('form-impresso');
  const rotuloAnterior = $('rotulo-anterior');
  const atualizarAnterior = () => {
    // O primeiro da cadeia não tem "Anterior".
    rotuloAnterior.hidden = anteriores(form.modulo.value).length === 0;
  };
  form.modulo.onchange = atualizarAnterior;
  atualizarAnterior();
  form.onsubmit = (e) => {
    e.preventDefault();
    const dados = Object.fromEntries(new FormData(form));
    $('saida-impresso').innerHTML = resultadoDoImpresso(dados);
  };

  if (codigoInicial) {
    campoLink.value = codigoInicial;
    saidaLink.innerHTML = resultadoDoLink(codigoInicial);
  }
}
