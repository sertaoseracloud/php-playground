// Cópia da W3.CSS 5.01 (w3schools.com/w3css, de uso livre) em .txt: o ?raw lê igual no Vite e no vitest.
import W3CSS from './vendor/w3css-5.01.txt?raw';
// A página do aluno roda num iframe isolado (sandbox). Este script é anexado ao
// HTML gerado: em vez de o iframe navegar, ele avisa o playground, que executa
// o PHP de novo com a nova URL ou com o corpo do POST.
export const SCRIPT_PONTE = `<script>(function () {
  function avisar(m) { m.__phpPlayground = true; parent.postMessage(m, '*'); }
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    var f = e.target, campos = [];
    new FormData(f, e.submitter).forEach(function (v, k) { if (typeof v === 'string') campos.push([k, v]); });
    avisar({ tipo: 'form', metodo: (f.getAttribute('method') || 'GET').toUpperCase(), acao: f.getAttribute('action') || '', campos: campos });
  }, true);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href');
    if (/^(#|[a-z][a-z0-9+.-]*:)/i.test(href)) {
      if (href.charAt(0) !== '#') { e.preventDefault(); window.open(a.href, '_blank'); }
      return;
    }
    e.preventDefault();
    avisar({ tipo: 'link', metodo: 'GET', acao: href, campos: [] });
  }, true);
})();</script>`;

// A W3.CSS que as páginas pedem ao w3schools bloqueia a pintura até chegar, e o iframe
// isolado nem sempre aproveita o cache: quando o site deles demora, o preview fica em
// branco. O preview usa esta cópia (W3.CSS 5.01, de uso livre) embutida na página; a aba
// "HTML gerado" continua mostrando o <link> que o aluno escreveu.
const LINK_W3CSS = /<link\b[^>]*\bhref\s*=\s*["']?(?:https?:)?\/\/www\.w3schools\.com\/w3css\/(?:\d+\/)?w3\.css["']?[^>]*>/gi;

export function paraOPreview(html) {
  return html.replace(LINK_W3CSS, () => `<style data-w3css>${W3CSS}</style>`);
}

const ORIGEM = 'http://localhost';

/**
 * Normaliza o que o aluno digita na barra de endereço: "?n=4", "index.php?n=4" ou "/index.php".
 * `principal` é o arquivo aberto quando a URL é "/" (index.php ou index.html).
 */
export function normalizarUrl(texto, principal = 'index.php') {
  const destino = new URL(texto.trim() || `/${principal}`, `${ORIGEM}/${principal}`);
  if (destino.pathname === '/') destino.pathname = `/${principal}`;
  return destino.pathname + destino.search;
}

/** Converte a mensagem vinda do iframe numa requisição para o motor PHP. */
export function montarRequisicao(urlAtual, { tipo, metodo, acao, campos }) {
  const base = new URL(urlAtual, ORIGEM);
  const destino = new URL(acao || base.pathname, base);
  if (destino.pathname === '/') destino.pathname = '/index.php';
  const params = new URLSearchParams(campos);

  if (tipo === 'form' && metodo === 'POST') {
    return { url: destino.pathname + destino.search, metodo: 'POST', corpo: params.toString() };
  }
  if (tipo === 'form') destino.search = params.toString();
  return { url: destino.pathname + destino.search, metodo: 'GET' };
}
