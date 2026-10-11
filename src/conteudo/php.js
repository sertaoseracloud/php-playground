import { exemplos } from './exemplos.js';
import { exercicios } from './exercicios.js';
import { documento, php } from './util.js';

const licao = (id) => exemplos.find((e) => e.id === id);
const exercicio = (id) => exercicios.find((e) => e.id === id);
const pagina = (corpo, topo, titulo) => ({
  'index.php': documento(corpo, { w3: true, classeBody: 'w3-container', topo, titulo }),
});

const media = {
  id: 'php-media',
  tipo: 'problema',
  titulo: 'Média das notas',
  dificuldade: 'facil',
  enunciado: `
    <p>As três notas chegam pela URL: <code>index.php?n1=8&amp;n2=6&amp;n3=7</code>.</p>
    <p>Calcule a média e mostre <b>Média: 7,0</b>, sempre com <b>uma casa decimal</b> e vírgula.</p>`,
  dica: "number_format($media, 1, ',', '') formata 7 como 7,0 e 9.1666 como 9,2.",
  arquivos: pagina('  <h2>Boletim</h2>\n  <!-- mostre a média aqui -->', php`<?php
$n1 = (float) ($_GET['n1'] ?? 8);
$n2 = (float) ($_GET['n2'] ?? 6);
$n3 = (float) ($_GET['n3'] ?? 7);
?>
`, 'Média'),
  solucao: pagina(`  <h2>Boletim</h2>
  <p>Média: <?= number_format(($n1 + $n2 + $n3) / 3, 1, ',', '') ?></p>`, php`<?php
$n1 = (float) ($_GET['n1'] ?? 8);
$n2 = (float) ($_GET['n2'] ?? 6);
$n3 = (float) ($_GET['n3'] ?? 7);
?>
`, 'Média'),
  testes: [
    { descricao: '?n1=8&n2=6&n3=7', url: '/index.php?n1=8&n2=6&n3=7', regras: [{ contem: 'Média: 7,0' }, { semErros: true }] },
    { descricao: '?n1=10&n2=9&n3=8.5', url: '/index.php?n1=10&n2=9&n3=8.5', regras: [{ contem: 'Média: 9,2' }] },
    { descricao: '?n1=0&n2=0&n3=1', url: '/index.php?n1=0&n2=0&n3=1', oculto: true, regras: [{ contem: 'Média: 0,3' }] },
  ],
};

const fizzbuzz = {
  id: 'php-fizzbuzz',
  tipo: 'problema',
  titulo: 'FizzBuzz',
  dificuldade: 'medio',
  enunciado: `
    <p>Para cada número de <b>1 até n</b> (<code>?n=</code>, padrão 15), crie um <code>&lt;li&gt;</code> numa
    <code>&lt;ul class="w3-ul"&gt;</code> com:</p>
    <ul>
      <li><b>FizzBuzz</b> se o número for divisível por 3 <b>e</b> por 5;</li>
      <li><b>Fizz</b> se for divisível só por 3;</li>
      <li><b>Buzz</b> se for divisível só por 5;</li>
      <li>o próprio <b>número</b> nos outros casos.</li>
    </ul>`,
  dica: 'Teste primeiro o caso de 15 (3 e 5), senão o "Fizz" ganha antes.',
  arquivos: pagina('  <h2>FizzBuzz até <?= $n ?></h2>\n  <ul class="w3-ul w3-border">\n  </ul>', php`<?php
$n = (int) ($_GET['n'] ?? 15);
?>
`, 'FizzBuzz'),
  solucao: pagina(`  <h2>FizzBuzz até <?= $n ?></h2>
  <ul class="w3-ul w3-border">
  <?php for ($i = 1; $i <= $n; $i++): ?>
    <li><?php
      if ($i % 15 === 0) echo 'FizzBuzz';
      elseif ($i % 3 === 0) echo 'Fizz';
      elseif ($i % 5 === 0) echo 'Buzz';
      else echo $i;
    ?></li>
  <?php endfor; ?>
  </ul>`, php`<?php
$n = (int) ($_GET['n'] ?? 15);
?>
`, 'FizzBuzz'),
  testes: [
    {
      descricao: '?n=15',
      url: '/index.php?n=15',
      regras: [
        { seletor: 'ul.w3-ul li', igual: 15, msg: 'Para n=15 a lista deve ter 15 itens' },
        { seletor: 'li:nth-child(3)', texto: 'Fizz' },
        { seletor: 'li:nth-child(5)', texto: 'Buzz' },
        { seletor: 'li:nth-child(7)', texto: '7' },
        { seletor: 'li:nth-child(15)', texto: 'FizzBuzz' },
      ],
    },
    { regras: [{ codigo: '\\b(for|while)\\s*\\(', msg: 'Use um laço' }, { semErros: true }] },
    {
      descricao: '?n=5',
      url: '/index.php?n=5',
      oculto: true,
      regras: [
        { seletor: 'ul.w3-ul li', igual: 5 },
        { seletor: 'li:nth-child(5)', texto: 'Buzz' },
        { seletor: 'li:nth-child(4)', texto: '4' },
      ],
    },
    {
      descricao: '?n=30',
      url: '/index.php?n=30',
      oculto: true,
      regras: [{ seletor: 'li:nth-child(30)', texto: 'FizzBuzz' }, { seletor: 'li:nth-child(25)', texto: 'Buzz' }],
    },
  ],
};

