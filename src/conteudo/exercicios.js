// Exercícios com verificação automática.
// Cada teste faz uma requisição (url/metodo/corpo) e aplica as regras de src/verificacoes.js.
// `solucao` é usada pelo botão "Ver solução" e pelos testes automatizados do projeto,
// que garantem que a solução passa e que o código inicial ainda não passa.
import { W3 } from './exemplos.js';

const php = String.raw;

const pagina = (corpo, topo = '') => php`${topo}<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
${corpo}
</body>
</html>
`;

export const exercicios = [
  {
    id: 'ex-apresentacao',
    tipo: 'problema',
    dificuldade: 'facil',
    titulo: 'Apresente-se',
    enunciado: `
      <p>Crie as variáveis <code>$nome</code> e <code>$idade</code> com os seus dados e mostre:</p>
      <ul>
        <li>um <code>&lt;h1 class="w3-text-blue"&gt;</code> com o texto <b>Meu nome é ...</b></li>
        <li>um parágrafo com <b>Tenho ... anos</b></li>
      </ul>`,
    dica: 'Use <?= $nome ?> dentro do HTML, ou echo "Meu nome é $nome";',
    arquivos: {
      'index.php': pagina(`  <!-- Escreva aqui o seu h1 e o parágrafo -->`, php`<?php
// Crie as variáveis $nome e $idade aqui

?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h1 class="w3-text-blue">Meu nome é <?= $nome ?></h1>
  <p>Tenho <?= $idade ?> anos</p>`, php`<?php
$nome = 'Ana';
$idade = 16;
?>
`),
    },
    testes: [
      {
        regras: [
          { codigo: '\\$nome\\s*=', msg: 'Crie a variável $nome' },
          { codigo: '\\$idade\\s*=', msg: 'Crie a variável $idade' },
          { seletor: 'h1.w3-text-blue', msg: 'Use um <h1> com a classe w3-text-blue' },
          { contem: 'Meu nome é' },
          { contem: 'anos' },
          { codigo: '(echo|<\\?=)[^;]*\\$nome', msg: 'Mostre o nome usando a variável $nome' },
          { semErros: true },
        ],
      },
    ],
  },
  {
    id: 'ex-par-impar',
    tipo: 'problema',
    dificuldade: 'facil',
    titulo: 'Par ou ímpar',
    enunciado: `
      <p>O número chega pela URL: <code>index.php?n=4</code>. Mostre:</p>
      <ul>
        <li><b>4 é par</b> dentro de um elemento com a classe <code>w3-green</code></li>
        <li><b>7 é ímpar</b> dentro de um elemento com a classe <code>w3-red</code></li>
      </ul>
      <p>Teste mudando o <code>?n=</code> na barra de endereço do resultado.</p>`,
    dica: 'O operador % dá o resto da divisão: $n % 2 === 0 significa que $n é par.',
    arquivos: {
      'index.php': pagina(`  <h2>Par ou ímpar?</h2>
  <!-- Use if/else para mostrar o resultado -->`, php`<?php
$n = (int) ($_GET['n'] ?? 7);
?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h2>Par ou ímpar?</h2>
  <?php if ($n % 2 === 0): ?>
    <div class="w3-panel w3-green"><p><?= $n ?> é par</p></div>
  <?php else: ?>
    <div class="w3-panel w3-red"><p><?= $n ?> é ímpar</p></div>
  <?php endif; ?>`, php`<?php
$n = (int) ($_GET['n'] ?? 7);
?>
`),
    },
    testes: [
      {
        descricao: 'index.php?n=4',
        url: '/index.php?n=4',
        regras: [
          { contem: '4 é par' },
          { naoContem: '4 é ímpar', msg: 'Para 4 não deve aparecer "4 é ímpar"' },
          { seletor: '.w3-green', msg: 'O resultado par deve ficar num elemento w3-green' },
        ],
      },
      {
        descricao: 'index.php?n=7',
        url: '/index.php?n=7',
        regras: [
          { contem: '7 é ímpar' },
          { seletor: '.w3-red', msg: 'O resultado ímpar deve ficar num elemento w3-red' },
        ],
      },
      { regras: [{ codigo: '%', msg: 'Use o operador % (resto da divisão)' }, { semErros: true }] },
      { descricao: 'index.php?n=0', url: '/index.php?n=0', oculto: true, regras: [{ contem: '0 é par' }] },
      { descricao: 'index.php?n=-3', url: '/index.php?n=-3', oculto: true, regras: [{ contem: '-3 é ímpar' }] },
    ],
  },
  {
    id: 'ex-tabuada',
    tipo: 'problema',
    dificuldade: 'medio',
    titulo: 'Tabuada com laço',
    enunciado: `
      <p>Mostre a tabuada do número recebido em <code>?n=</code> (padrão 5) numa
      <code>&lt;table class="w3-table w3-striped"&gt;</code>.</p>
      <p>Cada linha deve ter uma célula no formato <b>3 x 7 = 21</b>, de 1 a 10.</p>`,
    dica: 'for ($i = 1; $i <= 10; $i++) { ... } e, dentro, uma <tr><td>...</td></tr>.',
    arquivos: {
      'index.php': pagina(`  <h2>Tabuada do <?= $n ?></h2>
  <table class="w3-table w3-striped">
    <!-- gere as 10 linhas aqui com um laço -->
  </table>`, php`<?php
$n = (int) ($_GET['n'] ?? 5);
?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h2>Tabuada do <?= $n ?></h2>
  <table class="w3-table w3-striped">
    <?php for ($i = 1; $i <= 10; $i++): ?>
      <tr><td><?= $n ?> x <?= $i ?> = <?= $n * $i ?></td></tr>
    <?php endfor; ?>
  </table>`, php`<?php
$n = (int) ($_GET['n'] ?? 5);
?>
`),
    },
    testes: [
      {
        descricao: 'index.php?n=3',
        url: '/index.php?n=3',
        regras: [
          { seletor: 'table.w3-table.w3-striped', igual: 1, msg: 'Use uma tabela com as classes w3-table e w3-striped' },
          { seletor: 'table tr', min: 10, msg: 'A tabela deve ter 10 linhas' },
          { contem: '3 x 1 = 3' },
          { contem: '3 x 10 = 30' },
        ],
      },
      { descricao: 'index.php?n=9', url: '/index.php?n=9', regras: [{ contem: '9 x 7 = 63' }] },
      { regras: [{ codigo: '\\b(for|while)\\s*\\(', msg: 'Use um laço for ou while' }, { semErros: true }] },
      {
        descricao: 'index.php?n=12',
        url: '/index.php?n=12',
        oculto: true,
        regras: [{ contem: '12 x 10 = 120' }, { seletor: 'table tr', min: 10 }],
      },
    ],
  },
  {
    id: 'ex-lista-compras',
    tipo: 'problema',
    dificuldade: 'facil',
    titulo: 'Lista de compras',
    enunciado: `
      <p>Percorra o array <code>$itens</code> com <code>foreach</code> e mostre cada item
      num <code>&lt;li&gt;</code> dentro de <code>&lt;ul class="w3-ul w3-border"&gt;</code>.</p>
      <p>Abaixo da lista, mostre <b>Total: 5 itens</b> calculado com <code>count()</code>.</p>`,
    dica: '<?php foreach ($itens as $item): ?> <li><?= $item ?></li> <?php endforeach; ?>',
    arquivos: {
      'index.php': pagina(`  <h2>Lista de compras</h2>
  <!-- crie a lista aqui -->`, php`<?php
$itens = ['Arroz', 'Feijão', 'Macarrão', 'Leite', 'Café'];
?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h2>Lista de compras</h2>
  <ul class="w3-ul w3-border">
    <?php foreach ($itens as $item): ?>
      <li><?= $item ?></li>
    <?php endforeach; ?>
  </ul>
  <p>Total: <?= count($itens) ?> itens</p>`, php`<?php
$itens = ['Arroz', 'Feijão', 'Macarrão', 'Leite', 'Café'];
?>
`),
    },
    testes: [
      {
        regras: [
          { seletor: 'ul.w3-ul.w3-border li', igual: 5, msg: 'A lista w3-ul w3-border deve ter os 5 itens' },
          { contem: 'Macarrão' },
          { contem: 'Total: 5 itens' },
          { codigo: 'foreach\\s*\\(', msg: 'Use foreach para percorrer o array' },
          { codigo: 'count\\s*\\(', msg: 'Calcule o total com count()' },
          { semErros: true },
        ],
      },
    ],
  },
  {
    id: 'ex-cards',
    tipo: 'problema',
    dificuldade: 'medio',
    titulo: 'Cards de produtos',
    enunciado: `
      <p>Para cada produto do array, crie um card <code>&lt;div class="w3-card"&gt;</code>
      com o nome num <code>&lt;h3&gt;</code> e o preço no formato brasileiro, por exemplo <b>R$ 12,50</b>.</p>
      <p>Coloque cada card dentro de uma coluna <code>w3-third</code> de uma <code>w3-row-padding</code>.</p>`,
    dica: "number_format($preco, 2, ',', '.') transforma 12.5 em 12,50.",
    arquivos: {
      'index.php': pagina(`  <h2>Cardápio</h2>
  <div class="w3-row-padding">
    <!-- um card por produto -->
  </div>`, php`<?php
$produtos = [
    ['nome' => 'Pastel', 'preco' => 8.0],
    ['nome' => 'Suco', 'preco' => 6.5],
    ['nome' => 'Açaí', 'preco' => 12.5],
];
?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h2>Cardápio</h2>
  <div class="w3-row-padding">
    <?php foreach ($produtos as $p): ?>
      <div class="w3-third">
        <div class="w3-card w3-container w3-margin-bottom">
          <h3><?= $p['nome'] ?></h3>
          <p>R$ <?= number_format($p['preco'], 2, ',', '.') ?></p>
        </div>
      </div>
    <?php endforeach; ?>
  </div>`, php`<?php
$produtos = [
    ['nome' => 'Pastel', 'preco' => 8.0],
    ['nome' => 'Suco', 'preco' => 6.5],
    ['nome' => 'Açaí', 'preco' => 12.5],
];
?>
`),
    },
    testes: [
      {
        regras: [
          { seletor: '.w3-card', igual: 3, msg: 'Crie exatamente 3 cards w3-card' },
          { seletor: '.w3-row-padding .w3-third .w3-card', igual: 3, msg: 'Cada card deve estar numa coluna w3-third dentro de w3-row-padding' },
          { seletor: '.w3-card h3', igual: 3, msg: 'Cada card deve ter o nome num <h3>' },
          { contem: 'R$ 12,50' },
          { contem: 'R$ 6,50' },
          { codigo: 'foreach\\s*\\(', msg: 'Gere os cards com foreach' },
          { semErros: true },
        ],
      },
    ],
  },
  {
    id: 'ex-saudacao',
    tipo: 'problema',
    dificuldade: 'medio',
    titulo: 'Formulário de saudação',
    enunciado: `
      <p>Crie um formulário com <code>method="get"</code> e um campo <code>name="nome"</code>.</p>
      <p>Quando o nome for enviado, mostre <b>Olá, Ana!</b> dentro de um
      <code>&lt;div class="w3-panel w3-pale-green"&gt;</code>. Sem nome, não mostre a saudação.</p>
      <p>Proteja a página: o nome deve passar por <code>htmlspecialchars()</code>.</p>`,
    dica: "$nome = $_GET['nome'] ?? ''; e depois if ($nome !== '') { ... }",
    arquivos: {
      'index.php': pagina(`  <h2>Saudação</h2>
  <!-- formulário e saudação aqui -->`, php`<?php
// leia o nome de $_GET aqui
?>
`),
    },
    solucao: {
      'index.php': pagina(`  <h2>Saudação</h2>
  <form method="get">
    <input class="w3-input w3-border" name="nome" placeholder="Seu nome">
    <button class="w3-button w3-green w3-margin-top">Enviar</button>
  </form>
  <?php if ($nome !== ''): ?>
    <div class="w3-panel w3-pale-green"><p>Olá, <?= htmlspecialchars($nome) ?>!</p></div>
  <?php endif; ?>`, php`<?php
$nome = $_GET['nome'] ?? '';
?>
`),
    },
    testes: [
      {
        descricao: 'index.php (sem nome)',
        regras: [
          { seletor: 'form input[name="nome"]', msg: 'O formulário precisa de um campo name="nome"' },
          { seletor: 'form[method="get" i]', msg: 'Use method="get" no formulário' },
          { naoContem: 'Olá,', msg: 'Sem nome enviado, a saudação não deve aparecer' },
          { semErros: true },
        ],
      },
      {
        descricao: 'index.php?nome=Ana',
        url: '/index.php?nome=Ana',
        regras: [
          { contem: 'Olá, Ana!' },
          { seletor: '.w3-panel.w3-pale-green', msg: 'A saudação deve ficar num w3-panel w3-pale-green' },
        ],
      },
      {
        descricao: 'index.php?nome=<b>Bia</b>',
        url: '/index.php?nome=%3Cb%3EBia%3C%2Fb%3E',
        regras: [
          { seletor: '.w3-panel b', igual: 0, msg: 'Use htmlspecialchars(): o HTML digitado não pode virar tag' },
          { contem: 'Olá, <b>Bia</b>!' },
        ],
      },
      {
        descricao: 'index.php?nome=José',
        url: '/index.php?nome=Jos%C3%A9',
        oculto: true,
        regras: [{ contem: 'Olá, José!' }],
      },
    ],
  },
];
