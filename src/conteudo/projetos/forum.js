import { php } from '../util.js';
import { criarProjeto, SENHA_1234 } from './base.js';

const ESTRUTURA = `
CREATE TABLE usuarios (
  id         INTEGER PRIMARY KEY,
  nome       TEXT NOT NULL,
  email      TEXT NOT NULL UNIQUE,
  senha_hash TEXT NOT NULL
);

CREATE TABLE perguntas (
  id                 INTEGER PRIMARY KEY,
  usuario_id         INTEGER NOT NULL REFERENCES usuarios(id),
  titulo             TEXT NOT NULL,
  corpo              TEXT NOT NULL,
  criada_em          TEXT NOT NULL,
  melhor_resposta_id INTEGER
);

CREATE TABLE respostas (
  id          INTEGER PRIMARY KEY,
  pergunta_id INTEGER NOT NULL REFERENCES perguntas(id),
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  texto       TEXT NOT NULL,
  criada_em   TEXT NOT NULL
);

-- valor: +1 (voto positivo) ou -1 (negativo); um voto por pessoa em cada resposta
CREATE TABLE votos (
  usuario_id  INTEGER NOT NULL REFERENCES usuarios(id),
  resposta_id INTEGER NOT NULL REFERENCES respostas(id),
  valor       INTEGER NOT NULL,
  PRIMARY KEY (usuario_id, resposta_id)
);
`;

const BANCO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, email, senha_hash) VALUES
  (1, 'Ana Souza',  'ana@forum.com',   '${SENHA_1234}'),
  (2, 'Bruno Lima', 'bruno@forum.com', '${SENHA_1234}'),
  (3, 'Carla Dias', 'carla@forum.com', '${SENHA_1234}');

INSERT INTO perguntas (id, usuario_id, titulo, corpo, criada_em, melhor_resposta_id) VALUES
  (1, 1, 'Como conectar no MySQL com PDO?', 'Qual é o DSN para conectar no MySQL?', '2026-06-01 10:00', NULL),
  (2, 2, 'Diferença entre include e require?', 'Quando usar cada um?', '2026-06-02 11:00', 3),
  (3, 3, 'Como centralizar uma div com W3.CSS?', 'Quero o conteúdo no meio da página.', '2026-06-03 09:00', NULL);

INSERT INTO respostas (id, pergunta_id, usuario_id, texto, criada_em) VALUES
  (1, 1, 2, 'Use new PDO com o DSN mysql:host=localhost;dbname=...', '2026-06-01 11:00'),
  (2, 1, 3, 'Não esqueça do charset=utf8mb4 no DSN.', '2026-06-01 12:00'),
  (3, 2, 1, 'O require para o script se o arquivo não existir.', '2026-06-02 12:00'),
  (4, 2, 3, 'O include só mostra um aviso e continua.', '2026-06-02 13:00');

INSERT INTO votos (usuario_id, resposta_id, valor) VALUES (1, 1, 1), (3, 1, 1), (1, 2, 1);
`;

const ALTERNATIVO = `${ESTRUTURA}
INSERT INTO usuarios (id, nome, email, senha_hash) VALUES (1, 'Zeca Prado', 'zeca@forum.com', '${SENHA_1234}');
INSERT INTO perguntas (id, usuario_id, titulo, corpo, criada_em) VALUES (1, 1, 'Pergunta única do fórum', 'Corpo.', '2026-01-01 10:00');
INSERT INTO respostas (id, pergunta_id, usuario_id, texto, criada_em) VALUES (1, 1, 1, 'Resposta única.', '2026-01-01 11:00');
`;

const login = (quem) => ({ url: '/login.php', metodo: 'POST', corpo: `email=${quem}%40forum.com&senha=1234` });
const LOGIN_ANA = login('ana');
const LOGIN_BRUNO = login('bruno');
const LOGIN_CARLA = login('carla');
const votar = (resposta, valor) => ({ url: '/votar.php', metodo: 'POST', corpo: `resposta_id=${resposta}&valor=${valor}` });

// ---------- arquivos iniciais (login pronto) ----------

const conexao = php`<?php
session_start();

