import { php } from '../util.js';
import { criarProjeto, SENHA_1234 } from './base.js';

const ESTRUTURA = `
CREATE TABLE usuarios (
  id         INTEGER PRIMARY KEY,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL
);

CREATE TABLE posts (
  id         INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  titulo     TEXT NOT NULL,
  conteudo   TEXT NOT NULL,
  criado_em  TEXT NOT NULL
);

CREATE TABLE comentarios (
  id        INTEGER PRIMARY KEY,
  post_id   INTEGER NOT NULL REFERENCES posts(id),
  autor     TEXT NOT NULL,
  texto     TEXT NOT NULL,
  criado_em TEXT NOT NULL
);
`;

// Senha de todos os usuários: 1234 (guardada como hash bcrypt).
const BANCO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, email, senha_hash) VALUES
  (1, 'Ana Souza',  'ana@blog.com',   '${SENHA_1234}'),
  (2, 'Bruno Lima', 'bruno@blog.com', '${SENHA_1234}');

INSERT INTO posts (id, usuario_id, titulo, conteudo, criado_em) VALUES
  (1, 1, 'Bem-vindos ao blog', 'Este é o primeiro post do blog da turma.', '2026-03-01 10:00'),
  (2, 2, 'Aprendendo PHP', 'PHP roda no servidor e gera o HTML que o navegador mostra.', '2026-03-05 14:30'),
  (3, 1, 'Dicas de W3.CSS', 'Use w3-card e w3-row-padding para montar layouts rápidos.', '2026-03-10 09:15');

INSERT INTO comentarios (post_id, autor, texto, criado_em) VALUES
  (1, 'Carla', 'Que legal!', '2026-03-02 08:00'),
  (1, 'Davi', 'Parabéns pelo blog.', '2026-03-02 09:00'),
  (3, 'Bruno', 'Ótimas dicas!', '2026-03-11 12:00');
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (1, 'Zeca Prado', 'zeca@blog.com', '${SENHA_1234}');
INSERT INTO posts (id, usuario_id, titulo, conteudo, criado_em) VALUES
  (1, 1, 'Primeiro dia', 'Começando.', '2026-01-01 10:00'),
  (2, 1, 'Segundo dia', 'Continuando.', '2026-01-02 10:00');
`;

const LOGIN_ANA = { url: '/login.php', metodo: 'POST', corpo: 'email=ana%40blog.com&senha=1234' };

// ---------- arquivos iniciais ----------

const conexao = php`<?php
// Todo arquivo do blog começa com require 'conexao.php':
// ele abre a sessão ($_SESSION) e a conexão com o banco ($pdo).
session_start();

$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

// Atalho para htmlspecialchars: use e($texto) ao mostrar qualquer dado.
function e(?string $texto): string {
    return htmlspecialchars($texto ?? '');
}

// '2026-03-10 09:15' vira '10/03/2026'.
function dataBr(string $data): string {
    return date('d/m/Y', strtotime($data));
}
`;

const topoInicio = php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Blog da Turma</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<div class="w3-bar w3-indigo">
  <a href="index.php" class="w3-bar-item w3-button">📝 Blog da Turma</a>
`;

const topoFim = php`</div>
<main class="w3-container w3-padding" style="max-width:860px;margin:auto">
`;

const rodape = php`</main>
<footer class="w3-container w3-center w3-small w3-text-grey"><p>Blog da Turma</p></footer>
</body>
</html>
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
// Etapa 1: busque os posts (mais novos primeiro) com o nome do autor
?>
<?php include 'topo.php'; ?>
<h2>Últimos posts</h2>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': conexao,
  'topo.php': topoInicio + topoFim,
  'rodape.php': rodape,
};

// ---------- etapa 1: listar ----------

const index1 = php`<?php
require 'conexao.php';
$posts = $pdo->query(
    'SELECT posts.*, usuarios.nome AS autor
     FROM posts JOIN usuarios ON usuarios.id = posts.usuario_id
     ORDER BY posts.criado_em DESC'
)->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Últimos posts</h2>
<?php foreach ($posts as $p): ?>
  <article class="w3-card w3-white w3-padding w3-margin-bottom">
    <h3><a href="post.php?id=<?= $p['id'] ?>"><?= e($p['titulo']) ?></a></h3>
    <p class="autor w3-small w3-text-grey">por <?= e($p['autor']) ?> em <?= dataBr($p['criado_em']) ?></p>
    <p><?= e(mb_strimwidth($p['conteudo'], 0, 120, '…')) ?></p>
  </article>
