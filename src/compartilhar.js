// Guarda o código no próprio link (depois do #), sem precisar de servidor.

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
  const json = JSON.stringify({ i: item, a: arquivos });
  return 's=' + paraBase64Url(new TextEncoder().encode(json));
}

/**
 * Lê o hash da URL. Aceita "#s=<código>" (código compartilhado) ou "#<id>"
 * (link direto para um exemplo ou exercício). Devolve null se não houver nada.
 */
export function decodificar(hash) {
  const valor = hash.replace(/^#/, '');
  if (!valor) return null;
  if (!valor.startsWith('s=')) return { item: decodeURIComponent(valor) };
  try {
    const { i, a } = JSON.parse(new TextDecoder().decode(deBase64Url(valor.slice(2))));
    const valido = a && typeof a === 'object' && Object.values(a).every((v) => typeof v === 'string');
    return valido ? { item: i, arquivos: a } : null;
  } catch {
    return null;
  }
}
