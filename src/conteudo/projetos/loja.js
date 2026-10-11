import { php } from '../util.js';
import { criarProjeto } from './base.js';

const ESTRUTURA = `
CREATE TABLE categorias (
  id   INTEGER PRIMARY KEY,
  nome TEXT NOT NULL
);

CREATE TABLE produtos (
  id           INTEGER PRIMARY KEY,
  nome         TEXT NOT NULL,
  categoria_id INTEGER NOT NULL REFERENCES categorias(id),
  preco        REAL NOT NULL,
  estoque      INTEGER NOT NULL
);

CREATE TABLE pedidos (
  id        INTEGER PRIMARY KEY,
  cliente   TEXT NOT NULL,
  total     REAL NOT NULL,
  criado_em TEXT NOT NULL
);

CREATE TABLE itens_pedido (
  pedido_id      INTEGER NOT NULL REFERENCES pedidos(id),
  produto_id     INTEGER NOT NULL REFERENCES produtos(id),
  quantidade     INTEGER NOT NULL,
  preco_unitario REAL NOT NULL
);
`;

const BANCO = `${ESTRUTURA}
INSERT INTO categorias (id, nome) VALUES (1, 'Periféricos'), (2, 'Monitores'), (3, 'Áudio');

INSERT INTO produtos (id, nome, categoria_id, preco, estoque) VALUES
  (1, 'Teclado mecânico', 1, 199.90, 10),
  (2, 'Mouse sem fio',    1,  79.90,  0),
  (3, 'Monitor 24"',      2, 899.00,  3),
  (4, 'Headset gamer',    3, 229.50,  5),
  (5, 'Caixa de som',     3, 149.00,  8),
  (6, 'Webcam HD',        1, 189.00,  2);

INSERT INTO pedidos (id, cliente, total, criado_em) VALUES
  (1, 'Ana',   1098.90, '2026-05-01 10:00'),
  (2, 'Bruno',  608.00, '2026-05-02 15:00');

INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES
  (1, 1, 1, 199.90), (1, 3, 1, 899.00),
  (2, 4, 2, 229.50), (2, 5, 1, 149.00);
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO categorias (id, nome) VALUES (1, 'Livros');
INSERT INTO produtos (id, nome, categoria_id, preco, estoque) VALUES
  (1, 'Livro de PHP', 1, 59.90, 4),
  (2, 'Livro de SQL', 1, 49.90, 0);
`;

const comprar = (id) => ({ url: '/carrinho_adicionar.php', metodo: 'POST', corpo: `produto_id=${id}` });

// ---------- arquivos iniciais ----------

const conexao = php`<?php
session_start();

$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

function e(?string $texto): string {
    return htmlspecialchars($texto ?? '');
}

// 1234.5 vira 'R$ 1.234,50'.
function preco(float $valor): string {
    return 'R$ ' . number_format($valor, 2, ',', '.');
}
`;

const topo = (links) => php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Loja da Turma</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<div class="w3-bar w3-teal">
  <a href="index.php" class="w3-bar-item w3-button">🛍️ Loja da Turma</a>
${links}</div>
<main class="w3-container w3-padding" style="max-width:1000px;margin:auto">
`;

const linkCarrinhoSimples = '  <a href="carrinho.php" class="w3-bar-item w3-button w3-right">🛒 Carrinho</a>\n';
const linkCarrinhoContador = php`  <a href="carrinho.php" class="link-carrinho w3-bar-item w3-button w3-right">🛒 Carrinho (<?= array_sum($_SESSION['carrinho'] ?? []) ?>)</a>
`;
const linkAdmin = '  <a href="admin.php" class="w3-bar-item w3-button w3-right">📊 Admin</a>\n';

const rodape = php`</main>
</body>
</html>
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
// Etapa 1: busque os produtos
?>
<?php include 'topo.php'; ?>
<h2>Produtos</h2>
<div class="w3-row-padding">
  <!-- um card por produto -->
</div>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': conexao,
  'topo.php': topo(linkCarrinhoSimples),
  'rodape.php': rodape,
};

// ---------- index (catálogo) ----------

const consultaSimples = php`$produtos = $pdo->query('SELECT * FROM produtos ORDER BY id')->fetchAll();
`;