$pdo = new PDO('sqlite:/banco/escola.sqlite');
$pdo->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

function e(?string $texto): string {
    return htmlspecialchars($texto ?? '');
}

function dataBr(string $data): string {
    return date('d/m/Y H:i', strtotime($data));
}

function usuarioLogado(): ?array {
    return $_SESSION['usuario'] ?? null;
}

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
        $_SESSION['usuario'] = ['id' => $u['id'], 'nome' => $u['nome']];
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
  <button class="w3-button w3-deep-orange w3-margin-top">Entrar</button>
</form>
<p class="w3-small w3-text-grey">Contas de teste: ana, bruno ou carla @forum.com, senha 1234.</p>
<?php include 'rodape.php'; ?>
`;

const logout = php`<?php
require 'conexao.php';
$_SESSION = [];
session_destroy();
header('Location: index.php');
exit;
`;

const topo = php`<!DOCTYPE html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Fórum da Turma</title>
  <link rel="stylesheet" href="https://www.w3schools.com/w3css/5/w3.css">
</head>
<body class="w3-light-grey">
<div class="w3-bar w3-deep-orange">
  <a href="index.php" class="w3-bar-item w3-button">💬 Fórum da Turma</a>
  <?php if (usuarioLogado()): ?>
    <a href="logout.php" class="w3-bar-item w3-button w3-right">Sair</a>
    <span class="w3-bar-item w3-right">Olá, <?= e(usuarioLogado()['nome']) ?></span>
  <?php else: ?>
    <a href="login.php" class="w3-bar-item w3-button w3-right">Entrar</a>
  <?php endif; ?>
</div>
<main class="w3-container w3-padding" style="max-width:900px;margin:auto">
`;

const rodape = php`</main>
</body>
</html>
`;

const inicial = {
  'index.php': php`<?php
require 'conexao.php';
// Etapa 1: busque as perguntas com a quantidade de respostas
?>
<?php include 'topo.php'; ?>
<h2>Perguntas</h2>
<?php include 'rodape.php'; ?>
`,
  'conexao.php': conexao,
  'login.php': loginPhp,
  'logout.php': logout,
  'topo.php': topo,
  'rodape.php': rodape,
};

// ---------- etapa 1: lista ----------

const montarIndex = (botao = '') => php`<?php
require 'conexao.php';

$perguntas = $pdo->query(
    'SELECT perguntas.*, usuarios.nome AS autor, COUNT(respostas.id) AS total_respostas
     FROM perguntas
     JOIN usuarios ON usuarios.id = perguntas.usuario_id
     LEFT JOIN respostas ON respostas.pergunta_id = perguntas.id
     GROUP BY perguntas.id
     ORDER BY perguntas.criada_em DESC'
)->fetchAll();
?>
<?php include 'topo.php'; ?>
<h2>Perguntas</h2>
${botao}<?php foreach ($perguntas as $p): ?>
  <div class="pergunta w3-card w3-white w3-padding w3-margin-bottom" id="pergunta-<?= $p['id'] ?>">
    <h3><a href="pergunta.php?id=<?= $p['id'] ?>"><?= e($p['titulo']) ?></a></h3>
    <p class="w3-small w3-text-grey">
      por <?= e($p['autor']) ?> ·
      <span class="respostas"><?= $p['total_respostas'] ?> <?= $p['total_respostas'] == 1 ? 'resposta' : 'respostas' ?></span>
      <?php if ($p['melhor_resposta_id']): ?>
        <span class="resolvida w3-tag w3-green">✔ Resolvida</span>
      <?php endif; ?>
    </p>
  </div>
<?php endforeach; ?>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 2 em diante: página da pergunta ----------

const buscarPergunta = php`$stmt = $pdo->prepare(
    'SELECT perguntas.*, usuarios.nome AS autor
     FROM perguntas JOIN usuarios ON usuarios.id = perguntas.usuario_id
     WHERE perguntas.id = ?'
);
$stmt->execute([(int) ($_GET['id'] ?? 0)]);
$pergunta = $stmt->fetch();
$eu = usuarioLogado();`;

