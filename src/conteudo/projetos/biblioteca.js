import { php } from '../util.js';
import { criarProjeto } from './base.js';

const ESTRUTURA = `
CREATE TABLE livros (
  id         INTEGER PRIMARY KEY,
  titulo     TEXT NOT NULL,
  autor      TEXT NOT NULL,
  ano        INTEGER NOT NULL,
  exemplares INTEGER NOT NULL
);

CREATE TABLE alunos (
  id    INTEGER PRIMARY KEY,
  nome  TEXT NOT NULL,
  turma TEXT NOT NULL
);

-- data_devolucao fica NULL enquanto o livro não volta
CREATE TABLE emprestimos (
  id              INTEGER PRIMARY KEY,
  livro_id        INTEGER NOT NULL REFERENCES livros(id),
  aluno_id        INTEGER NOT NULL REFERENCES alunos(id),
  data_emprestimo TEXT NOT NULL,
  data_prevista   TEXT NOT NULL,
  data_devolucao  TEXT
);
`;

const BANCO = `${ESTRUTURA}
INSERT INTO livros (id, titulo, autor, ano, exemplares) VALUES
  (1, 'Dom Casmurro',      'Machado de Assis',  1899, 2),
  (2, 'O Cortiço',         'Aluísio Azevedo',   1890, 1),
  (3, 'Vidas Secas',       'Graciliano Ramos',  1938, 3),
  (4, 'Capitães da Areia', 'Jorge Amado',       1937, 1),
  (5, 'A Hora da Estrela', 'Clarice Lispector', 1977, 2);

INSERT INTO alunos (id, nome, turma) VALUES
  (1, 'Ana Souza',  '2º A'),
  (2, 'Bruno Lima', '2º A'),
  (3, 'Carla Dias', '3º B');

INSERT INTO emprestimos (id, livro_id, aluno_id, data_emprestimo, data_prevista, data_devolucao) VALUES
  (1, 1, 1, '2026-04-01', '2026-04-08', '2026-04-07'),
  (2, 2, 2, '2026-04-05', '2026-04-12', NULL),
  (3, 3, 1, '2026-04-10', '2026-04-17', NULL),
  (4, 4, 3, '2026-03-20', '2026-03-27', '2026-04-02'),
  (5, 1, 3, '2026-04-14', '2026-04-21', NULL);
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO livros (id, titulo, autor, ano, exemplares) VALUES (1, 'Livro A', 'Autor X', 2000, 1);
INSERT INTO alunos (id, nome, turma) VALUES (1, 'Zeca Prado', '1º A');
INSERT INTO emprestimos (id, livro_id, aluno_id, data_emprestimo, data_prevista, data_devolucao) VALUES
  (1, 1, 1, '2026-04-01', '2026-04-08', NULL);
`;

// ---------- arquivos iniciais ----------

const conexao = php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

// "Hoje" fixo para os testes darem sempre o mesmo resultado.
// Num sistema de verdade seria: const HOJE = date('Y-m-d');
const HOJE = '2026-04-15';

function e(?string $texto): string {
    return htmlspecialchars($texto ?? '');
}

// '2026-04-15' vira '15/04/2026'.
function dataBr(?string $data): string {
    return $data ? date('d/m/Y', strtotime($data)) : '';
}

// Dias entre duas datas (positivo quando $depois vem depois de $antes).
function diasEntre(string $antes, string $depois): int {
    return (int) round((strtotime($depois) - strtotime($antes)) / 86400);
}
`;

const topo = php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Biblioteca da Escola</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<div class="w3-bar w3-brown">
  <a href="index.php" class="w3-bar-item w3-button">📚 Biblioteca</a>
  <a href="index.php" class="w3-bar-item w3-button">Acervo</a>
  <a href="emprestimos.php" class="w3-bar-item w3-button">Empréstimos</a>
  <a href="emprestar.php" class="w3-bar-item w3-button">Novo empréstimo</a>
  <span class="w3-bar-item w3-right w3-small">Hoje: <?= dataBr(HOJE) ?></span>
</div>
<main class="w3-container w3-padding" style="max-width:1000px;margin:auto">
`;