const consultaFiltros = php`$categorias = $pdo->query('SELECT * FROM categorias ORDER BY nome')->fetchAll();

// Monta o WHERE só com os filtros que vieram na URL.
$condicoes = [];
$parametros = [];
if (!empty($_GET['categoria'])) {
    $condicoes[] = 'categoria_id = ?';
    $parametros[] = (int) $_GET['categoria'];
}
$q = trim($_GET['q'] ?? '');
if ($q !== '') {
    $condicoes[] = 'nome LIKE ?';
    $parametros[] = '%' . $q . '%';
}
$sql = 'SELECT * FROM produtos';
if ($condicoes) {
    $sql .= ' WHERE ' . implode(' AND ', $condicoes);
}
$stmt = $pdo->prepare($sql . ' ORDER BY id');
$stmt->execute($parametros);
$produtos = $stmt->fetchAll();
`;

const barraFiltros = php`<div class="w3-bar w3-white w3-margin-bottom">
  <a class="w3-bar-item w3-button" href="index.php">Todas</a>
  <?php foreach ($categorias as $c): ?>
    <a class="categoria w3-bar-item w3-button" href="?categoria=<?= $c['id'] ?>"><?= e($c['nome']) ?></a>
  <?php endforeach; ?>
  <form class="w3-bar-item w3-right" style="padding:4px">
    <input class="w3-input w3-border w3-small" name="q" value="<?= e($q) ?>" placeholder="Buscar produto">
  </form>
</div>
<?php if (!$produtos): ?>
  <p class="w3-panel w3-pale-yellow">Nenhum produto encontrado.</p>
<?php endif; ?>
`;

const botaoComprar = php`        <?php if ($p['estoque'] > 0): ?>
          <form method="post" action="carrinho_adicionar.php">
            <input type="hidden" name="produto_id" value="<?= $p['id'] ?>">
            <button class="comprar w3-button w3-teal w3-block w3-margin-bottom">Adicionar ao carrinho</button>
          </form>
        <?php endif; ?>
`;

const montarIndex = ({ consulta = consultaSimples, filtros = '', compra = '' } = {}) => php`<?php
require 'conexao.php';
${consulta}?>
<?php include 'topo.php'; ?>
<h2>Produtos</h2>
${filtros}<div class="w3-row-padding">
  <?php foreach ($produtos as $p): ?>
    <div class="w3-third w3-margin-bottom">
      <div class="produto w3-card w3-white w3-container" id="produto-<?= $p['id'] ?>">
        <h3><?= e($p['nome']) ?></h3>
        <p class="preco w3-xlarge w3-text-teal"><?= preco($p['preco']) ?></p>
        <p class="estoque w3-small">Estoque: <?= $p['estoque'] ?></p>
        <?php if ($p['estoque'] == 0): ?>
          <p><span class="w3-tag w3-red">Esgotado</span></p>
        <?php endif; ?>
${compra}      </div>
    </div>
  <?php endforeach; ?>
</div>
<?php include 'rodape.php'; ?>
`;

// ---------- carrinho ----------

const carregarCarrinho = php`<?php
require 'conexao.php';

// O carrinho fica na sessão: [produto_id => quantidade].
$carrinho = $_SESSION['carrinho'] ?? [];
$itens = [];
$total = 0;
if ($carrinho) {
    $marcadores = implode(',', array_fill(0, count($carrinho), '?'));
    $stmt = $pdo->prepare("SELECT * FROM produtos WHERE id IN ($marcadores) ORDER BY nome");
    $stmt->execute(array_keys($carrinho));
    foreach ($stmt->fetchAll() as $p) {
        $p['quantidade'] = $carrinho[$p['id']];
        $p['subtotal'] = $p['preco'] * $p['quantidade'];
        $total += $p['subtotal'];
        $itens[] = $p;
    }
}
?>`;

const qtdTexto = php`<td class="quantidade"><?= $i['quantidade'] ?></td>`;
const qtdForm = php`<td class="quantidade">
          <form method="post" action="carrinho_atualizar.php" class="w3-bar">
            <input type="hidden" name="produto_id" value="<?= $i['id'] ?>">
            <input class="w3-input w3-border w3-bar-item" type="number" min="0" name="quantidade" value="<?= $i['quantidade'] ?>" style="width:80px">
            <button class="w3-button w3-bar-item w3-small">OK</button>
          </form>
        </td>`;
