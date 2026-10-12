// Tela do certificado: o documento (pronto para imprimir/salvar em PDF) e os
// botões para compartilhar no LinkedIn. Abre por link (#/certificado/<código>),
// então quem recebe o link vê o mesmo certificado.
import { CERTIFICADOS, EMISSOR, certificadoXml, decodificarCertificado, linkLinkedInPerfil, linkLinkedInPublicar, linkPublico, textoPublicacao } from '../certificados.js';
import { svgBadge } from '../badges.js';
import { esc } from './util.js';

const dataPorExtenso = (data) => new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });

export function renderCertificado(el, codigo, { definirStatus = () => {} } = {}) {
  const cert = decodificarCertificado(codigo);
  if (!cert) {
    el.innerHTML = `
      <div class="certificado-pagina">
        <div class="w3-panel aviso-certificado"><p>Este link de certificado não é válido.</p>
        <p><a href="#/trilha">← Voltar para a trilha</a></p></div>
      </div>`;
    return null;
  }

  const def = CERTIFICADOS[cert.modulo];
  const final = cert.modulo === 'final';
  const confere = cert.selo === 'confere';
  // Só um certificado com selo válido pode ser compartilhado: gerar o link de novo
  // a partir de dados alterados criaria um selo válido para eles.
  const url = confere ? linkPublico(cert) : '';
  const grupos = (hash) => (hash.match(/.{1,16}/g) ?? []).join(' ');
  const hashEmGrupos = grupos(cert.hash);
  const curto = (hash) => `${hash.slice(0, 8)}…${hash.slice(-4)}`;
  const dataCurta = (data) => new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
  // A cadeia, do primeiro certificado até este: cada bloco aponta para o hash do anterior.
  const blocos = confere ? [...cert.cadeia, { modulo: cert.modulo, data: cert.data, hash: cert.hash, anterior: cert.anterior }] : [];
  const avisoSelo = {
    'nao-confere': `<div class="aviso-selo erro" role="alert">⚠️ <b>O selo não confere.</b> Os dados deste link foram
      alterados depois da emissão: este certificado não é válido.</div>`,
    ausente: `<div class="aviso-selo" role="status">ℹ️ <b>Link de uma versão antiga, sem selo ou sem a cadeia de certificados.</b>
      Se o certificado é seu, abra-o de novo pela trilha para gerar um link novo.</div>`,
  }[cert.selo] ?? '';

  el.innerHTML = `
    <div class="certificado-pagina">
      <p class="voltar-trilha"><a href="#/trilha">← Voltar à trilha</a></p>
      ${avisoSelo}

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
            <div><dt>Selo</dt><dd class="selo-${cert.selo}">${confere ? '✅ confere' : cert.selo === 'ausente' ? 'ℹ️ sem selo' : '⚠️ não confere'}</dd></div>
          </dl>
          <details class="selo-detalhes">
            <summary>🔐 Selo de verificação (HMAC-SHA256)</summary>
            <p class="selo-hash"><code>${esc(hashEmGrupos)}</code></p>
            <p>O selo é calculado a partir da <b>data de obtenção</b>, do <b>emissor</b> (${esc(EMISSOR.responsavel)}),
              da <b>empresa</b> (${esc(EMISSOR.organizacao)}), do <b>aluno</b> e do módulo, com uma chave secreta da
              ${esc(EMISSOR.organizacao)}. Se qualquer um desses dados mudar no link, o selo deixa de conferir.</p>
            ${blocos.length > 1 ? `
              <p><b>🔗 Cadeia de certificados.</b> Como num blockchain, cada certificado leva no selo o hash do
                anterior. Para alterar este, seria preciso alterar todos os anteriores também.</p>
              <ol class="cadeia">
                ${blocos.map((b) => `
                  <li class="${b.modulo === cert.modulo ? 'atual' : ''}">
                    <b>${esc(CERTIFICADOS[b.modulo].titulo)}</b>
                    <span>${dataCurta(b.data)}</span>
                    <code title="${esc(b.hash)}">${esc(curto(b.hash))}</code>
                    <small>${b.anterior ? `anterior: <code>${esc(curto(b.anterior))}</code>` : 'primeiro da cadeia'}</small>
                  </li>`).join('')}
              </ol>` : ''}
          </details>
          <div class="acoes-certificado" ${confere ? '' : 'hidden'}>
            <a class="btn btn-linkedin" href="${esc(linkLinkedInPublicar(cert, url))}" target="_blank" rel="noopener">in Publicar no LinkedIn</a>
            <a class="btn btn-linkedin-contorno" href="${esc(linkLinkedInPerfil(cert, url))}" target="_blank" rel="noopener">＋ Adicionar ao perfil</a>
            <button type="button" class="btn btn-fantasma" id="btn-copiar-certificado">🔗 Copiar link</button>
            <button type="button" class="btn btn-fantasma" id="btn-copiar-texto">📝 Copiar texto do post</button>
            <button type="button" class="btn btn-fantasma" id="btn-imprimir">🖨️ Imprimir / PDF</button>
            <a class="btn btn-fantasma" href="#/validar/${esc(codigo)}">🔎 Validar</a>
            <button type="button" class="btn btn-fantasma" id="btn-xml" title="Arquivo com os dados para conferir o certificado em outras páginas (sem o segredo)">📄 Baixar XML</button>
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
              <span class="cert-hash" title="Selo de verificação (HMAC-SHA256)">Selo: ${esc(hashEmGrupos)}</span>
              ${cert.anterior ? `<span class="cert-hash" title="Hash do certificado anterior da cadeia">Anterior: ${esc(grupos(cert.anterior))}</span>` : ''}
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
  if (!confere) return cert;
  el.querySelector('#btn-xml').onclick = () => {
    const blob = new Blob([certificadoXml(cert, codigo)], { type: 'application/xml' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `certificado-${cert.id}.xml` });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    definirStatus('📄 XML do certificado baixado.');
  };
  el.querySelector('#btn-copiar-certificado').onclick = () => copiar(url, '🔗 Link do badge copiado!');
  el.querySelector('#btn-copiar-texto').onclick = () => copiar(textoPublicacao(cert, url), '📝 Texto do post copiado!');
  return cert;
}
