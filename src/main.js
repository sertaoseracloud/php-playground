import 'w3-css/w3.css';
import './estilo.css';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Prec } from '@codemirror/state';
import { keymap } from '@codemirror/view';
import { php as linguagemPhp } from '@codemirror/lang-php';

import { exemplos, W3 } from './conteudo/exemplos.js';
import { exercicios } from './conteudo/exercicios.js';
import { MotorPHP, TempoEsgotado } from './php/motor.js';
import { SCRIPT_PONTE, montarRequisicao, normalizarUrl } from './navegacao.js';
import { codificar, decodificar } from './compartilhar.js';
import { corrigir } from './corrigir.js';

const LIVRE = {
  id: 'livre',
  titulo: 'Código livre (em branco)',
  resumo: 'Escreva o que quiser. Use o botão + para criar outros arquivos e incluí-los com include.',
  arquivos: {
    'index.php': `<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">

  <h1><?= "Olá!" ?></h1>

</body>
</html>
`,
  },
};

const itens = [LIVRE, ...exemplos, ...exercicios];
const porId = new Map(itens.map((i) => [i.id, i]));
const ehExercicio = (item) => Array.isArray(item.testes);

// ---------- armazenamento local (rascunhos e exercícios concluídos) ----------
const PREFIXO = 'php-playground:';
const local = {
  ler(chave, padrao = null) {
    try {
      const valor = localStorage.getItem(PREFIXO + chave);
      return valor === null ? padrao : JSON.parse(valor);
    } catch {
      return padrao;
    }
  },
  gravar(chave, valor) {
    try { localStorage.setItem(PREFIXO + chave, JSON.stringify(valor)); } catch { /* sem armazenamento */ }
  },
  remover(chave) {
    try { localStorage.removeItem(PREFIXO + chave); } catch { /* sem armazenamento */ }
  },
};
const concluidos = () => new Set(local.ler('concluidos', []));

// ---------- elementos ----------
const $ = (id) => document.getElementById(id);
const el = {
  seletor: $('seletor'),
  executar: $('btn-executar'),
  verificar: $('btn-verificar'),
  restaurar: $('btn-restaurar'),
  compartilhar: $('btn-compartilhar'),
  status: $('status'),
  descricao: $('descricao'),
  abasArquivos: $('abas-arquivos'),
  editor: $('editor'),
  abaVerificacao: $('aba-verificacao'),
  barra: $('barra-endereco'),
  url: $('url'),
  resultado: $('saida-resultado'),
  fonte: $('saida-fonte'),
  verificacao: $('saida-verificacao'),
  erros: $('erros'),
};

const esc = (texto) => String(texto).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const clonar = (arquivos) => ({ ...arquivos });

// ---------- estado ----------
const estado = {
  item: LIVRE,
  arquivos: clonar(LIVRE.arquivos),
  atual: 'index.php',
  url: '/index.php',
  editores: new Map(),
  phpPronto: false,
};

// ---------- editor ----------
let salvarTimer;
function salvarRascunho() {
  clearTimeout(salvarTimer);
  salvarTimer = setTimeout(() => local.gravar(`rascunho:${estado.item.id}`, estado.arquivos), 300);
}

const extensoes = [
  basicSetup,
  linguagemPhp(),
  EditorView.lineWrapping,
  Prec.highest(keymap.of([{ key: 'Mod-Enter', run: () => { executar(); return true; } }])),
  EditorView.updateListener.of((u) => {
    if (u.docChanged) {
      estado.arquivos[estado.atual] = u.state.doc.toString();
      salvarRascunho();
    }
  }),
];
const editor = new EditorView({ parent: el.editor });

function abrirArquivo(nome) {
  estado.editores.set(estado.atual, editor.state);
  estado.atual = nome;
  editor.setState(estado.editores.get(nome) ?? EditorState.create({ doc: estado.arquivos[nome], extensions: extensoes }));
  renderAbasArquivos();
  editor.focus();
}

function renderAbasArquivos() {
  el.abasArquivos.replaceChildren();
  for (const nome of Object.keys(estado.arquivos)) {
    const aba = document.createElement('button');
    aba.className = 'aba' + (nome === estado.atual ? ' ativa' : '');
    aba.setAttribute('role', 'tab');
    aba.textContent = nome;
    aba.onclick = () => abrirArquivo(nome);
    if (nome !== 'index.php') {
      const fechar = document.createElement('span');
      fechar.className = 'fechar';
      fechar.textContent = '×';
      fechar.title = `Excluir ${nome}`;
      fechar.onclick = (e) => {
        e.stopPropagation();
        if (!confirm(`Excluir o arquivo ${nome}?`)) return;
        delete estado.arquivos[nome];
        estado.editores.delete(nome);
        salvarRascunho();
        if (estado.atual === nome) {
          estado.atual = 'index.php';
          editor.setState(estado.editores.get('index.php') ?? EditorState.create({ doc: estado.arquivos['index.php'], extensions: extensoes }));
        }
        renderAbasArquivos();
      };
      aba.append(fechar);
    }
    el.abasArquivos.append(aba);
  }
  const novo = document.createElement('button');
  novo.className = 'aba';
  novo.textContent = '+';
  novo.title = 'Novo arquivo';
  novo.onclick = novoArquivo;
  el.abasArquivos.append(novo);
}

