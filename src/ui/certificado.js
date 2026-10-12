// Tela do certificado: o documento (pronto para imprimir/salvar em PDF) e os
// botões para compartilhar no LinkedIn. Abre por link (#/certificado/<código>),
// então quem recebe o link vê o mesmo certificado.
import { CERTIFICADOS, EMISSOR, decodificarCertificado, linkLinkedInPerfil, linkLinkedInPublicar, linkPublico, textoPublicacao } from '../certificados.js';
import { svgBadge } from '../badges.js';
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
  const url = linkPublico(cert);

  el.innerHTML = `
    <div class="certificado-pagina">
      <p class="voltar-trilha"><a href="#/">← Voltar à trilha</a></p>

      <!-- Página do badge, no estilo da Credly -->
      <section class="badge-credly" aria-labelledby="badge-titulo">
        <div class="badge-imagem">${svgBadge(cert.modulo, { tamanho: 240 })}</div>
        <div class="badge-info">
          <p class="badge-rotulo">${final ? 'Certificado de conclusão' : 'Badge digital'} · emitido por <b>${esc(EMISSOR.organizacao)}</b></p>
          <h1 id="badge-titulo">${esc(def.titulo)}</h1>
          <p class="badge-dono">Conquistado por <b>${esc(cert.nome)}</b> em ${dataPorExtenso(cert.data)}</p>
          <p class="badge-desc">Quem tem este ${final ? 'certificado' : 'badge'} ${esc(def.resumo)} do curso
            <b>${esc(EMISSOR.curso)}</b>, com exercícios corrigidos automaticamente por testes funcionais.</p>
          <h2 class="badge-subtitulo">Habilidades</h2>
          <ul class="badge-habilidades">${def.conteudos.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>
          <dl class="badge-dados">
            <div><dt>Emissor</dt><dd>${esc(EMISSOR.organizacao)}</dd></div>
            <div><dt>Responsável</dt><dd>${esc(EMISSOR.responsavel)}</dd></div>
            <div><dt>Código</dt><dd class="cert-codigo-dd">${esc(cert.id)}</dd></div>
          </dl>
          <div class="acoes-certificado">
            <a class="btn btn-linkedin" href="${esc(linkLinkedInPublicar(cert, url))}" target="_blank" rel="noopener">in Publicar no LinkedIn</a>
            <a class="btn btn-linkedin-contorno" href="${esc(linkLinkedInPerfil(cert, url))}" target="_blank" rel="noopener">＋ Adicionar ao perfil</a>
            <button type="button" class="btn btn-fantasma" id="btn-copiar-certificado">🔗 Copiar link</button>
            <button type="button" class="btn btn-fantasma" id="btn-copiar-texto">📝 Copiar texto do post</button>
            <button type="button" class="btn btn-fantasma" id="btn-imprimir">🖨️ Imprimir / PDF</button>
          </div>
        </div>
      </section>

      <h2 class="titulo-documento">Certificado</h2>
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
          <p class="cert-nome">${esc(cert.nome)}</p>
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
  const copiar = async (texto, aviso) => {
    try {
      await navigator.clipboard.writeText(texto);
      definirStatus(aviso);
    } catch {
      prompt('Copie:', texto);
    }
  };
  el.querySelector('#btn-copiar-certificado').onclick = () => copiar(url, '🔗 Link do badge copiado!');
  el.querySelector('#btn-copiar-texto').onclick = () => copiar(textoPublicacao(cert, url), '📝 Texto do post copiado!');
  return cert;
}
