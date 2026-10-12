import { verificarRegra } from './verificacoes.js';

/**
 * Roda os casos de teste do problema com os arquivos do aluno.
 *
 * - "Executar" usa só os casos visíveis; "Enviar" inclui os ocultos (`oculto: true`).
 * - Cada caso pode trocar o banco (`banco: 'SQL'`); senão usa o banco do problema.
 *   Bancos diferentes nos casos ocultos impedem respostas fixas no código.
 * - Um caso pode ter `passos`: uma sequência de requisições que compartilham
 *   sessão ($_SESSION) e banco, como um usuário de verdade (login → publicar →
 *   ver o feed). Cada passo pode ter as próprias `regras`.
 *
 * `executar(arquivos, { url, metodo, corpo }, banco, { novaSessao, manterBanco, contexto })`
 * deve devolver { html, erros }.
 */
export async function corrigir(problema, arquivos, executar, { incluirOcultos = true } = {}) {
  const codigo = Object.values(arquivos).join('\n');
  const casos = problema.testes.filter((t) => incluirOcultos || !t.oculto);
  const relatorio = [];
  for (const teste of casos) {
    const seed = teste.banco ?? problema.banco;
    const banco = seed ? { seed } : undefined;
    const passos = teste.passos ?? [teste];
    const resultados = [];
    for (const [i, passo] of passos.entries()) {
      const resposta = await executar(
        arquivos,
        { url: passo.url, metodo: passo.metodo, corpo: passo.corpo },
        banco,
        { novaSessao: i === 0, manterBanco: i > 0, contexto: 'testes' },
      );
      const pagina = { html: resposta.html, erros: resposta.erros, codigo };
      resultados.push(...(passo.regras ?? []).map((regra) => verificarRegra(regra, pagina)));
    }
    relatorio.push({
      descricao: teste.descricao,
      oculto: Boolean(teste.oculto),
      ok: resultados.every((r) => r.ok),
      resultados,
    });
  }
  return { aprovado: relatorio.every((t) => t.ok), relatorio };
}