const colunaRemover = php`
        <td><a class="remover w3-button w3-small w3-red" href="carrinho_remover.php?id=<?= $i['id'] ?>">Remover</a></td>`;

const avisos = php`<?php if (($_GET['erro'] ?? '') === 'cliente'): ?>
  <div class="w3-panel w3-pale-red"><p>Informe seu nome para finalizar.</p></div>
<?php elseif (($_GET['erro'] ?? '') === 'estoque'): ?>
  <div class="w3-panel w3-pale-red"><p>Estoque insuficiente para algum produto.</p></div>
<?php endif; ?>
`;

const formFinalizar = php`
  <form method="post" action="finalizar.php" class="w3-card w3-white w3-padding w3-margin-top" style="max-width:420px">
    <input class="w3-input w3-border" name="cliente" placeholder="Seu nome">
    <button class="finalizar w3-button w3-teal w3-margin-top">Finalizar compra</button>
  </form>`;

const montarCarrinho = ({ quantidade = qtdTexto, remover = '', cabecalhoExtra = '', topoAvisos = '', finalizar = '' } = {}) => php`${carregarCarrinho}
<?php include 'topo.php'; ?>
<h2>Carrinho</h2>
${topoAvisos}<?php if (!$itens): ?>
  <p class="w3-panel w3-pale-yellow">Seu carrinho está vazio.</p>
<?php else: ?>
  <table class="w3-table-all">
    <tr class="w3-teal"><th>Produto</th><th>Qtd.</th><th>Subtotal</th>${cabecalhoExtra}</tr>
    <?php foreach ($itens as $i): ?>
      <tr class="item" id="item-<?= $i['id'] ?>">
        <td><?= e($i['nome']) ?></td>
        ${quantidade}
        <td class="subtotal"><?= preco($i['subtotal']) ?></td>${remover}
      </tr>
    <?php endforeach; ?>
  </table>
  <p class="total w3-large">Total: <?= preco($total) ?></p>${finalizar}
<?php endif; ?>
<p><a href="index.php">← Continuar comprando</a></p>
<?php include 'rodape.php'; ?>
`;

const adicionar = php`<?php
require 'conexao.php';

$id = (int) ($_POST['produto_id'] ?? 0);
$stmt = $pdo->prepare('SELECT estoque FROM produtos WHERE id = ?');
$stmt->execute([$id]);
$estoque = $stmt->fetchColumn();

// Só adiciona se o produto existe e ainda há estoque para mais um.
$noCarrinho = $_SESSION['carrinho'][$id] ?? 0;
if ($estoque !== false && $noCarrinho < $estoque) {
    $_SESSION['carrinho'][$id] = $noCarrinho + 1;
}
header('Location: carrinho.php');
exit;
`;

const atualizar = php`<?php
require 'conexao.php';

$id = (int) ($_POST['produto_id'] ?? 0);
$quantidade = (int) ($_POST['quantidade'] ?? 0);

if (isset($_SESSION['carrinho'][$id])) {
    if ($quantidade <= 0) {
        unset($_SESSION['carrinho'][$id]);
    } else {
        $stmt = $pdo->prepare('SELECT estoque FROM produtos WHERE id = ?');
        $stmt->execute([$id]);
        $_SESSION['carrinho'][$id] = min($quantidade, (int) $stmt->fetchColumn());
    }
}
header('Location: carrinho.php');
exit;
`;

const remover = php`<?php
require 'conexao.php';

unset($_SESSION['carrinho'][(int) ($_GET['id'] ?? 0)]);
header('Location: carrinho.php');
exit;
`;

// ---------- checkout ----------