function novoArquivo() {
  const nome = prompt('Nome do novo arquivo (ex.: funcoes.php, estilo.css):', 'novo.php')?.trim();
  if (!nome) return;
  if (!/^[\w-]+\.(php|html|css|js|txt|json)$/.test(nome)) {
    alert('Use só letras, números, - e _, com extensão .php, .html, .css, .js, .txt ou .json.');
    return;
  }
  if (nome in estado.arquivos) {
    alert('Já existe um arquivo com esse nome.');
    return;
  }
  estado.arquivos[nome] = nome.endsWith('.php') ? '<?php\n\n' : '';
  salvarRascunho();
  abrirArquivo(nome);
}

// ---------- seletor e descrição ----------
function renderSeletor() {
  const feitos = concluidos();
  const grupo = (rotulo, lista) => {
    const g = document.createElement('optgroup');
    g.label = rotulo;
    for (const item of lista) {
      const o = new Option((feitos.has(item.id) ? '✅ ' : '') + item.titulo, item.id);
      g.append(o);
    }
    return g;
  };
  el.seletor.replaceChildren(grupo('Começar', [LIVRE]), grupo('Exemplos', exemplos), grupo('Exercícios', exercicios));
  el.seletor.value = estado.item.id;
}

function renderDescricao() {
  const item = estado.item;
  if (!ehExercicio(item)) {
    el.descricao.innerHTML = `<h2>${esc(item.titulo)}</h2><p>${esc(item.resumo)}</p>`;
    return;
  }
  const feito = concluidos().has(item.id) ? ' <span class="feito">✅ concluído</span>' : '';
  el.descricao.innerHTML = `
    <h2>${esc(item.titulo)}${feito}</h2>
    ${item.enunciado}
    <details><summary>💡 Dica</summary><p><code>${esc(item.dica)}</code></p></details>
    <p><button class="w3-button w3-small w3-border w3-round" id="btn-solucao">Ver solução</button></p>`;
  $('btn-solucao').onclick = () => {
    if (!confirm('Substituir o seu código pela solução? Seu rascunho será perdido.')) return;
    carregarArquivos(clonar(item.solucao));
    salvarRascunho();
    executar();
  };
}

function carregarArquivos(arquivos) {
  estado.arquivos = arquivos;
  estado.editores.clear();
  estado.atual = 'index.php';
  editor.setState(EditorState.create({ doc: arquivos['index.php'] ?? '', extensions: extensoes }));
  renderAbasArquivos();
}

function selecionar(id, { arquivos, atualizarHash = true } = {}) {
  const item = porId.get(id) ?? LIVRE;
  estado.item = item;
  estado.url = '/index.php';
  el.url.value = estado.url;
  carregarArquivos(arquivos ?? local.ler(`rascunho:${item.id}`) ?? clonar(item.arquivos));
  renderDescricao();
  el.seletor.value = item.id;

  const exercicio = ehExercicio(item);
  el.verificar.hidden = !exercicio;
  el.abaVerificacao.hidden = !exercicio;
  el.verificacao.innerHTML = exercicio ? '<p>Clique em <b>✔ Verificar</b> para conferir o seu código.</p>' : '';
  if (!exercicio) mostrarSaida('resultado');

  if (atualizarHash) history.replaceState(null, '', `#${item.id}`);
  if (estado.phpPronto) executar();
}

// ---------- abas de saída ----------
const saidas = { resultado: el.resultado, fonte: el.fonte, verificacao: el.verificacao };
function mostrarSaida(nome) {
  for (const [chave, elemento] of Object.entries(saidas)) elemento.hidden = chave !== nome;
  document.querySelectorAll('[data-saida]').forEach((b) => b.classList.toggle('ativa', b.dataset.saida === nome));
}
document.querySelectorAll('[data-saida]').forEach((b) => { b.onclick = () => mostrarSaida(b.dataset.saida); });

// ---------- execução ----------
function definirStatus(texto) {
  el.status.textContent = texto;
}

function mostrarErros(texto) {
  el.erros.hidden = !texto;
  el.erros.textContent = texto ?? '';
}