<?php endforeach; ?>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 2: página do post ----------

const buscarPost = php`$stmt = $pdo->prepare(
    'SELECT posts.*, usuarios.nome AS autor
     FROM posts JOIN usuarios ON usuarios.id = posts.usuario_id
     WHERE posts.id = ?'
);
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
$post = $stmt->fetch();`;

const artigo = php`  <article class="w3-card w3-white w3-padding">
    <h1><?= e($post['titulo']) ?></h1>
    <p class="autor w3-small w3-text-grey">por <?= e($post['autor']) ?> em <?= dataBr($post['criado_em']) ?></p>
    <div class="conteudo"><?= nl2br(e($post['conteudo'])) ?></div>
  </article>`;

const post2 = php`<?php
require 'conexao.php';
${buscarPost}
?>
<?php include 'topo.php'; ?>
<?php if (!$post): ?>
  <div class="w3-panel w3-pale-red"><p>Post não encontrado</p></div>
<?php else: ?>
${artigo}
  <p><a href="index.php">← Voltar</a></p>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 3: comentários ----------

const post3 = php`<?php
require 'conexao.php';
${buscarPost}

$comentarios = [];
if ($post) {
    $stmt = $pdo->prepare('SELECT * FROM comentarios WHERE post_id = ? ORDER BY criado_em');
    $stmt->execute([$post['id']]);
    $comentarios = $stmt->fetchAll();
}
?>
<?php include 'topo.php'; ?>
<?php if (!$post): ?>
  <div class="w3-panel w3-pale-red"><p>Post não encontrado</p></div>
<?php else: ?>
${artigo}

  <h3>Comentários (<?= count($comentarios) ?>)</h3>
  <?php foreach ($comentarios as $c): ?>
    <div class="comentario w3-panel w3-white w3-leftbar w3-border-indigo">
      <p><b><?= e($c['autor']) ?></b>: <?= e($c['texto']) ?></p>
    </div>
  <?php endforeach; ?>

  <form method="post" action="comentar.php" class="w3-card w3-white w3-padding">
    <input type="hidden" name="post_id" value="<?= $post['id'] ?>">
    <input class="w3-input w3-border" name="autor" placeholder="Seu nome" required>
    <textarea class="w3-input w3-border w3-margin-top" name="texto" placeholder="Seu comentário" required></textarea>
    <button class="w3-button w3-indigo w3-margin-top">Comentar</button>
  </form>
  <p><a href="index.php">← Voltar</a></p>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

const comentar = php`<?php
require 'conexao.php';

$postId = (int) ($_POST['post_id'] ?? 0);
$autor = trim($_POST['autor'] ?? '');
$texto = trim($_POST['texto'] ?? '');

if ($autor !== '' && $texto !== '') {
    $stmt = $pdo->prepare('INSERT INTO comentarios (post_id, autor, texto, criado_em) VALUES (?, ?, ?, ?)');
    $stmt->execute([$postId, $autor, $texto, date('Y-m-d H:i')]);
}
header('Location: post.php?id=' . $postId);
exit;
`;

// ---------- etapa 4: login ----------

const menuUsuario4 = php`  <?php if (isset($_SESSION['usuario_id'])): ?>
    <a href="logout.php" class="w3-bar-item w3-button w3-right">Sair</a>
    <span class="w3-bar-item w3-right usuario">Olá, <?= e($_SESSION['usuario_nome']) ?></span>
  <?php else: ?>
    <a href="login.php" class="w3-bar-item w3-button w3-right">Entrar</a>
  <?php endif; ?>
`;