const rodape = php`</main>
</body>
</html>
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
// Etapa 1: busque os livros com a quantidade disponível
?>
<?php include 'topo.php'; ?>
<h2>Acervo</h2>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': conexao,
  'topo.php': topo,
  'rodape.php': rodape,
};

// ---------- etapas 1 e 2: acervo e busca ----------

const SQL_ACERVO = (where) => `SELECT livros.*, livros.exemplares - COUNT(emprestimos.id) AS disponiveis
     FROM livros
     LEFT JOIN emprestimos ON emprestimos.livro_id = livros.id AND emprestimos.data_devolucao IS NULL
${where}     GROUP BY livros.id
     ORDER BY livros.titulo`;

const tabelaAcervo = php`<table class="acervo w3-table-all w3-hoverable">
  <thead><tr class="w3-brown"><th>Título</th><th>Autor</th><th>Ano</th><th>Disponíveis</th></tr></thead>
  <tbody>
  <?php foreach ($livros as $l): ?>
    <tr id="livro-<?= $l['id'] ?>">
      <td><?= e($l['titulo']) ?></td>
      <td><?= e($l['autor']) ?></td>
      <td><?= $l['ano'] ?></td>
      <td class="disponiveis">
        <?= $l['disponiveis'] ?> de <?= $l['exemplares'] ?>
        <?php if ($l['disponiveis'] == 0): ?><span class="w3-tag w3-red w3-small">Indisponível</span><?php endif; ?>
      </td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>`;

const index1 = php`<?php
require 'conexao.php';

// Disponíveis = exemplares menos os empréstimos ainda não devolvidos.
$livros = $pdo->query(
    '${SQL_ACERVO('')}'
)->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Acervo</h2>
${tabelaAcervo}
<?php include 'rodape.php'; ?>
`;

const index2 = php`<?php
require 'conexao.php';

$q = trim($_GET['q'] ?? '');
$stmt = $pdo->prepare(
    '${SQL_ACERVO('     WHERE livros.titulo LIKE :q OR livros.autor LIKE :q\n')}'
);
$stmt->execute(['q' => '%' . $q . '%']);
$livros = $stmt->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Acervo</h2>
<form class="w3-margin-bottom">
  <input class="w3-input w3-border" name="q" value="<?= e($q) ?>" placeholder="Buscar por título ou autor">
</form>
<?php if (!$livros): ?>
  <p class="w3-panel w3-pale-yellow">Nenhum livro encontrado.</p>
<?php else: ?>
${tabelaAcervo}
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 3: emprestar ----------

const emprestar = php`<?php
require 'conexao.php';

function disponiveis(PDO $pdo, int $livroId): int {
    $stmt = $pdo->prepare(
        'SELECT livros.exemplares - COUNT(emprestimos.id)
         FROM livros
         LEFT JOIN emprestimos ON emprestimos.livro_id = livros.id AND emprestimos.data_devolucao IS NULL
         WHERE livros.id = ?
         GROUP BY livros.id'
    );
    $stmt->execute([$livroId]);
    return (int) $stmt->fetchColumn();
}

$erro = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $livroId = (int) ($_POST['livro_id'] ?? 0);
    $alunoId = (int) ($_POST['aluno_id'] ?? 0);

    $stmt = $pdo->prepare('SELECT id FROM alunos WHERE id = ?');
    $stmt->execute([$alunoId]);

    if (!$stmt->fetchColumn()) {
        $erro = 'Aluno não encontrado.';
    } elseif (disponiveis($pdo, $livroId) <= 0) {
        $erro = 'Livro indisponível.';
    } else {
        $prevista = date('Y-m-d', strtotime(HOJE . ' +7 days'));
        $stmt = $pdo->prepare(
            'INSERT INTO emprestimos (livro_id, aluno_id, data_emprestimo, data_prevista) VALUES (?, ?, ?, ?)'
        );
        $stmt->execute([$livroId, $alunoId, HOJE, $prevista]);
        header('Location: emprestimos.php');
        exit;
    }
}

$livros = array_filter(
    $pdo->query('SELECT * FROM livros ORDER BY titulo')->fetchAll(),
    fn ($l) => disponiveis($pdo, $l['id']) > 0
);
$alunos = $pdo->query('SELECT * FROM alunos ORDER BY nome')->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Novo empréstimo</h2>
<?php if ($erro): ?>
  <div class="w3-panel w3-pale-red"><p><?= e($erro) ?></p></div>
<?php endif; ?>
<form method="post" class="w3-card w3-white w3-padding" style="max-width:480px">
  <label>Livro</label>
  <select class="w3-select w3-border" name="livro_id">
    <?php foreach ($livros as $l): ?>
      <option value="<?= $l['id'] ?>"><?= e($l['titulo']) ?></option>
    <?php endforeach; ?>
  </select>
  <label>Aluno</label>
  <select class="w3-select w3-border" name="aluno_id">
    <?php foreach ($alunos as $a): ?>
      <option value="<?= $a['id'] ?>"><?= e($a['nome']) ?> (<?= e($a['turma']) ?>)</option>
    <?php endforeach; ?>
  </select>
  <p class="w3-small">Devolução prevista: 7 dias.</p>
  <button class="w3-button w3-brown">Emprestar</button>
</form>
<?php include 'rodape.php'; ?>
`;

