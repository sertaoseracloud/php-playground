// Monta um projeto com etapas encadeadas.
//
// Cada etapa declara só os arquivos que muda (`alteracoes`; null apaga um arquivo).
// A solução da etapa N é a solução da etapa N-1 com essas alterações, e o código
// inicial da etapa N é a solução da etapa N-1. Assim o aluno constrói o sistema
// aos poucos. Na tela, se o aluno resolveu a etapa anterior, ele continua do
// próprio código (veja src/ui/item.js).

export const SENHA_1234 = '$2y$08$U6S.d1ZI8ZvNR6JVTKEXneYmp7xABkJ6pGI24og8xCk3TOcglUwLe';

function aplicar(base, alteracoes = {}) {
  const resultado = { ...base };
  for (const [nome, conteudo] of Object.entries(alteracoes)) {
    if (conteudo === null) delete resultado[nome];
    else resultado[nome] = conteudo;
  }
  // index.php sempre primeiro: é o arquivo que o navegador abre.
  const { 'index.php': index, ...resto } = resultado;
  return index === undefined ? resultado : { 'index.php': index, ...resto };
}

export function criarProjeto({ id, titulo, icone, descricao, resumo, banco, inicial, etapas }) {
  const grupo = { id, titulo, icone, descricao };
  const itens = [{
    id: `${id}-visao-geral`,
    tipo: 'licao',
    grupo: id,
    titulo: 'Visão geral do projeto',
    resumo,
    banco,
    arquivos: inicial,
  }];

  let anterior = inicial;
  let idAnterior = null;
  etapas.forEach((etapa, i) => {
    const solucao = aplicar(anterior, etapa.alteracoes);
    const item = {
      id: `${id}-${i + 1}`,
      tipo: 'problema',
      grupo: id,
      projeto: grupo,
      etapa: i + 1,
      totalEtapas: etapas.length,
      etapaAnterior: idAnterior,
      titulo: `Etapa ${i + 1}: ${etapa.titulo}`,
      dificuldade: etapa.dificuldade,
      enunciado: etapa.enunciado,
      dica: etapa.dica,
      banco,
      arquivos: anterior,
      solucao,
      testes: etapa.testes,
    };
    itens.push(item);
    anterior = solucao;
    idAnterior = item.id;
  });

  return { grupo, itens };
}
