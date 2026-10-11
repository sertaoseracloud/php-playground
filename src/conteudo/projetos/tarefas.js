import { php } from '../util.js';
import { criarProjeto } from './base.js';

const ESTRUTURA = `
CREATE TABLE tarefas (
  id        INTEGER PRIMARY KEY,
  titulo    TEXT NOT NULL,
  concluida INTEGER NOT NULL DEFAULT 0
);
`;

const BANCO = `${ESTRUTURA}
INSERT INTO tarefas (titulo, concluida) VALUES
  ('Estudar HTML', 1),
  ('Fazer exercícios de PHP', 0),
  ('Revisar PDO', 0);
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO tarefas (titulo, concluida) VALUES
  ('Comprar pão', 0),
  ('Ler livro', 1);
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
// Etapa 1: busque as tarefas aqui
?>
<?php include 'topo.php'; ?>
<ul class="w3-ul w3-card w3-white">
  <!-- uma <li> por tarefa -->
</ul>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': php`<?php
// Conexão com o banco. No playground o arquivo do banco é /banco/escola.sqlite;
// num servidor seria algo como new PDO('mysql:host=localhost;dbname=tarefas', ...).
$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
`,
  'topo.php': php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Minhas tarefas</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<header class="w3-container w3-teal"><h1>✅ Minhas tarefas</h1></header>
<main class="w3-container w3-padding" style="max-width:720px">
`,
  'rodape.php': php`</main>
</body>
</html>
`,
};

// ---------- código de cada etapa ----------

const index1 = php`<?php
require 'conexao.php';
$tarefas = $pdo->query('SELECT * FROM tarefas ORDER BY id')->fetchAll();
?>
<?php include 'topo.php'; ?>
<ul class="w3-ul w3-card w3-white">
<?php foreach ($tarefas as $t): ?>
  <?php if ($t['concluida']): ?>
    <li class="concluida w3-text-grey"><s><?= htmlspecialchars($t['titulo']) ?></s></li>
  <?php else: ?>
    <li><?= htmlspecialchars($t['titulo']) ?></li>
  <?php endif; ?>
<?php endforeach; ?>
</ul>
<?php include 'rodape.php'; ?>
`;

const formAdicionar = `<form method="post" action="adicionar.php" class="w3-bar w3-margin-bottom">
  <input class="w3-input w3-border w3-bar-item" style="width:70%" name="titulo" placeholder="Nova tarefa" required>
  <button class="w3-button w3-teal w3-bar-item">Adicionar</button>
</form>
`;

const index2 = index1.replace('<ul class="w3-ul', `${formAdicionar}<ul class="w3-ul`);

const adicionar = php`<?php
require 'conexao.php';

$titulo = trim($_POST['titulo'] ?? '');
if ($titulo !== '') {
    $stmt = $pdo->prepare('INSERT INTO tarefas (titulo) VALUES (?)');
    $stmt->execute([$titulo]);
}
header('Location: index.php');
exit;
`;

const index3 = index2.replace(
  `    <li><?= htmlspecialchars($t['titulo']) ?></li>`,
  `    <li>
      <?= htmlspecialchars($t['titulo']) ?>
      <a class="concluir w3-button w3-small w3-green w3-right" href="concluir.php?id=<?= $t['id'] ?>">Concluir</a>
    </li>`,
);

const concluir = php`<?php
require 'conexao.php';

$stmt = $pdo->prepare('UPDATE tarefas SET concluida = 1 WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
header('Location: index.php');
exit;
`;

const index4 = php`<?php
require 'conexao.php';
$tarefas = $pdo->query('SELECT * FROM tarefas ORDER BY id')->fetchAll();
?>
<?php include 'topo.php'; ?>
${formAdicionar}<ul class="w3-ul w3-card w3-white">
<?php foreach ($tarefas as $t): ?>
  <li class="<?= $t['concluida'] ? 'concluida w3-text-grey' : '' ?>">
    <?php if ($t['concluida']): ?>
      <s><?= htmlspecialchars($t['titulo']) ?></s>
    <?php else: ?>
      <?= htmlspecialchars($t['titulo']) ?>
      <a class="concluir w3-button w3-small w3-green" href="concluir.php?id=<?= $t['id'] ?>">Concluir</a>
    <?php endif; ?>
    <a class="excluir w3-button w3-small w3-red w3-right" href="excluir.php?id=<?= $t['id'] ?>"
       onclick="return confirm('Excluir esta tarefa?')">Excluir</a>
  </li>
<?php endforeach; ?>
</ul>
<?php include 'rodape.php'; ?>
`;

