# 🐘 PHP Playground

Trilha de exercícios no estilo LeetCode para ensinar **HTML → W3.CSS → PHP → PHP + PDO** em aula.
O PHP 8.4 roda **dentro do navegador** (WebAssembly), inclusive com banco de dados **SQLite via PDO**.
Não há servidor, instalação nem custo: o site é estático e fica no GitHub Pages.

**Acesse:** https://sertaoseracloud.github.io/php-playground/

## O que tem

- **40 problemas** (10 por módulo) com dificuldade Fácil/Médio/Difícil, mais **lições** de conceito
  no começo de cada assunto:
  1. **HTML**: estrutura, títulos, ênfase, links, imagens, listas, tabelas, formulários e semântica.
  2. **W3.CSS**: cores, botões, painéis, tags, cards, barra de navegação, grade, tabelas, formulários e landing page.
  3. **PHP**: variáveis, condicionais, laços (FizzBuzz, tabuada), arrays, funções, `$_GET`, `$_POST` e `include`.
  4. **PHP + PDO**: conectar, `COUNT`, `ORDER BY`, `prepare` contra SQL injection, `fetch`, `JOIN` + `GROUP BY`,
     `INSERT`, paginação com `LIMIT`/`OFFSET` e `LEFT JOIN`.
- **🏗️ Módulo extra: Projetos** — 6 sistemas completos construídos em **etapas encadeadas** (33 etapas).
  O código de partida de cada etapa é o **código do próprio aluno** na etapa anterior (ou a referência,
  se ele não a resolveu):

  | Projeto | Etapas | Destaques |
  | --- | --- | --- |
  | ✅ Lista de tarefas (CRUD) | 5 | criar, listar, concluir, editar, excluir |
  | 📝 Blog | 6 | JOIN, comentários, login com `password_verify`, publicar, excluir só o que é seu |
  | 🐦 Rede social | 6 | perfil, seguir, feed com subconsulta, curtidas, busca, "quem seguir" |
  | 🛍️ Loja virtual | 6 | filtros, carrinho na sessão, checkout com **transação**, relatório de vendas |
  | 📚 Biblioteca escolar | 5 | disponibilidade com LEFT JOIN, empréstimos, atrasos e multas com datas |
  | 💬 Fórum de perguntas | 5 | respostas, votos com **upsert**, melhor resposta só pelo autor |

  Os testes dos projetos simulam um usuário de verdade: um caso pode ter vários **passos** que
  compartilham sessão e banco (login → publicar → ver o feed), e os redirecionamentos
  (`header('Location: ...')`) são seguidos. No preview, clicar em links e enviar formulários mantém o
  banco e a sessão; **▶ Executar** começa do zero.
- **Como no LeetCode**: **▶ Executar** roda os casos visíveis; **⬆ Enviar** roda todos, inclusive os
  **casos ocultos**. Os ocultos usam outros valores e outro banco, então resposta fixa no código não passa.
  O resultado sai como "Aceito" ou "Resposta errada", mostrando o caso que falhou.
- **Tela do problema**: descrição, código, preview e o painel **🧪 Testes funcionais** com cada caso de
  teste (⏳ pendente, ✅ passou, ❌ falhou e o motivo), para o aluno saber se acertou a questão.
- **Posição do código e do preview**: a W3.CSS muda o layout em 601px e 993px, então o modo
  **Auto** só põe código e preview lado a lado quando o preview passa de 600px (ex.: telas de 1920px).
  Em telas menores (1366px, projetores) o código fica em cima e o preview embaixo, ambos na largura toda.
  Há botões para fixar ⇆/⇅, ocultar a descrição, recolher os testes e um divisor arrastável
  (mouse ou setas do teclado). O **📐 medidor** mostra a largura do preview e a faixa da W3.CSS.
- **♿ Acessibilidade**: temas Dracula, Alto contraste e Claro; tamanho do texto (87,5% a 175%,
  editor incluído); fonte Atkinson Hyperlegible; mais espaçamento; links sublinhados e foco reforçado;
  reduzir animações; **🔊 Ouvir** o enunciado; atalhos de teclado; link "Pular para o conteúdo";
  rótulos e regiões `aria-live` para leitores de tela.
