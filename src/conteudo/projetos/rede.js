import { php } from '../util.js';
import { criarProjeto, SENHA_1234 } from './base.js';

const ESTRUTURA = `
CREATE TABLE usuarios (
  id         INTEGER PRIMARY KEY,
  nome       TEXT NOT NULL,
  usuario    TEXT NOT NULL UNIQUE,
  email      TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL,
  bio        TEXT NOT NULL DEFAULT ''
);

CREATE TABLE posts (
  id         INTEGER PRIMARY KEY,
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  texto      TEXT NOT NULL,
  criado_em  TEXT NOT NULL
);

-- quem segue quem
CREATE TABLE seguidores (
  seguidor_id INTEGER NOT NULL REFERENCES usuarios(id),
  seguido_id  INTEGER NOT NULL REFERENCES usuarios(id),
  PRIMARY KEY (seguidor_id, seguido_id)
);

CREATE TABLE curtidas (
  usuario_id INTEGER NOT NULL REFERENCES usuarios(id),
  post_id    INTEGER NOT NULL REFERENCES posts(id),
  PRIMARY KEY (usuario_id, post_id)
);
`;

const BANCO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, usuario, email, senha_hash, bio) VALUES
  (1, 'Ana Souza',  'ana',   'ana@rede.com',   '${SENHA_1234}', 'Dev em formação 💻'),
  (2, 'Bruno Lima', 'bruno', 'bruno@rede.com', '${SENHA_1234}', 'Aprendendo PHP'),
  (3, 'Carla Dias', 'carla', 'carla@rede.com', '${SENHA_1234}', 'Designer 🎨'),
  (4, 'Davi Rocha', 'davi',  'davi@rede.com',  '${SENHA_1234}', 'Gosto de xadrez');

INSERT INTO posts (id, usuario_id, texto, criado_em) VALUES
  (1, 1, 'Primeiro post na rede!',      '2026-04-01 09:00'),
  (2, 2, 'Hoje aprendi PDO',            '2026-04-02 10:00'),
  (3, 3, 'Novo layout com W3.CSS',      '2026-04-03 11:00'),
  (4, 2, 'Alguém mais estudando PHP?',  '2026-04-04 12:00'),
  (5, 4, 'Partida de xadrez hoje',      '2026-04-05 13:00'),
  (6, 1, 'Terminei o projeto do blog',  '2026-04-06 14:00');

-- Ana segue Bruno; Bruno segue Ana e Carla; Carla e Davi seguem Ana.
INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (1, 2), (2, 1), (2, 3), (3, 1), (4, 1);

INSERT INTO curtidas (usuario_id, post_id) VALUES (2, 1), (3, 1), (1, 2), (4, 6);
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, usuario, email, senha_hash, bio) VALUES
  (1, 'Ana Souza',  'ana',  'ana@rede.com',  '${SENHA_1234}', ''),
  (2, 'Zeca Prado', 'zeca', 'zeca@rede.com', '${SENHA_1234}', 'Oi!');
INSERT INTO posts (id, usuario_id, texto, criado_em) VALUES (1, 2, 'Oi, sou o Zeca', '2026-01-01 10:00');
`;

const login = (quem) => ({ url: '/login.php', metodo: 'POST', corpo: `email=${quem}%40rede.com&senha=1234` });
const LOGIN_ANA = login('ana');
const LOGIN_BRUNO = login('bruno');

// ---------- arquivos iniciais (o login já vem pronto) ----------

const conexao = php`<?php
session_start();

$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

function e(?string $texto): string {
    return htmlspecialchars($texto ?? '');
}

// '2026-04-06 14:00' vira '06/04 14:00'.
function quando(string $data): string {
    return date('d/m H:i', strtotime($data));
}

// Usuário logado (array com id, nome e usuario) ou null.
function usuarioLogado(): ?array {
    return $_SESSION['usuario'] ?? null;
}

// Manda para o login quem não entrou; devolve o usuário logado.
function exigirLogin(): array {
    $usuario = usuarioLogado();
    if (!$usuario) {
        header('Location: login.php');
        exit;
    }
    return $usuario;
}
`;

const loginPhp = php`<?php
require 'conexao.php';

