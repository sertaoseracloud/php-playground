// Tela do certificado: o documento (pronto para imprimir/salvar em PDF) e os
// botões para compartilhar no LinkedIn. Abre por link (#/certificado/<código>),
// então quem recebe o link vê o mesmo certificado.
import { CERTIFICADOS, EMISSOR, decodificarCertificado, linkLinkedInPerfil, linkLinkedInPublicar } from '../certificados.js';
import { esc } from './util.js';

const dataPorExtenso = (data) => new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export function renderCertificado(el, codigo, { definirStatus = () => {} } = {}) {
  const cert = decodificarCertificado(codigo);
  if (!cert) {
    el.innerHTML = `
      <div class="certificado-pagina">
        <div class="w3-panel aviso-certificado"><p>Este link de certificado não é válido.</p>
        <p><a href="#/">← Voltar para a trilha</a></p></div>
      </div>`;
    return null;
  }

  const def = CERTIFICADOS[cert.modulo];
  const final = cert.modulo === 'final';
  const url = `${location.origin}${location.pathname}#/certificado/${codigo}`;

  el.innerHTML = `
    <div class="certificado-pagina">
      <div class="acoes-certificado">
        <a class="btn btn-fantasma" href="#/">← Voltar à trilha</a>
        <button type="button" class="btn btn-roxo" id="btn-imprimir">🖨️ Imprimir / salvar PDF</button>
        <a class="btn btn-linkedin" href="${esc(linkLinkedInPerfil(cert, url))}" target="_blank" rel="noopener">in Adicionar ao perfil</a>
        <a class="btn btn-linkedin" href="${esc(linkLinkedInPublicar(url))}" target="_blank" rel="noopener">in Publicar no LinkedIn</a>
        <button type="button" class="btn btn-fantasma" id="btn-copiar-certificado">🔗 Copiar link</button>
      </div>

      <article class="certificado ${final ? 'certificado-final' : ''}" aria-label="Certificado de ${esc(cert.nome)}">
        <div class="moldura">
          <header class="cert-topo">
            <img class="cert-logo" src="${esc(EMISSOR.logo)}" alt="" width="64" height="64"
                 onerror="this.replaceWith(Object.assign(document.createElement('span'), {className: 'cert-logo cert-logo-texto', textContent: '☁️'}))">
            <div>
              <p class="cert-emissor">${esc(EMISSOR.organizacao)}</p>
              <p class="cert-curso">${esc(EMISSOR.curso)}</p>
            </div>
            <span class="cert-selo" aria-hidden="true">${final ? '🎓' : '🏆'}</span>
          </header>

          <p class="cert-tipo">${final ? 'Certificado de conclusão da trilha' : 'Certificado de conclusão de módulo'}</p>
          <p class="cert-certificamos">Certificamos que</p>
          <h1 class="cert-nome">${esc(cert.nome)}</h1>
          <p class="cert-texto">${esc(def.resumo)} em <b>${esc(def.titulo)}</b>,
            com exercícios corrigidos automaticamente.</p>

          <ul class="cert-conteudos" aria-label="Conteúdos">
            ${def.conteudos.map((c) => `<li>${esc(c)}</li>`).join('')}
          </ul>

          <footer class="cert-rodape">
            <div class="cert-assinatura">
              <span class="linha-assinatura" aria-hidden="true"></span>
              <b>${esc(EMISSOR.responsavel)}</b>
              <span>${esc(EMISSOR.cargo)}</span>
            </div>
            <div class="cert-data">
              <span>Concluído em</span>
              <b>${dataPorExtenso(cert.data)}</b>
              <span class="cert-codigo">Código: ${esc(cert.id)}</span>
            </div>
            <div class="cert-assinatura">
              <span class="linha-assinatura" aria-hidden="true"></span>
              <b>${esc(EMISSOR.organizacao)}</b>
              <span>Instituição emissora</span>
            </div>
          </footer>
        </div>
      </article>
      <p class="nota-certificado">Dica: em "Imprimir", escolha <b>Salvar como PDF</b> e o layout <b>paisagem</b>.</p>
    </div>`;

  el.querySelector('#btn-imprimir').onclick = () => window.print();
  el.querySelector('#btn-copiar-certificado').onclick = async () => {
    try {
      await navigator.clipboard.writeText(url);
      definirStatus('🔗 Link do certificado copiado!');
    } catch {
      prompt('Copie o link do certificado:', url);
    }
  };
  return cert;
}