const RESPOSTAS_POR_DATA = php`
$respostas = [];
if ($pergunta) {
    $stmt = $pdo->prepare(
        'SELECT respostas.*, usuarios.nome AS autor
         FROM respostas JOIN usuarios ON usuarios.id = respostas.usuario_id
         WHERE pergunta_id = ?
         ORDER BY respostas.criada_em'
    );
    $stmt->execute([$pergunta['id']]);
    $respostas = $stmt->fetchAll();
}`;

// Pontos = soma dos votos. A melhor resposta vem primeiro; depois, as mais votadas.
const RESPOSTAS_POR_VOTOS = php`
$respostas = [];
if ($pergunta) {
    $stmt = $pdo->prepare(
        'SELECT respostas.*, usuarios.nome AS autor, COALESCE(SUM(votos.valor), 0) AS pontos
         FROM respostas
         JOIN usuarios ON usuarios.id = respostas.usuario_id
         LEFT JOIN votos ON votos.resposta_id = respostas.id
         WHERE pergunta_id = :pergunta
         GROUP BY respostas.id
         ORDER BY (respostas.id = :melhor) DESC, pontos DESC, respostas.criada_em'
    );
    $stmt->execute(['pergunta' => $pergunta['id'], 'melhor' => $pergunta['melhor_resposta_id'] ?? 0]);
    $respostas = $stmt->fetchAll();
}`;

const blocoVotos = php`        <span class="pontos w3-tag w3-light-grey"><?= $r['pontos'] ?></span>
        <?php if ($eu && $eu['id'] != $r['usuario_id']): ?>
          <form method="post" action="votar.php" style="display:inline">
            <input type="hidden" name="resposta_id" value="<?= $r['id'] ?>">
            <button class="votar-cima w3-button w3-small" name="valor" value="1">▲</button>
            <button class="votar-baixo w3-button w3-small" name="valor" value="-1">▼</button>
          </form>
        <?php endif; ?>
`;

const blocoMarcar = php`        <?php if ($eu && $eu['id'] == $pergunta['usuario_id'] && $r['id'] != $pergunta['melhor_resposta_id']): ?>
          <form method="post" action="marcar.php" style="display:inline">
            <input type="hidden" name="resposta_id" value="<?= $r['id'] ?>">
            <button class="marcar w3-button w3-small w3-green">Marcar como melhor</button>
          </form>
        <?php endif; ?>
`;

const montarPergunta = ({ consulta = RESPOSTAS_POR_DATA, votos = '', marcar = '', melhor = false } = {}) => php`<?php
require 'conexao.php';
${buscarPergunta}
${consulta}
?>
<?php include 'topo.php'; ?>
<?php if (!$pergunta): ?>
  <div class="w3-panel w3-pale-red"><p>Pergunta não encontrada</p></div>
<?php else: ?>
  <div class="w3-card w3-white w3-padding">
    <h1><?= e($pergunta['titulo']) ?></h1>
    <div class="corpo"><?= nl2br(e($pergunta['corpo'])) ?></div>
    <p class="w3-small w3-text-grey">por <?= e($pergunta['autor']) ?> em <?= dataBr($pergunta['criada_em']) ?></p>
  </div>

  <h3><?= count($respostas) ?> resposta(s)</h3>
  <div class="respostas">
  <?php foreach ($respostas as $r): ?>
    ${melhor
      ? `<?php $ehMelhor = $r['id'] == $pergunta['melhor_resposta_id']; ?>
    <div class="resposta w3-panel w3-white w3-leftbar <?= $ehMelhor ? 'melhor w3-border-green' : 'w3-border-deep-orange' ?>" id="resposta-<?= $r['id'] ?>">
      <?php if ($ehMelhor): ?><p class="w3-text-green"><b>✔ Melhor resposta</b></p><?php endif; ?>`
      : `<div class="resposta w3-panel w3-white w3-leftbar w3-border-deep-orange" id="resposta-<?= $r['id'] ?>">`}
      <p class="texto"><?= nl2br(e($r['texto'])) ?></p>
      <p class="w3-small w3-text-grey">
        <?= e($r['autor']) ?> em <?= dataBr($r['criada_em']) ?>
${votos}${marcar}      </p>
    </div>
  <?php endforeach; ?>
  </div>

  <?php if ($eu): ?>
    <form method="post" action="responder.php" class="w3-card w3-white w3-padding">
      <input type="hidden" name="pergunta_id" value="<?= $pergunta['id'] ?>">
      <textarea class="w3-input w3-border" name="texto" rows="4" placeholder="Sua resposta" required></textarea>
      <button class="w3-button w3-deep-orange w3-margin-top">Responder</button>
    </form>
  <?php else: ?>
    <p><a href="login.php">Entre</a> para responder.</p>
  <?php endif; ?>
<?php endif; ?>
<?php include 'rodape.php'; ?>
`;