$erro = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('SELECT * FROM usuarios WHERE email = ?');
    $stmt->execute([trim($_POST['email'] ?? '')]);
    $u = $stmt->fetch();
    if ($u && password_verify($_POST['senha'] ?? '', $u['senha_hash'])) {
        $_SESSION['usuario'] = ['id' => $u['id'], 'nome' => $u['nome'], 'usuario' => $u['usuario']];
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
  <button class="w3-button w3-blue w3-margin-top">Entrar</button>
</form>
<p class="w3-small w3-text-grey">Contas de teste: ana, bruno, carla ou davi @rede.com, senha 1234.</p>
<?php include 'rodape.php'; ?>
`;

const logout = php`<?php
require 'conexao.php';
$_SESSION = [];
session_destroy();
header('Location: login.php');
exit;
`;

const topo = (busca = '') => php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Rede da Turma</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<div class="w3-bar w3-blue">
  <a href="index.php" class="w3-bar-item w3-button">🐦 Rede da Turma</a>
${busca}  <?php if (usuarioLogado()): ?>
    <a href="logout.php" class="w3-bar-item w3-button w3-right">Sair</a>
    <a href="perfil.php?u=<?= e(usuarioLogado()['usuario']) ?>" class="w3-bar-item w3-button w3-right">@<?= e(usuarioLogado()['usuario']) ?></a>
  <?php else: ?>
    <a href="login.php" class="w3-bar-item w3-button w3-right">Entrar</a>
  <?php endif; ?>
</div>
<main class="w3-container w3-padding" style="max-width:960px;margin:auto">
`;

const rodape = php`</main>
</body>
</html>
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
$eu = exigirLogin();
?>
<?php include 'topo.php'; ?>
<h2>Olá, <?= e($eu['nome']) ?>!</h2>
<p>Em breve: a timeline da rede.</p>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': conexao,
  'login.php': loginPhp,
  'logout.php': logout,
  'topo.php': topo(),
  'rodape.php': rodape,
};

// ---------- etapa 1: perfil ----------

const perfilTopo = php`<?php
require 'conexao.php';

$stmt = $pdo->prepare('SELECT * FROM usuarios WHERE usuario = ?');
$stmt->execute([$_GET['u'] ?? '']);
$perfil = $stmt->fetch();

if ($perfil) {
    $stmt = $pdo->prepare('SELECT * FROM posts WHERE usuario_id = ? ORDER BY criado_em DESC');
    $stmt->execute([$perfil['id']]);
    $posts = $stmt->fetchAll();

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM seguidores WHERE seguido_id = ?');
    $stmt->execute([$perfil['id']]);
    $seguidores = $stmt->fetchColumn();

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM seguidores WHERE seguidor_id = ?');
    $stmt->execute([$perfil['id']]);
    $seguindo = $stmt->fetchColumn();
}`;

const perfilCabecalho = php`  <div class="w3-card w3-white w3-padding w3-margin-bottom">
    <h1><?= e($perfil['nome']) ?></h1>
    <p class="handle w3-text-grey">@<?= e($perfil['usuario']) ?></p>
    <p class="bio"><?= e($perfil['bio']) ?></p>
    <p class="contadores">Seguidores: <?= $seguidores ?> · Seguindo: <?= $seguindo ?></p>`;

const perfilPosts = php`  </div>
  <div id="posts">
  <?php foreach ($posts as $p): ?>
    <div class="post w3-card w3-white w3-padding w3-margin-bottom">
      <p class="texto"><?= e($p['texto']) ?></p>
      <p class="w3-small w3-text-grey"><?= quando($p['criado_em']) ?></p>
    </div>
  <?php endforeach; ?>
  </div>`;

const montarPerfil = ({ logica = '', botao = '' } = {}) => php`${perfilTopo}
${logica}?>
<?php include 'topo.php'; ?>
<?php if (!$perfil): ?>
  <div class="w3-panel w3-pale-red"><p>Usuário não encontrado</p></div>
<?php else: ?>
${perfilCabecalho}
${botao}${perfilPosts}
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

const perfil1 = montarPerfil();

// ---------- etapa 2: publicar e timeline ----------

const formPublicar = php`<form method="post" action="publicar.php" class="w3-card w3-white w3-padding w3-margin-bottom">
  <textarea class="w3-input w3-border" name="texto" maxlength="280" rows="3" placeholder="O que está acontecendo?" required></textarea>
  <button class="w3-button w3-blue w3-margin-top">Publicar</button>
</form>`;

const postNaTimeline = (extra = '') => php`    <div class="post w3-card w3-white w3-padding w3-margin-bottom" id="post-<?= $p['id'] ?>">
      <p><a class="autor" href="perfil.php?u=<?= e($p['usuario']) ?>">@<?= e($p['usuario']) ?></a>
         <span class="w3-small w3-text-grey"><?= quando($p['criado_em']) ?></span></p>
      <p class="texto"><?= e($p['texto']) ?></p>
${extra}    </div>`;

const SQL_TIMELINE = `SELECT posts.*, usuarios.usuario
     FROM posts JOIN usuarios ON usuarios.id = posts.usuario_id
     ORDER BY posts.criado_em DESC`;

const index2 = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$posts = $pdo->query(
    '${SQL_TIMELINE}'
)->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Olá, <?= e($eu['nome']) ?>!</h2>
${formPublicar}
<div id="timeline">
  <?php foreach ($posts as $p): ?>
${postNaTimeline()}
  <?php endforeach; ?>
</div>
<?php include 'rodape.php'; ?>
`;

const publicar = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$texto = trim($_POST['texto'] ?? '');
if ($texto !== '' && mb_strlen($texto) <= 280) {
    $stmt = $pdo->prepare('INSERT INTO posts (usuario_id, texto, criado_em) VALUES (?, ?, ?)');
    $stmt->execute([$eu['id'], $texto, date('Y-m-d H:i')]);
}
header('Location: index.php');
exit;
`;

// ---------- etapa 3: seguir ----------

const logicaSeguir = php`
$eu = usuarioLogado();
$jaSigo = false;
if ($perfil && $eu) {
    $stmt = $pdo->prepare('SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?');
    $stmt->execute([$eu['id'], $perfil['id']]);
    $jaSigo = (bool) $stmt->fetchColumn();
}
`;

const botaoSeguir = php`    <?php if ($eu && $eu['id'] != $perfil['id']): ?>
      <form method="post" action="seguir.php">
        <input type="hidden" name="seguido_id" value="<?= $perfil['id'] ?>">
        <button class="seguir w3-button <?= $jaSigo ? 'w3-light-grey' : 'w3-blue' ?>"><?= $jaSigo ? 'Deixar de seguir' : 'Seguir' ?></button>
      </form>
    <?php endif; ?>
`;

const perfil3 = montarPerfil({ logica: logicaSeguir, botao: botaoSeguir });

const seguir = php`<?php
require 'conexao.php';
$eu = exigirLogin();
$seguido = (int) ($_POST['seguido_id'] ?? 0);

if ($seguido !== $eu['id']) {
    $stmt = $pdo->prepare('SELECT 1 FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?');
    $stmt->execute([$eu['id'], $seguido]);
    if ($stmt->fetchColumn()) {
        $sql = 'DELETE FROM seguidores WHERE seguidor_id = ? AND seguido_id = ?';
    } else {
        $sql = 'INSERT INTO seguidores (seguidor_id, seguido_id) VALUES (?, ?)';
    }
    $pdo->prepare($sql)->execute([$eu['id'], $seguido]);
}

$stmt = $pdo->prepare('SELECT usuario FROM usuarios WHERE id = ?');
$stmt->execute([$seguido]);
$usuario = $stmt->fetchColumn();
header('Location: ' . ($usuario ? 'perfil.php?u=' . urlencode($usuario) : 'index.php'));
exit;
`;

// ---------- etapa 4: feed ----------

const SQL_FEED = `SELECT posts.*, usuarios.usuario
     FROM posts JOIN usuarios ON usuarios.id = posts.usuario_id
     WHERE posts.usuario_id = :eu
        OR posts.usuario_id IN (SELECT seguido_id FROM seguidores WHERE seguidor_id = :eu)
     ORDER BY posts.criado_em DESC`;

const montarIndex = ({ colunas = false, consultaExtra = '', extraPost = '', lateral = '' } = {}) => php`<?php
require 'conexao.php';
$eu = exigirLogin();

// Feed: meus posts e os de quem eu sigo.
$stmt = $pdo->prepare(
    '${SQL_FEED}'
);
$stmt->execute(['eu' => $eu['id']]);
$posts = $stmt->fetchAll();
${consultaExtra}?>
<?php include 'topo.php'; ?>
${colunas ? '<div class="w3-row-padding">\n<div class="w3-twothird">\n' : ''}<h2>Olá, <?= e($eu['nome']) ?>!</h2>
${formPublicar}
<div id="timeline">
  <?php foreach ($posts as $p): ?>
${postNaTimeline(extraPost)}
  <?php endforeach; ?>
</div>
${colunas ? `</div>\n${lateral}</div>\n` : ''}<?php include 'rodape.php'; ?>
`;

const index4 = montarIndex();

// ---------- etapa 5: curtidas ----------

const consultaCurtidas = php`
// Quantas curtidas cada post tem e quais eu curti.
$total = $pdo->query('SELECT post_id, COUNT(*) AS n FROM curtidas GROUP BY post_id')->fetchAll(PDO::FETCH_KEY_PAIR);
$stmt = $pdo->prepare('SELECT post_id FROM curtidas WHERE usuario_id = ?');
$stmt->execute([$eu['id']]);
$curti = $stmt->fetchAll(PDO::FETCH_COLUMN);
`;

const botaoCurtir = php`      <form method="post" action="curtir.php" class="w3-small">
        <input type="hidden" name="post_id" value="<?= $p['id'] ?>">
        <span class="curtidas">❤ <?= $total[$p['id']] ?? 0 ?></span>
        <button class="curtir w3-button w3-small w3-border"><?= in_array($p['id'], $curti) ? 'Descurtir' : 'Curtir' ?></button>
      </form>
`;

const index5 = montarIndex({ consultaExtra: consultaCurtidas, extraPost: botaoCurtir });

const curtir = php`<?php
require 'conexao.php';
$eu = exigirLogin();
$post = (int) ($_POST['post_id'] ?? 0);

$stmt = $pdo->prepare('DELETE FROM curtidas WHERE usuario_id = ? AND post_id = ?');
$stmt->execute([$eu['id'], $post]);
if ($stmt->rowCount() === 0) {
    // Ainda não tinha curtido: curte.
    $pdo->prepare('INSERT INTO curtidas (usuario_id, post_id) VALUES (?, ?)')->execute([$eu['id'], $post]);
}
header('Location: index.php');
exit;
`;

// ---------- etapa 6: busca e sugestões ----------

const consultaSugestoes = consultaCurtidas + php`
// Quem seguir: quem eu ainda não sigo, dos mais seguidos para os menos.
$stmt = $pdo->prepare(
    'SELECT usuarios.nome, usuarios.usuario, COUNT(s.seguidor_id) AS seguidores
     FROM usuarios LEFT JOIN seguidores s ON s.seguido_id = usuarios.id
     WHERE usuarios.id <> :eu
       AND usuarios.id NOT IN (SELECT seguido_id FROM seguidores WHERE seguidor_id = :eu)
     GROUP BY usuarios.id
     ORDER BY seguidores DESC, usuarios.nome
     LIMIT 3'
);
$stmt->execute(['eu' => $eu['id']]);
$sugestoes = $stmt->fetchAll();
`;

const lateralSugestoes = php`<div class="w3-third">
  <div class="sugestoes w3-card w3-white w3-padding">
    <h3>Quem seguir</h3>
    <ul class="w3-ul">
    <?php foreach ($sugestoes as $s): ?>
      <li><a href="perfil.php?u=<?= e($s['usuario']) ?>"><?= e($s['nome']) ?></a>
        <span class="w3-small w3-text-grey">@<?= e($s['usuario']) ?></span></li>
    <?php endforeach; ?>
    </ul>
  </div>
</div>
`;

const index6 = montarIndex({ colunas: true, consultaExtra: consultaSugestoes, extraPost: botaoCurtir, lateral: lateralSugestoes });

const formBusca = php`  <form action="buscar.php" class="w3-bar-item" style="padding:4px 8px">
    <input class="w3-input w3-small" name="q" placeholder="Buscar pessoas" style="width:180px">
  </form>
`;

const buscar = php`<?php
require 'conexao.php';

$q = trim($_GET['q'] ?? '');
$resultados = [];
if ($q !== '') {
    $stmt = $pdo->prepare('SELECT nome, usuario FROM usuarios WHERE nome LIKE :q OR usuario LIKE :q ORDER BY nome');
    $stmt->execute(['q' => '%' . $q . '%']);
    $resultados = $stmt->fetchAll();
}
?>
<?php include 'topo.php'; ?>
<h2>Buscar pessoas</h2>
<?php if ($q === ''): ?>
  <p>Digite algo para buscar.</p>
<?php elseif (!$resultados): ?>
  <p>Ninguém encontrado para "<?= e($q) ?>".</p>
<?php else: ?>
  <ul class="w3-ul w3-card w3-white resultados">
  <?php foreach ($resultados as $r): ?>
    <li><a href="perfil.php?u=<?= e($r['usuario']) ?>"><?= e($r['nome']) ?></a> <span class="w3-text-grey">@<?= e($r['usuario']) ?></span></li>
  <?php endforeach; ?>
  </ul>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

export const projetoRede = criarProjeto({
  id: 'rede',
  titulo: 'Rede social',
  icone: '🐦',
  descricao: 'Perfis, posts, seguir, feed, curtidas e busca: uma mini rede social.',
  banco: BANCO,
  resumo: `
    <p>Você vai construir a <b>Rede da Turma</b>, uma mini rede social com perfis, posts curtos,
    seguidores, feed, curtidas e busca.</p>
    <h2>O que já vem pronto</h2>
    <ul>
      <li><code>login.php</code> e <code>logout.php</code> (como no projeto do Blog);</li>
      <li><code>conexao.php</code> com as funções <code>usuarioLogado()</code> e <code>exigirLogin()</code>.</li>
    </ul>
    <h2>O que você vai praticar</h2>
    <ul>
      <li>tabelas de relacionamento (<code>seguidores</code>, <code>curtidas</code>) com chave primária composta;</li>
      <li>subconsultas (<code>IN (SELECT ...)</code>), <code>COUNT</code>, <code>GROUP BY</code> e <code>LEFT JOIN</code>;</li>
      <li>botões que alternam estado (seguir/deixar de seguir, curtir/descurtir);</li>
      <li>busca com <code>LIKE</code> segura usando <code>prepare</code>.</li>
    </ul>
    <p>Contas de teste: <code>ana@rede.com</code>, <code>bruno@rede.com</code>, <code>carla@rede.com</code>,
    <code>davi@rede.com</code>, todas com senha <code>1234</code>.</p>`,
  inicial,
  etapas: [
    {
      titulo: 'Página de perfil',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie <code>perfil.php?u=ana</code> (página pública) que mostre:</p>
        <ul>
          <li>o nome num <code>&lt;h1&gt;</code>, <code>&lt;p class="handle"&gt;</code> com <b>@ana</b> e <code>&lt;p class="bio"&gt;</code>;</li>
          <li><code>&lt;p class="contadores"&gt;</code> no formato <b>Seguidores: 3 · Seguindo: 1</b>;</li>
          <li>os posts da pessoa, do mais novo ao mais antigo, cada um num <code>&lt;div class="post"&gt;</code>
            dentro de <code>&lt;div id="posts"&gt;</code>.</li>
        </ul>
        <p>Usuário inexistente: <b>Usuário não encontrado</b>.</p>`,
      dica: 'Seguidores: COUNT(*) WHERE seguido_id = ?. Seguindo: COUNT(*) WHERE seguidor_id = ?.',
      alteracoes: { 'perfil.php': perfil1 },
      testes: [
        {
          descricao: 'perfil.php?u=ana',
          url: '/perfil.php?u=ana',
          regras: [
            { seletor: 'h1', texto: 'Ana Souza' },
            { seletor: 'p.handle', texto: '@ana' },
            { seletor: 'p.contadores', texto: 'Seguidores: 3 · Seguindo: 1' },
            { seletor: '#posts .post', igual: 2 },
            { seletor: '#posts .post:first-child', texto: 'Terminei o projeto do blog' },
            { semErros: true },
          ],
        },
        { descricao: 'perfil.php?u=ninguem', url: '/perfil.php?u=ninguem', regras: [{ contem: 'Usuário não encontrado' }] },
        {
          descricao: 'outro banco: perfil.php?u=zeca',
          url: '/perfil.php?u=zeca',
          banco: ALTERNATIVO,
          oculto: true,
          regras: [{ seletor: '#posts .post', igual: 1 }, { seletor: 'p.contadores', texto: 'Seguidores: 0 · Seguindo: 0' }],
        },
        {
          descricao: "perfil.php?u=' OR 1=1 --",
          url: '/perfil.php?u=%27%20OR%201%3D1%20--',
          oculto: true,
          regras: [{ contem: 'Usuário não encontrado' }, { semErros: true }],
        },
      ],
    },
    {
      titulo: 'Publicar e timeline',
      dificuldade: 'facil',
      enunciado: `
        <p>No <code>index.php</code> (já exige login):</p>
        <ul>
          <li>um formulário <code>method="post"</code> para <code>publicar.php</code> com um
            <code>&lt;textarea name="texto" maxlength="280"&gt;</code>;</li>
          <li>a timeline com <b>todos</b> os posts, do mais novo ao mais antigo, dentro de
            <code>&lt;div id="timeline"&gt;</code>. Cada post é um <code>&lt;div class="post" id="post-ID"&gt;</code>
            com um link <code>&lt;a class="autor"&gt;</code> <b>@usuario</b> para o perfil e o texto em <code>&lt;p class="texto"&gt;</code>.</li>
        </ul>
        <p>O <code>publicar.php</code> exige login, aceita de 1 a 280 caracteres (<code>mb_strlen</code>) e volta para o início.</p>`,
      dica: "No publicar.php, $eu = exigirLogin(); garante o login e devolve o usuário.",
      alteracoes: { 'index.php': index2, 'publicar.php': publicar },
      testes: [
        {
          descricao: 'timeline da Ana',
          passos: [LOGIN_ANA, { url: '/index.php', regras: [
            { seletor: 'form[action="publicar.php"][method="post" i] textarea[name="texto"][maxlength="280"]' },
            { seletor: '#timeline .post', igual: 6 },
            { seletor: '#timeline .post:first-child a.autor', texto: '@ana' },
            { seletor: '#post-3 .texto', texto: 'Novo layout com W3.CSS' },
          ] }],
        },
        {
          descricao: 'Ana publica',
          passos: [LOGIN_ANA, { url: '/publicar.php', metodo: 'POST', corpo: 'texto=Ol%C3%A1+rede', regras: [
            { seletor: '#timeline .post', igual: 7 },
            { seletor: '#timeline .post:first-child .texto', texto: 'Olá rede' },
            { semErros: true },
          ] }],
        },
        {
          descricao: 'texto com 281 caracteres',
          oculto: true,
          passos: [LOGIN_ANA, { url: '/publicar.php', metodo: 'POST', corpo: `texto=${'a'.repeat(281)}`, regras: [{ seletor: '#timeline .post', igual: 6, msg: 'Posts com mais de 280 caracteres não podem ser salvos' }] }],
        },
        {
          descricao: 'publicar sem login',
          oculto: true,
          passos: [{ url: '/publicar.php', metodo: 'POST', corpo: 'texto=invasor' }, LOGIN_ANA, { url: '/index.php', regras: [{ seletor: '#timeline .post', igual: 6 }] }],
        },
      ],
    },
    {
      titulo: 'Seguir e deixar de seguir',
      dificuldade: 'medio',
      enunciado: `
        <p>No perfil de <b>outra pessoa</b> (e só para quem está logado), mostre um formulário
        <code>method="post"</code> para <code>seguir.php</code> com o campo oculto <code>seguido_id</code> e um
        <code>&lt;button class="seguir"&gt;</code> com o texto <b>Seguir</b> ou <b>Deixar de seguir</b>.</p>
        <p>O <code>seguir.php</code> alterna: se já segue, apaga; senão, insere. Ninguém pode seguir a si mesmo.
        Depois, volta para o perfil da pessoa.</p>`,
      dica: "header('Location: perfil.php?u=' . urlencode($usuario)) volta para o perfil certo.",
      alteracoes: { 'perfil.php': perfil3, 'seguir.php': seguir },
      testes: [
        {
          descricao: 'Ana segue a Carla',
          passos: [
            LOGIN_ANA,
            { url: '/perfil.php?u=carla', regras: [{ seletor: 'button.seguir', texto: 'Seguir' }, { seletor: 'p.contadores', texto: 'Seguidores: 1' }] },
            { url: '/seguir.php', metodo: 'POST', corpo: 'seguido_id=3', regras: [
              { seletor: 'h1', texto: 'Carla Dias' },
              { seletor: 'button.seguir', texto: 'Deixar de seguir' },
              { seletor: 'p.contadores', texto: 'Seguidores: 2' },
            ] },
          ],
        },
        {
          descricao: 'Ana deixa de seguir o Bruno',
          passos: [LOGIN_ANA, { url: '/seguir.php', metodo: 'POST', corpo: 'seguido_id=2', regras: [
            { seletor: 'button.seguir', texto: 'Seguir' },
            { seletor: 'p.contadores', texto: 'Seguidores: 0' },
          ] }],
        },
        {
          descricao: 'o próprio perfil e visitante',
          passos: [
            { url: '/perfil.php?u=ana', regras: [{ seletor: 'button.seguir', igual: 0, msg: 'Deslogado não vê o botão' }] },
            LOGIN_ANA,
            { url: '/perfil.php?u=ana', regras: [{ seletor: 'button.seguir', igual: 0, msg: 'Ninguém segue a si mesmo' }] },
          ],
        },
        {
          descricao: 'seguir a si mesma via POST',
          oculto: true,
          passos: [LOGIN_ANA, { url: '/seguir.php', metodo: 'POST', corpo: 'seguido_id=1' }, { url: '/perfil.php?u=ana', regras: [{ seletor: 'p.contadores', texto: 'Seguidores: 3 · Seguindo: 1' }] }],
        },
      ],
    },
    {
      titulo: 'Feed de quem você segue',
      dificuldade: 'medio',
      enunciado: `
        <p>Troque a timeline do <code>index.php</code> por um <b>feed</b>: só os posts <b>seus</b> e de
        <b>quem você segue</b>, do mais novo ao mais antigo.</p>
        <p>A Ana segue só o Bruno, então o feed dela tem 4 posts (2 dela e 2 do Bruno).</p>`,
      dica: 'WHERE posts.usuario_id = :eu OR posts.usuario_id IN (SELECT seguido_id FROM seguidores WHERE seguidor_id = :eu)',
      alteracoes: { 'index.php': index4 },
      testes: [
        {
          descricao: 'feed da Ana',
          passos: [LOGIN_ANA, { url: '/index.php', regras: [
            { seletor: '#timeline .post', igual: 4 },
            { naoContem: 'Novo layout com W3.CSS' },
            { naoContem: 'Partida de xadrez' },
          ] }],
        },
        {
          descricao: 'Ana segue a Carla e o feed cresce',
          passos: [LOGIN_ANA, { url: '/seguir.php', metodo: 'POST', corpo: 'seguido_id=3' }, { url: '/index.php', regras: [
            { seletor: '#timeline .post', igual: 5 },
            { seletor: '#post-3', msg: 'O post da Carla deve aparecer no feed' },
          ] }],
        },
        {
          descricao: 'feed do Bruno',
          oculto: true,
          passos: [LOGIN_BRUNO, { url: '/index.php', regras: [{ seletor: '#timeline .post', igual: 5 }, { naoContem: 'Partida de xadrez' }] }],
        },
      ],
    },
    {
      titulo: 'Curtidas',
      dificuldade: 'medio',
      enunciado: `
        <p>Em cada post do feed, mostre <code>&lt;span class="curtidas"&gt;</code> com <b>❤ 2</b> (total de curtidas)
        e um formulário <code>method="post"</code> para <code>curtir.php</code> (campo oculto <code>post_id</code>) com um
        <code>&lt;button class="curtir"&gt;</code>: <b>Curtir</b> ou <b>Descurtir</b>, conforme você já curtiu.</p>
        <p>O <code>curtir.php</code> alterna a curtida e volta para o início.</p>`,
      dica: 'PDO::FETCH_KEY_PAIR transforma "post_id, COUNT(*)" num array [post_id => total].',
      alteracoes: { 'index.php': index5, 'curtir.php': curtir },
      testes: [
        {
          descricao: 'curtidas no feed da Ana',
          passos: [LOGIN_ANA, { url: '/index.php', regras: [
            { seletor: '#post-1 .curtidas', texto: '❤ 2' },
            { seletor: '#post-2 button.curtir', texto: 'Descurtir' },
            { seletor: '#post-4 button.curtir', texto: 'Curtir' },
          ] }],
        },
        {
          descricao: 'curtir e descurtir',
          passos: [
            LOGIN_ANA,
            { url: '/curtir.php', metodo: 'POST', corpo: 'post_id=4', regras: [{ seletor: '#post-4 .curtidas', texto: '❤ 1' }, { seletor: '#post-4 button.curtir', texto: 'Descurtir' }] },
            { url: '/curtir.php', metodo: 'POST', corpo: 'post_id=2', regras: [{ seletor: '#post-2 .curtidas', texto: '❤ 0' }, { seletor: '#post-2 button.curtir', texto: 'Curtir' }] },
          ],
        },
        {
          descricao: 'curtir sem login',
          oculto: true,
          passos: [{ url: '/curtir.php', metodo: 'POST', corpo: 'post_id=1' }, LOGIN_ANA, { url: '/index.php', regras: [{ seletor: '#post-1 .curtidas', texto: '❤ 2' }] }],
        },
      ],
    },
    {
      titulo: 'Busca e "Quem seguir"',
      dificuldade: 'dificil',
      enunciado: `
        <p>Duas funções para encontrar pessoas:</p>
        <ul>
          <li><b>Busca</b>: um formulário no topo (<code>action="buscar.php"</code>, campo <code>q</code>). O
            <code>buscar.php</code> procura pelo <b>nome</b> ou pelo <b>usuário</b> com <code>LIKE</code> e mostra os resultados
            numa <code>&lt;ul class="resultados"&gt;</code>. Busca vazia: <b>Digite algo para buscar.</b></li>
          <li><b>Quem seguir</b>: no <code>index.php</code>, uma coluna lateral <code>&lt;div class="sugestoes"&gt;</code> com
            até 3 pessoas que você <b>ainda não segue</b> (sem você mesmo), das <b>mais seguidas</b> para as menos.</li>
        </ul>`,
      dica: "execute(['q' => '%' . $q . '%']) põe os curingas no valor, nunca dentro do SQL.",
      alteracoes: { 'index.php': index6, 'buscar.php': buscar, 'topo.php': topo(formBusca) },
      testes: [
        {
          descricao: 'buscar.php?q=ca',
          url: '/buscar.php?q=ca',
          regras: [{ seletor: 'ul.resultados li', igual: 1 }, { seletor: 'ul.resultados li', texto: 'Carla Dias' }],
        },
        { descricao: 'buscar.php?q=a', url: '/buscar.php?q=a', regras: [{ seletor: 'ul.resultados li', igual: 4 }] },
        { descricao: 'buscar.php (vazio)', url: '/buscar.php', regras: [{ contem: 'Digite algo para buscar.' }, { seletor: 'form[action="buscar.php"] input[name="q"]', msg: 'Coloque o formulário de busca no topo' }] },
        {
          descricao: 'sugestões para a Ana',
          passos: [LOGIN_ANA, { url: '/index.php', regras: [
            { seletor: '.sugestoes li', igual: 2, msg: 'A Ana ainda não segue Carla e Davi' },
            { seletor: '.sugestoes li:first-child', texto: 'Carla Dias' },
          ] }],
        },
        {
          descricao: 'sugestões para o Bruno',
          oculto: true,
          passos: [LOGIN_BRUNO, { url: '/index.php', regras: [{ seletor: '.sugestoes li', igual: 1 }, { seletor: '.sugestoes li', texto: 'Davi Rocha' }] }],
        },
        { descricao: "buscar.php?q='", url: '/buscar.php?q=%27', oculto: true, regras: [{ semErros: true }, { seletor: 'ul.resultados li', igual: 0 }] },
      ],
    },
  ],
});
