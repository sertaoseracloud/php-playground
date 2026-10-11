// Regras usadas pelos exercícios para conferir a página gerada pelo aluno.
// Cada regra é um objeto com uma das chaves abaixo e, opcionalmente, `msg`:
//   { contem: 'texto' }              o texto visível da página contém 'texto'
//   { naoContem: 'texto' }           o texto visível NÃO contém 'texto'
//   { seletor: 'css', min, max, igual }  quantidade de elementos que casam com o seletor
//   { seletor: 'css', texto: 'x' }   algum elemento do seletor contém o texto 'x'
//   { codigo: 'regex' }              o código-fonte do aluno casa com a regex
//   { semErros: true }               o PHP não emitiu erros nem avisos

function documento(html) {
  return new DOMParser().parseFromString(html, 'text/html');
}

function normalizar(texto) {
  return texto.replace(/\s+/g, ' ').trim();
}

export function textoVisivel(html) {
  const doc = documento(html);
  doc.querySelectorAll('script, style').forEach((el) => el.remove());
  return normalizar(doc.body?.textContent ?? '');
}

function resultado(ok, regra, padrao, detalhe) {
  return { ok, mensagem: regra.msg ?? padrao, detalhe };
}

export function verificarRegra(regra, { html, erros, codigo }) {
  if ('contem' in regra) {
    const ok = textoVisivel(html).includes(normalizar(regra.contem));
    return resultado(ok, regra, `A página deve mostrar "${regra.contem}"`, ok ? undefined : 'texto não encontrado');
  }
  if ('naoContem' in regra) {
    const ok = !textoVisivel(html).includes(normalizar(regra.naoContem));
    return resultado(ok, regra, `A página não deve mostrar "${regra.naoContem}"`, ok ? undefined : 'texto encontrado');
  }
  if ('seletor' in regra && 'texto' in regra) {
    const esperado = normalizar(regra.texto);
    const elementos = [...documento(html).querySelectorAll(regra.seletor)];
    const ok = elementos.some((e) => normalizar(e.textContent).includes(esperado));
    return resultado(ok, regra, `Um elemento "${regra.seletor}" deve conter "${regra.texto}"`,
      ok ? undefined : `nenhum "${regra.seletor}" com esse texto`);
  }
  if ('seletor' in regra) {
    const qtd = documento(html).querySelectorAll(regra.seletor).length;
    const { min, max, igual } = regra;
    let ok;
    let padrao;
    if (igual !== undefined) {
      ok = qtd === igual;
      padrao = `A página deve ter exatamente ${igual} elemento(s) "${regra.seletor}"`;
    } else {
      ok = qtd >= (min ?? 1) && (max === undefined || qtd <= max);
      padrao = max === undefined
        ? `A página deve ter pelo menos ${min ?? 1} elemento(s) "${regra.seletor}"`
        : `A página deve ter entre ${min ?? 0} e ${max} elemento(s) "${regra.seletor}"`;
    }
    return resultado(ok, regra, padrao, ok ? undefined : `encontrei ${qtd} elemento(s) "${regra.seletor}"`);
  }
  if ('codigo' in regra) {
    const ok = new RegExp(regra.codigo, 'i').test(codigo);
    return resultado(ok, regra, `O código deve usar ${regra.codigo}`);
  }
  if ('semErros' in regra) {
    const ok = !erros || erros.trim() === '';
    return resultado(ok, regra, 'O PHP não deve mostrar erros nem avisos', ok ? undefined : erros.trim().split('\n')[0]);
  }
  throw new Error(`Regra desconhecida: ${JSON.stringify(regra)}`);
}