const login = php`<?php
require 'conexao.php';

$erro = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
    $stmt->execute([trim($_POST['email'] ?? '')]);
    $usuario = $stmt->fetch();

    if ($usuario && password_verify($_POST['senha'] ?? '', $usuario['senha_hash'])) {
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['nome'];
        header('Location: index.php');
        exit;
    }
    $erro = true;
}
?>
<?php include 'topo.php'; ?>
<h2>Entrar</h2>
<?php if ($erro): ?>
  <div class="w3-panel w3-pale-red"><p>E-mail ou senha inválidos</p></div>
<?php endif; ?>
<form method="post" class="w3-card w3-white w3-padding" style="max-width:400px">
  <input class="w3-input w3-border" type="email" name="email" placeholder="E-mail" required>
  <input class="w3-input w3-border w3-margin-top" type="password" name="senha" placeholder="Senha" required>
  <button class="w3-button w3-indigo w3-margin-top">Entrar</button>
</form>
<p class="w3-small w3-text-grey">Contas de teste: ana@blog.com ou bruno@blog.com, senha 1234.</p>
<?php include 'rodape.php'; ?>
`;

const logout = php`<?php
require 'conexao.php';

$_SESSION = [];
session_destroy();
header('Location: index.php');
exit;
`;

// ---------- etapa 5: publicar ----------

const index5 = index1.replace(
  '<h2>Últimos posts</h2>',
  `<h2>Últimos posts</h2>
<?php if (isset($_SESSION['usuario_id'])): ?>
  <p><a class="novo-post w3-button w3-indigo" href="novo.php">✏️ Novo post</a></p>
<?php endif; ?>`,
);

const novo = php`<?php
require 'conexao.php';

// Só quem fez login pode publicar.
if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

$erro = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = trim($_POST['titulo'] ?? '');
    $conteudo = trim($_POST['conteudo'] ?? '');
    if ($titulo === '' || $conteudo === '') {
        $erro = 'Preencha o título e o conteúdo.';
    } else {
        $stmt = $pdo->prepare('INSERT INTO posts (usuario_id, titulo, conteudo, criado_em) VALUES (?, ?, ?, ?)');
        $stmt->execute([$_SESSION['usuario_id'], $titulo, $conteudo, date('Y-m-d H:i')]);
        header('Location: post.php?id=' . $pdo->lastInsertId());
        exit;
    }
}
?>
<?php include 'topo.php'; ?>
<h2>Novo post</h2>
<?php if ($erro): ?>
  <div class="w3-panel w3-pale-red"><p><?= e($erro) ?></p></div>
<?php endif; ?>
<form method="post" class="w3-card w3-white w3-padding">
  <input class="w3-input w3-border" name="titulo" placeholder="Título">
  <textarea class="w3-input w3-border w3-margin-top" name="conteudo" rows="6" placeholder="Escreva seu post"></textarea>
  <button class="w3-button w3-indigo w3-margin-top">Publicar</button>
</form>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 6: meus posts ----------

const menuUsuario6 = menuUsuario4.replace(
  `    <a href="logout.php"`,
  `    <a href="painel.php" class="w3-bar-item w3-button">Meus posts</a>
    <a href="logout.php"`,
);

const painel = php`<?php
require 'conexao.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

$stmt = $pdo->prepare('SELECT * FROM posts WHERE usuario_id = ? ORDER BY criado_em DESC');
$stmt->execute([$_SESSION['usuario_id']]);
$posts = $stmt->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Meus posts (<?= count($posts) ?>)</h2>
<ul class="w3-ul w3-card w3-white">
<?php foreach ($posts as $p): ?>
  <li>
    <a href="post.php?id=<?= $p['id'] ?>"><?= e($p['titulo']) ?></a>
    <a class="excluir w3-button w3-small w3-red w3-right" href="excluir.php?id=<?= $p['id'] ?>"
       onclick="return confirm('Excluir este post e os comentários?')">Excluir</a>
  </li>
