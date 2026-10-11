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
- **Como no LeetCode**: **▶ Executar** roda os casos visíveis; **⬆ Enviar** roda todos, inclusive os
  **casos ocultos**. Os ocultos usam outros valores e outro banco, então resposta fixa no código não passa.
  O resultado sai como "Aceito" ou "Resposta errada", mostrando o caso que falhou.
- **Tela do problema**: descrição à esquerda; **código e preview lado a lado, com o mesmo tamanho**
  (como o "Try it" da W3Schools); embaixo, o painel **🧪 Testes funcionais** com cada caso de teste
  (⏳ pendente, ✅ passou, ❌ falhou e o motivo), para o aluno saber se acertou a questão.
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
