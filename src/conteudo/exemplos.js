// Lições do módulo PHP (veja php.js). Cada lição é um conjunto de arquivos;
// o primeiro é o que o navegador pede (index.php).
// String.raw preserva as barras invertidas do PHP; evite escrever "${" no PHP.

export const W3 = '<link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">';

const php = String.raw;

export const exemplos = [
  {
    tipo: 'licao',
    id: 'ola-mundo',
    titulo: 'Olá, mundo',
    resumo: 'O PHP roda no servidor e devolve HTML. Compare as abas "Resultado" e "HTML gerado".',
    arquivos: {
      'index.php': php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Olá, mundo</title>
  ${W3}
</head>
<body class="w3-container">

  <h1 class="w3-text-indigo">Olá, mundo!</h1>

  <?php
    // Tudo dentro deste bloco PHP é executado no servidor.
    echo "<p>Este parágrafo foi escrito pelo PHP.</p>";
  ?>

  <p>Hoje é <?= date('d/m/Y') ?> e agora são <?= date('H:i') ?>.</p>

</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'variaveis',
    titulo: 'Variáveis e tipos',
    resumo: 'Variáveis começam com $. Aspas duplas interpolam variáveis; o ponto (.) concatena textos.',
    arquivos: {
      'index.php': php`<?php
$nome    = "Maria";      // string
$idade   = 17;           // int
$altura  = 1.65;         // float
$aprovada = true;        // bool
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Variáveis</h2>

  <p>Aspas duplas: <?= "Olá, $nome!" ?></p>
  <p>Concatenação: <?= 'Olá, ' . $nome . '!' ?></p>
  <p>Daqui a 5 anos <?= $nome ?> terá <?= $idade + 5 ?> anos.</p>

  <h3>Que tipo é cada variável?</h3>
  <pre class="w3-code"><?php
    var_dump($nome);
    var_dump($idade);
    var_dump($altura);
    var_dump($aprovada);
  ?></pre>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'condicionais',
    titulo: 'if / elseif / else',
    resumo: 'Mude o valor de $nota e veja a cor e a mensagem mudarem.',
    arquivos: {
      'index.php': php`<?php
$nota = 7.5;

if ($nota >= 7) {
    $situacao = 'Aprovado';
    $cor = 'w3-green';
} elseif ($nota >= 5) {
    $situacao = 'Recuperação';
    $cor = 'w3-amber';
} else {
    $situacao = 'Reprovado';
    $cor = 'w3-red';
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Boletim</h2>
  <div class="w3-panel <?= $cor ?> w3-round-large">
    <p>Nota: <strong><?= $nota ?></strong></p>
    <p>Situação: <strong><?= $situacao ?></strong></p>
  </div>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'lacos',
    titulo: 'Laços (for e while)',
    resumo: 'O laço for gera as linhas da tabela. Troque $numero para ver outra tabuada.',
    arquivos: {
      'index.php': php`<?php $numero = 7; ?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Tabuada do <?= $numero ?></h2>

  <table class="w3-table w3-striped w3-bordered w3-card">
    <tr class="w3-blue"><th>Conta</th><th>Resultado</th></tr>
    <?php for ($i = 1; $i <= 10; $i++): ?>
      <tr>
        <td><?= $numero ?> x <?= $i ?></td>
        <td><?= $numero * $i ?></td>
      </tr>
    <?php endfor; ?>
  </table>

  <h3>Contagem regressiva com while</h3>
  <p>
  <?php
    $n = 5;
    while ($n > 0) {
        echo "<span class='w3-tag w3-round w3-teal'>$n</span> ";
        $n--;
    }
  ?>
  🚀
  </p>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'arrays',
    titulo: 'Arrays e foreach',
    resumo: 'Arrays guardam listas. foreach percorre cada item. Arrays associativos usam chaves de texto.',
    arquivos: {
      'index.php': php`<?php
$frutas = ['Maçã', 'Banana', 'Uva', 'Manga'];

$aluno = [
    'nome'  => 'João',
    'curso' => 'Informática',
    'turma' => '2º A',
];
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Lista simples (<?= count($frutas) ?> frutas)</h2>
  <ul class="w3-ul w3-border w3-hoverable" style="max-width:300px">
    <?php foreach ($frutas as $fruta): ?>
      <li><?= $fruta ?></li>
    <?php endforeach; ?>
  </ul>

  <h2>Array associativo</h2>
  <table class="w3-table w3-bordered" style="max-width:400px">
    <?php foreach ($aluno as $campo => $valor): ?>
      <tr><th><?= ucfirst($campo) ?></th><td><?= $valor ?></td></tr>
    <?php endforeach; ?>
  </table>

  <p>A primeira fruta é <b><?= $frutas[0] ?></b> e o curso é <b><?= $aluno['curso'] ?></b>.</p>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'funcoes',
    titulo: 'Funções',
    resumo: 'Funções evitam repetir código. Recebem parâmetros e devolvem um valor com return.',
    arquivos: {
      'index.php': php`<?php
function formatarPreco(float $valor): string {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}

function media(array $notas): float {
    return array_sum($notas) / count($notas);
}

function saudacao(string $nome, string $periodo = 'dia'): string {
    return "Bom $periodo, $nome!";
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Funções</h2>
  <p><?= saudacao('Ana') ?></p>
  <p><?= saudacao('Carlos', 'noite') ?></p>
  <p>Preço: <?= formatarPreco(1234.5) ?></p>
  <p>Média de [8, 6.5, 9]: <?= number_format(media([8, 6.5, 9]), 1, ',', '') ?></p>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'formulario-get',
    titulo: 'Formulário com GET',
    resumo: 'Preencha e envie: os dados vão na URL (veja a barra de endereço) e chegam em $_GET.',
    arquivos: {
      'index.php': php`<?php
$nome  = $_GET['nome']  ?? '';
$idade = $_GET['idade'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Formulário GET</h2>

  <form method="get" class="w3-card w3-padding" style="max-width:400px">
    <label>Nome</label>
    <input class="w3-input w3-border" name="nome" value="<?= htmlspecialchars($nome) ?>">
    <label>Idade</label>
    <input class="w3-input w3-border" name="idade" type="number" value="<?= htmlspecialchars($idade) ?>">
    <button class="w3-button w3-blue w3-margin-top">Enviar</button>
  </form>

  <?php if ($nome !== ''): ?>
    <div class="w3-panel w3-pale-green w3-leftbar w3-border-green">
      <p>Olá, <b><?= htmlspecialchars($nome) ?></b>!
      <?php if ($idade !== ''): ?>
        Você <?= $idade >= 18 ? 'é maior' : 'é menor' ?> de idade.
      <?php endif; ?>
      </p>
    </div>
  <?php endif; ?>

  <p class="w3-small w3-text-grey">Dica: htmlspecialchars() impede que alguém injete HTML pelo formulário.</p>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'formulario-post',
    titulo: 'Formulário com POST e validação',
    resumo: 'Com POST os dados não aparecem na URL. O PHP valida os campos e mostra os erros.',
    arquivos: {
      'index.php': php`<?php
$erros = [];
$enviado = $_SERVER['REQUEST_METHOD'] === 'POST';

if ($enviado) {
    $email    = trim($_POST['email'] ?? '');
    $mensagem = trim($_POST['mensagem'] ?? '');
    $assuntos = $_POST['assuntos'] ?? [];

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erros[] = 'Informe um e-mail válido.';
    }
    if (strlen($mensagem) < 10) {
        $erros[] = 'A mensagem precisa ter pelo menos 10 caracteres.';
    }
    if (count($assuntos) === 0) {
        $erros[] = 'Escolha pelo menos um assunto.';
    }
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  ${W3}
</head>
<body class="w3-container">
  <h2>Fale conosco</h2>

  <?php if ($enviado && count($erros) === 0): ?>
    <div class="w3-panel w3-green w3-round">
      <p>Mensagem recebida! Assuntos: <?= htmlspecialchars(implode(', ', $assuntos)) ?>.</p>
    </div>
  <?php endif; ?>

  <?php foreach ($erros as $erro): ?>
    <div class="w3-panel w3-pale-red w3-leftbar w3-border-red"><p><?= $erro ?></p></div>
  <?php endforeach; ?>

  <form method="post" class="w3-card w3-padding" style="max-width:450px">
    <label>E-mail</label>
    <input class="w3-input w3-border" name="email" value="<?= htmlspecialchars($_POST['email'] ?? '') ?>">

    <p>Assuntos:</p>
    <label><input class="w3-check" type="checkbox" name="assuntos[]" value="Dúvida"> Dúvida</label>
    <label><input class="w3-check" type="checkbox" name="assuntos[]" value="Sugestão"> Sugestão</label>
    <label><input class="w3-check" type="checkbox" name="assuntos[]" value="Elogio"> Elogio</label>

    <p><label>Mensagem</label>
    <textarea class="w3-input w3-border" name="mensagem" rows="3"><?= htmlspecialchars($_POST['mensagem'] ?? '') ?></textarea></p>

    <button class="w3-button w3-indigo">Enviar</button>
  </form>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'produtos',
    titulo: 'PHP + W3.CSS: vitrine de produtos',
    resumo: 'Juntando tudo: um array de produtos vira cards W3.CSS gerados por um foreach.',
    arquivos: {
      'index.php': php`<?php
$produtos = [
    ['nome' => 'Teclado',  'preco' => 149.90, 'estoque' => 12],
    ['nome' => 'Mouse',    'preco' => 79.90,  'estoque' => 0],
    ['nome' => 'Monitor',  'preco' => 899.00, 'estoque' => 3],
    ['nome' => 'Headset',  'preco' => 229.50, 'estoque' => 7],
    ['nome' => 'Webcam',   'preco' => 189.00, 'estoque' => 1],
    ['nome' => 'Pendrive', 'preco' => 39.90,  'estoque' => 40],
];

function preco(float $valor): string {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  ${W3}
</head>
<body class="w3-light-grey">
  <div class="w3-container w3-teal"><h2>Loja da Turma</h2></div>

  <div class="w3-row-padding w3-margin-top">
    <?php foreach ($produtos as $p): ?>
      <div class="w3-third w3-margin-bottom">
        <div class="w3-card w3-white w3-container">
          <h3><?= $p['nome'] ?></h3>
          <p class="w3-xlarge w3-text-teal"><?= preco($p['preco']) ?></p>
          <?php if ($p['estoque'] === 0): ?>
            <p><span class="w3-tag w3-red">Esgotado</span></p>
          <?php elseif ($p['estoque'] < 5): ?>
            <p><span class="w3-tag w3-amber">Últimas <?= $p['estoque'] ?> unidades</span></p>
          <?php else: ?>
            <p><span class="w3-tag w3-green">Em estoque</span></p>
          <?php endif; ?>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</body>
</html>
`,
    },
  },
  {
    tipo: 'licao',
    id: 'include',
    titulo: 'include: reaproveitando partes',
    resumo: 'Cabeçalho e rodapé ficam em arquivos próprios (veja as abas acima do editor) e são incluídos com include.',
    arquivos: {
      'index.php': php`<?php
$titulo = 'Página inicial';
include 'cabecalho.php';
?>

<div class="w3-container">
  <p>Este conteúdo é exclusivo da página inicial.</p>
  <p>O cabeçalho e o rodapé vieram de outros arquivos.</p>
</div>

<?php include 'rodape.php'; ?>
`,
      'cabecalho.php': php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title><?= $titulo ?></title>
  ${W3}
</head>
<body>
<header class="w3-container w3-purple">
  <h1><?= $titulo ?></h1>
</header>
`,
      'rodape.php': php`<footer class="w3-container w3-light-grey w3-margin-top">
  <p>© <?= date('Y') ?> Minha Escola</p>
</footer>
</body>
</html>
`,
    },
  },
];
