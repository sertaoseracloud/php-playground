// Glossário: cada termo técnico com uma explicação simples, uma analogia do dia a
// dia e um exemplo curto. A descrição de cada desafio mostra os termos que aparecem
// no texto dele (até MAX_TERMOS, na ordem em que aparecem), para não sobrecarregar.
//
// `padroes` são regex (sem flags; usamos 'iu'), testadas no texto visível do desafio.
// Bordas de palavra são tratadas em `termosDoTexto`, porque \b não entende acentos.

export const MAX_TERMOS = 6;

export const GLOSSARIO = [
  // ---------- HTML ----------
  {
    id: 'html', termo: 'HTML', padroes: ['html'],
    definicao: 'A linguagem que diz o que é cada parte da página: título, parágrafo, imagem, link.',
    analogia: 'É o esqueleto de uma casa: define onde ficam paredes, portas e janelas, mas não a cor delas.',
    exemplo: '<h1>Bem-vindo</h1>\n<p>Este é um parágrafo.</p>',
  },
  {
    id: 'tag', termo: 'Tag', padroes: ['tags?'],
    definicao: 'Uma marcação entre < e > que abre e fecha um pedaço da página.',
    analogia: 'Como a etiqueta de uma caixa de mudança: "cozinha", "quarto". Ela diz o que tem dentro.',
    exemplo: '<p>texto aqui dentro</p>',
  },
  {
    id: 'titulos', termo: 'Títulos (h1 a h6)', padroes: ['<h[1-6]>', 'títulos?'],
    definicao: 'Tags de título, do mais importante (h1) ao menos importante (h6). Use um só h1 por página.',
    analogia: 'Como num jornal: a manchete é o h1, os títulos das matérias são h2, os subtítulos, h3.',
    exemplo: '<h1>Minha cidade</h1>\n<h2>História</h2>',
  },
  {
    id: 'paragrafo', termo: 'Parágrafo (p)', padroes: ['<p>', 'parágrafos?'],
    definicao: 'A tag <p> marca um bloco de texto corrido.',
    analogia: 'Como os parágrafos de uma redação: cada um é um bloco com uma ideia.',
    exemplo: '<p>Minha cidade fica no sertão.</p>',
  },
  {
    id: 'lista', termo: 'Lista (ul, ol, li)', padroes: ['<ul>', '<ol>', '<li>', 'listas? (não )?ordenadas?'],
    definicao: 'ul é uma lista com marcadores (sem ordem); ol é numerada (com ordem); cada item é um li.',
    analogia: 'ul é a lista de compras (tanto faz a ordem); ol é o passo a passo de uma receita (a ordem importa).',
    exemplo: '<ol>\n  <li>Bata os ovos</li>\n  <li>Misture a farinha</li>\n</ol>',
  },
  {
    id: 'atributo', termo: 'Atributo', padroes: ['atributos?'],
    definicao: 'Uma informação extra escrita dentro da tag de abertura.',
    analogia: 'Como os avisos escritos na etiqueta da caixa: "frágil", "este lado para cima".',
    exemplo: '<img src="gato.jpg" alt="Gato dormindo">',
  },
  {
    id: 'link', termo: 'Link', padroes: ['links?', 'href'],
    definicao: 'Uma ligação que leva para outra página ou outro lugar da mesma página.',
    analogia: 'Como uma placa de rua: você segue e chega a outro lugar.',
    exemplo: '<a href="https://www.w3schools.com">Estudar</a>',
  },
  {
    id: 'alt', termo: 'Texto alternativo (alt)', padroes: ['alt', 'acessíve(l|is)'],
    definicao: 'Um texto que descreve a imagem para quem não consegue vê-la (leitores de tela).',
    analogia: 'Como a audiodescrição de um filme: conta em palavras o que aparece na tela.',
    exemplo: '<img src="logo.png" alt="Logo da escola">',
  },
  {
    id: 'semantico', termo: 'HTML semântico', padroes: ['semântic[oa]s?', '<header>', '<main>', '<nav>', '<footer>'],
    definicao: 'Usar a tag que diz o significado do conteúdo: cabeçalho, menu, conteúdo principal, rodapé.',
    analogia: 'Como rotular gavetas pelo que tem dentro ("meias", "camisetas") em vez de "gaveta 1" e "gaveta 2".',
    exemplo: '<header>...</header>\n<main>...</main>\n<footer>...</footer>',
  },
  {
    id: 'formulario', termo: 'Formulário', padroes: ['formulários?', '<form'],
    definicao: 'A parte da página onde a pessoa digita dados e envia.',
    analogia: 'Como uma ficha de cadastro em papel: você preenche os campos e entrega no balcão (o servidor).',
    exemplo: '<form action="salvar.php" method="post">\n  <input name="nome">\n  <button>Enviar</button>\n</form>',
  },
  {
    id: 'tabela', termo: 'Tabela', padroes: ['tabelas?', '<table'],
    definicao: 'Dados organizados em linhas e colunas. No HTML, mostra dados na página; no banco, guarda os dados.',
    analogia: 'Uma planilha: cada linha é um registro (um aluno) e cada coluna, uma informação (nome, idade).',
    exemplo: '<table>\n  <tr><th>Nome</th><th>Idade</th></tr>\n  <tr><td>Ana</td><td>16</td></tr>\n</table>',
  },
  {
    id: 'url', termo: 'URL', padroes: ['url', 'endereço da página'],
    definicao: 'O endereço de uma página na internet.',
    analogia: 'Como o endereço de uma casa: rua e número. Depois do "?" pode vir um recado, como ?nome=Ana.',
    exemplo: 'https://site.com/pagina.php?nome=Ana',
  },

  // ---------- CSS e W3.CSS ----------
  {
    id: 'css', termo: 'CSS', padroes: ['css'],
    definicao: 'A linguagem que define a aparência: cores, tamanhos, espaços e posição.',
    analogia: 'Se o HTML é o esqueleto da casa, o CSS é a pintura, os móveis e a decoração.',
    exemplo: 'h1 { color: purple; }',
  },
  {
    id: 'w3css', termo: 'W3.CSS', padroes: ['w3\\.css'],
    definicao: 'Uma biblioteca de CSS pronta: você não escreve estilos, só usa classes como w3-blue.',
    analogia: 'Como comprar roupa pronta numa loja: em vez de costurar, você escolhe e veste.',
    exemplo: '<div class="w3-container w3-blue">Olá</div>',
  },
  {
    id: 'classe', termo: 'Classe (class)', padroes: ['class', 'classes?'],
    definicao: 'Um nome que você dá a elementos para aplicar um estilo a todos eles.',
    analogia: 'Como o uniforme de um time: todo mundo com a mesma camisa fica com a mesma cara.',
    exemplo: '<p class="w3-text-red">Atenção</p>',
  },
  {
    id: 'container', termo: 'Container', padroes: ['containers?'],
    definicao: 'Uma caixa que agrupa elementos e dá um espaço nas bordas.',
    analogia: 'Como uma bandeja: segura e organiza as coisas que estão em cima dela.',
    exemplo: '<div class="w3-container">...</div>',
  },
  {
    id: 'painel', termo: 'Painel (w3-panel)', padroes: ['painé(l|is)', 'w3-panel'],
    definicao: 'Uma caixa de destaque para avisos e mensagens, com espaço em volta do texto.',
    analogia: 'Como um post-it colorido colado na página: chama atenção para um recado.',
    exemplo: '<div class="w3-panel w3-pale-green">Salvo com sucesso</div>',
  },
  {
    id: 'responsivo', termo: 'Responsivo', padroes: ['responsiv[oa]s?', 'grade'],
    definicao: 'Uma página que se ajusta sozinha ao tamanho da tela.',
    analogia: 'Como água, que toma a forma do copo: no celular, no tablet ou no computador.',
    exemplo: '<div class="w3-row">\n  <div class="w3-half">metade</div>\n  <div class="w3-half">metade</div>\n</div>',
  },
  {
    id: 'navbar', termo: 'Barra de navegação', padroes: ['barra de navegação', 'navbar', 'menu'],
    definicao: 'Um menu com os links principais do site.',
    analogia: 'Como o índice de um livro: leva você direto para cada parte.',
    exemplo: '<div class="w3-bar w3-black">\n  <a class="w3-bar-item w3-button" href="#">Início</a>\n</div>',
  },

  // ---------- PHP ----------
  {
    id: 'php', termo: 'PHP', padroes: ['php'],
    definicao: 'Uma linguagem que roda no servidor e monta a página antes de mandá-la ao navegador.',
    analogia: 'É o cozinheiro de um restaurante: você não vê ele trabalhando, só recebe o prato pronto (o HTML).',
    exemplo: '<?php echo "Olá!"; ?>',
  },
  {
    id: 'servidor', termo: 'Servidor', padroes: ['servidor(es)?'],
    definicao: 'O computador que recebe os pedidos do navegador e devolve as páginas.',
    analogia: 'O balcão de uma lanchonete: você faz o pedido e recebe o lanche.',
  },
  {
    id: 'requisicao', termo: 'Requisição (HTTP)', padroes: ['requisiç(ão|ões)', 'http'],
    definicao: 'O pedido que o navegador faz ao servidor. A página que volta é a resposta.',
    analogia: 'Pedir uma pizza: o pedido é a requisição; a pizza entregue é a resposta.',
  },
  {
    id: 'echo', termo: 'echo', padroes: ['echo'],
    definicao: 'O comando do PHP que escreve algo na página.',
    analogia: 'Um alto-falante: tudo o que você manda pelo echo sai na página.',
    exemplo: 'echo "Olá, mundo!";',
  },
  {
    id: 'variavel', termo: 'Variável', padroes: ['variáve(l|is)'],
    definicao: 'Um nome que guarda um valor para você usar depois. No PHP, começa com $.',
    analogia: 'Uma caixa com etiqueta: a etiqueta é o nome ($idade) e dentro está o valor (17).',
    exemplo: '$idade = 17;\necho $idade;',
  },
  {
    id: 'string', termo: 'String (texto)', padroes: ['strings?'],
    definicao: 'Um valor de texto, escrito entre aspas.',
    analogia: 'Um colar de contas: cada letra é uma conta, sempre na mesma ordem.',
    exemplo: '$nome = "Ana";\necho "Olá, $nome!";',
  },
  {
    id: 'condicional', termo: 'Condicional (if / else)', padroes: ['condiç(ão|ões)', 'condiciona(l|is)', 'if', 'else'],
    definicao: 'Escolhe o que fazer de acordo com uma condição: se for verdade, faz uma coisa; senão, outra.',
    analogia: 'Um semáforo: se está verde, você passa; senão, espera.',
    exemplo: 'if ($nota >= 7) {\n  echo "Aprovado";\n} else {\n  echo "Recuperação";\n}',
  },
  {
    id: 'laco', termo: 'Laço (loop)', padroes: ['laços?', 'loop', 'foreach', 'while', 'repeti(r|ção)'],
    definicao: 'Repete um bloco de código várias vezes, uma para cada item.',
    analogia: 'Uma playlist no modo repetir: toca a mesma sequência para cada música da lista.',
    exemplo: 'foreach ($nomes as $nome) {\n  echo "<li>$nome</li>";\n}',
  },
  {
    id: 'array', termo: 'Array (lista)', padroes: ['arrays?', 'vetor(es)?'],
    definicao: 'Uma lista de valores guardada numa só variável. Cada valor tem uma posição, começando em 0.',
    analogia: 'Uma caixa de ovos: vários espaços numerados, cada um com um ovo (um valor).',
    exemplo: '$frutas = ["maçã", "banana"];\necho $frutas[0]; // maçã',
  },
  {
    id: 'associativo', termo: 'Array associativo', padroes: ['associativ[oa]s?', 'chave e valor', '=>'],
    definicao: 'Um array em que cada valor tem um nome (a chave) em vez de um número.',
    analogia: 'Uma agenda de contatos: você procura pelo nome e encontra o telefone.',
    exemplo: '$aluno = ["nome" => "Ana", "idade" => 16];\necho $aluno["nome"];',
  },
  {
    id: 'funcao', termo: 'Função', padroes: ['funç(ão|ões)', 'function'],
    definicao: 'Um bloco de código com nome, que você escreve uma vez e usa quantas vezes quiser.',
    analogia: 'Uma receita de bolo: escrita uma vez, usada sempre que quiser, com ingredientes diferentes.',
    exemplo: 'function dobro($n) {\n  return $n * 2;\n}\necho dobro(5); // 10',
  },
  {
    id: 'parametro', termo: 'Parâmetro', padroes: ['parâmetros?', 'argumentos?'],
    definicao: 'Um valor que você entrega para a função trabalhar.',
    analogia: 'Os ingredientes que você entrega para a receita.',
    exemplo: 'function saudar($nome) { return "Oi, $nome"; }',
  },
  {
    id: 'retorno', termo: 'Retorno (return)', padroes: ['return', 'retorn(a|o|ar)'],
    definicao: 'O valor que a função devolve quando termina.',
    analogia: 'O bolo que sai do forno no fim da receita.',
    exemplo: 'return $total;',
  },
  {
    id: 'get', termo: 'GET e $_GET', padroes: ['\\$_get', 'get'],
    definicao: 'Um jeito de enviar dados pela URL, depois do "?". No PHP, eles chegam em $_GET.',
    analogia: 'Um recado escrito do lado de fora do envelope: qualquer um que olha a URL consegue ler.',
    exemplo: '// pagina.php?nome=Ana\necho $_GET["nome"]; // Ana',
  },
  {
    id: 'post', termo: 'POST e $_POST', padroes: ['\\$_post', 'método post', 'method="?post'],
    definicao: 'Um jeito de enviar dados do formulário sem mostrar na URL. No PHP, eles chegam em $_POST.',
    analogia: 'O recado dentro do envelope fechado: chega ao destino, mas não aparece por fora.',
    exemplo: 'echo $_POST["email"];',
  },
  {
    id: 'escapar', termo: 'htmlspecialchars (escapar)', padroes: ['htmlspecialchars', 'xss', 'escapar'],
    definicao: 'Transforma < e > em texto comum, para que o que a pessoa digitou não vire código na página.',
    analogia: 'Plastificar um bilhete: dá para ler, mas ninguém consegue escrever por cima.',
    exemplo: 'echo htmlspecialchars($_GET["nome"]);',
  },
  {
    id: 'include', termo: 'include / require', padroes: ['include', 'require'],
    definicao: 'Junta o conteúdo de outro arquivo PHP neste, para não repetir código.',
    analogia: 'Um carimbo de cabeçalho: em vez de desenhar em cada folha, você carimba.',
    exemplo: 'include "cabecalho.php";',
  },
  {
    id: 'redirecionar', termo: 'Redirecionar', padroes: ['redirecion', 'location:'],
    definicao: 'Mandar o navegador ir para outra página.',
    analogia: 'Uma placa de "mudamos de endereço" que leva você ao lugar novo.',
    exemplo: 'header("Location: index.php");\nexit;',
  },
  {
    id: 'sessao', termo: 'Sessão', padroes: ['sess(ão|ões)', '\\$_session', 'session_start'],
    definicao: 'A memória do servidor sobre quem está usando o site, de uma página para a outra.',
    analogia: 'A pulseira de um evento: depois de entrar, você não precisa mostrar o ingresso em cada área.',
    exemplo: 'session_start();\n$_SESSION["usuario"] = "ana";',
  },
  {
    id: 'cookie', termo: 'Cookie', padroes: ['cookies?'],
    definicao: 'Um pequeno dado que o site guarda no seu navegador.',
    analogia: 'A comanda de um restaurante: fica com você e mostra ao garçom o que é seu.',
  },
  {
    id: 'hash', termo: 'Hash de senha', padroes: ['password_hash', 'password_verify', 'hash'],
    definicao: 'Transforma a senha num código que não dá para desfazer. O site guarda o código, nunca a senha.',
    analogia: 'Fazer suco de laranja: dá para comparar dois sucos, mas não dá para voltar à laranja.',
    exemplo: '$hash = password_hash($senha, PASSWORD_DEFAULT);\npassword_verify($senha, $hash); // true',
  },

  // ---------- banco de dados ----------
  {
    id: 'banco', termo: 'Banco de dados', padroes: ['banco de dados', 'banco', 'sqlite'],
    definicao: 'Um lugar organizado para guardar dados de forma permanente.',
    analogia: 'Um arquivo de aço com gavetas e fichas: tudo guardado e fácil de achar.',
  },
  {
    id: 'sql', termo: 'SQL', padroes: ['sql', 'select'],
    definicao: 'A linguagem para pedir coisas ao banco: buscar, inserir, alterar e apagar dados.',
    analogia: 'O idioma que o bibliotecário entende: "me traga todos os livros de PHP".',
    exemplo: 'SELECT nome FROM alunos;',
  },
  {
    id: 'where', termo: 'WHERE (filtro)', padroes: ['where', 'filtr(o|ar)'],
    definicao: 'A parte da consulta que escolhe só as linhas que atendem a uma condição.',
    analogia: 'Uma peneira: só passa o que serve.',
    exemplo: 'SELECT nome FROM alunos WHERE idade >= 18;',
  },
  {
    id: 'pdo', termo: 'PDO', padroes: ['pdo'],
    definicao: 'A ferramenta do PHP para conversar com bancos de dados.',
    analogia: 'Um intérprete entre o PHP e o banco: leva os pedidos e traz as respostas.',
    exemplo: '$pdo = new PDO("sqlite:/banco/escola.sqlite");',
  },
  {
    id: 'prepare', termo: 'Consulta preparada (prepare)', padroes: ['prepare', 'consultas? preparadas?', 'execute'],
    definicao: 'Uma consulta com lugares reservados (?) que o PDO preenche com segurança.',
    analogia: 'Um formulário com espaços em branco: a pessoa só preenche os espaços, não consegue mudar as perguntas.',
    exemplo: '$stmt = $pdo->prepare("SELECT * FROM alunos WHERE id = ?");\n$stmt->execute([$id]);',
  },
  {
    id: 'injection', termo: 'SQL injection', padroes: ['sql injection', 'injeção'],
    definicao: 'Um ataque em que alguém digita SQL num campo para enganar o banco.',
    analogia: 'Alguém que escreve "e mais mil reais" no espaço em branco de um cheque. A consulta preparada não deixa espaço em branco.',
  },
  {
    id: 'chave-primaria', termo: 'Chave primária', padroes: ['chaves? primárias?', 'primary key'],
    definicao: 'Uma coluna com um número único que identifica cada linha da tabela.',
    analogia: 'O número de matrícula: dois alunos podem ter o mesmo nome, mas nunca a mesma matrícula.',
    exemplo: 'id INTEGER PRIMARY KEY',
  },
  {
    id: 'chave-estrangeira', termo: 'Chave estrangeira', padroes: ['chaves? estrangeiras?', 'references', '[a-z]+_id'],
    definicao: 'Uma coluna que guarda o id de uma linha de outra tabela, ligando as duas.',
    analogia: 'Escrever no caderno do aluno o número da turma dele: o número leva até a turma.',
    exemplo: 'curso_id INTEGER REFERENCES cursos(id)',
  },
  {
    id: 'join', termo: 'JOIN', padroes: ['join'],
    definicao: 'Junta dados de duas tabelas que se relacionam.',
    analogia: 'Cruzar a lista de chamada com a lista de cursos para saber o curso de cada aluno.',
    exemplo: 'SELECT a.nome, c.nome\nFROM alunos a JOIN cursos c ON c.id = a.curso_id;',
  },
  {
    id: 'agrupar', termo: 'GROUP BY, COUNT e AVG', padroes: ['group by', 'count', 'avg', 'sum'],
    definicao: 'Agrupa linhas parecidas e calcula totais, contagens ou médias de cada grupo.',
    analogia: 'Separar moedas por valor e contar quantas tem em cada pilha.',
    exemplo: 'SELECT curso_id, COUNT(*) FROM alunos GROUP BY curso_id;',
  },
  {
    id: 'paginacao', termo: 'Paginação (LIMIT / OFFSET)', padroes: ['paginaç(ão|ões)', 'limit', 'offset'],
    definicao: 'Mostra os resultados aos poucos, em páginas.',
    analogia: 'Um livro: em vez de um rolo enorme, você vê 10 itens por página.',
    exemplo: 'SELECT * FROM alunos LIMIT 10 OFFSET 20;',
  },
  {
    id: 'crud', termo: 'CRUD', padroes: ['crud'],
    definicao: 'As quatro operações básicas com dados: criar, ler, atualizar e apagar.',
    analogia: 'O que você faz com os contatos do celular: adicionar, ver, editar e excluir.',
    exemplo: 'INSERT · SELECT · UPDATE · DELETE',
  },
  {
    id: 'transacao', termo: 'Transação', padroes: ['transaç(ão|ões)', 'begintransaction', 'commit', 'rollback'],
    definicao: 'Um grupo de operações no banco que acontece inteiro ou não acontece.',
    analogia: 'Uma troca de figurinhas: ou os dois entregam, ou ninguém entrega.',
    exemplo: '$pdo->beginTransaction();\n// ... várias operações ...\n$pdo->commit();',
  },
];

