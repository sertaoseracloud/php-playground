// Tudo o que fica salvo no navegador do aluno: progresso, rascunhos e o banco
// do playground livre. Cada acesso é protegido: sem localStorage (aba anônima,
// bloqueio), o site continua funcionando, só não lembra.
const PREFIXO = 'php-playground:';

function ler(chave, padrao = null) {
  try {
    const valor = localStorage.getItem(PREFIXO + chave);
    return valor === null ? padrao : JSON.parse(valor);
  } catch {
    return padrao;
  }
}

function gravar(chave, valor) {
  try { localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
}

function remover(chave) {
  try { localStorage.removeItem(PREFIXO + chave); } catch { /* sem armazenamento */ }
}

// ---------- progresso: 'resolvido' | 'tentado' ----------
export const statusDe = (id) => ler('progresso', {})[id];

/** Data local no formato AAAA-MM-DD. */
export const hoje = () => new Date().toLocaleDateString('sv-SE');

export function marcar(id, status) {
  registrarAtividade();
  const progresso = ler('progresso', {});
  if (progresso[id] === 'resolvido') return; // nunca rebaixa um problema resolvido
  progresso[id] = status;
  gravar('progresso', progresso);
  if (status === 'resolvido') {
    const datas = ler('datas', {});
    datas[id] = hoje();
    gravar('datas', datas);
  }
}

/** Dia em que o item foi resolvido (vira a data do certificado). */
export const dataDe = (id) => ler('datas', {})[id] ?? (statusDe(id) === 'resolvido' ? hoje() : null);

// ---------- dias com atividade (sequência 🔥) ----------
function registrarAtividade() {
  const dias = new Set(ler('atividade', []));
  dias.add(hoje());
  gravar('atividade', [...dias].sort().slice(-400));
}
export const diasAtivos = () => ler('atividade', []);

// ---------- nome que aparece nos certificados ----------
export const lerNome = () => ler('nome', '');
export const gravarNome = (nome) => gravar('nome', nome.trim());

// ---------- rascunhos de código ----------
export const lerRascunho = (id) => ler(`rascunho:${id}`);
export const gravarRascunho = (id, arquivos) => gravar(`rascunho:${id}`, arquivos);
export const apagarRascunho = (id) => remover(`rascunho:${id}`);

// ---------- banco do playground livre (bytes do SQLite em base64) ----------
export function lerBancoLivre() {
  const base64 = ler('banco:livre');
  if (!base64) return null;
  try {
    return Uint8Array.from(atob(base64), (ch) => ch.charCodeAt(0));
  } catch {
    return null;
  }
}

export function gravarBancoLivre(bytes) {
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  gravar('banco:livre', btoa(binario));
}

export const apagarBancoLivre = () => remover('banco:livre');

// ---------- preferências (layout, acessibilidade, tutorial) ----------
export const lerPreferencia = (chave, padrao = null) => ler(`pref:${chave}`, padrao);
export const gravarPreferencia = (chave, valor) => gravar(`pref:${chave}`, valor);