const responder = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$perguntaId = (int) ($_POST['pergunta_id'] ?? 0);
$texto = trim($_POST['texto'] ?? '');
if ($texto !== '') {
    $stmt = $pdo->prepare('INSERT INTO respostas (pergunta_id, usuario_id, texto, criada_em) VALUES (?, ?, ?, ?)');
    $stmt->execute([$perguntaId, $eu['id'], $texto, date('Y-m-d H:i')]);
}
header('Location: pergunta.php?id=' . $perguntaId);
exit;
`;

// ---------- etapa 3: perguntar ----------

const botaoPerguntar = php`<?php if (usuarioLogado()): ?>
  <p><a class="perguntar w3-button w3-deep-orange" href="perguntar.php">❓ Fazer uma pergunta</a></p>
<?php endif; ?>
`;

const perguntar = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$erro = '';
$titulo = trim($_POST['titulo'] ?? '');
$corpo = trim($_POST['corpo'] ?? '');
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    if (mb_strlen($titulo) < 10) {
        $erro = 'O título precisa ter pelo menos 10 caracteres.';
    } elseif ($corpo === '') {
        $erro = 'Descreva a sua dúvida.';
    } else {
        $stmt = $pdo->prepare('INSERT INTO perguntas (usuario_id, titulo, corpo, criada_em) VALUES (?, ?, ?, ?)');
        $stmt->execute([$eu['id'], $titulo, $corpo, date('Y-m-d H:i')]);
        header('Location: pergunta.php?id=' . $pdo->lastInsertId());
        exit;
    }
}
?>
<?php include 'topo.php'; ?>
<h2>Nova pergunta</h2>
<?php if ($erro): ?>
  <div class="w3-panel w3-pale-red"><p><?= e($erro) ?></p></div>
<?php endif; ?>
<form method="post" class="w3-card w3-white w3-padding">
  <input class="w3-input w3-border" name="titulo" value="<?= e($titulo) ?>" placeholder="Título (mínimo 10 caracteres)">
  <textarea class="w3-input w3-border w3-margin-top" name="corpo" rows="5" placeholder="Descreva a dúvida"><?= e($corpo) ?></textarea>
  <button class="w3-button w3-deep-orange w3-margin-top">Publicar pergunta</button>
</form>
<?php include 'rodape.php'; ?>
`;

// ---------- etapa 4: votos ----------

const votarPhp = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$respostaId = (int) ($_POST['resposta_id'] ?? 0);
$valor = (int) ($_POST['valor'] ?? 0);

$stmt = $pdo->prepare('SELECT * FROM respostas WHERE id = ?');
$stmt->execute([$respostaId]);
$resposta = $stmt->fetch();

// Só +1 ou -1, e ninguém vota na própria resposta.
if ($resposta && in_array($valor, [1, -1], true) && $resposta['usuario_id'] != $eu['id']) {
    // Um voto por pessoa: se já votou, troca o valor.
    $stmt = $pdo->prepare(
        'INSERT INTO votos (usuario_id, resposta_id, valor) VALUES (?, ?, ?)
         ON CONFLICT (usuario_id, resposta_id) DO UPDATE SET valor = excluded.valor'
    );
    $stmt->execute([$eu['id'], $respostaId, $valor]);
}
header('Location: pergunta.php?id=' . ($resposta['pergunta_id'] ?? 0));
exit;
`;

// ---------- etapa 5: melhor resposta ----------

const marcarPhp = php`<?php
require 'conexao.php';
$eu = exigirLogin();