const excluir = php`<?php
require 'conexao.php';

$stmt = $pdo->prepare('DELETE FROM tarefas WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
header('Location: index.php');
exit;
`;

const index5 = index4
  .replace(
    `$tarefas = $pdo->query('SELECT * FROM tarefas ORDER BY id')->fetchAll();`,
    `$tarefas = $pdo->query('SELECT * FROM tarefas ORDER BY id')->fetchAll();
$pendentes = count(array_filter($tarefas, fn ($t) => !$t['concluida']));`,
  )
  .replace(
    `${formAdicionar}<ul`,
    `<p class="contador">Pendentes: <?= $pendentes ?> de <?= count($tarefas) ?></p>
${formAdicionar}<ul`,
  )
  .replace(
    `    <a class="excluir`,
    `    <a class="editar w3-button w3-small w3-blue" href="editar.php?id=<?= $t['id'] ?>">Editar</a>
    <a class="excluir`,
  );

const editar = php`<?php
require 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = trim($_POST['titulo'] ?? '');
    if ($titulo !== '') {
        $stmt = $pdo->prepare('UPDATE tarefas SET titulo = ? WHERE id = ?');
        $stmt->execute([$titulo, (int) $_POST['id']]);
    }
    header('Location: index.php');
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM tarefas WHERE id = ?');
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
$tarefa = $stmt->fetch();
?>
<?php include 'topo.php'; ?>
<?php if (!$tarefa): ?>
  <div class="w3-panel w3-pale-red"><p>Tarefa não encontrada</p></div>
<?php else: ?>
  <h2>Editar tarefa</h2>
  <form method="post" class="w3-card w3-white w3-padding">
    <input type="hidden" name="id" value="<?= $tarefa['id'] ?>">
    <input class="w3-input w3-border" name="titulo" value="<?= htmlspecialchars($tarefa['titulo']) ?>" required>
    <button class="w3-button w3-blue w3-margin-top">Salvar</button>
    <a class="w3-button w3-margin-top" href="index.php">Cancelar</a>
  </form>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

export const projetoTarefas = criarProjeto({
  id: 'tarefas',
  titulo: 'Lista de tarefas (CRUD)',
  icone: '✅',
  descricao: 'O CRUD completo: criar, listar, concluir, editar e excluir. O melhor primeiro projeto.',
  banco: BANCO,
  resumo: `
    <p>Neste projeto você constrói uma <b>lista de tarefas</b> completa, o famoso <b>CRUD</b>:
    <b>C</b>reate (criar), <b>R</b>ead (ler), <b>U</b>pdate (atualizar) e <b>D</b>elete (excluir).</p>
    <h2>Como funciona</h2>
    <ul>
      <li>São <b>5 etapas</b>. Cada uma acrescenta uma funcionalidade.</li>
      <li>O código de uma etapa é o ponto de partida da próxima.</li>
      <li>O projeto já tem vários arquivos: <code>conexao.php</code> (banco), <code>topo.php</code> e
        <code>rodape.php</code> (layout), incluídos com <code>require</code>/<code>include</code>.</li>
      <li>No preview, os cliques em links e formulários <b>mantêm o banco</b>: o que você cadastrar
        continua lá até clicar em ▶ Executar de novo.</li>
    </ul>
    <p>Veja a tabela <code>tarefas</code> na aba 🗄️ Banco.</p>`,
  inicial,
  etapas: [
    {
      titulo: 'Listar as tarefas',
      dificuldade: 'facil',
      enunciado: `
        <p>No <code>index.php</code>, busque as tarefas no banco (ordem do <code>id</code>) e mostre
        cada uma num <code>&lt;li&gt;</code> da lista <code>w3-ul</code>.</p>
        <p>Tarefas <b>concluídas</b> (<code>concluida = 1</code>) devem ter a classe <code>concluida</code>
        e o título riscado com <code>&lt;s&gt;</code>.</p>`,
      dica: "$pdo->query('SELECT * FROM tarefas ORDER BY id')->fetchAll() e um foreach com if.",
      alteracoes: { 'index.php': index1 },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: 'ul.w3-ul li', igual: 3, msg: 'Mostre as 3 tarefas do banco' },
            { seletor: 'li', texto: 'Revisar PDO' },
            { seletor: 'li.concluida', igual: 1, msg: 'Só "Estudar HTML" está concluída' },
            { seletor: 'li.concluida s', texto: 'Estudar HTML' },
            { semErros: true },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALTERNATIVO,
          oculto: true,
          regras: [{ seletor: 'ul.w3-ul li', igual: 2 }, { seletor: 'li.concluida', texto: 'Ler livro' }],
        },
      ],
    },
    {
      titulo: 'Adicionar tarefa',
      dificuldade: 'facil',
      enunciado: `
        <p>Acima da lista, crie um formulário <code>method="post"</code> com <code>action="adicionar.php"</code>
        e um campo <code>name="titulo"</code>.</p>
        <p>Crie o arquivo <code>adicionar.php</code> (botão <b>+</b> do editor) que:</p>
        <ul>
          <li>insere a tarefa com <code>prepare</code>/<code>execute</code>;</li>
          <li>ignora títulos vazios (use <code>trim</code>);</li>
          <li>volta para a lista com <code>header('Location: index.php')</code>.</li>
        </ul>`,
      dica: 'Depois do header(\'Location: ...\') use exit; para parar o script.',
      alteracoes: { 'index.php': index2, 'adicionar.php': adicionar },
      testes: [
        {
          descricao: 'index.php',
          regras: [{ seletor: 'form[action="adicionar.php"][method="post" i] input[name="titulo"]', msg: 'Crie o formulário POST para adicionar.php com o campo titulo' }],
        },
        {
          descricao: 'POST adicionar.php (titulo=Estudar SQL)',
          passos: [{ url: '/adicionar.php', metodo: 'POST', corpo: 'titulo=Estudar+SQL', regras: [
            { seletor: 'ul.w3-ul li', igual: 4, msg: 'Depois de adicionar, a lista deve ter 4 tarefas' },
            { seletor: 'li', texto: 'Estudar SQL' },
            { semErros: true },
          ] }],
        },
        { regras: [{ codigo: '->\\s*prepare\\s*\\(', msg: 'Use prepare() no INSERT' }] },
        {
          descricao: 'título só com espaços',
          oculto: true,
          passos: [{ url: '/adicionar.php', metodo: 'POST', corpo: 'titulo=%20%20', regras: [{ seletor: 'ul.w3-ul li', igual: 3, msg: 'Títulos vazios não podem ser salvos' }] }],
        },
        {
          descricao: "título com apóstrofo",
          oculto: true,
          passos: [{ url: '/adicionar.php', metodo: 'POST', corpo: 'titulo=Ler+D%27%C3%81vila', regras: [{ seletor: 'li', texto: "Ler D'Ávila" }, { semErros: true }] }],
        },
      ],
    },
    {
      titulo: 'Concluir tarefa',
      dificuldade: 'medio',
      enunciado: `
        <p>Em cada tarefa <b>pendente</b>, coloque um link <code>&lt;a class="concluir"&gt;</code> para
        <code>concluir.php?id=ID</code>.</p>
        <p>O <code>concluir.php</code> marca a tarefa como concluída (<code>UPDATE ... SET concluida = 1</code>)
        e volta para a lista.</p>`,
      dica: "Converta o id com (int) $_GET['id'] e use prepare no UPDATE.",
      alteracoes: { 'index.php': index3, 'concluir.php': concluir },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: 'a.concluir', igual: 2, msg: 'Só as 2 tarefas pendentes têm o link Concluir' },
            { seletor: 'a.concluir[href="concluir.php?id=2"]', msg: 'O link deve ir para concluir.php?id=ID' },
          ],
        },
        {
          descricao: 'concluir.php?id=2',
          passos: [{ url: '/concluir.php?id=2', regras: [
            { seletor: 'li.concluida', igual: 2 },
            { seletor: 'li.concluida', texto: 'Fazer exercícios de PHP' },
            { semErros: true },
          ] }],
        },
        {
          descricao: 'outro banco',
          banco: ALTERNATIVO,
          oculto: true,
          passos: [{ url: '/concluir.php?id=1', regras: [{ seletor: 'li.concluida', igual: 2 }, { seletor: 'a.concluir', igual: 0 }] }],
        },
      ],
    },
    {
      titulo: 'Excluir tarefa',
      dificuldade: 'medio',
      enunciado: `
        <p>Em <b>todas</b> as tarefas, coloque um link <code>&lt;a class="excluir"&gt;</code> para
        <code>excluir.php?id=ID</code>.</p>
        <p>O <code>excluir.php</code> apaga a tarefa (<code>DELETE</code>) e volta para a lista.
        Um id que não existe não pode causar erro.</p>`,
      dica: 'onclick="return confirm(\'Excluir?\')" no link pede confirmação antes de excluir.',
      alteracoes: { 'index.php': index4, 'excluir.php': excluir },
      testes: [
        { descricao: 'index.php', regras: [{ seletor: 'a.excluir', igual: 3, msg: 'Toda tarefa precisa do link Excluir' }] },
        {
          descricao: 'excluir.php?id=1',
          passos: [{ url: '/excluir.php?id=1', regras: [
            { seletor: 'ul.w3-ul li', igual: 2 },
            { naoContem: 'Estudar HTML' },
          ] }],
        },
        {
          descricao: 'excluir.php?id=999',
          oculto: true,
          passos: [{ url: '/excluir.php?id=999', regras: [{ seletor: 'ul.w3-ul li', igual: 3 }, { semErros: true }] }],
        },
      ],
    },
    {
      titulo: 'Editar tarefa e contador',
      dificuldade: 'dificil',
      enunciado: `
        <p>Termine o CRUD:</p>
        <ul>
          <li>Acima do formulário, mostre <code>&lt;p class="contador"&gt;</code> com <b>Pendentes: 2 de 3</b>.</li>
          <li>Em cada tarefa, um link <code>&lt;a class="editar"&gt;</code> para <code>editar.php?id=ID</code>.</li>
          <li>O <code>editar.php</code> mostra um formulário <code>method="post"</code> com o título atual no campo
            <code>name="titulo"</code> e o id num campo oculto <code>&lt;input type="hidden" name="id"&gt;</code>.</li>
          <li>Ao enviar, atualiza o título e volta para a lista. Id inexistente: <b>Tarefa não encontrada</b>.</li>
        </ul>`,
      dica: 'Um único editar.php pode tratar GET (mostrar o formulário) e POST (salvar) com $_SERVER[\'REQUEST_METHOD\'].',
      alteracoes: { 'index.php': index5, 'editar.php': editar },
      testes: [
        {
          descricao: 'index.php',
          regras: [{ seletor: 'p.contador', texto: 'Pendentes: 2 de 3' }, { seletor: 'a.editar', igual: 3 }],
        },
        {
          descricao: 'editar.php?id=2',
          url: '/editar.php?id=2',
          regras: [
            { seletor: 'form[method="post" i] input[name="titulo"][value="Fazer exercícios de PHP"]', msg: 'O campo titulo deve vir preenchido' },
            { seletor: 'input[type="hidden"][name="id"][value="2"]', msg: 'Envie o id num campo oculto' },
          ],
        },
        {
          descricao: 'POST editar.php (id=2, titulo=Fazer listas)',
          passos: [{ url: '/editar.php', metodo: 'POST', corpo: 'id=2&titulo=Fazer+listas', regras: [
            { seletor: 'li', texto: 'Fazer listas' },
            { seletor: 'ul.w3-ul li', igual: 3 },
          ] }],
        },
        { descricao: 'outro banco', banco: ALTERNATIVO, oculto: true, regras: [{ seletor: 'p.contador', texto: 'Pendentes: 1 de 2' }] },
        { descricao: 'editar.php?id=99', url: '/editar.php?id=99', oculto: true, regras: [{ contem: 'Tarefa não encontrada' }, { semErros: true }] },
      ],
    },
  ],
});