const desconto = {
  id: 'php-desconto',
  tipo: 'problema',
  titulo: 'Função de desconto',
  dificuldade: 'medio',
  enunciado: `
    <p>Crie a função <code>aplicarDesconto(float $preco, int $percentual): float</code>, que devolve o preço com desconto.</p>
    <p>Use a função para mostrar <b>Preço final: R$ 90,00</b> para <code>?preco=100&amp;pct=10</code>,
    no formato brasileiro (duas casas, vírgula).</p>`,
  dica: "O desconto é $preco * $percentual / 100. Formate com number_format($valor, 2, ',', '.').",
  arquivos: pagina('  <h2>Calculadora de desconto</h2>\n  <!-- mostre o preço final -->', php`<?php
$preco = (float) ($_GET['preco'] ?? 100);
$pct = (int) ($_GET['pct'] ?? 10);

// crie a função aplicarDesconto aqui
?>
`, 'Desconto'),
  solucao: pagina(`  <h2>Calculadora de desconto</h2>
  <p>Preço final: R$ <?= number_format(aplicarDesconto($preco, $pct), 2, ',', '.') ?></p>`, php`<?php
$preco = (float) ($_GET['preco'] ?? 100);
$pct = (int) ($_GET['pct'] ?? 10);

function aplicarDesconto(float $preco, int $percentual): float {
    return $preco - $preco * $percentual / 100;
}
?>
`, 'Desconto'),
  testes: [
    { descricao: '?preco=100&pct=10', url: '/index.php?preco=100&pct=10', regras: [{ contem: 'Preço final: R$ 90,00' }] },
    { descricao: '?preco=200&pct=25', url: '/index.php?preco=200&pct=25', regras: [{ contem: 'Preço final: R$ 150,00' }] },
    {
      regras: [
        { codigo: 'function\\s+aplicarDesconto\\s*\\(', msg: 'Crie a função aplicarDesconto' },
        { codigo: 'aplicarDesconto\\s*\\(\\s*\\$', msg: 'Chame aplicarDesconto passando as variáveis' },
        { semErros: true },
      ],
    },
    { descricao: '?preco=59.9&pct=0', url: '/index.php?preco=59.9&pct=0', oculto: true, regras: [{ contem: 'R$ 59,90' }] },
    { descricao: '?preco=1500&pct=100', url: '/index.php?preco=1500&pct=100', oculto: true, regras: [{ contem: 'R$ 0,00' }] },
    { descricao: '?preco=2500&pct=10', url: '/index.php?preco=2500&pct=10', oculto: true, regras: [{ contem: 'R$ 2.250,00' }] },
  ],
};

