# 🐘 PHP Playground

Playground para ensinar **PHP, HTML e W3.CSS** em aula. O PHP 8.4 roda **dentro do navegador**
(WebAssembly), então não há servidor, instalação ou custo: o site é estático e fica no GitHub Pages.

**Acesse:** https://sertaoseracloud.github.io/php-playground/

## O que tem

- **Editor** com destaque de sintaxe, vários arquivos (`include`) e atalho **Ctrl+Enter** para executar.
- **Resultado** renderizado ao lado e aba **HTML gerado**, que mostra o que o PHP devolveu ao navegador.
- **Barra de endereço**: edite `index.php?n=4` e tecle Enter para ensinar `$_GET`.
  Formulários GET e POST e links funcionam dentro do resultado.
- **11 exemplos progressivos**: olá mundo, variáveis, if/else, laços, arrays, funções,
  formulários GET e POST, layout W3.CSS, vitrine de produtos e `include`.
- **6 exercícios com correção automática** (✔ Verificar), dica e botão "Ver solução".
  Os exercícios concluídos ficam marcados com ✅ no navegador do aluno.
- **Compartilhar**: copia um link com o código embutido (depois do `#`). Nada é enviado a servidor.
- **Rascunhos automáticos** no navegador e botão **Restaurar** para voltar ao original.
- **Proteção contra laço infinito**: o PHP roda num Web Worker e é reiniciado depois de 8 s.

### Links diretos para a aula

Cada item tem um endereço próprio, útil para slides:

- `.../php-playground/#formulario-get`
- `.../php-playground/#ex-tabuada`

## Limitações

- Não há banco de dados MySQL nem acesso à rede a partir do PHP.
- O primeiro acesso baixa cerca de 8 MB, que o navegador guarda em cache depois.
- A W3.CSS dos exemplos vem de `https://www.w3schools.com/w3css/5/w3.css`. Os alunos precisam de internet.

## Como adicionar conteúdo

- Exemplos: [`src/conteudo/exemplos.js`](src/conteudo/exemplos.js)
- Exercícios: [`src/conteudo/exercicios.js`](src/conteudo/exercicios.js). Cada teste faz uma requisição
  (`url`, `metodo`, `corpo`) e aplica regras como `{ contem }`, `{ naoContem }`,
  `{ seletor, min, max, igual }`, `{ codigo }` (regex no código do aluno) e `{ semErros }`.
  As regras estão documentadas em [`src/verificacoes.js`](src/verificacoes.js).

Os testes rodam **todos** os exemplos e exercícios no mesmo PHP WebAssembly. Eles garantem que os
exemplos não têm erros, que cada solução passa e que o código inicial ainda não passa.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local com recarga
npm test         # testes (verificações + todo o conteúdo rodando no PHP)
npm run build    # gera dist/
```

A cada push na `main`, o GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml))
roda os testes, faz o build e publica no GitHub Pages.

## Como funciona

```
Editor (CodeMirror) ──arquivos──▶ Web Worker: PHP 8.4 (WebAssembly, @php-wasm/web)
        ▲                                   │ grava em /www e simula a requisição HTTP
        │                                   ▼
 formulários/links ◀── iframe isolado (sandbox) ◀── HTML gerado
```

O PHP vem do [WordPress Playground](https://github.com/WordPress/wordpress-playground)
(`@php-wasm/web`, licença GPL-2.0-or-later).
