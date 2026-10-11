import { verificarRegra } from './verificacoes.js';

/**
 * Roda os casos de teste do problema com os arquivos do aluno.
 *
 * - "Executar" usa só os casos visíveis; "Enviar" inclui os ocultos (`oculto: true`).
 * - Cada caso pode trocar o banco (`banco: 'SQL'`); senão usa o banco do problema.
 *   Bancos diferentes nos casos ocultos impedem respostas fixas no código.
 *
 * `executar(arquivos, { url, metodo, corpo }, banco)` deve devolver { html, erros }.
 */
export async function corrigir(problema, arquivos, executar, { incluirOcultos = true } = {}) {
  const codigo = Object.values(arquivos).join('\n');
  const casos = problema.testes.filter((t) => incluirOcultos || !t.oculto);
  const relatorio = [];
  for (const teste of casos) {
    const seed = teste.banco ?? problema.banco;
    const resposta = await executar(
      arquivos,
      { url: teste.url, metodo: teste.metodo, corpo: teste.corpo },
      seed ? { seed } : undefined,
    );
    const pagina = { html: resposta.html, erros: resposta.erros, codigo };
    const resultados = teste.regras.map((regra) => verificarRegra(regra, pagina));
    relatorio.push({
      descricao: teste.descricao,
      oculto: Boolean(teste.oculto),
      ok: resultados.every((r) => r.ok),
      resultados,
    });
  }
  return { aprovado: relatorio.every((t) => t.ok), relatorio };
}