const finalizar = php`<?php
require 'conexao.php';

$carrinho = $_SESSION['carrinho'] ?? [];
$cliente = trim($_POST['cliente'] ?? '');
if (!$carrinho) {
    header('Location: carrinho.php');
    exit;
}
if ($cliente === '') {
    header('Location: carrinho.php?erro=cliente');
    exit;
}

// Transação: ou grava o pedido inteiro (pedido, itens e estoque), ou nada.
$pdo->beginTransaction();
try {
    $total = 0;
    $itens = [];
    foreach ($carrinho as $id => $quantidade) {
        $stmt = $pdo->prepare('SELECT * FROM produtos WHERE id = ?');
        $stmt->execute([$id]);
        $produto = $stmt->fetch();
        if (!$produto || $produto['estoque'] < $quantidade) {
            throw new Exception('Estoque insuficiente');
        }
        $total += $produto['preco'] * $quantidade;
        $itens[] = [$id, $quantidade, $produto['preco']];
    }

    $stmt = $pdo->prepare('INSERT INTO pedidos (cliente, total, criado_em) VALUES (?, ?, ?)');
    $stmt->execute([$cliente, $total, date('Y-m-d H:i')]);
    $pedidoId = $pdo->lastInsertId();

    $inserirItem = $pdo->prepare('INSERT INTO itens_pedido (pedido_id, produto_id, quantidade, preco_unitario) VALUES (?, ?, ?, ?)');
    $baixarEstoque = $pdo->prepare('UPDATE produtos SET estoque = estoque - ? WHERE id = ?');
    foreach ($itens as [$id, $quantidade, $precoUnitario]) {
        $inserirItem->execute([$pedidoId, $id, $quantidade, $precoUnitario]);
        $baixarEstoque->execute([$quantidade, $id]);
    }
    $pdo->commit();
} catch (Exception $erro) {
    $pdo->rollBack();
    header('Location: carrinho.php?erro=estoque');
    exit;
}

unset($_SESSION['carrinho']);
header('Location: pedido.php?id=' . $pedidoId);
exit;
`;

const pedido = php`<?php
require 'conexao.php';

$stmt = $pdo->prepare('SELECT * FROM pedidos WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
$pedido = $stmt->fetch();
if ($pedido) {
    $stmt = $pdo->prepare(
        'SELECT itens_pedido.*, produtos.nome
         FROM itens_pedido JOIN produtos ON produtos.id = itens_pedido.produto_id
         WHERE pedido_id = ?'
    );
    $stmt->execute([$pedido['id']]);
    $itens = $stmt->fetchAll();
}
?>
<?php include 'topo.php'; ?>
<?php if (!$pedido): ?>
  <div class="w3-panel w3-pale-red"><p>Pedido não encontrado</p></div>
<?php else: ?>
  <h2>Pedido #<?= $pedido['id'] ?> confirmado</h2>
  <p>Cliente: <?= e($pedido['cliente']) ?></p>
  <table class="w3-table-all">
    <tr class="w3-teal"><th>Produto</th><th>Qtd.</th><th>Preço</th></tr>
    <?php foreach ($itens as $i): ?>
      <tr class="item"><td><?= e($i['nome']) ?></td><td><?= $i['quantidade'] ?></td><td><?= preco($i['preco_unitario']) ?></td></tr>
    <?php endforeach; ?>
  </table>
  <p class="total w3-large">Total: <?= preco($pedido['total']) ?></p>
<?php endif; ?>
<p><a href="index.php">← Voltar à loja</a></p>
<?php include 'rodape.php'; ?>
`;

// ---------- relatório ----------

const admin = php`<?php
require 'conexao.php';

$faturamento = $pdo->query('SELECT COALESCE(SUM(total), 0) FROM pedidos')->fetchColumn();

$maisVendidos = $pdo->query(
    'SELECT produtos.nome, SUM(itens_pedido.quantidade) AS vendidos
     FROM itens_pedido JOIN produtos ON produtos.id = itens_pedido.produto_id
     GROUP BY produtos.id
     ORDER BY vendidos DESC, produtos.nome
     LIMIT 5'
)->fetchAll();

$pedidos = $pdo->query('SELECT * FROM pedidos ORDER BY id DESC')->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Relatório de vendas</h2>
<p class="faturamento w3-xlarge">Faturamento: <?= preco($faturamento) ?></p>

<div class="w3-row-padding">
  <div class="w3-half">
    <h3>Mais vendidos</h3>
    <table class="mais-vendidos w3-table-all">
      <thead><tr class="w3-teal"><th>Produto</th><th>Vendidos</th></tr></thead>
      <tbody>
      <?php foreach ($maisVendidos as $m): ?>
        <tr><td><?= e($m['nome']) ?></td><td><?= $m['vendidos'] ?></td></tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
  <div class="w3-half">
    <h3>Pedidos</h3>
    <table class="pedidos w3-table-all">
      <thead><tr class="w3-teal"><th>#</th><th>Cliente</th><th>Total</th></tr></thead>
      <tbody>
      <?php foreach ($pedidos as $p): ?>
        <tr><td><?= $p['id'] ?></td><td><?= e($p['cliente']) ?></td><td><?= preco($p['total']) ?></td></tr>
      <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php include 'rodape.php'; ?>
`;

