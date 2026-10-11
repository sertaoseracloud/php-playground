import { verificarRegra } from './verificacoes.js';

/**
 * Executa cada teste do exercício com os arquivos do aluno e aplica as regras.
 * `executar(arquivos, { url, metodo, corpo })` deve devolver { html, erros }.
 */
export async function corrigir(exercicio, arquivos, executar) {
  const codigo = Object.values(arquivos).join('\n');
  const relatorio = [];
  for (const teste of exercicio.testes) {
    const resposta = await executar(arquivos, { url: teste.url, metodo: teste.metodo, corpo: teste.corpo });
    const pagina = { html: resposta.html, erros: resposta.erros, codigo };
    relatorio.push({
      descricao: teste.descricao,
      resultados: teste.regras.map((regra) => verificarRegra(regra, pagina)),
    });
  }
  const aprovado = relatorio.every((t) => t.resultados.every((r) => r.ok));
  return { aprovado, relatorio };
}