const consultaAbertos = php`$emprestimos = $pdo->query(
    'SELECT emprestimos.*, livros.titulo, alunos.nome AS aluno
     FROM emprestimos
     JOIN livros ON livros.id = emprestimos.livro_id
     JOIN alunos ON alunos.id = emprestimos.aluno_id
     WHERE emprestimos.data_devolucao IS NULL
     ORDER BY emprestimos.data_prevista'
)->fetchAll();`;

const emprestimos3 = php`<?php
require 'conexao.php';
${consultaAbertos}
?>
<?php include 'topo.php'; ?>
<h2>Empréstimos em aberto</h2>
<table class="emprestimos w3-table-all">
  <thead><tr class="w3-brown"><th>Livro</th><th>Aluno</th><th>Devolver até</th></tr></thead>
  <tbody>
  <?php foreach ($emprestimos as $em): ?>
    <tr id="emprestimo-<?= $em['id'] ?>">
      <td><?= e($em['titulo']) ?></td>
      <td><?= e($em['aluno']) ?></td>
      <td class="prevista"><?= dataBr($em['data_prevista']) ?></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 4: devolver e atrasos ----------

const emprestimos4 = (linkAluno = false) => php`<?php
require 'conexao.php';
${consultaAbertos}
?>
<?php include 'topo.php'; ?>
<h2>Empréstimos em aberto</h2>
<table class="emprestimos w3-table-all">
  <thead><tr class="w3-brown"><th>Livro</th><th>Aluno</th><th>Devolver até</th><th>Situação</th><th></th></tr></thead>
  <tbody>
  <?php foreach ($emprestimos as $em): ?>
    <?php $atraso = diasEntre($em['data_prevista'], HOJE); ?>
    <tr id="emprestimo-<?= $em['id'] ?>" class="<?= $atraso > 0 ? 'atrasado w3-pale-red' : '' ?>">
      <td><?= e($em['titulo']) ?></td>
      <td>${linkAluno ? `<a href="aluno.php?id=<?= $em['aluno_id'] ?>"><?= e($em['aluno']) ?></a>` : `<?= e($em['aluno']) ?>`}</td>
      <td class="prevista"><?= dataBr($em['data_prevista']) ?></td>
      <td class="situacao"><?= $atraso > 0 ? $atraso . ($atraso === 1 ? ' dia' : ' dias') . ' de atraso' : 'No prazo' ?></td>
      <td><a class="devolver w3-button w3-small w3-brown" href="devolver.php?id=<?= $em['id'] ?>">Devolver</a></td>
    </tr>
  <?php endforeach; ?>
  </tbody>
</table>
<?php include 'rodape.php'; ?>
`;

const devolver = php`<?php
require 'conexao.php';

$stmt = $pdo->prepare('UPDATE emprestimos SET data_devolucao = ? WHERE id = ? AND data_devolucao IS NULL');
$stmt->execute([HOJE, (int) ($_GET['id'] ?? 0)]);
header('Location: emprestimos.php');
exit;
`;

// ---------- etapa 5: ficha do aluno ----------

const aluno = php`<?php
require 'conexao.php';

const MULTA_POR_DIA = 0.50;