- **❓ Tutorial** em modal, passo a passo, destacando cada parte da tela. Abre sozinho na primeira visita.
- **Progresso** por módulo e por dificuldade (✅ resolvido, ◐ tentado), salvo no navegador do aluno.
- **Aba Banco**: mostra as tabelas e os dados do problema. O banco é recriado a cada execução.
- **Playground livre** com banco SQLite que **fica salvo no navegador** e botão "Resetar banco".
- **Resultado** renderizado, aba **HTML gerado** e **barra de endereço** para testar `$_GET`.
  Formulários GET/POST e links funcionam dentro do resultado.
- Tema **Dracula** e fonte **Fira Code** (com ligaduras).
- **Compartilhar**: link com o código embutido. Nada é enviado a servidor.
- **Proteção contra laço infinito**: o PHP roda num Web Worker e é reiniciado depois de 8 s.

### Links diretos para a aula

- Lista de problemas: `https://sertaoseracloud.github.io/php-playground/`
- Um problema: `.../php-playground/#/p/pdo-filtro-curso`
- Playground livre: `.../php-playground/#/livre`

## Banco de dados (PDO)

No navegador o banco é **SQLite**, porque o PHP WebAssembly não tem servidor MySQL. O código PDO é o mesmo;
muda só a linha de conexão:

```php
// No playground:
$pdo = new PDO('sqlite:/banco/escola.sqlite');

// Num servidor com MySQL:
$pdo = new PDO('mysql:host=localhost;dbname=escola;charset=utf8mb4', 'usuario', 'senha');
```

O banco `escola` tem as tabelas `cursos` e `alunos`. Veja os scripts em [`src/conteudo/bancos.js`](src/conteudo/bancos.js).

## Como adicionar conteúdo

Cada módulo fica num arquivo em [`src/conteudo/`](src/conteudo/) (`html.js`, `w3css.js`, `php.js`, `pdo.js`),
com uma lista `itens` de lições e problemas, na ordem em que aparecem.

Um problema tem `enunciado`, `dica`, `dificuldade`, `arquivos` (código inicial), `solucao`, `banco`
(SQL opcional) e `testes`. Cada teste faz uma requisição (`url`, `metodo`, `corpo`), pode trocar o banco
(`banco`) e ser oculto (`oculto: true`). Os testes aplicam as regras abaixo, documentadas em
[`src/verificacoes.js`](src/verificacoes.js):

| Regra | Confere |
| --- | --- |
| `{ contem }` / `{ naoContem }` | o texto visível da página |
| `{ seletor, min, max, igual }` | quantos elementos casam com o seletor CSS |
| `{ seletor, texto }` | algum elemento do seletor contém o texto |
| `{ codigo }` | regex no código do aluno (ex.: exigir `prepare`) |
| `{ semErros }` | o PHP não emitiu erros nem avisos |

Os testes do projeto rodam **toda a trilha** no mesmo PHP WebAssembly. Eles garantem que as lições não têm
erros, que cada solução passa em todos os casos e que cada código inicial ainda não passa.

## Desenvolvimento

```bash
npm install
npm run dev      # servidor local com recarga
npm test         # testes (regras, motor PHP, banco e toda a trilha)
npm run build    # gera dist/
```

A cada push na `main`, o GitHub Actions ([`.github/workflows/pages.yml`](.github/workflows/pages.yml))
roda os testes, faz o build e publica no GitHub Pages.

## Como funciona

```
Editor (CodeMirror) ──arquivos + seed SQL──▶ Web Worker: PHP 8.4 (WebAssembly, @php-wasm/web)
        ▲                                     │ grava /www, cria /banco/escola.sqlite
        │                                     │ e simula a requisição HTTP
 formulários/links ◀── iframe isolado ◀── HTML gerado ──▶ regras de verificação (casos de teste)
```

O PHP vem do [WordPress Playground](https://github.com/WordPress/wordpress-playground)
(`@php-wasm/web`, licença GPL-2.0-or-later).
