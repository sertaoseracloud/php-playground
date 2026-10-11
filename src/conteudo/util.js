// Utilitários para escrever o conteúdo da trilha.
// String.raw preserva as barras invertidas do PHP; evite escrever "${" no PHP.
export const php = String.raw;

export const W3 = '<link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">';

/** Monta um documento HTML completo. */
export function documento(corpo, { titulo = 'Minha página', w3 = false, classeBody = '', topo = '' } = {}) {
  const css = w3 ? `\n  ${W3}` : '';
  const classe = classeBody ? ` class="${classeBody}"` : '';
  return `${topo}<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${titulo}</title>${css}
</head>
<body${classe}>
${corpo}
</body>
</html>
`;
}