$stmt = $pdo->prepare(
    'SELECT respostas.id, perguntas.id AS pergunta_id, perguntas.usuario_id AS dono
     FROM respostas JOIN perguntas ON perguntas.id = respostas.pergunta_id
     WHERE respostas.id = ?'
);
$stmt->execute([(int) ($_POST['resposta_id'] ?? 0)]);
$alvo = $stmt->fetch();

// Só quem fez a pergunta escolhe a melhor resposta.
if ($alvo && $alvo['dono'] == $eu['id']) {
    $pdo->prepare('UPDATE perguntas SET melhor_resposta_id = ? WHERE id = ?')->execute([$alvo['id'], $alvo['pergunta_id']]);
}
header('Location: pergunta.php?id=' . ($alvo['pergunta_id'] ?? 0));
exit;
`;

export const projetoForum = criarProjeto({
  id: 'forum',
  titulo: 'Fórum de perguntas',
  icone: '💬',
  descricao: 'Perguntas, respostas, votos e melhor resposta, no estilo do Stack Overflow.',
  banco: BANCO,
  resumo: `
    <p>Você vai construir o <b>Fórum da Turma</b>, parecido com o Stack Overflow: perguntas, respostas,
    votos para cima e para baixo e a escolha da melhor resposta.</p>
    <h2>O que já vem pronto</h2>
    <ul><li>login/logout e as funções <code>usuarioLogado()</code> e <code>exigirLogin()</code>.</li></ul>
    <h2>O que você vai praticar</h2>
    <ul>
      <li><code>LEFT JOIN</code> + <code>COUNT</code> e <code>COALESCE(SUM(...), 0)</code>;</li>
      <li><b>upsert</b>: <code>INSERT ... ON CONFLICT ... DO UPDATE</code> (um voto por pessoa);</li>
      <li>ordenação com várias regras (melhor resposta primeiro, depois as mais votadas);</li>
      <li><b>autorização</b>: só o autor da pergunta escolhe a melhor resposta; ninguém vota em si mesmo.</li>
    </ul>
    <p>Contas de teste: <code>ana@forum.com</code>, <code>bruno@forum.com</code>, <code>carla@forum.com</code>, senha <code>1234</code>.</p>`,
  inicial,
  etapas: [
    {
      titulo: 'Lista de perguntas',
      dificuldade: 'facil',
      enunciado: `
        <p>No <code>index.php</code>, liste as perguntas da <b>mais nova para a mais antiga</b>. Cada uma num
        <code>&lt;div class="pergunta" id="pergunta-ID"&gt;</code> com:</p>
        <ul>
          <li>um <code>&lt;h3&gt;</code> com link para <code>pergunta.php?id=ID</code>;</li>
          <li><code>&lt;span class="respostas"&gt;</code> com <b>2 respostas</b> (ou <b>1 resposta</b>, <b>0 respostas</b>);</li>
          <li>se tiver melhor resposta escolhida: <code>&lt;span class="resolvida"&gt;</code> <b>✔ Resolvida</b>.</li>
        </ul>`,
      dica: 'LEFT JOIN respostas + COUNT(respostas.id) conta 0 para perguntas sem resposta.',
      alteracoes: { 'index.php': montarIndex() },
      testes: [
        {
          descricao: 'index.php',
          regras: [
            { seletor: '.pergunta', igual: 3 },
            { seletor: '.pergunta:first-of-type h3', texto: 'Como centralizar uma div com W3.CSS?' },
            { seletor: '#pergunta-1 .respostas', texto: '2 respostas' },
            { seletor: '#pergunta-3 .respostas', texto: '0 respostas' },
            { seletor: '.resolvida', igual: 1 },
            { seletor: '#pergunta-2 .resolvida', texto: '✔ Resolvida' },
            { seletor: 'a[href="pergunta.php?id=1"]' },
            { semErros: true },
          ],
        },
        { descricao: 'outro banco', banco: ALTERNATIVO, oculto: true, regras: [{ seletor: '#pergunta-1 .respostas', texto: '1 resposta' }, { seletor: '.resolvida', igual: 0 }] },
      ],
    },
    {
      titulo: 'Ver a pergunta e responder',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie <code>pergunta.php?id=ID</code> com o título num <code>&lt;h1&gt;</code>, o texto em
        <code>&lt;div class="corpo"&gt;</code> e as respostas (mais antigas primeiro) em
        <code>&lt;div class="resposta" id="resposta-ID"&gt;</code> dentro de <code>&lt;div class="respostas"&gt;</code>.</p>
        <ul>
          <li>Logado: formulário <code>method="post"</code> para <code>responder.php</code> com <code>pergunta_id</code> (oculto) e
            <code>&lt;textarea name="texto"&gt;</code>.</li>
          <li>Deslogado: um link para <code>login.php</code> no lugar do formulário.</li>
          <li>Pergunta inexistente: <b>Pergunta não encontrada</b>.</li>
        </ul>
        <p>O <code>responder.php</code> exige login, grava a resposta e volta para a pergunta.</p>`,
      dica: "Depois de gravar: header('Location: pergunta.php?id=' . $perguntaId);",
      alteracoes: { 'pergunta.php': montarPergunta(), 'responder.php': responder },
      testes: [
        {
          descricao: 'pergunta.php?id=1 (deslogado)',
          url: '/pergunta.php?id=1',
          regras: [
            { seletor: 'h1', texto: 'Como conectar no MySQL com PDO?' },
            { seletor: '.corpo', texto: 'Qual é o DSN' },
            { seletor: '.respostas .resposta', igual: 2 },
            { seletor: 'form[action="responder.php"]', igual: 0, msg: 'Deslogado não vê o formulário' },
            { seletor: 'main a[href="login.php"]', msg: 'Deslogado vê um link para entrar' },
          ],
        },
        {
          descricao: 'Ana responde a pergunta 3',
          passos: [LOGIN_ANA, { url: '/responder.php', metodo: 'POST', corpo: 'pergunta_id=3&texto=Use+w3-center', regras: [
            { seletor: 'h1', texto: 'Como centralizar uma div com W3.CSS?' },
            { seletor: '.respostas .resposta', igual: 1 },
            { seletor: '.resposta .texto', texto: 'Use w3-center' },
            { semErros: true },
          ] }],
        },
        { descricao: 'pergunta.php?id=99', url: '/pergunta.php?id=99', regras: [{ contem: 'Pergunta não encontrada' }] },
        {
          descricao: 'responder sem login',
          oculto: true,
          passos: [{ url: '/responder.php', metodo: 'POST', corpo: 'pergunta_id=3&texto=invasor' }, { url: '/pergunta.php?id=3', regras: [{ seletor: '.resposta', igual: 0 }] }],
        },
        {
          descricao: 'resposta com HTML',
          oculto: true,
          passos: [LOGIN_ANA, { url: '/responder.php', metodo: 'POST', corpo: 'pergunta_id=3&texto=%3Cscript%3Ealert(1)%3C%2Fscript%3E', regras: [{ seletor: '.resposta script', igual: 0, msg: 'Use e() / htmlspecialchars nas respostas' }] }],
        },
      ],
    },
    {
      titulo: 'Fazer perguntas',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie <code>perguntar.php</code> (só logado) com um formulário <code>method="post"</code> com <code>titulo</code> e
        <code>corpo</code>:</p>
        <ul>
          <li>título com menos de 10 caracteres: <b>O título precisa ter pelo menos 10 caracteres.</b> (mantenha o que foi digitado);</li>
          <li>corpo vazio: <b>Descreva a sua dúvida.</b>;</li>
          <li>tudo certo: grava e redireciona para a pergunta criada.</li>
        </ul>
        <p>No <code>index.php</code>, para quem está logado, um link <code>&lt;a class="perguntar"&gt;</code>.</p>`,
      dica: 'mb_strlen conta caracteres acentuados corretamente; strlen conta bytes.',
      alteracoes: { 'index.php': montarIndex(botaoPerguntar), 'perguntar.php': perguntar },
      testes: [
        {
          descricao: 'Bruno faz uma pergunta',
          passos: [
            LOGIN_BRUNO,
            { url: '/index.php', regras: [{ seletor: 'a.perguntar[href="perguntar.php"]' }] },
            { url: '/perguntar.php', metodo: 'POST', corpo: 'titulo=O+que+%C3%A9+uma+sess%C3%A3o%3F&corpo=Como+funciona+o+%24_SESSION%3F', regras: [
              { seletor: 'h1', texto: 'O que é uma sessão?' },
              { seletor: '.corpo', texto: 'Como funciona o $_SESSION?' },
            ] },
            { url: '/index.php', regras: [{ seletor: '.pergunta', igual: 4 }, { seletor: '.pergunta:first-of-type h3', texto: 'O que é uma sessão?' }] },
          ],
        },
        {
          descricao: 'título curto',
          passos: [LOGIN_BRUNO, { url: '/perguntar.php', metodo: 'POST', corpo: 'titulo=Ajuda&corpo=Socorro', regras: [
            { contem: 'O título precisa ter pelo menos 10 caracteres.' },
            { seletor: 'input[name="titulo"][value="Ajuda"]', msg: 'Mantenha o título digitado no campo' },
          ] }],
        },
        {
          descricao: 'deslogado',
          passos: [{ url: '/index.php', regras: [{ seletor: 'a.perguntar', igual: 0 }] }, { url: '/perguntar.php', regras: [{ seletor: 'input[name="senha"]', msg: 'Deslogado vai para o login' }] }],
        },
        {
          descricao: 'corpo vazio',
          oculto: true,
          passos: [LOGIN_BRUNO, { url: '/perguntar.php', metodo: 'POST', corpo: 'titulo=Uma+pergunta+v%C3%A1lida&corpo=', regras: [{ contem: 'Descreva a sua dúvida.' }] }],
        },
      ],
    },
    {
      titulo: 'Votos nas respostas',
      dificuldade: 'dificil',
      enunciado: `
        <p>Em cada resposta, mostre <code>&lt;span class="pontos"&gt;</code> com a soma dos votos e, para quem está logado
        e <b>não é o autor da resposta</b>, um formulário <code>method="post"</code> para <code>votar.php</code> com
        <code>resposta_id</code> e dois botões <code>name="valor"</code>: <code>&lt;button class="votar-cima" value="1"&gt;</code> e
        <code>&lt;button class="votar-baixo" value="-1"&gt;</code>.</p>
        <ul>
          <li>Cada pessoa tem <b>um voto</b> por resposta: votar de novo troca o valor.</li>
          <li>Ninguém vota na própria resposta.</li>
          <li>As respostas aparecem da <b>mais votada</b> para a menos votada.</li>
        </ul>`,
      dica: 'INSERT ... ON CONFLICT (usuario_id, resposta_id) DO UPDATE SET valor = excluded.valor',
      alteracoes: { 'pergunta.php': montarPergunta({ consulta: RESPOSTAS_POR_VOTOS, votos: blocoVotos }), 'votar.php': votarPhp },
      testes: [
        {
          descricao: 'pergunta.php?id=1',
          url: '/pergunta.php?id=1',
          regras: [
            { seletor: '#resposta-1 .pontos', texto: '2' },
            { seletor: '#resposta-2 .pontos', texto: '1' },
            { seletor: '.respostas .resposta:first-child', texto: 'Use new PDO' },
          ],
        },
        {
          descricao: 'Bruno vota na resposta da Carla',
          passos: [
            LOGIN_BRUNO,
            { url: '/pergunta.php?id=1', regras: [
              { seletor: '#resposta-2 button.votar-cima[value="1"]' },
              { seletor: '#resposta-1 button.votar-cima', igual: 0, msg: 'Bruno não vota na própria resposta' },
            ] },
            { ...votar(2, 1), regras: [{ seletor: '#resposta-2 .pontos', texto: '2' }] },
            { ...votar(2, 1), regras: [{ seletor: '#resposta-2 .pontos', texto: '2', msg: 'Só um voto por pessoa' }] },
            { ...votar(2, -1), regras: [{ seletor: '#resposta-2 .pontos', texto: '0', msg: 'Votar de novo troca o voto' }] },
          ],
        },
        {
          descricao: 'Carla muda o voto e a ordem muda',
          passos: [LOGIN_CARLA, { ...votar(1, -1), regras: [
            { seletor: '#resposta-1 .pontos', texto: '0' },
            { seletor: '.respostas .resposta:first-child', texto: 'charset=utf8mb4' },
          ] }],
        },
        {
          descricao: 'votar na própria resposta via POST',
          oculto: true,
          passos: [LOGIN_CARLA, { ...votar(2, 1), regras: [{ seletor: '#resposta-2 .pontos', texto: '1' }] }],
        },
        {
          descricao: 'voto com valor inválido',
          oculto: true,
          passos: [LOGIN_BRUNO, { ...votar(2, 50), regras: [{ seletor: '#resposta-2 .pontos', texto: '1' }] }],
        },
      ],
    },
    {
      titulo: 'Melhor resposta',
      dificuldade: 'medio',
      enunciado: `
        <p>Só o <b>autor da pergunta</b> vê, em cada resposta (exceto a já escolhida), um formulário
        <code>method="post"</code> para <code>marcar.php</code> com <code>resposta_id</code> e um
        <code>&lt;button class="marcar"&gt;</code>.</p>
        <p>O <code>marcar.php</code> confere se quem está logado é o dono da pergunta e grava
        <code>melhor_resposta_id</code>. A melhor resposta ganha a classe <code>melhor</code>, o texto
        <b>✔ Melhor resposta</b> e aparece <b>primeiro</b>, mesmo com menos votos.</p>`,
      dica: 'ORDER BY (respostas.id = :melhor) DESC, pontos DESC: a comparação vale 1 para a melhor resposta.',
      alteracoes: { 'pergunta.php': montarPergunta({ consulta: RESPOSTAS_POR_VOTOS, votos: blocoVotos, marcar: blocoMarcar, melhor: true }), 'marcar.php': marcarPhp },
      testes: [
        {
          descricao: 'pergunta.php?id=2',
          url: '/pergunta.php?id=2',
          regras: [
            { seletor: '.resposta.melhor', igual: 1 },
            { seletor: '.respostas .resposta:first-child.melhor', msg: 'A melhor resposta aparece primeiro' },
            { seletor: '.melhor', texto: '✔ Melhor resposta' },
          ],
        },
        {
          descricao: 'Ana escolhe a resposta da Carla',
          passos: [
            LOGIN_ANA,
            { url: '/pergunta.php?id=1', regras: [{ seletor: 'button.marcar', igual: 2 }] },
            { url: '/marcar.php', metodo: 'POST', corpo: 'resposta_id=2', regras: [
              { seletor: '#resposta-2.melhor' },
              { seletor: '.respostas .resposta:first-child', texto: 'charset=utf8mb4' },
            ] },
            { url: '/index.php', regras: [{ seletor: '#pergunta-1 .resolvida' }] },
          ],
        },
        {
          descricao: 'Bruno tenta escolher na pergunta da Ana',
          passos: [
            LOGIN_BRUNO,
            { url: '/pergunta.php?id=1', regras: [{ seletor: 'button.marcar', igual: 0, msg: 'Só o autor da pergunta vê o botão' }] },
            { url: '/marcar.php', metodo: 'POST', corpo: 'resposta_id=2' },
            { url: '/pergunta.php?id=1', regras: [{ seletor: '.melhor', igual: 0, msg: 'Só o autor da pergunta pode escolher' }] },
          ],
        },
        {
          descricao: 'sem login',
          oculto: true,
          passos: [{ url: '/marcar.php', metodo: 'POST', corpo: 'resposta_id=1' }, { url: '/pergunta.php?id=1', regras: [{ seletor: '.melhor', igual: 0 }] }],
        },
      ],
    },
  ],
});
