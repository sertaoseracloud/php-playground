// Rotas do site (no hash da URL) e links de compartilhamento.
//   #/            lista de problemas
//   #/p/<id>      lição ou problema
//   #/livre       playground livre
//   #/s/<código>  código compartilhado (arquivos guardados no próprio link)

function paraBase64Url(bytes) {
  let binario = '';
  bytes.forEach((b) => { binario += String.fromCharCode(b); });
  return btoa(binario).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function deBase64Url(texto) {
  const base64 = texto.replace(/-/g, '+').replace(/_/g, '/');
  return Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
}

export function codificar({ item, arquivos }) {
  return paraBase64Url(new TextEncoder().encode(JSON.stringify({ i: item, a: arquivos })));
}

export function decodificar(codigo) {
  try {
    const { i, a } = JSON.parse(new TextDecoder().decode(deBase64Url(codigo)));
    const valido = typeof i === 'string' && a && typeof a === 'object' && Object.values(a).every((v) => typeof v === 'string');
    return valido ? { item: i, arquivos: a } : null;
  } catch {
    return null;
  }
}

export const linkItem = (id) => (id === 'livre' ? '#/livre' : `#/p/${encodeURIComponent(id)}`);
export const linkCompartilhado = (estado) => `#/s/${codificar(estado)}`;

export function lerRota(hash) {
  const caminho = hash.replace(/^#\/?/, '');
  if (caminho === 'livre') return { tela: 'item', id: 'livre' };
  if (caminho.startsWith('p/')) return { tela: 'item', id: decodeURIComponent(caminho.slice(2)) };
  if (caminho.startsWith('s/')) {
    const dados = decodificar(caminho.slice(2));
    if (dados) return { tela: 'item', id: dados.item, arquivos: dados.arquivos };
  }
  return { tela: 'inicio' };
}