<?php endforeach; ?>
</ul>
<?php include 'rodape.php'; ?>
`;

const excluir = php`<?php
require 'conexao.php';

if (!isset($_SESSION['usuario_id'])) {
    header('Location: login.php');
    exit;
}

// O "AND usuario_id = ?" impede que alguém apague o post de outra pessoa
// só trocando o id na URL.
$id = (int) ($_GET['id'] ?? 0);
$stmt = $pdo->prepare('DELETE FROM posts WHERE id = ? AND usuario_id = ?');
$stmt->execute([$id, $_SESSION['usuario_id']]);

if ($stmt->rowCount() > 0) {
    $pdo->prepare('DELETE FROM comentarios WHERE post_id = ?')->execute([$id]);
}
header('Location: painel.php');
exit;
`;

export const projetoBlog = criarProjeto({
  id: 'blog',
  titulo: 'Blog',
  icone: '📝',
  descricao: 'Posts, comentários, login com senha criptografada e área do autor.',
  banco: BANCO,
  resumo: `
    <p>Você vai construir o <b>Blog da Turma</b>: lista de posts, página de cada post, comentários,
    login com senha criptografada e uma área onde cada autor publica e gerencia os próprios posts.</p>
    <h2>O que você vai praticar</h2>
    <ul>
      <li><code>JOIN</code> entre <code>posts</code> e <code>usuarios</code>;</li>
      <li>páginas com parâmetro na URL (<code>post.php?id=3</code>);</li>
      <li>formulários que gravam e redirecionam (<code>header('Location: ...')</code>);</li>
      <li><b>sessões</b> (<code>$_SESSION</code>) e <code>password_verify()</code>;</li>
      <li>segurança: <code>htmlspecialchars</code> (atalho <code>e()</code>) e só excluir o que é seu.</li>
    </ul>
    <p>Contas de teste: <code>ana@blog.com</code> e <code>bruno@blog.com</code>, senha <code>1234</code>.
    As senhas estão no banco como <b>hash</b> (veja a coluna <code>senha_hash</code> na aba 🗄️ Banco).</p>`,
  inicial,
  etapas: [
    {
      titulo: 'Listar os posts',
      dificuldade: 'facil',
      enunciado: `
        <p>No <code>index.php</code>, mostre os posts do <b>mais novo para o mais antigo</b>. Cada post é um
        <code>&lt;article class="w3-card"&gt;</code> com:</p>
        <ul>
          <li>um <code>&lt;h3&gt;</code> com link para <code>post.php?id=ID</code>;</li>
          <li><code>&lt;p class="autor"&gt;</code> no formato <b>por Ana Souza em 10/03/2026</b>;</li>
          <li>um resumo do conteúdo.</li>
        </ul>
        <p>O nome do autor está na tabela <code>usuarios</code>: use <code>JOIN</code>.</p>`,
      dica: 'ORDER BY posts.criado_em DESC. A função dataBr() de conexao.php formata a data.',
      alteracoes: { 'index.php': index1 },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: 'article.w3-card', igual: 3, msg: 'Mostre os 3 posts' },
            { seletor: 'article:first-of-type h3', texto: 'Dicas de W3.CSS' },
            { seletor: 'article h3 a[href="post.php?id=3"]', msg: 'O título deve ter link para post.php?id=ID' },
            { seletor: 'p.autor', texto: 'por Ana Souza em 10/03/2026' },
            { semErros: true },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALTERNATIVO,
          oculto: true,
          regras: [{ seletor: 'article.w3-card', igual: 2 }, { seletor: 'article:first-of-type h3', texto: 'Segundo dia' }],
        },
      ],
    },
    {
      titulo: 'Página do post',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie <code>post.php</code>: ele recebe <code>?id=</code> e mostra o post com o título num
        <code>&lt;h1&gt;</code>, o <code>&lt;p class="autor"&gt;</code> e o texto num <code>&lt;div class="conteudo"&gt;</code>.</p>
        <p>Se o post não existir, mostre <b>Post não encontrado</b>.</p>`,
      dica: 'Mesma consulta do index, com WHERE posts.id = ? e fetch() no lugar de fetchAll().',
      alteracoes: { 'post.php': post2 },
      testes: [
        {
          descricao: 'post.php?id=2',
          url: '/post.php?id=2',
          regras: [
            { seletor: 'h1', texto: 'Aprendendo PHP' },
            { seletor: 'p.autor', texto: 'por Bruno Lima' },
            { seletor: '.conteudo', texto: 'PHP roda no servidor' },
          ],
        },
        { descricao: 'post.php?id=99', url: '/post.php?id=99', regras: [{ contem: 'Post não encontrado' }, { semErros: true }] },
        { regras: [{ codigo: '->\\s*prepare\\s*\\(', msg: 'Use prepare() para buscar pelo id' }] },
        { descricao: 'post.php?id=abc', url: '/post.php?id=abc', oculto: true, regras: [{ contem: 'Post não encontrado' }, { semErros: true }] },
      ],
    },
    {
      titulo: 'Comentários',
      dificuldade: 'medio',
      enunciado: `
        <p>No <code>post.php</code>, abaixo do post:</p>
        <ul>
          <li>mostre <b>Comentários (2)</b> e cada comentário num <code>&lt;div class="comentario"&gt;</code>;</li>
          <li>crie um formulário <code>method="post"</code> para <code>comentar.php</code> com os campos
            <code>post_id</code> (oculto), <code>autor</code> e <code>texto</code>.</li>
        </ul>
        <p>O <code>comentar.php</code> grava o comentário (se autor e texto não estiverem vazios) e volta para o post.</p>`,
      dica: "header('Location: post.php?id=' . $postId) leva o leitor de volta ao mesmo post.",
      alteracoes: { 'post.php': post3, 'comentar.php': comentar },
      testes: [
        {
          descricao: 'post.php?id=1',
          url: '/post.php?id=1',
          regras: [
            { seletor: '.comentario', igual: 2 },
            { contem: 'Comentários (2)' },
            { seletor: 'form[action="comentar.php"][method="post" i] input[name="post_id"][value="1"]', msg: 'O formulário precisa do post_id oculto' },
          ],
        },
        {
          descricao: 'comentar no post 3',
          passos: [{ url: '/comentar.php', metodo: 'POST', corpo: 'post_id=3&autor=Caio&texto=Muito+bom', regras: [
            { seletor: 'h1', texto: 'Dicas de W3.CSS' },
            { seletor: '.comentario', igual: 2 },
            { seletor: '.comentario', texto: 'Muito bom' },
            { semErros: true },
          ] }],
        },
        {
          descricao: 'comentário com HTML',
          oculto: true,
          passos: [{ url: '/comentar.php', metodo: 'POST', corpo: 'post_id=2&autor=X&texto=%3Ci%3Eoi%3C%2Fi%3E', regras: [
            { seletor: '.comentario i', igual: 0, msg: 'Use e() / htmlspecialchars nos comentários' },
          ] }],
        },
        {
          descricao: 'comentário vazio',
          oculto: true,
          passos: [{ url: '/comentar.php', metodo: 'POST', corpo: 'post_id=2&autor=X&texto=', regras: [{ seletor: '.comentario', igual: 0 }] }],
        },
      ],
    },
    {
      titulo: 'Login e logout',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie <code>login.php</code> com um formulário <code>method="post"</code> (campos <code>email</code> e
        <code>senha</code> do tipo password). Ao enviar:</p>
        <ul>
          <li>busque o usuário pelo e-mail e confira a senha com <code>password_verify()</code>;</li>
          <li>se estiver certo, guarde <code>usuario_id</code> e <code>usuario_nome</code> em <code>$_SESSION</code>
            e redirecione para <code>index.php</code>;</li>
          <li>senão, mostre <b>E-mail ou senha inválidos</b>.</li>
        </ul>
        <p>No <code>topo.php</code>: logado, mostre <code>&lt;span class="usuario"&gt;</code> <b>Olá, Ana Souza</b> e um link
        para <code>logout.php</code>; deslogado, um link para <code>login.php</code>. O <code>logout.php</code> encerra a sessão.</p>`,
      dica: 'password_verify($senhaDigitada, $usuario[\'senha_hash\']). Nunca compare a senha com == .',
      alteracoes: {
        'topo.php': topoInicio + menuUsuario4 + topoFim,
        'login.php': login,
        'logout.php': logout,
      },
      testes: [
        {
          descricao: 'login.php',
          url: '/login.php',
          regras: [
            { seletor: 'form[method="post" i] input[name="email"]' },
            { seletor: 'form input[type="password"][name="senha"]', msg: 'O campo senha deve ser type="password"' },
            { seletor: 'a[href="login.php"]', msg: 'Deslogado, o topo mostra o link Entrar (login.php)' },
          ],
        },
        {
          descricao: 'login da Ana',
          passos: [{ ...LOGIN_ANA, regras: [
            { seletor: '.usuario', texto: 'Olá, Ana Souza' },
            { seletor: 'a[href="logout.php"]', msg: 'Logado, o topo mostra o link Sair (logout.php)' },
            { seletor: 'article.w3-card', igual: 3, msg: 'Depois do login, volte para o index.php' },
          ] }],
        },
        {
          descricao: 'senha errada',
          passos: [{ url: '/login.php', metodo: 'POST', corpo: 'email=ana%40blog.com&senha=errada', regras: [
            { contem: 'E-mail ou senha inválidos' },
            { naoContem: 'Olá,' },
          ] }],
        },
        {
          descricao: 'login e logout',
          passos: [LOGIN_ANA, { url: '/logout.php', regras: [
            { naoContem: 'Olá, Ana' },
            { seletor: 'a[href="login.php"]' },
          ] }],
        },
        { regras: [{ codigo: 'password_verify\\s*\\(', msg: 'Confira a senha com password_verify()' }] },
        {
          descricao: 'e-mail que não existe',
          oculto: true,
          passos: [{ url: '/login.php', metodo: 'POST', corpo: 'email=x%40x.com&senha=1234', regras: [{ contem: 'E-mail ou senha inválidos' }, { semErros: true }] }],
        },
      ],
    },
    {
      titulo: 'Publicar posts',
      dificuldade: 'dificil',
      enunciado: `
        <p>Crie <code>novo.php</code>, só para quem fez login (deslogado → redirecione para <code>login.php</code>):</p>
        <ul>
          <li>formulário <code>method="post"</code> com <code>titulo</code> e <code>conteudo</code>;</li>
          <li>vazio: mostre <b>Preencha o título e o conteúdo.</b>;</li>
          <li>senão, insira o post com o <code>usuario_id</code> da sessão e a data atual
            (<code>date('Y-m-d H:i')</code>) e redirecione para o post criado
            (<code>$pdo-&gt;lastInsertId()</code>).</li>
        </ul>
        <p>No <code>index.php</code>, mostre o link <code>&lt;a class="novo-post"&gt;</code> só para quem está logado.</p>`,
      dica: "header('Location: post.php?id=' . $pdo->lastInsertId()); depois do INSERT.",
      alteracoes: { 'index.php': index5, 'novo.php': novo },
      testes: [
        {
          descricao: 'deslogado',
          passos: [
            { url: '/index.php', regras: [{ seletor: 'a.novo-post', igual: 0, msg: 'Deslogado não vê o link Novo post' }] },
            { url: '/novo.php', regras: [{ seletor: 'input[name="senha"]', msg: 'Deslogado, novo.php deve redirecionar para login.php' }] },
          ],
        },
        {
          descricao: 'Ana publica um post',
          passos: [
            LOGIN_ANA,
            { url: '/index.php', regras: [{ seletor: 'a.novo-post[href="novo.php"]', msg: 'Logado vê o link Novo post' }] },
            { url: '/novo.php', metodo: 'POST', corpo: 'titulo=Meu+primeiro+post&conteudo=Escrevendo+no+blog', regras: [
              { seletor: 'h1', texto: 'Meu primeiro post' },
              { seletor: 'p.autor', texto: 'por Ana Souza' },
            ] },
            { url: '/index.php', regras: [
              { seletor: 'article.w3-card', igual: 4 },
              { seletor: 'article:first-of-type h3', texto: 'Meu primeiro post' },
            ] },
          ],
        },
        {
          descricao: 'POST sem login',
          oculto: true,
          passos: [
            { url: '/novo.php', metodo: 'POST', corpo: 'titulo=Invasor&conteudo=x' },
            { url: '/index.php', regras: [{ seletor: 'article.w3-card', igual: 3, msg: 'Sem login nada pode ser publicado' }] },
          ],
        },
        {
          descricao: 'post vazio',
          oculto: true,
          passos: [LOGIN_ANA, { url: '/novo.php', metodo: 'POST', corpo: 'titulo=&conteudo=', regras: [{ contem: 'Preencha o título e o conteúdo.' }] }],
        },
      ],
    },
    {
      titulo: 'Meus posts e exclusão segura',
      dificuldade: 'dificil',
      enunciado: `
        <p>Crie <code>painel.php</code> (só logado) com os posts <b>do usuário logado</b> numa
        <code>&lt;ul class="w3-ul"&gt;</code>, cada um com um link <code>&lt;a class="excluir"&gt;</code> para
        <code>excluir.php?id=ID</code>. No topo, para quem está logado, um link <b>Meus posts</b> (<code>painel.php</code>).</p>
        <p>O <code>excluir.php</code> apaga o post <b>e os comentários dele</b>, mas <b>só se o post for de quem está logado</b>.
        Trocar o id na URL não pode apagar o post de outra pessoa!</p>`,
      dica: 'DELETE FROM posts WHERE id = ? AND usuario_id = ? e depois confira $stmt->rowCount().',
      alteracoes: {
        'topo.php': topoInicio + menuUsuario6 + topoFim,
        'painel.php': painel,
        'excluir.php': excluir,
      },
      testes: [
        {
          descricao: 'painel da Ana',
          passos: [LOGIN_ANA, { url: '/painel.php', regras: [
            { seletor: 'ul.w3-ul li', igual: 2, msg: 'A Ana tem 2 posts' },
            { seletor: 'a.excluir[href="excluir.php?id=3"]' },
            { seletor: 'a[href="painel.php"]', msg: 'O topo deve ter o link Meus posts' },
          ] }],
        },
        {
          descricao: 'Ana exclui o próprio post',
          passos: [LOGIN_ANA, { url: '/excluir.php?id=1', regras: [{ seletor: 'ul.w3-ul li', igual: 1 }] }, { url: '/post.php?id=1', regras: [{ contem: 'Post não encontrado' }] }],
        },
        {
          descricao: 'Ana tenta excluir o post do Bruno',
          passos: [LOGIN_ANA, { url: '/excluir.php?id=2' }, { url: '/index.php', regras: [
            { seletor: 'article.w3-card', igual: 3, msg: 'Não é permitido excluir o post de outra pessoa' },
          ] }],
        },
        {
          descricao: 'excluir sem login',
          oculto: true,
          passos: [{ url: '/excluir.php?id=1' }, { url: '/index.php', regras: [{ seletor: 'article.w3-card', igual: 3 }] }],
        },
        {
          descricao: 'comentários do post excluído',
          oculto: true,
          passos: [LOGIN_ANA, { url: '/excluir.php?id=3' }, { url: '/comentar.php', metodo: 'POST', corpo: 'post_id=1&autor=A&texto=B', regras: [
            { seletor: '.comentario', igual: 3, msg: 'Os outros posts não podem perder comentários' },
          ] }],
        },
      ],
    },
  ],
});