async function executar(req = { url: estado.url }) {
  if (!estado.phpPronto) return;
  definirStatus('Executando…');
  try {
    const r = await motor.executar(clonar(estado.arquivos), req);
    estado.url = req.url ?? '/index.php';
    el.url.value = estado.url;
    el.resultado.srcdoc = r.html + SCRIPT_PONTE;
    el.fonte.textContent = r.html;
    mostrarErros(r.erros.trim());
    const metodo = req.metodo === 'POST' ? 'POST ' : '';
    definirStatus(`PHP 8.4 · ${metodo}HTTP ${r.status} · ${r.ms} ms`);
  } catch (erro) {
    tratarErroExecucao(erro);
  }
}

function tratarErroExecucao(erro) {
  if (erro instanceof TempoEsgotado) {
    el.resultado.srcdoc = `<p style="font-family:sans-serif;padding:1em;color:#b71c1c">⏱️ ${esc(erro.message)}<br>
      Verifique se algum laço (for/while) nunca termina.</p>`;
    mostrarErros(erro.message);
  } else {
    mostrarErros(String(erro?.message ?? erro));
    definirStatus('Erro ao executar');
  }
}

window.addEventListener('message', (e) => {
  if (e.source !== el.resultado.contentWindow || !e.data?.__phpPlayground) return;
  executar(montarRequisicao(estado.url, e.data));
});

el.barra.addEventListener('submit', (e) => {
  e.preventDefault();
  executar({ url: normalizarUrl(el.url.value) });
});

el.executar.onclick = () => executar();

// ---------- verificação de exercícios ----------
el.verificar.onclick = async () => {
  const item = estado.item;
  if (!ehExercicio(item)) return;
  mostrarSaida('verificacao');
  el.verificacao.innerHTML = '<p>Verificando…</p>';
  try {
    const { aprovado, relatorio } = await corrigir(item, clonar(estado.arquivos), (arquivos, req) => motor.executar(arquivos, req));
    const blocos = relatorio.map((teste) => `
      ${teste.descricao ? `<h3>Testando <code>${esc(teste.descricao)}</code></h3>` : '<h3>Código e página</h3>'}
      <ul>${teste.resultados.map((r) => `
        <li>${r.ok ? '✅' : '❌'} ${esc(r.mensagem)}
        ${!r.ok && r.detalhe ? `<span class="detalhe">${esc(r.detalhe)}</span>` : ''}</li>`).join('')}
      </ul>`).join('');
    el.verificacao.innerHTML = `
      <div class="resumo ${aprovado ? 'ok' : 'falha'}">${aprovado ? '🎉 Parabéns! Todos os testes passaram.' : 'Ainda falta um pouco. Veja os itens com ❌.'}</div>
      ${blocos}`;
    if (aprovado) {
      local.gravar('concluidos', [...concluidos().add(item.id)]);
      renderSeletor();
      renderDescricao();
    }
    definirStatus(aprovado ? 'Exercício concluído!' : 'Verificação concluída');
  } catch (erro) {
    el.verificacao.innerHTML = `<p>Não foi possível verificar: ${esc(erro?.message ?? erro)}</p>`;
    tratarErroExecucao(erro);
  }
};

// ---------- restaurar e compartilhar ----------
el.restaurar.onclick = () => {
  if (!confirm('Voltar ao código original deste item? Suas alterações serão perdidas.')) return;
  local.remover(`rascunho:${estado.item.id}`);
  selecionar(estado.item.id, { arquivos: clonar(estado.item.arquivos) });
};

el.compartilhar.onclick = async () => {
  const hash = codificar({ item: estado.item.id, arquivos: estado.arquivos });
  const link = `${location.origin}${location.pathname}#${hash}`;
  history.replaceState(null, '', `#${hash}`);
  try {
    await navigator.clipboard.writeText(link);
    definirStatus('🔗 Link copiado!');
  } catch {
    prompt('Copie o link:', link);
  }
};

el.seletor.onchange = () => selecionar(el.seletor.value);

function carregarDoHash() {
  const dados = decodificar(location.hash);
  if (dados?.arquivos) selecionar(dados.item, { arquivos: dados.arquivos, atualizarHash: false });
  else selecionar(dados?.item && porId.has(dados.item) ? dados.item : exemplos[0].id);
}
window.addEventListener('hashchange', carregarDoHash);

// ---------- início ----------
const motor = new MotorPHP({
  aoMudarEstado(situacao, erro) {
    if (situacao === 'carregando') {
      estado.phpPronto = false;
      definirStatus('Carregando o PHP… (só demora na primeira vez)');
    } else if (situacao === 'pronto') {
      const primeiraVez = !motor?.jaIniciou;
      estado.phpPronto = true;
      definirStatus('PHP 8.4 pronto');
      if (primeiraVez) {
        motor.jaIniciou = true;
        executar();
      }
    } else {
      definirStatus('Não foi possível carregar o PHP');
      mostrarErros(`Falha ao carregar o PHP: ${erro}`);
    }
    el.executar.disabled = !estado.phpPronto;
    el.verificar.disabled = !estado.phpPronto;
  },
});

renderSeletor();
carregarDoHash();