const login = {
  id: 'php-login',
  tipo: 'problema',
  titulo: 'Tela de login com POST',
  dificuldade: 'dificil',
  enunciado: `
    <p>Crie uma tela de login com <code>method="post"</code>, um campo <code>name="usuario"</code> e um campo
    <code>type="password"</code> com <code>name="senha"</code>.</p>
    <ul>
      <li>Usuário <b>admin</b> e senha <b>1234</b>: mostre <b>Bem-vindo, admin!</b> num <code>w3-panel w3-green</code>.</li>
      <li>Qualquer outra combinação: mostre <b>Usuário ou senha inválidos</b> num <code>w3-panel w3-red</code>.</li>
      <li>Sem envio (GET): mostre só o formulário, sem nenhum painel.</li>
    </ul>`,
  dica: "Use $_SERVER['REQUEST_METHOD'] === 'POST' para saber se o formulário foi enviado.",
  arquivos: pagina(`  <h2>Entrar</h2>
  <form class="w3-card w3-padding" style="max-width:360px">
    <!-- campos usuario e senha -->
    <button class="w3-button w3-indigo">Entrar</button>
  </form>`, '', 'Login'),
  solucao: pagina(`  <h2>Entrar</h2>
  <?php if ($enviado && $usuario === 'admin' && $senha === '1234'): ?>
    <div class="w3-panel w3-green"><p>Bem-vindo, <?= htmlspecialchars($usuario) ?>!</p></div>
  <?php elseif ($enviado): ?>
    <div class="w3-panel w3-red"><p>Usuário ou senha inválidos</p></div>
  <?php endif; ?>
  <form method="post" class="w3-card w3-padding" style="max-width:360px">
    <input class="w3-input w3-border" name="usuario" placeholder="Usuário">
    <input class="w3-input w3-border w3-margin-top" type="password" name="senha" placeholder="Senha">
    <button class="w3-button w3-indigo w3-margin-top">Entrar</button>
  </form>`, php`<?php
$enviado = $_SERVER['REQUEST_METHOD'] === 'POST';
$usuario = $_POST['usuario'] ?? '';
$senha = $_POST['senha'] ?? '';
?>
`, 'Login'),
  testes: [
    {
      descricao: 'GET (abrir a página)',
      regras: [
        { seletor: 'form[method="post" i] input[name="usuario"]', msg: 'O formulário POST precisa do campo usuario' },
        { seletor: 'form input[type="password"][name="senha"]', msg: 'Crie o campo de senha (type="password", name="senha")' },
        { seletor: '.w3-panel', igual: 0, msg: 'Sem envio, não mostre nenhum painel' },
        { semErros: true },
      ],
    },
    {
      descricao: 'POST usuario=admin&senha=1234',
      metodo: 'POST',
      corpo: 'usuario=admin&senha=1234',
      regras: [{ seletor: '.w3-panel.w3-green', texto: 'Bem-vindo, admin!' }, { naoContem: 'inválidos' }],
    },
    {
      descricao: 'POST usuario=admin&senha=errada',
      metodo: 'POST',
      corpo: 'usuario=admin&senha=errada',
      regras: [{ seletor: '.w3-panel.w3-red', texto: 'Usuário ou senha inválidos' }, { naoContem: 'Bem-vindo' }],
    },
    {
      descricao: 'POST vazio',
      metodo: 'POST',
      corpo: 'usuario=&senha=',
      oculto: true,
      regras: [{ seletor: '.w3-panel.w3-red', texto: 'inválidos' }, { semErros: true }],
    },
    {
      descricao: 'POST usuario=Admin&senha=1234',
      metodo: 'POST',
      corpo: 'usuario=Admin&senha=1234',
      oculto: true,
      regras: [{ seletor: '.w3-panel.w3-red', msg: 'A comparação do usuário deve ser exata' }],
    },
  ],
};

export const moduloPhp = {
  id: 'php',
  titulo: 'PHP',
  icone: '🐘',
  descricao: 'A lógica no servidor: variáveis, condições, laços, arrays, funções e formulários.',
  itens: [
    licao('ola-mundo'),
    licao('variaveis'),
    exercicio('ex-apresentacao'),
    media,
    licao('condicionais'),
    exercicio('ex-par-impar'),
    licao('lacos'),
    exercicio('ex-tabuada'),
    fizzbuzz,
    licao('arrays'),
    exercicio('ex-lista-compras'),
    licao('funcoes'),
    desconto,
    licao('produtos'),
    exercicio('ex-cards'),
    licao('formulario-get'),
    exercicio('ex-saudacao'),
    licao('formulario-post'),
    login,
    licao('include'),
  ],
};