$stmt = $pdo->prepare('SELECT * FROM alunos WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
$aluno = $stmt->fetch();

$historico = [];
$diasDeAtraso = 0;
if ($aluno) {
    $stmt = $pdo->prepare(
        'SELECT emprestimos.*, livros.titulo
         FROM emprestimos JOIN livros ON livros.id = emprestimos.livro_id
         WHERE aluno_id = ?
         ORDER BY data_emprestimo'
    );
    $stmt->execute([$aluno['id']]);
    foreach ($stmt->fetchAll() as $em) {
        // Devolvido: atraso até a devolução. Em aberto: atraso até hoje.
        $fim = $em['data_devolucao'] ?? HOJE;
        $em['atraso'] = max(0, diasEntre($em['data_prevista'], $fim));
        $diasDeAtraso += $em['atraso'];
        $historico[] = $em;
    }
}
$multa = $diasDeAtraso * MULTA_POR_DIA;
?>
<?php include 'topo.php'; ?>
<?php if (!$aluno): ?>
  <div class="w3-panel w3-pale-red"><p>Aluno não encontrado</p></div>
<?php else: ?>
  <h1><?= e($aluno['nome']) ?></h1>
  <p>Turma: <?= e($aluno['turma']) ?></p>
  <table class="historico w3-table-all">
    <thead><tr class="w3-brown"><th>Livro</th><th>Emprestado</th><th>Devolução</th><th>Atraso</th></tr></thead>
    <tbody>
    <?php foreach ($historico as $em): ?>
      <tr>
        <td><?= e($em['titulo']) ?></td>
        <td><?= dataBr($em['data_emprestimo']) ?></td>
        <td><?= $em['data_devolucao'] ? dataBr($em['data_devolucao']) : 'Em aberto' ?></td>
        <td class="atraso"><?= $em['atraso'] ?> dia(s)</td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>
  <p class="multa w3-large">Multa: R$ <?= number_format($multa, 2, ',', '.') ?></p>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

export const projetoBiblioteca = criarProjeto({
  id: 'biblioteca',
  titulo: 'Biblioteca escolar',
  icone: '📚',
  descricao: 'Acervo, empréstimos, devoluções, atrasos e multas: muitos JOINs e datas.',
  banco: BANCO,
  resumo: `
    <p>Você vai construir o sistema da <b>Biblioteca da Escola</b>: acervo com exemplares disponíveis,
    empréstimos, devoluções, controle de atrasos e a ficha de cada aluno com a multa.</p>
    <h2>O que você vai praticar</h2>
    <ul>
      <li><code>LEFT JOIN</code> com condição extra e <code>COUNT</code> para calcular disponibilidade;</li>
      <li><code>NULL</code> como "ainda não aconteceu" (<code>data_devolucao IS NULL</code>);</li>
      <li>datas com <code>strtotime()</code> e <code>date()</code>: prazo de 7 dias, dias de atraso;</li>
      <li>regras de negócio: não emprestar livro sem exemplar, multa por dia de atraso.</li>
    </ul>
    <p>Para os testes darem sempre o mesmo resultado, <b>hoje</b> é fixo em <code>15/04/2026</code>
    (constante <code>HOJE</code> em <code>conexao.php</code>).</p>`,
  inicial,
  etapas: [
    {
      titulo: 'Acervo com disponibilidade',
      dificuldade: 'facil',
      enunciado: `
        <p>No <code>index.php</code>, mostre os livros em ordem de título numa <code>&lt;table class="acervo"&gt;</code>,
        com uma linha <code>&lt;tr id="livro-ID"&gt;</code> por livro dentro do <code>&lt;tbody&gt;</code>.</p>
        <p>A célula <code>&lt;td class="disponiveis"&gt;</code> mostra <b>1 de 2</b>: exemplares menos empréstimos
        <b>não devolvidos</b>. Sem nenhum disponível, inclua a <code>&lt;span class="w3-tag"&gt;</code> <b>Indisponível</b>.</p>`,
      dica: 'LEFT JOIN emprestimos ON emprestimos.livro_id = livros.id AND emprestimos.data_devolucao IS NULL, depois GROUP BY livros.id.',
      alteracoes: { 'index.php': index1 },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: 'table.acervo tbody tr', igual: 5 },
            { seletor: 'table.acervo tbody tr:first-child', texto: 'A Hora da Estrela' },
            { seletor: '#livro-1 .disponiveis', texto: '1 de 2' },
            { seletor: '#livro-3 .disponiveis', texto: '2 de 3' },
            { seletor: '#livro-2 .disponiveis', texto: '0 de 1' },
            { seletor: '#livro-2 .w3-tag', texto: 'Indisponível' },
            { seletor: '.w3-tag', igual: 1 },
            { semErros: true },
          ],
        },
        { descricao: 'outro banco', banco: ALTERNATIVO, oculto: true, regras: [{ seletor: '#livro-1 .disponiveis', texto: '0 de 1' }] },
      ],
    },
    {
      titulo: 'Buscar livros',
      dificuldade: 'facil',
      enunciado: `
        <p>Acima da tabela, um formulário GET com o campo <code>q</code>. A busca procura no <b>título</b> e no
        <b>autor</b>. Sem resultados: <b>Nenhum livro encontrado.</b></p>`,
      dica: "WHERE livros.titulo LIKE :q OR livros.autor LIKE :q, antes do GROUP BY. Com q vazio, '%%' traz tudo.",
      alteracoes: { 'index.php': index2 },
      testes: [
        { descricao: '?q=machado', url: '/index.php?q=machado', regras: [{ seletor: 'table.acervo tbody tr', igual: 1 }, { seletor: '#livro-1' }] },
        { descricao: '?q=da', url: '/index.php?q=da', regras: [{ seletor: 'table.acervo tbody tr', igual: 3 }, { seletor: '#livro-3' }, { seletor: '#livro-4' }, { seletor: '#livro-5' }] },
        { descricao: 'index.php', regras: [{ seletor: 'form input[name="q"]' }, { seletor: 'table.acervo tbody tr', igual: 5 }] },
        { descricao: '?q=zzz', url: '/index.php?q=zzz', oculto: true, regras: [{ contem: 'Nenhum livro encontrado.' }] },
        { descricao: "?q='", url: '/index.php?q=%27', oculto: true, regras: [{ semErros: true }] },
      ],
    },
    {
      titulo: 'Novo empréstimo',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie <code>emprestar.php</code> com um formulário <code>method="post"</code>:</p>
        <ul>
          <li><code>&lt;select name="livro_id"&gt;</code> só com os livros <b>disponíveis</b>;</li>
          <li><code>&lt;select name="aluno_id"&gt;</code> com todos os alunos.</li>
        </ul>
        <p>Ao enviar, grave o empréstimo com data de hoje (<code>HOJE</code>) e devolução prevista para <b>7 dias</b> depois,
        e vá para <code>emprestimos.php</code>. Recuse com <b>Livro indisponível.</b> ou <b>Aluno não encontrado.</b></p>
        <p>O <code>emprestimos.php</code> lista os empréstimos <b>em aberto</b> numa <code>&lt;table class="emprestimos"&gt;</code>,
        com <code>&lt;tr id="emprestimo-ID"&gt;</code> e a data prevista em <code>&lt;td class="prevista"&gt;</code>.</p>`,
      dica: "date('Y-m-d', strtotime(HOJE . ' +7 days')) calcula a data prevista.",
      alteracoes: { 'emprestar.php': emprestar, 'emprestimos.php': emprestimos3 },
      testes: [
        {
          descricao: 'emprestar.php',
          url: '/emprestar.php',
          regras: [
            { seletor: 'form[method="post" i] select[name="livro_id"] option', igual: 4, msg: 'O Cortiço está indisponível e não pode aparecer' },
            { seletor: 'select[name="aluno_id"] option', igual: 3 },
          ],
        },
        {
          descricao: 'emprestar Capitães da Areia para a Ana',
          passos: [
            { url: '/emprestar.php', metodo: 'POST', corpo: 'livro_id=4&aluno_id=1', regras: [
              { seletor: 'table.emprestimos tbody tr', igual: 4 },
              { seletor: '#emprestimo-6 .prevista', texto: '22/04/2026' },
            ] },
            { url: '/index.php', regras: [{ seletor: '#livro-4 .disponiveis', texto: '0 de 1' }] },
          ],
        },
        {
          descricao: 'livro indisponível',
          passos: [{ url: '/emprestar.php', metodo: 'POST', corpo: 'livro_id=2&aluno_id=1', regras: [{ contem: 'Livro indisponível.' }] },
            { url: '/emprestimos.php', regras: [{ seletor: 'table.emprestimos tbody tr', igual: 3 }] }],
        },
        {
          descricao: 'aluno inexistente',
          oculto: true,
          passos: [{ url: '/emprestar.php', metodo: 'POST', corpo: 'livro_id=3&aluno_id=99', regras: [{ contem: 'Aluno não encontrado.' }, { semErros: true }] }],
        },
      ],
    },
    {
      titulo: 'Devoluções e atrasos',
      dificuldade: 'medio',
      enunciado: `
        <p>No <code>emprestimos.php</code>, acrescente:</p>
        <ul>
          <li><code>&lt;td class="situacao"&gt;</code>: <b>3 dias de atraso</b> (ou <b>1 dia de atraso</b>) quando a data prevista
            já passou, senão <b>No prazo</b>; linhas atrasadas com a classe <code>atrasado</code>;</li>
          <li>um link <code>&lt;a class="devolver"&gt;</code> para <code>devolver.php?id=ID</code>.</li>
        </ul>
        <p>O <code>devolver.php</code> grava a data de devolução (<code>HOJE</code>) e volta para a lista.</p>`,
      dica: 'A função diasEntre($prevista, HOJE) de conexao.php dá os dias de atraso.',
      alteracoes: { 'emprestimos.php': emprestimos4(), 'devolver.php': devolver },
      testes: [
        {
          descricao: 'emprestimos.php',
          url: '/emprestimos.php',
          regras: [
            { seletor: 'tr.atrasado', igual: 1 },
            { seletor: 'tr.atrasado#emprestimo-2', msg: 'O empréstimo do Bruno está atrasado' },
            { seletor: '#emprestimo-2 .situacao', texto: '3 dias de atraso' },
            { seletor: '#emprestimo-3 .situacao', texto: 'No prazo' },
            { seletor: 'a.devolver[href="devolver.php?id=2"]' },
          ],
        },
        {
          descricao: 'devolver O Cortiço',
          passos: [
            { url: '/devolver.php?id=2', regras: [{ seletor: 'table.emprestimos tbody tr', igual: 2 }, { seletor: 'tr.atrasado', igual: 0 }] },
            { url: '/index.php', regras: [{ seletor: '#livro-2 .disponiveis', texto: '1 de 1' }] },
          ],
        },
        { descricao: 'outro banco', url: '/emprestimos.php', banco: ALTERNATIVO, oculto: true, regras: [{ seletor: '#emprestimo-1 .situacao', texto: '7 dias de atraso' }] },
      ],
    },
    {
      titulo: 'Ficha do aluno e multa',
      dificuldade: 'dificil',
      enunciado: `
        <p>Crie <code>aluno.php?id=ID</code> com o nome num <code>&lt;h1&gt;</code>, a turma e o histórico de empréstimos
        numa <code>&lt;table class="historico"&gt;</code> (linhas no <code>&lt;tbody&gt;</code>).</p>
        <p>Calcule a <b>multa</b>: R$ 0,50 por dia de atraso, somando:</p>
        <ul>
          <li>livros devolvidos com atraso (dias entre a data prevista e a devolução);</li>
          <li>livros em aberto e atrasados (dias entre a data prevista e hoje).</li>
        </ul>
        <p>Mostre <code>&lt;p class="multa"&gt;</code> com <b>Multa: R$ 3,00</b>. No <code>emprestimos.php</code>, o nome do aluno vira
        um link para <code>aluno.php?id=ID</code>. Aluno inexistente: <b>Aluno não encontrado</b>.</p>`,
      dica: "max(0, diasEntre($prevista, $devolucao ?? HOJE)) nunca deixa o atraso negativo.",
      alteracoes: { 'aluno.php': aluno, 'emprestimos.php': emprestimos4(true) },
      testes: [
        {
          descricao: 'aluno.php?id=3 (Carla)',
          url: '/aluno.php?id=3',
          regras: [
            { seletor: 'h1', texto: 'Carla Dias' },
            { seletor: 'table.historico tbody tr', igual: 2 },
            { seletor: 'p.multa', texto: 'Multa: R$ 3,00' },
          ],
        },
        { descricao: 'aluno.php?id=2 (Bruno)', url: '/aluno.php?id=2', regras: [{ seletor: 'p.multa', texto: 'Multa: R$ 1,50' }] },
        { descricao: 'aluno.php?id=1 (Ana)', url: '/aluno.php?id=1', regras: [{ seletor: 'p.multa', texto: 'Multa: R$ 0,00' }] },
        { descricao: 'emprestimos.php', url: '/emprestimos.php', regras: [{ seletor: 'a[href="aluno.php?id=2"]', msg: 'O nome do aluno deve levar à ficha' }] },
        { descricao: 'outro banco', url: '/aluno.php?id=1', banco: ALTERNATIVO, oculto: true, regras: [{ seletor: 'p.multa', texto: 'Multa: R$ 3,50' }] },
        { descricao: 'aluno.php?id=99', url: '/aluno.php?id=99', oculto: true, regras: [{ contem: 'Aluno não encontrado' }, { semErros: true }] },
      ],
    },
  ],
});
