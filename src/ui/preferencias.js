// Preferências de acessibilidade: tema, tamanho do texto, fonte e espaçamento.
// Aplicadas como atributos/classes no <html>; o CSS faz o resto (estilo.css).

export const TEMAS = {
  dracula: 'Dracula (escuro)',
  'alto-contraste': 'Alto contraste',
  claro: 'Claro',
};

export const TAMANHOS = [87.5, 100, 112.5, 125, 150, 175];

export const OPCOES = {
  fonteLegivel: 'Fonte mais legível (Atkinson Hyperlegible)',
  espacamento: 'Mais espaço entre linhas e letras',
  sublinharLinks: 'Sublinhar links e destacar o foco',
  reduzirMovimento: 'Reduzir animações',
};

const CLASSES = {
  fonteLegivel: 'a11y-fonte-legivel',
  espacamento: 'a11y-espacamento',
  sublinharLinks: 'a11y-links',
  reduzirMovimento: 'a11y-sem-movimento',
};

export const PADRAO = {
  tema: 'dracula',
  tamanho: 100,
  fonteLegivel: false,
  espacamento: false,
  sublinharLinks: false,
  reduzirMovimento: false,
};

export function normalizarPreferencias(salvas) {
  const p = { ...PADRAO };
  if (!salvas || typeof salvas !== 'object') return p;
  if (salvas.tema in TEMAS) p.tema = salvas.tema;
  if (TAMANHOS.includes(salvas.tamanho)) p.tamanho = salvas.tamanho;
  for (const chave of Object.keys(OPCOES)) {
    if (typeof salvas[chave] === 'boolean') p[chave] = salvas[chave];
  }
  return p;
}

export function aplicarPreferencias(p, raiz = document.documentElement) {
  raiz.dataset.tema = p.tema;
  raiz.style.setProperty('--escala', String(p.tamanho / 100));
  for (const [chave, classe] of Object.entries(CLASSES)) raiz.classList.toggle(classe, Boolean(p[chave]));
}
