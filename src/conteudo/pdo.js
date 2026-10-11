import { BANCO_ALTERNATIVO, BANCO_ESCOLA } from './bancos.js';
import { documento, php } from './util.js';

const pagina = (topo, corpo, titulo) => ({
  'index.php': documento(corpo, { w3: true, classeBody: 'w3-container', topo, titulo }),
});

const CONEXAO = php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');
`;

const ALT = BANCO_ALTERNATIVO;

export const moduloPdo = {
  id: 'pdo',
  titulo: 'PHP + PDO',
  icone: '🗄️',
  descricao: 'Banco de dados de verdade: conectar, consultar, filtrar com segurança, inserir e paginar.',
  itens: [
    {
      id: 'licao-pdo-conectar',
      tipo: 'licao',
      titulo: 'Conectando e consultando com PDO',
      banco: BANCO_ESCOLA,
      resumo: `
        <p><b>PDO</b> é a forma padrão de o PHP falar com bancos de dados. O código é o mesmo para MySQL,
        PostgreSQL ou SQLite: só muda a <b>linha de conexão</b> (DSN).</p>
        <pre class="trecho">// Aqui no playground (SQLite):
$pdo = new PDO('sqlite:/banco/escola.sqlite');

// Num servidor com MySQL seria:
$pdo = new PDO('mysql:host=localhost;dbname=escola;charset=utf8mb4', 'usuario', 'senha');</pre>
        <p><code>query()</code> executa um SQL e <code>fetchAll(PDO::FETCH_ASSOC)</code> devolve um array de linhas.
        Veja as tabelas na aba <b>Banco</b>. O banco volta ao original a cada execução.</p>`,
      arquivos: pagina(php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');

$alunos = $pdo->query('SELECT nome, idade, nota FROM alunos ORDER BY nome')
              ->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Alunos (<?= count($alunos) ?>)</h2>
  <table class="w3-table-all">
    <tr class="w3-indigo"><th>Nome</th><th>Idade</th><th>Nota</th></tr>
    <?php foreach ($alunos as $aluno): ?>
      <tr>
        <td><?= $aluno['nome'] ?></td>
        <td><?= $aluno['idade'] ?></td>
        <td><?= number_format($aluno['nota'], 1, ',', '') ?></td>
      </tr>
    <?php endforeach; ?>
  </table>`, 'Alunos'),
    },
    {
      id: 'pdo-contar',
      tipo: 'problema',
      titulo: 'Conectar e contar',
      dificuldade: 'facil',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Conecte ao banco com <code>new PDO('sqlite:/banco/escola.sqlite')</code> e mostre
        <b>Total de alunos: 8</b>, contando com <code>SELECT COUNT(*)</code>.</p>
        <p>O número deve vir do banco: há um caso oculto com outro banco.</p>`,
      dica: "$pdo->query('SELECT COUNT(*) FROM alunos')->fetchColumn() devolve só o número.",
      arquivos: pagina(php`<?php
// conecte ao banco aqui
?>
`, '  <h2>Escola</h2>', 'Contar'),
      solucao: pagina(php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');
$total = $pdo->query('SELECT COUNT(*) FROM alunos')->fetchColumn();
?>
`, '  <h2>Escola</h2>\n  <p>Total de alunos: <?= $total ?></p>', 'Contar'),
      testes: [
        { descricao: 'banco escola', regras: [{ contem: 'Total de alunos: 8' }, { semErros: true }] },
        {
          regras: [
            { codigo: 'new\\s+PDO\\s*\\(', msg: 'Conecte com new PDO(...)' },
            { codigo: 'COUNT\\s*\\(', msg: 'Use SELECT COUNT(*)' },
          ],
        },
        { descricao: 'outro banco (3 alunos)', banco: ALT, oculto: true, regras: [{ contem: 'Total de alunos: 3' }] },
      ],
    },
    {
      id: 'pdo-listar',
      tipo: 'problema',
      titulo: 'Listar nomes em ordem',
      dificuldade: 'facil',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Liste o nome de todos os alunos em <b>ordem alfabética</b>, um por <code>&lt;li&gt;</code>,
        dentro de <code>&lt;ul class="w3-ul w3-border"&gt;</code>.</p>`,
      dica: 'SELECT nome FROM alunos ORDER BY nome, depois foreach para gerar os <li>.',
      arquivos: pagina(CONEXAO + '?>\n', '  <h2>Alunos</h2>\n  <ul class="w3-ul w3-border">\n  </ul>', 'Listar'),
      solucao: pagina(CONEXAO + php`$nomes = $pdo->query('SELECT nome FROM alunos ORDER BY nome')->fetchAll(PDO::FETCH_COLUMN);
?>
`, `  <h2>Alunos</h2>
  <ul class="w3-ul w3-border">
    <?php foreach ($nomes as $nome): ?>
      <li><?= htmlspecialchars($nome) ?></li>
    <?php endforeach; ?>
  </ul>`, 'Listar'),
      testes: [
        {
          descricao: 'banco escola',
          regras: [
            { seletor: 'ul.w3-ul li', igual: 8, msg: 'A lista deve ter os 8 alunos' },
            { seletor: 'ul.w3-ul li:first-child', texto: 'Ana Souza' },
            { seletor: 'ul.w3-ul li:last-child', texto: 'Hugo Melo' },
            { semErros: true },
          ],
        },
        { regras: [{ codigo: 'ORDER\\s+BY', msg: 'Ordene no SQL com ORDER BY' }] },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [{ seletor: 'ul.w3-ul li', igual: 3 }, { seletor: 'ul.w3-ul li:first-child', texto: 'Xavier Luz' }],
        },
      ],
    },
    {
      id: 'pdo-tabela',
      tipo: 'problema',
      titulo: 'Tabela de alunos',
      dificuldade: 'facil',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Mostre os alunos numa <code>&lt;table class="w3-table-all"&gt;</code> com:</p>
        <ul>
          <li>um <code>&lt;thead&gt;</code> com os cabeçalhos <b>Nome</b>, <b>Idade</b> e <b>Nota</b>;</li>
          <li>um <code>&lt;tbody&gt;</code> com uma linha por aluno;</li>
          <li>a nota com <b>uma casa decimal</b> e vírgula (ex.: <b>9,0</b>).</li>
        </ul>`,
      dica: "fetchAll(PDO::FETCH_ASSOC) e depois $aluno['nome'], $aluno['idade']... dentro do foreach.",
      arquivos: pagina(CONEXAO + '?>\n', '  <h2>Alunos</h2>\n  <table class="w3-table-all">\n  </table>', 'Tabela'),
      solucao: pagina(CONEXAO + php`$alunos = $pdo->query('SELECT nome, idade, nota FROM alunos ORDER BY nome')->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Alunos</h2>
  <table class="w3-table-all">
    <thead><tr class="w3-indigo"><th>Nome</th><th>Idade</th><th>Nota</th></tr></thead>
    <tbody>
    <?php foreach ($alunos as $a): ?>
      <tr>
        <td><?= htmlspecialchars($a['nome']) ?></td>
        <td><?= $a['idade'] ?></td>
        <td><?= number_format($a['nota'], 1, ',', '') ?></td>
      </tr>
    <?php endforeach; ?>
    </tbody>
  </table>`, 'Tabela'),
      testes: [
        {
          descricao: 'banco escola',
          regras: [
            { seletor: 'table.w3-table-all thead th', igual: 3, msg: 'O cabeçalho deve ter 3 colunas' },
            { seletor: 'thead th', texto: 'Idade' },
            { seletor: 'table tbody tr', igual: 8, msg: 'O <tbody> deve ter uma linha por aluno (8)' },
            { seletor: 'tbody td', texto: 'Gabi Costa' },
            { seletor: 'tbody td', texto: '10,0' },
            { semErros: true },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [{ seletor: 'table tbody tr', igual: 3 }, { seletor: 'tbody td', texto: '8,5' }],
        },
      ],
    },
    {
      id: 'licao-pdo-prepare',
      tipo: 'licao',
      titulo: 'Consultas preparadas e SQL injection',
      banco: BANCO_ESCOLA,
      resumo: `
        <p>Nunca junte o que o usuário digitou direto no SQL: isso permite <b>SQL injection</b>.
        Use <code>prepare()</code> com marcadores (<code>?</code> ou <code>:nome</code>) e passe os valores no
        <code>execute()</code>. O PDO cuida de escapar tudo.</p>
        <p>Teste na barra de endereço: <code>?nota=9</code> e depois <code>?nota=0 OR 1=1</code>.
        Com <code>prepare</code> o ataque não funciona.</p>`,
      arquivos: pagina(php`<?php
$pdo = new PDO('sqlite:/banco/escola.sqlite');
$minima = $_GET['nota'] ?? 7;

// ❌ Perigoso: $pdo->query("SELECT ... WHERE nota >= $minima")
// ✅ Seguro:
$stmt = $pdo->prepare('SELECT nome, nota FROM alunos WHERE nota >= ? ORDER BY nota DESC');
$stmt->execute([$minima]);
$alunos = $stmt->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Alunos com nota a partir de <?= htmlspecialchars($minima) ?></h2>
  <form class="w3-margin-bottom">
    <input class="w3-input w3-border" name="nota" value="<?= htmlspecialchars($minima) ?>" style="max-width:120px;display:inline-block">
    <button class="w3-button w3-indigo">Filtrar</button>
  </form>
  <ul class="w3-ul w3-border">
    <?php foreach ($alunos as $a): ?>
      <li><?= $a['nome'] ?> <span class="w3-tag w3-right"><?= $a['nota'] ?></span></li>
    <?php endforeach; ?>
  </ul>`, 'Prepare'),
    },
    {
      id: 'pdo-filtro-curso',
      tipo: 'problema',
      titulo: 'Filtrar por curso com prepare',
      dificuldade: 'medio',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Receba o nome do curso em <code>?curso=</code> (padrão <b>Informática</b>) e liste, numa
        <code>&lt;ul class="w3-ul"&gt;</code>, os nomes dos alunos desse curso.</p>
        <ul>
          <li>Use <code>prepare()</code> e <code>execute()</code>: nada de colocar a variável dentro do SQL.</li>
          <li>Se nenhum aluno for encontrado, mostre <b>Nenhum aluno encontrado</b> (e nenhum <code>&lt;li&gt;</code>).</li>
        </ul>`,
      dica: 'JOIN: SELECT alunos.nome FROM alunos JOIN cursos ON cursos.id = alunos.curso_id WHERE cursos.nome = ?',
      arquivos: pagina(CONEXAO + php`$curso = $_GET['curso'] ?? 'Informática';
?>
`, '  <h2>Alunos de <?= htmlspecialchars($curso) ?></h2>', 'Filtro'),
      solucao: pagina(CONEXAO + php`$curso = $_GET['curso'] ?? 'Informática';
$stmt = $pdo->prepare(
    'SELECT alunos.nome FROM alunos
     JOIN cursos ON cursos.id = alunos.curso_id
     WHERE cursos.nome = ? ORDER BY alunos.nome'
);
$stmt->execute([$curso]);
$nomes = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
`, `  <h2>Alunos de <?= htmlspecialchars($curso) ?></h2>
  <?php if (count($nomes) === 0): ?>
    <p class="w3-text-grey">Nenhum aluno encontrado</p>
  <?php else: ?>
    <ul class="w3-ul w3-border">
      <?php foreach ($nomes as $nome): ?>
        <li><?= htmlspecialchars($nome) ?></li>
      <?php endforeach; ?>
    </ul>
  <?php endif; ?>`, 'Filtro'),
      testes: [
        {
          descricao: '?curso=Informática',
          url: '/index.php?curso=Inform%C3%A1tica',
          regras: [{ seletor: 'ul.w3-ul li', igual: 3 }, { seletor: 'li', texto: 'Felipe Nunes' }, { naoContem: 'Gabi Costa' }],
        },
        { descricao: '?curso=Design', url: '/index.php?curso=Design', regras: [{ seletor: 'ul.w3-ul li', igual: 2 }, { seletor: 'li', texto: 'Gabi Costa' }] },
        {
          regras: [
            { codigo: '->\\s*prepare\\s*\\(', msg: 'Use $pdo->prepare(...)' },
            { codigo: '->\\s*execute\\s*\\(', msg: 'Passe o curso no execute(...)' },
            { semErros: true },
          ],
        },
        {
          descricao: '?curso=Mecânica',
          url: '/index.php?curso=Mec%C3%A2nica',
          oculto: true,
          regras: [{ seletor: 'li', igual: 0 }, { contem: 'Nenhum aluno encontrado' }],
        },
        {
          descricao: "SQL injection: ?curso=' OR '1'='1",
          url: "/index.php?curso=%27%20OR%20%271%27%3D%271",
          oculto: true,
          regras: [{ seletor: 'li', igual: 0, msg: 'A consulta está vulnerável a SQL injection: use prepare()' }, { semErros: true }],
        },
      ],
    },
    {
      id: 'pdo-aprovados',
      tipo: 'problema',
      titulo: 'Aprovados e reprovados',
      dificuldade: 'medio',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Liste todos os alunos numa <code>w3-ul</code>. Ao lado de cada nome, mostre:</p>
        <ul>
          <li><code>&lt;span class="w3-tag w3-green"&gt;Aprovado&lt;/span&gt;</code> se a nota for <b>7 ou mais</b>;</li>
          <li><code>&lt;span class="w3-tag w3-red"&gt;Reprovado&lt;/span&gt;</code> caso contrário.</li>
        </ul>`,
      dica: 'Busque nome e nota e decida a tag com if dentro do foreach.',
      arquivos: pagina(CONEXAO + '?>\n', '  <h2>Resultado final</h2>', 'Aprovados'),
      solucao: pagina(CONEXAO + php`$alunos = $pdo->query('SELECT nome, nota FROM alunos ORDER BY nome')->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Resultado final</h2>
  <ul class="w3-ul w3-border">
    <?php foreach ($alunos as $a): ?>
      <li>
        <?= htmlspecialchars($a['nome']) ?>
        <?php if ($a['nota'] >= 7): ?>
          <span class="w3-tag w3-green">Aprovado</span>
        <?php else: ?>
          <span class="w3-tag w3-red">Reprovado</span>
        <?php endif; ?>
      </li>
    <?php endforeach; ?>
  </ul>`, 'Aprovados'),
      testes: [
        {
          descricao: 'banco escola',
          regras: [
            { seletor: '.w3-ul li', igual: 8 },
            { seletor: '.w3-tag.w3-green', igual: 5, msg: 'Devem existir 5 aprovados (nota ≥ 7)' },
            { seletor: '.w3-tag.w3-red', igual: 3, msg: 'Devem existir 3 reprovados' },
            { seletor: '.w3-tag.w3-green', texto: 'Aprovado' },
            { semErros: true },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [{ seletor: '.w3-tag.w3-green', igual: 2 }, { seletor: '.w3-tag.w3-red', igual: 1 }],
        },
      ],
    },
    {
      id: 'pdo-buscar-id',
      tipo: 'problema',
      titulo: 'Ficha do aluno por id',
      dificuldade: 'medio',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Receba <code>?id=</code> (padrão 1) e mostre a ficha do aluno num <code>w3-card</code>:</p>
        <ul>
          <li>o nome num <code>&lt;h3&gt;</code>;</li>
          <li><b>Idade: 18</b> e <b>Curso: Eletrônica</b> em parágrafos.</li>
        </ul>
        <p>Se o id não existir, mostre <b>Aluno não encontrado</b> num <code>w3-panel w3-pale-red</code> (sem card).
        Use <code>prepare</code> e <code>fetch()</code>, que devolve <code>false</code> quando não há linha.</p>`,
      dica: 'SELECT alunos.nome, idade, cursos.nome AS curso FROM alunos JOIN cursos ON ... WHERE alunos.id = ?',
      arquivos: pagina(CONEXAO + php`$id = (int) ($_GET['id'] ?? 1);
?>
`, '  <h2>Ficha do aluno</h2>', 'Ficha'),
      solucao: pagina(CONEXAO + php`$id = (int) ($_GET['id'] ?? 1);
$stmt = $pdo->prepare(
    'SELECT alunos.nome, alunos.idade, cursos.nome AS curso
     FROM alunos JOIN cursos ON cursos.id = alunos.curso_id
     WHERE alunos.id = ?'
);
$stmt->execute([$id]);
$aluno = $stmt->fetch(PDO::FETCH_ASSOC);
?>
`, `  <h2>Ficha do aluno</h2>
  <?php if ($aluno): ?>
    <div class="w3-card w3-container" style="max-width:360px">
      <h3><?= htmlspecialchars($aluno['nome']) ?></h3>
      <p>Idade: <?= $aluno['idade'] ?></p>
      <p>Curso: <?= htmlspecialchars($aluno['curso']) ?></p>
    </div>
  <?php else: ?>
    <div class="w3-panel w3-pale-red"><p>Aluno não encontrado</p></div>
  <?php endif; ?>`, 'Ficha'),
      testes: [
        {
          descricao: '?id=3',
          url: '/index.php?id=3',
          regras: [
            { seletor: '.w3-card h3', texto: 'Carla Dias' },
            { seletor: '.w3-card p', texto: 'Idade: 18' },
            { seletor: '.w3-card p', texto: 'Curso: Eletrônica' },
          ],
        },
        {
          descricao: '?id=99',
          url: '/index.php?id=99',
          regras: [
            { seletor: '.w3-panel.w3-pale-red', texto: 'Aluno não encontrado' },
            { seletor: '.w3-card', igual: 0, msg: 'Sem aluno, não mostre o card' },
            { semErros: true },
          ],
        },
        { regras: [{ codigo: '->\\s*prepare\\s*\\(', msg: 'Use prepare()' }] },
        { descricao: '?id=7', url: '/index.php?id=7', oculto: true, regras: [{ seletor: '.w3-card h3', texto: 'Gabi Costa' }] },
        { descricao: '?id=abc', url: '/index.php?id=abc', oculto: true, regras: [{ contem: 'Aluno não encontrado' }, { semErros: true }] },
      ],
    },
    {
      id: 'pdo-media-curso',
      tipo: 'problema',
      titulo: 'Média por curso (JOIN + GROUP BY)',
      dificuldade: 'medio',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Para cada curso <b>que tem alunos</b>, mostre um <code>&lt;li&gt;</code> numa <code>w3-ul</code> no formato
        <b>Informática: 6,7</b>: nome do curso, dois-pontos e a média das notas com uma casa decimal.</p>
        <p>Ordene pelo nome do curso. Faça o cálculo no SQL com <code>AVG()</code> e <code>GROUP BY</code>.</p>`,
      dica: 'SELECT cursos.nome, AVG(alunos.nota) AS media FROM alunos JOIN cursos ON ... GROUP BY cursos.id ORDER BY cursos.nome',
      arquivos: pagina(CONEXAO + '?>\n', '  <h2>Médias por curso</h2>', 'Médias'),
      solucao: pagina(CONEXAO + php`$linhas = $pdo->query(
    'SELECT cursos.nome, AVG(alunos.nota) AS media
     FROM alunos JOIN cursos ON cursos.id = alunos.curso_id
     GROUP BY cursos.id ORDER BY cursos.nome'
)->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Médias por curso</h2>
  <ul class="w3-ul w3-border">
    <?php foreach ($linhas as $l): ?>
      <li><?= htmlspecialchars($l['nome']) ?>: <?= number_format($l['media'], 1, ',', '') ?></li>
    <?php endforeach; ?>
  </ul>`, 'Médias'),
      testes: [
        {
          descricao: 'banco escola',
          regras: [
            { seletor: '.w3-ul li', igual: 3, msg: 'Mostre só os 3 cursos que têm alunos' },
            { seletor: '.w3-ul li:first-child', texto: 'Design: 8,5' },
            { seletor: '.w3-ul li', texto: 'Eletrônica: 6,8' },
            { seletor: '.w3-ul li', texto: 'Informática: 6,7' },
            { semErros: true },
          ],
        },
        {
          regras: [
            { codigo: 'AVG\\s*\\(', msg: 'Calcule a média no SQL com AVG()' },
            { codigo: 'GROUP\\s+BY', msg: 'Agrupe com GROUP BY' },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [{ seletor: '.w3-ul li', igual: 2 }, { seletor: 'li', texto: 'Informática: 5,8' }, { seletor: 'li', texto: 'Redes: 7,0' }],
        },
      ],
    },
    {
      id: 'pdo-inserir',
      tipo: 'problema',
      titulo: 'Cadastrar aluno (INSERT)',
      dificuldade: 'medio',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Crie um formulário <code>method="post"</code> com os campos <code>nome</code>, <code>idade</code>,
        <code>nota</code> e <code>curso_id</code>.</p>
        <ul>
          <li>Ao enviar, insira o aluno com <code>prepare</code> + <code>execute</code> e mostre
            <b>Aluno cadastrado!</b> num <code>w3-panel w3-green</code>.</li>
          <li>Sempre (com ou sem envio), mostre abaixo a lista de nomes em <code>&lt;ul class="w3-ul"&gt;</code>.</li>
        </ul>
        <p>Lembre: o banco volta ao original a cada execução, então só o aluno recém-enviado aparece a mais.</p>`,
      dica: "INSERT INTO alunos (nome, idade, nota, curso_id) VALUES (?, ?, ?, ?) e execute([$nome, $idade, $nota, $curso]).",
      arquivos: pagina(CONEXAO + '?>\n', `  <h2>Novo aluno</h2>
  <form class="w3-card w3-padding" style="max-width:400px">
    <!-- campos nome, idade, nota e curso_id -->
    <button class="w3-button w3-green">Cadastrar</button>
  </form>`, 'Cadastro'),
      solucao: pagina(CONEXAO + php`$cadastrou = false;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $stmt = $pdo->prepare('INSERT INTO alunos (nome, idade, nota, curso_id) VALUES (?, ?, ?, ?)');
    $stmt->execute([$_POST['nome'], (int) $_POST['idade'], (float) $_POST['nota'], (int) $_POST['curso_id']]);
    $cadastrou = true;
}
$nomes = $pdo->query('SELECT nome FROM alunos ORDER BY id')->fetchAll(PDO::FETCH_COLUMN);
?>
`, `  <h2>Novo aluno</h2>
  <?php if ($cadastrou): ?>
    <div class="w3-panel w3-green"><p>Aluno cadastrado!</p></div>
  <?php endif; ?>
  <form method="post" class="w3-card w3-padding" style="max-width:400px">
    <input class="w3-input w3-border" name="nome" placeholder="Nome" required>
    <input class="w3-input w3-border" name="idade" type="number" placeholder="Idade">
    <input class="w3-input w3-border" name="nota" type="number" step="0.1" placeholder="Nota">
    <select class="w3-select" name="curso_id">
      <option value="1">Informática</option>
      <option value="2">Eletrônica</option>
      <option value="3">Design</option>
    </select>
    <button class="w3-button w3-green w3-margin-top">Cadastrar</button>
  </form>
  <ul class="w3-ul w3-border w3-margin-top">
    <?php foreach ($nomes as $nome): ?>
      <li><?= htmlspecialchars($nome) ?></li>
    <?php endforeach; ?>
  </ul>`, 'Cadastro'),
      testes: [
        {
          descricao: 'GET (abrir a página)',
          regras: [
            { seletor: 'form[method="post" i] [name="nome"]', msg: 'O formulário POST precisa do campo nome' },
            { seletor: 'form [name="idade"]', msg: 'Crie o campo idade' },
            { seletor: 'form [name="nota"]', msg: 'Crie o campo nota' },
            { seletor: 'form [name="curso_id"]', msg: 'Crie o campo curso_id' },
            { seletor: 'ul.w3-ul li', igual: 8, msg: 'Mostre a lista com os 8 alunos' },
            { seletor: '.w3-panel', igual: 0, msg: 'Sem envio, não mostre a mensagem de cadastro' },
          ],
        },
        {
          descricao: 'POST nome=Iris Teixeira',
          metodo: 'POST',
          corpo: 'nome=Iris+Teixeira&idade=17&nota=8&curso_id=1',
          regras: [
            { seletor: '.w3-panel.w3-green', texto: 'Aluno cadastrado!' },
            { seletor: 'ul.w3-ul li', igual: 9 },
            { seletor: 'ul.w3-ul li', texto: 'Iris Teixeira' },
            { semErros: true },
          ],
        },
        { regras: [{ codigo: '->\\s*prepare\\s*\\(', msg: 'Use prepare() no INSERT' }] },
        {
          descricao: "POST nome=Joana D'Arc",
          metodo: 'POST',
          corpo: 'nome=Joana+D%27Arc&idade=19&nota=9&curso_id=3',
          oculto: true,
          regras: [{ seletor: 'ul.w3-ul li', texto: "Joana D'Arc" }, { semErros: true }],
        },
      ],
    },
    {
      id: 'pdo-paginacao',
      tipo: 'problema',
      titulo: 'Paginação com LIMIT e OFFSET',
      dificuldade: 'dificil',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Mostre os alunos em ordem alfabética, <b>3 por página</b>, numa <code>w3-ul</code>.</p>
        <ul>
          <li>A página vem de <code>?pagina=</code> (padrão 1; valores menores que 1 viram 1).</li>
          <li>Abaixo, crie um link <code>&lt;a class="w3-button"&gt;</code> para <b>cada página</b>
            (<code>?pagina=1</code>, <code>?pagina=2</code>…), calculando o total com <code>COUNT(*)</code>.</li>
          <li>Use <code>LIMIT</code> e <code>OFFSET</code> com <code>prepare</code>.</li>
        </ul>`,
      dica: 'OFFSET = (pagina - 1) * 3. Total de páginas = ceil(total / 3). Use bindValue(..., PDO::PARAM_INT).',
      arquivos: pagina(CONEXAO + php`$porPagina = 3;
$pagina = (int) ($_GET['pagina'] ?? 1);
?>
`, '  <h2>Alunos - página <?= $pagina ?></h2>', 'Paginação'),
      solucao: pagina(CONEXAO + php`$porPagina = 3;
$pagina = max(1, (int) ($_GET['pagina'] ?? 1));

$total = (int) $pdo->query('SELECT COUNT(*) FROM alunos')->fetchColumn();
$paginas = (int) ceil($total / $porPagina);

$stmt = $pdo->prepare('SELECT nome FROM alunos ORDER BY nome LIMIT :limite OFFSET :inicio');
$stmt->bindValue(':limite', $porPagina, PDO::PARAM_INT);
$stmt->bindValue(':inicio', ($pagina - 1) * $porPagina, PDO::PARAM_INT);
$stmt->execute();
$nomes = $stmt->fetchAll(PDO::FETCH_COLUMN);
?>
`, `  <h2>Alunos - página <?= $pagina ?></h2>
  <ul class="w3-ul w3-border">
    <?php foreach ($nomes as $nome): ?>
      <li><?= htmlspecialchars($nome) ?></li>
    <?php endforeach; ?>
  </ul>
  <div class="w3-bar w3-margin-top">
    <?php for ($p = 1; $p <= $paginas; $p++): ?>
      <a href="?pagina=<?= $p ?>" class="w3-button <?= $p === $pagina ? 'w3-indigo' : 'w3-light-grey' ?>"><?= $p ?></a>
    <?php endfor; ?>
  </div>`, 'Paginação'),
      testes: [
        {
          descricao: '?pagina=1',
          url: '/index.php?pagina=1',
          regras: [
            { seletor: '.w3-ul li', igual: 3 },
            { seletor: '.w3-ul li:first-child', texto: 'Ana Souza' },
            { seletor: 'a.w3-button', igual: 3, msg: 'Com 8 alunos devem existir 3 links de página' },
            { seletor: 'a.w3-button[href*="pagina=3"]', msg: 'Crie o link ?pagina=3' },
          ],
        },
        {
          descricao: '?pagina=3',
          url: '/index.php?pagina=3',
          regras: [{ seletor: '.w3-ul li', igual: 2 }, { seletor: '.w3-ul li:first-child', texto: 'Gabi Costa' }, { semErros: true }],
        },
        {
          regras: [
            { codigo: 'LIMIT', msg: 'Use LIMIT no SQL' },
            { codigo: 'OFFSET', msg: 'Use OFFSET no SQL' },
            { codigo: 'COUNT\\s*\\(', msg: 'Conte o total com COUNT(*)' },
          ],
        },
        {
          descricao: '?pagina=0',
          url: '/index.php?pagina=0',
          oculto: true,
          regras: [{ seletor: '.w3-ul li:first-child', texto: 'Ana Souza' }, { seletor: '.w3-ul li', igual: 3 }],
        },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [{ seletor: '.w3-ul li', igual: 3 }, { seletor: 'a.w3-button', igual: 1 }],
        },
      ],
    },
    {
      id: 'pdo-cursos-cards',
      tipo: 'problema',
      titulo: 'Vitrine de cursos (LEFT JOIN)',
      dificuldade: 'dificil',
      banco: BANCO_ESCOLA,
      enunciado: `
        <p>Mostre <b>todos os cursos</b>, inclusive os que não têm alunos, cada um num card
        <code>&lt;div class="w3-card" id="curso-ID"&gt;</code> (ex.: <code>id="curso-4"</code>) com:</p>
        <ul>
          <li>o nome do curso num <code>&lt;h3&gt;</code>;</li>
          <li>o turno num parágrafo;</li>
          <li>a quantidade de alunos num <code>&lt;span class="w3-badge"&gt;</code>.</li>
        </ul>
        <p>Use <b>uma única consulta</b> com <code>LEFT JOIN</code> e <code>COUNT</code>. Coloque os cards numa
        grade <code>w3-row-padding</code> com colunas <code>w3-quarter</code>.</p>`,
      dica: 'LEFT JOIN mantém os cursos sem alunos; COUNT(alunos.id) conta 0 para eles.',
      arquivos: pagina(CONEXAO + '?>\n', '  <h2>Cursos</h2>\n  <div class="w3-row-padding">\n  </div>', 'Cursos'),
      solucao: pagina(CONEXAO + php`$cursos = $pdo->query(
    'SELECT cursos.id, cursos.nome, cursos.turno, COUNT(alunos.id) AS total
     FROM cursos LEFT JOIN alunos ON alunos.curso_id = cursos.id
     GROUP BY cursos.id ORDER BY cursos.id'
)->fetchAll(PDO::FETCH_ASSOC);
?>
`, `  <h2>Cursos</h2>
  <div class="w3-row-padding">
    <?php foreach ($cursos as $c): ?>
      <div class="w3-quarter w3-margin-bottom">
        <div class="w3-card w3-container" id="curso-<?= $c['id'] ?>">
          <h3><?= htmlspecialchars($c['nome']) ?></h3>
          <p><?= htmlspecialchars($c['turno']) ?></p>
          <p><span class="w3-badge w3-indigo"><?= $c['total'] ?></span> alunos</p>
        </div>
      </div>
    <?php endforeach; ?>
  </div>`, 'Cursos'),
      testes: [
        {
          descricao: 'banco escola',
          regras: [
            { seletor: '.w3-row-padding .w3-quarter .w3-card', igual: 4, msg: 'Crie 4 cards w3-card, cada um numa coluna w3-quarter' },
            { seletor: '#curso-1 h3', texto: 'Informática' },
            { seletor: '#curso-1 .w3-badge', texto: '3' },
            { seletor: '#curso-3 .w3-badge', texto: '2' },
            { seletor: '#curso-4 h3', texto: 'Mecânica' },
            { seletor: '#curso-4 .w3-badge', texto: '0' },
            { seletor: '#curso-2 p', texto: 'Tarde' },
            { semErros: true },
          ],
        },
        {
          regras: [
            { codigo: 'LEFT\\s+JOIN', msg: 'Use LEFT JOIN para incluir cursos sem alunos' },
            { codigo: 'COUNT\\s*\\(', msg: 'Conte com COUNT()' },
          ],
        },
        {
          descricao: 'outro banco',
          banco: ALT,
          oculto: true,
          regras: [
            { seletor: '.w3-card', igual: 2 },
            { seletor: '#curso-1 .w3-badge', texto: '2' },
            { seletor: '#curso-2 .w3-badge', texto: '1' },
          ],
        },
      ],
    },
  ],
};