// Letras (com acento), dígitos, _ e $ contam como parte de uma palavra.
const LETRA = '[\\p{L}\\p{N}_$]';
const REGEX = new Map(GLOSSARIO.map((t) => [
  t.id,
  new RegExp(`(?<!${LETRA})(?:${t.padroes.join('|')})(?!${LETRA})`, 'iu'),
]));

// Nível de cada termo: o módulo em que ele aparece primeiro (a ordem do glossário).
const ORDEM_MODULOS = ['html', 'w3css', 'php', 'pdo', 'projetos'];
const INICIO_DO_NIVEL = { html: 'html', w3css: 'css', php: 'php', pdo: 'banco' };
const NIVEL = new Map();
{
  let nivel = 0;
  for (const t of GLOSSARIO) {
    const novo = Object.entries(INICIO_DO_NIVEL).find(([, id]) => id === t.id);
    if (novo) nivel = ORDEM_MODULOS.indexOf(novo[0]);
    NIVEL.set(t.id, nivel);
  }
}

/**
 * Termos do glossário que aparecem no texto, na ordem em que aparecem.
 * Se passarem de `max`, ficam os do nível do módulo (ou o mais próximo dele):
 * num projeto, JOIN e sessão importam mais do que "link", já visto no começo.
 */
export function termosDoTexto(texto, { max = MAX_TERMOS, modulo } = {}) {
  const nivelItem = modulo ? ORDEM_MODULOS.indexOf(modulo) : Infinity;
  const prioridade = (t) => Math.min(NIVEL.get(t.id), nivelItem);
  return GLOSSARIO
    .map((t) => ({ termo: t, posicao: texto.search(REGEX.get(t.id)) }))
    .filter((x) => x.posicao >= 0)
    .sort((a, b) => prioridade(b.termo) - prioridade(a.termo) || a.posicao - b.posicao)
    .slice(0, max)
    .sort((a, b) => a.posicao - b.posicao)
    .map((x) => x.termo);
}