export const projetoLoja = criarProjeto({
  id: 'loja',
  titulo: 'Loja virtual',
  icone: '🛍️',
  descricao: 'Catálogo, busca, carrinho na sessão, checkout com transação e relatório de vendas.',
  banco: BANCO,
  resumo: `
    <p>Você vai construir a <b>Loja da Turma</b>: catálogo com filtros, carrinho de compras guardado na
    <b>sessão</b>, finalização do pedido e um relatório de vendas.</p>
    <h2>O que você vai praticar</h2>
    <ul>
      <li>montar consultas com filtros opcionais (<code>WHERE</code> dinâmico, mas sempre com <code>prepare</code>);</li>
      <li>guardar estruturas em <code>$_SESSION</code> (o carrinho é um array <code>[produto_id =&gt; quantidade]</code>);</li>
      <li><code>IN (?, ?, ?)</code> com quantidade variável de marcadores;</li>
      <li><b>transações</b> (<code>beginTransaction</code>, <code>commit</code>, <code>rollBack</code>): o pedido é gravado inteiro ou não é gravado;</li>
      <li>relatórios com <code>SUM</code>, <code>GROUP BY</code> e <code>ORDER BY</code>.</li>
    </ul>`,
  inicial,
  etapas: [
    {
      titulo: 'Catálogo de produtos',
      dificuldade: 'facil',
      enunciado: `
        <p>Mostre os produtos numa grade <code>w3-row-padding</code> com colunas <code>w3-third</code>. Cada produto é um
        <code>&lt;div class="produto w3-card" id="produto-ID"&gt;</code> com:</p>
        <ul>
          <li>o nome num <code>&lt;h3&gt;</code>;</li>
          <li><code>&lt;p class="preco"&gt;</code> com o preço formatado (<b>R$ 199,90</b>, use <code>preco()</code>);</li>
          <li><code>&lt;p class="estoque"&gt;</code> com <b>Estoque: 10</b>;</li>
          <li>sem estoque, uma <code>&lt;span class="w3-tag"&gt;</code> <b>Esgotado</b>.</li>
        </ul>`,
      dica: 'A função preco() está em conexao.php: preco(1234.5) devolve R$ 1.234,50.',
      alteracoes: { 'index.php': montarIndex() },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: '.w3-third .produto', igual: 6, msg: 'Mostre os 6 produtos, cada um num w3-third' },
            { seletor: '#produto-1 .preco', texto: 'R$ 199,90' },
            { seletor: '#produto-3 .preco', texto: 'R$ 899,00' },
            { seletor: '#produto-1 .estoque', texto: 'Estoque: 10' },
            { seletor: '#produto-2 .w3-tag', texto: 'Esgotado' },
            { seletor: '.w3-tag', igual: 1, msg: 'Só o produto sem estoque mostra Esgotado' },
            { semErros: true },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALTERNATIVO,
          oculto: true,
          regras: [{ seletor: '.produto', igual: 2 }, { seletor: '#produto-2 .w3-tag', texto: 'Esgotado' }, { seletor: '#produto-1 .preco', texto: 'R$ 59,90' }],
        },
      ],
    },
    {
      titulo: 'Categorias e busca',
      dificuldade: 'medio',
      enunciado: `
        <p>Acima da grade, coloque:</p>
        <ul>
          <li>um link <code>&lt;a class="categoria"&gt;</code> para cada categoria, com <code>href="?categoria=ID"</code>;</li>
          <li>um formulário GET com o campo <code>q</code> para buscar pelo nome (<code>LIKE</code>).</li>
        </ul>
        <p>Os dois filtros podem ser usados <b>juntos</b> (<code>?categoria=1&amp;q=mo</code>). Sem resultado:
        <b>Nenhum produto encontrado.</b></p>`,
      dica: 'Junte as condições num array e use implode(\' AND \', $condicoes). Os valores vão no execute().',
      alteracoes: { 'index.php': montarIndex({ consulta: consultaFiltros, filtros: barraFiltros }) },
      testes: [
        { descricao: 'index.php', regras: [{ seletor: 'a.categoria', igual: 3 }, { seletor: 'a.categoria[href="?categoria=3"]' }, { seletor: 'form input[name="q"]' }] },
        { descricao: '?categoria=3', url: '/index.php?categoria=3', regras: [{ seletor: '.produto', igual: 2 }, { seletor: '#produto-4' }] },
        { descricao: '?q=mo', url: '/index.php?q=mo', regras: [{ seletor: '.produto', igual: 2 }, { seletor: '#produto-2' }, { seletor: '#produto-3' }] },
        { descricao: '?categoria=1&q=mo', url: '/index.php?categoria=1&q=mo', regras: [{ seletor: '.produto', igual: 1 }, { seletor: '#produto-2' }] },
        { descricao: '?categoria=99', url: '/index.php?categoria=99', oculto: true, regras: [{ seletor: '.produto', igual: 0 }, { contem: 'Nenhum produto encontrado.' }] },
        { descricao: "?q='", url: '/index.php?q=%27', oculto: true, regras: [{ seletor: '.produto', igual: 0 }, { semErros: true }] },
      ],
    },
    {
      titulo: 'Carrinho de compras',
      dificuldade: 'medio',
      enunciado: `
        <p>Em cada produto <b>com estoque</b>, um formulário <code>method="post"</code> para
        <code>carrinho_adicionar.php</code> (campo oculto <code>produto_id</code>) com um
        <code>&lt;button class="comprar"&gt;</code>.</p>
        <p>O <code>carrinho_adicionar.php</code> soma 1 em <code>$_SESSION['carrinho'][$id]</code> (sem passar do estoque) e vai para
        <code>carrinho.php</code>, que mostra:</p>
        <ul>
          <li>cada item numa <code>&lt;tr class="item" id="item-ID"&gt;</code> com <code>&lt;td class="quantidade"&gt;</code> e
            <code>&lt;td class="subtotal"&gt;</code>;</li>
          <li><code>&lt;p class="total"&gt;</code> com <b>Total: R$ 429,40</b>;</li>
          <li>carrinho vazio: <b>Seu carrinho está vazio.</b></li>
        </ul>
        <p>No topo, o link <code>&lt;a class="link-carrinho"&gt;</code> mostra <b>Carrinho (2)</b> (total de unidades).</p>`,
      dica: "Para buscar vários ids: \"... WHERE id IN ($marcadores)\" com $marcadores = implode(',', array_fill(0, count($carrinho), '?')).",
      alteracoes: {
        'index.php': montarIndex({ consulta: consultaFiltros, filtros: barraFiltros, compra: botaoComprar }),
        'topo.php': topo(linkCarrinhoContador),
        'carrinho.php': montarCarrinho(),
        'carrinho_adicionar.php': adicionar,
      },
      testes: [
        { descricao: 'index.php', regras: [{ seletor: '.produto button.comprar', igual: 5, msg: 'Só os 5 produtos com estoque têm o botão' }] },
        { descricao: 'carrinho vazio', url: '/carrinho.php', regras: [{ contem: 'Seu carrinho está vazio.' }] },
        {
          descricao: 'comprar teclado e headset',
          passos: [comprar(1), { ...comprar(4), regras: [
            { seletor: 'tr.item', igual: 2 },
            { seletor: '#item-4 .subtotal', texto: 'R$ 229,50' },
            { seletor: 'p.total', texto: 'Total: R$ 429,40' },
          ] }],
        },
        {
          descricao: 'dois teclados',
          passos: [comprar(1), { ...comprar(1), regras: [{ seletor: '#item-1 .quantidade', texto: '2' }, { seletor: 'p.total', texto: 'Total: R$ 399,80' }] },
            { url: '/index.php', regras: [{ seletor: 'a.link-carrinho', texto: 'Carrinho (2)' }] }],
        },
        { descricao: 'produto esgotado', oculto: true, passos: [{ ...comprar(2), regras: [{ contem: 'Seu carrinho está vazio.' }] }] },
        { descricao: 'produto inexistente', oculto: true, passos: [{ ...comprar(999), regras: [{ contem: 'Seu carrinho está vazio.' }, { semErros: true }] }] },
        {
          descricao: 'mais que o estoque',
          oculto: true,
          passos: [comprar(6), comprar(6), { ...comprar(6), regras: [{ seletor: '#item-6 .quantidade', texto: '2', msg: 'A Webcam só tem 2 em estoque' }] }],
        },
      ],
    },
    {
      titulo: 'Alterar quantidade e remover',
      dificuldade: 'medio',
      enunciado: `
        <p>No carrinho, troque a quantidade por um formulário <code>method="post"</code> para
        <code>carrinho_atualizar.php</code> (campos <code>produto_id</code> e <code>quantidade</code> do tipo number) e
        coloque em cada item um link <code>&lt;a class="remover"&gt;</code> para <code>carrinho_remover.php?id=ID</code>.</p>
        <ul>
          <li>Quantidade 0 ou menos remove o item.</li>
          <li>A quantidade nunca passa do estoque.</li>
        </ul>`,
      dica: 'min($quantidade, $estoque) limita ao estoque; unset($_SESSION[\'carrinho\'][$id]) remove.',
      alteracoes: {
        'carrinho.php': montarCarrinho({ quantidade: qtdForm, remover: colunaRemover, cabecalhoExtra: '<th></th>' }),
        'carrinho_atualizar.php': atualizar,
        'carrinho_remover.php': remover,
      },
      testes: [
        {
          descricao: 'remover o teclado',
          passos: [comprar(1), comprar(4), { url: '/carrinho_remover.php?id=1', regras: [{ seletor: 'tr.item', igual: 1 }, { seletor: '#item-4' }] }],
        },
        {
          descricao: 'mudar para 3 teclados',
          passos: [comprar(1), { url: '/carrinho_atualizar.php', metodo: 'POST', corpo: 'produto_id=1&quantidade=3', regras: [
            { seletor: '#item-1 input[name="quantidade"][value="3"]' },
            { seletor: 'p.total', texto: 'Total: R$ 599,70' },
            { seletor: '#item-1 a.remover[href="carrinho_remover.php?id=1"]' },
          ] }],
        },
        {
          descricao: 'quantidade acima do estoque',
          passos: [comprar(3), { url: '/carrinho_atualizar.php', metodo: 'POST', corpo: 'produto_id=3&quantidade=10', regras: [{ seletor: '#item-3 input[name="quantidade"][value="3"]', msg: 'O Monitor só tem 3 em estoque' }] }],
        },
        {
          descricao: 'quantidade zero',
          oculto: true,
          passos: [comprar(1), { url: '/carrinho_atualizar.php', metodo: 'POST', corpo: 'produto_id=1&quantidade=0', regras: [{ contem: 'Seu carrinho está vazio.' }] }],
        },
      ],
    },
    {
      titulo: 'Finalizar compra (transação)',
      dificuldade: 'dificil',
      enunciado: `
        <p>No carrinho (com itens), um formulário <code>method="post"</code> para <code>finalizar.php</code> com o campo
        <code>cliente</code>. O <code>finalizar.php</code>:</p>
        <ul>
          <li>sem nome: volta para <code>carrinho.php?erro=cliente</code>, que mostra <b>Informe seu nome para finalizar.</b>;</li>
          <li>numa <b>transação</b>: confere o estoque, grava o pedido e os itens e baixa o estoque;</li>
          <li>esvazia o carrinho e vai para <code>pedido.php?id=ID</code>.</li>
        </ul>
        <p>O <code>pedido.php</code> mostra <code>&lt;h2&gt;</code> <b>Pedido #3 confirmado</b>, os itens em
        <code>&lt;tr class="item"&gt;</code> e o <code>&lt;p class="total"&gt;</code>.</p>`,
      dica: 'Se algo falhar no meio, $pdo->rollBack() desfaz tudo o que foi feito desde o beginTransaction().',
      alteracoes: {
        'carrinho.php': montarCarrinho({ quantidade: qtdForm, remover: colunaRemover, cabecalhoExtra: '<th></th>', topoAvisos: avisos, finalizar: formFinalizar }),
        'finalizar.php': finalizar,
        'pedido.php': pedido,
      },
      testes: [
        {
          descricao: 'Caio compra teclado e headset',
          passos: [
            comprar(1),
            { ...comprar(4), regras: [{ seletor: 'form[action="finalizar.php"][method="post" i] input[name="cliente"]' }] },
            { url: '/finalizar.php', metodo: 'POST', corpo: 'cliente=Caio', regras: [
              { seletor: 'h2', texto: 'Pedido #3 confirmado' },
              { seletor: 'tr.item', igual: 2 },
              { seletor: 'p.total', texto: 'Total: R$ 429,40' },
            ] },
            { url: '/carrinho.php', regras: [{ contem: 'Seu carrinho está vazio.' }] },
            { url: '/index.php', regras: [{ seletor: '#produto-1 .estoque', texto: 'Estoque: 9' }, { seletor: '#produto-4 .estoque', texto: 'Estoque: 4' }] },
          ],
        },
        {
          descricao: 'sem nome do cliente',
          passos: [comprar(1), { url: '/finalizar.php', metodo: 'POST', corpo: 'cliente=', regras: [
            { contem: 'Informe seu nome para finalizar.' },
            { seletor: 'tr.item', igual: 1, msg: 'O carrinho continua com os itens' },
          ] }],
        },
        {
          regras: [
            { codigo: 'beginTransaction\\s*\\(', msg: 'Use $pdo->beginTransaction()' },
            { codigo: 'commit\\s*\\(', msg: 'Confirme com $pdo->commit()' },
          ],
        },
        {
          descricao: 'finalizar sem carrinho',
          oculto: true,
          passos: [{ url: '/finalizar.php', metodo: 'POST', corpo: 'cliente=Caio' }, { url: '/pedido.php?id=3', regras: [{ contem: 'Pedido não encontrado' }] }],
        },
      ],
    },
    {
      titulo: 'Relatório de vendas',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie <code>admin.php</code> (com link <b>Admin</b> no topo) mostrando:</p>
        <ul>
          <li><code>&lt;p class="faturamento"&gt;</code> com a soma de todos os pedidos: <b>Faturamento: R$ 1.706,90</b>;</li>
          <li><code>&lt;table class="mais-vendidos"&gt;</code>: produtos e unidades vendidas, do mais vendido para o menos
            (empate: ordem alfabética), dentro de <code>&lt;tbody&gt;</code>;</li>
          <li><code>&lt;table class="pedidos"&gt;</code>: os pedidos, do mais recente para o mais antigo, dentro de <code>&lt;tbody&gt;</code>.</li>
        </ul>`,
      dica: 'COALESCE(SUM(total), 0) devolve 0 quando ainda não há pedidos.',
      alteracoes: { 'admin.php': admin, 'topo.php': topo(linkCarrinhoContador + linkAdmin) },
      testes: [
        {
          descricao: 'admin.php',
          url: '/admin.php',
          regras: [
            { seletor: 'p.faturamento', texto: 'Faturamento: R$ 1.706,90' },
            { seletor: '.mais-vendidos tbody tr', igual: 4 },
            { seletor: '.mais-vendidos tbody tr:first-child', texto: 'Headset gamer' },
            { seletor: '.pedidos tbody tr', igual: 2 },
            { seletor: '.pedidos tbody tr:first-child', texto: 'Bruno' },
            { seletor: 'a[href="admin.php"]', msg: 'Coloque o link Admin no topo' },
          ],
        },
        {
          descricao: 'depois de vender 3 teclados',
          passos: [comprar(1), comprar(1), comprar(1), { url: '/finalizar.php', metodo: 'POST', corpo: 'cliente=Davi' }, { url: '/admin.php', regras: [
            { seletor: '.mais-vendidos tbody tr:first-child', texto: 'Teclado mecânico' },
            { seletor: 'p.faturamento', texto: 'R$ 2.306,60' },
            { seletor: '.pedidos tbody tr:first-child', texto: 'Davi' },
          ] }],
        },
        {
          descricao: 'loja sem pedidos',
          url: '/admin.php',
          banco: ALTERNATIVO,
          oculto: true,
          regras: [{ seletor: 'p.faturamento', texto: 'Faturamento: R$ 0,00' }, { seletor: '.mais-vendidos tbody tr', igual: 0 }, { semErros: true }],
        },
      ],
    },
  ],
});
