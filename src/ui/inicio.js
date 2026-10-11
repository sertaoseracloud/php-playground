// Tela inicial: a trilha com os módulos, o progresso e a lista de problemas.
import { modulos, problemas, DIFICULDADES } from '../conteudo/trilha.js';
import { linkItem } from '../compartilhar.js';
import { statusDe } from '../progresso.js';
import { esc } from './util.js';

const ICONES = { resolvido: '✅', tentado: '◐' };

function iconeStatus(item) {
  const status = statusDe(item.id);
  if (item.tipo === 'licao') return status ? '✔️' : '📖';
  return ICONES[status] ?? '○';
}

export function resumoProgresso() {
  const resolvidos = problemas.filter((p) => statusDe(p.id) === 'resolvido');
  return { resolvidos: resolvidos.length, total: problemas.length, lista: resolvidos };
}

function cartaoNumero(valor, rotulo, cor) {
  return `<div class="cartao-numero"><div class="valor" style="color:${cor}">${valor}</div><div class="rotulo">${rotulo}</div></div>`;
}

export function renderInicio(el) {
  const { resolvidos, total, lista } = resumoProgresso();
  const porDificuldade = (d) => {
    const todos = problemas.filter((p) => p.dificuldade === d).length;
    const feitos = lista.filter((p) => p.dificuldade === d).length;
    return `${feitos}/${todos}`;
  };

  const blocos = modulos.map((m, i) => {
    const doModulo = m.itens.filter((x) => x.tipo === 'problema');
    const feitos = doModulo.filter((p) => statusDe(p.id) === 'resolvido').length;
    const pct = Math.round((feitos / doModulo.length) * 100);
    const linha = (item) => {
      const direita = item.tipo === 'licao'
        ? '<span class="licao-chip">Lição</span>'
        : `<span class="dificuldade ${item.dificuldade}">${DIFICULDADES[item.dificuldade]}</span>`;
      return `
        <a class="linha-item ${item.tipo}" href="${linkItem(item.id)}">
          <span class="icone-status">${iconeStatus(item)}</span>
          <span class="titulo">${esc(item.titulo)}</span>
          ${direita}
        </a>`;
    };
    // Projetos: um bloco por projeto, com o progresso das etapas.
    const linhas = m.grupos
      ? m.grupos.map((g) => {
        const doGrupo = m.itens.filter((x) => x.grupo === g.id);
        const etapas = doGrupo.filter((x) => x.tipo === 'problema');
        const prontas = etapas.filter((x) => statusDe(x.id) === 'resolvido').length;
        return `
          <div class="grupo-cabecalho" id="projeto-${g.id}">
            <h3>${g.icone} ${esc(g.titulo)} <span class="contagem">${prontas}/${etapas.length} etapas</span></h3>
            <p>${esc(g.descricao)}</p>
          </div>
          ${doGrupo.map(linha).join('')}`;
      }).join('')
      : m.itens.map(linha).join('');
    return `
      <section class="modulo" id="modulo-${m.id}">
        <div class="modulo-cabecalho">
          <h2>${m.icone} ${esc(m.titulo)} <span class="passo">${m.extra ? 'módulo extra' : `módulo ${i + 1}`}</span></h2>
          <p>${esc(m.descricao)}</p>
          <div class="barra-progresso"><span style="width:${pct}%"></span></div>
          <div class="contagem">${feitos}/${doModulo.length} ${m.extra ? 'etapas concluídas' : 'problemas resolvidos'}</div>
        </div>
        ${linhas}
      </section>`;
  }).join('');

  el.innerHTML = `
    <div class="inicio">
      <h1>Trilha: do HTML ao banco de dados</h1>
      <p class="sub">Leia a lição, resolva os problemas e clique em <b>Enviar</b> para conferir. Tudo roda no seu navegador.</p>
      <div class="resumo-geral">
        ${cartaoNumero(`${resolvidos}/${total}`, 'problemas resolvidos', 'var(--roxo)')}
        ${cartaoNumero(porDificuldade('facil'), 'Fácil', 'var(--verde)')}
        ${cartaoNumero(porDificuldade('medio'), 'Médio', 'var(--laranja)')}
        ${cartaoNumero(porDificuldade('dificil'), 'Difícil', 'var(--vermelho)')}
      </div>
      ${blocos}
    </div>`;
}
