import { documento } from './util.js';

const html = (corpo, opcoes) => ({ 'index.html': documento(corpo, opcoes) });

export const moduloHtml = {
  id: 'html',
  titulo: 'HTML',
  icone: '📄',
  descricao: 'A estrutura de toda página web: tags, atributos, listas, tabelas, formulários e semântica.',
  itens: [
    {
      id: 'licao-html-estrutura',
      tipo: 'licao',
      titulo: 'Anatomia de uma página HTML',
      resumo: `
        <p>Todo documento HTML tem a mesma estrutura: <code>&lt;!DOCTYPE html&gt;</code>, a tag
        <code>&lt;html&gt;</code> e, dentro dela, o <code>&lt;head&gt;</code> (informações sobre a página)
        e o <code>&lt;body&gt;</code> (o que aparece na tela).</p>
        <p>As tags geralmente vêm em pares: <code>&lt;p&gt;</code> abre e <code>&lt;/p&gt;</code> fecha.
        <b>Atributos</b> dão detalhes extras, como o <code>href</code> de um link ou o <code>alt</code> de uma imagem.</p>
        <p>Altere o código, clique em <b>▶ Executar</b> e compare com a aba <b>HTML gerado</b>.</p>`,
      arquivos: html(`  <!-- Comentários não aparecem na página -->
  <h1>Título principal</h1>
  <h2>Subtítulo</h2>
  <p>Um parágrafo com <strong>negrito</strong>, <em>itálico</em> e um
     <a href="https://developer.mozilla.org/pt-BR/docs/Web/HTML" target="_blank">link</a>.</p>

  <img src="https://picsum.photos/id/0/320/180" alt="Notebook sobre a mesa" width="320">

  <h2>Lista não ordenada</h2>
  <ul>
    <li>HTML: estrutura</li>
    <li>CSS: aparência</li>
    <li>PHP: lógica no servidor</li>
  </ul>

  <h2>Lista ordenada</h2>
  <ol>
    <li>Abrir o editor</li>
    <li>Escrever o código</li>
    <li>Executar</li>
  </ol>`, { titulo: 'Anatomia HTML' }),
    },
    {
      id: 'html-primeira-pagina',
      tipo: 'problema',
      titulo: 'Minha primeira página',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie uma página HTML completa com:</p>
        <ul>
          <li>a declaração <code>&lt;!DOCTYPE html&gt;</code> e <code>&lt;html lang="pt-br"&gt;</code>;</li>
          <li>um <code>&lt;title&gt;</code> com o texto <b>Minha página</b>;</li>
          <li>um <code>&lt;h1&gt;</code> com o texto <b>Olá, HTML!</b></li>
        </ul>`,
      dica: 'O <title> fica dentro do <head>; o <h1> fica dentro do <body>.',
      arquivos: { 'index.html': '<!-- Escreva sua página aqui -->\n' },
      solucao: html('  <h1>Olá, HTML!</h1>'),
      testes: [
        {
          regras: [
            { codigo: '<!DOCTYPE html>', msg: 'Comece com <!DOCTYPE html>' },
            { seletor: 'html[lang="pt-br" i]', msg: 'Use <html lang="pt-br">' },
            { seletor: 'title', texto: 'Minha página' },
            { seletor: 'h1', texto: 'Olá, HTML!' },
          ],
        },
      ],
    },
    {
      id: 'html-titulos-paragrafos',
      tipo: 'problema',
      titulo: 'Títulos e parágrafos',
      dificuldade: 'facil',
      enunciado: `
        <p>Monte um artigo sobre o seu bairro ou cidade com:</p>
        <ul>
          <li><b>exatamente um</b> <code>&lt;h1&gt;</code> com o nome do lugar;</li>
          <li>pelo menos <b>dois</b> <code>&lt;h2&gt;</code> (seções);</li>
          <li>pelo menos <b>um parágrafo</b> <code>&lt;p&gt;</code> em cada seção (no mínimo dois no total).</li>
        </ul>`,
      dica: 'A hierarquia importa: h1 é o título da página, h2 são as seções, e só deve existir um h1.',
      arquivos: html('  <!-- seu artigo aqui -->', { titulo: 'Meu bairro' }),
      solucao: html(`  <h1>Juazeiro do Norte</h1>
  <h2>História</h2>
  <p>Cidade do Cariri cearense, conhecida pela fé e pela cultura popular.</p>
  <h2>Comidas típicas</h2>
  <p>Baião de dois, tapioca e rapadura.</p>`, { titulo: 'Meu bairro' }),
      testes: [
        {
          regras: [
            { seletor: 'h1', igual: 1, msg: 'Use exatamente um <h1>' },
            { seletor: 'h2', min: 2, msg: 'Use pelo menos dois <h2>' },
            { seletor: 'p', min: 2, msg: 'Escreva pelo menos dois parágrafos' },
          ],
        },
      ],
    },
    {
      id: 'html-enfase',
      tipo: 'problema',
      titulo: 'Negrito, itálico e quebra de linha',
      dificuldade: 'facil',
      enunciado: `
        <p>Escreva um aviso em um parágrafo onde:</p>
        <ul>
          <li>a palavra <b>importante</b> esteja em <code>&lt;strong&gt;</code>;</li>
          <li>a palavra <b>atenção</b> esteja em <code>&lt;em&gt;</code>;</li>
          <li>exista uma quebra de linha <code>&lt;br&gt;</code> dentro do parágrafo.</li>
        </ul>`,
      dica: '<strong> dá importância (negrito) e <em> dá ênfase (itálico). <br> não tem tag de fechamento.',
      arquivos: html('  <p>Aviso: leia com atenção. Isto é importante.</p>', { titulo: 'Aviso' }),
      solucao: html('  <p>Aviso: leia com <em>atenção</em>.<br>Isto é <strong>importante</strong>.</p>', { titulo: 'Aviso' }),
      testes: [
        {
          regras: [
            { seletor: 'p strong', texto: 'importante' },
            { seletor: 'p em', texto: 'atenção' },
            { seletor: 'p br', msg: 'Use <br> dentro do parágrafo' },
          ],
        },
      ],
    },
    {
      id: 'html-links',
      tipo: 'problema',
      titulo: 'Links externos e âncoras',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie:</p>
        <ul>
          <li>um link para <code>https://www.w3schools.com</code> que abra em <b>nova aba</b> (<code>target="_blank"</code>);</li>
          <li>um link interno com <code>href="#contato"</code>;</li>
          <li>uma <code>&lt;section id="contato"&gt;</code> com um <code>&lt;h2&gt;</code> <b>Contato</b>.</li>
        </ul>`,
      dica: 'O href="#contato" leva até o elemento que tem id="contato" na mesma página.',
      arquivos: html('  <h1>Links</h1>\n  <!-- seus links aqui -->', { titulo: 'Links' }),
      solucao: html(`  <h1>Links</h1>
  <p><a href="https://www.w3schools.com" target="_blank">Estudar na W3Schools</a></p>
  <p><a href="#contato">Ir para o contato</a></p>
  <section id="contato">
    <h2>Contato</h2>
    <p>professor@escola.com</p>
  </section>`, { titulo: 'Links' }),
      testes: [
        {
          regras: [
            { seletor: 'a[href="https://www.w3schools.com"][target="_blank"]', msg: 'Crie o link para https://www.w3schools.com com target="_blank"' },
            { seletor: 'a[href="#contato"]', msg: 'Crie um link com href="#contato"' },
            { seletor: 'section#contato h2', texto: 'Contato' },
          ],
        },
      ],
    },
    {
      id: 'html-imagens',
      tipo: 'problema',
      titulo: 'Imagem acessível',
      dificuldade: 'facil',
      enunciado: `
        <p>Mostre a imagem <code>https://picsum.photos/id/1025/400/300</code> com:</p>
        <ul>
          <li>um texto alternativo (<code>alt</code>) <b>não vazio</b> descrevendo a imagem;</li>
          <li>largura de <b>300</b> pixels (<code>width="300"</code>);</li>
          <li>dentro de um <code>&lt;figure&gt;</code> com uma legenda <code>&lt;figcaption&gt;</code>.</li>
        </ul>`,
      dica: 'O alt é lido por leitores de tela e aparece quando a imagem não carrega.',
      arquivos: html('  <h1>Galeria</h1>\n  <img src="https://picsum.photos/id/1025/400/300">', { titulo: 'Galeria' }),
      solucao: html(`  <h1>Galeria</h1>
  <figure>
    <img src="https://picsum.photos/id/1025/400/300" alt="Cachorro enrolado em um cobertor" width="300">
    <figcaption>Um cachorro tirando um cochilo.</figcaption>
  </figure>`, { titulo: 'Galeria' }),
      testes: [
        {
          regras: [
            { seletor: 'img[src="https://picsum.photos/id/1025/400/300"]', msg: 'Use a imagem indicada no src' },
            { codigo: '<img[^>]*\\balt\\s*=\\s*"[^"]+"', msg: 'O alt da imagem não pode ficar vazio' },
            { seletor: 'img[width="300"]', msg: 'Defina width="300"' },
            { seletor: 'figure img', msg: 'Coloque a imagem dentro de <figure>' },
            { seletor: 'figure figcaption', msg: 'Adicione uma <figcaption> no <figure>' },
          ],
        },
      ],
    },
    {
      id: 'html-listas',
      tipo: 'problema',
      titulo: 'Listas ordenadas e não ordenadas',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie uma receita com:</p>
        <ul>
          <li>um <code>&lt;h2&gt;</code> <b>Ingredientes</b> seguido de uma lista <b>não ordenada</b> com <b>exatamente 4</b> itens;</li>
          <li>um <code>&lt;h2&gt;</code> <b>Modo de preparo</b> seguido de uma lista <b>ordenada</b> com <b>exatamente 3</b> passos.</li>
        </ul>`,
      dica: '<ul> é não ordenada (marcadores) e <ol> é ordenada (números). Cada item é um <li>.',
      arquivos: html('  <h1>Tapioca</h1>', { titulo: 'Receita' }),
      solucao: html(`  <h1>Tapioca</h1>
  <h2>Ingredientes</h2>
  <ul>
    <li>Goma de tapioca</li>
    <li>Queijo coalho</li>
    <li>Coco ralado</li>
    <li>Sal</li>
  </ul>
  <h2>Modo de preparo</h2>
  <ol>
    <li>Peneire a goma na frigideira quente.</li>
    <li>Espere firmar e adicione o recheio.</li>
    <li>Dobre e sirva.</li>
  </ol>`, { titulo: 'Receita' }),
      testes: [
        {
          regras: [
            { seletor: 'h2', texto: 'Ingredientes' },
            { seletor: 'h2', texto: 'Modo de preparo' },
            { seletor: 'ul > li', igual: 4, msg: 'A lista de ingredientes (<ul>) deve ter 4 itens' },
            { seletor: 'ol > li', igual: 3, msg: 'O modo de preparo (<ol>) deve ter 3 passos' },
          ],
        },
      ],
    },
    {
      id: 'html-tabela',
      tipo: 'problema',
      titulo: 'Tabela de notas',
      dificuldade: 'medio',
      enunciado: `
        <p>Monte uma tabela com:</p>
        <ul>
          <li>um <code>&lt;caption&gt;</code> <b>Notas do 1º bimestre</b>;</li>
          <li>um <code>&lt;thead&gt;</code> com os cabeçalhos <code>&lt;th&gt;</code> <b>Aluno</b> e <b>Nota</b>;</li>
          <li>um <code>&lt;tbody&gt;</code> com <b>3 linhas</b> de alunos.</li>
        </ul>`,
      dica: 'Linhas são <tr>; células de cabeçalho são <th> e células comuns são <td>.',
      arquivos: html('  <table>\n    <!-- sua tabela aqui -->\n  </table>', { titulo: 'Notas' }),
      solucao: html(`  <table border="1">
    <caption>Notas do 1º bimestre</caption>
    <thead>
      <tr><th>Aluno</th><th>Nota</th></tr>
    </thead>
    <tbody>
      <tr><td>Ana</td><td>9,0</td></tr>
      <tr><td>Bruno</td><td>7,5</td></tr>
      <tr><td>Carla</td><td>8,0</td></tr>
    </tbody>
  </table>`, { titulo: 'Notas' }),
      testes: [
        {
          regras: [
            { seletor: 'table caption', texto: 'Notas do 1º bimestre' },
            { seletor: 'table thead th', igual: 2, msg: 'O <thead> deve ter 2 <th>' },
            { seletor: 'thead th', texto: 'Aluno' },
            { seletor: 'thead th', texto: 'Nota' },
            { seletor: 'table tbody tr', igual: 3, msg: 'O <tbody> deve ter 3 linhas' },
            { seletor: 'tbody td', min: 6, msg: 'Cada linha precisa de 2 células <td>' },
          ],
        },
      ],
    },
    {
      id: 'html-formulario',
      tipo: 'problema',
      titulo: 'Formulário de cadastro',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie um formulário com <code>action="salvar.php"</code> e <code>method="post"</code> contendo:</p>
        <ul>
          <li>um campo de texto <code>name="nome"</code> <b>obrigatório</b> (<code>required</code>);</li>
          <li>um campo do tipo <b>email</b> com <code>name="email"</code>;</li>
          <li>um <code>&lt;select name="curso"&gt;</code> com <b>3</b> opções;</li>
          <li>um <code>&lt;label&gt;</code> para cada campo, ligado pelo atributo <code>for</code>;</li>
          <li>um botão do tipo <b>submit</b>.</li>
        </ul>`,
      dica: '<label for="nome"> se liga ao campo que tem id="nome".',
      arquivos: html('  <h1>Cadastro</h1>\n  <form>\n  </form>', { titulo: 'Cadastro' }),
      solucao: html(`  <h1>Cadastro</h1>
  <form action="salvar.php" method="post">
    <p><label for="nome">Nome</label>
    <input type="text" id="nome" name="nome" required></p>
    <p><label for="email">E-mail</label>
    <input type="email" id="email" name="email"></p>
    <p><label for="curso">Curso</label>
    <select id="curso" name="curso">
      <option>Informática</option>
      <option>Eletrônica</option>
      <option>Design</option>
    </select></p>
    <button type="submit">Cadastrar</button>
  </form>`, { titulo: 'Cadastro' }),
      testes: [
        {
          regras: [
            { seletor: 'form[action="salvar.php"][method="post" i]', msg: 'Use action="salvar.php" e method="post"' },
            { seletor: 'form input[name="nome"][required]', msg: 'O campo nome deve ser obrigatório (required)' },
            { seletor: 'form input[type="email"][name="email"]', msg: 'Crie um campo type="email" com name="email"' },
            { seletor: 'form select[name="curso"] option', igual: 3, msg: 'O select curso deve ter 3 opções' },
            { seletor: 'label[for]', min: 3, msg: 'Use um <label for="..."> para cada campo' },
            { seletor: 'form button[type="submit"], form input[type="submit"]', msg: 'Adicione um botão submit' },
          ],
        },
      ],
    },
    {
      id: 'licao-html-semantica',
      tipo: 'licao',
      titulo: 'HTML semântico',
      resumo: `
        <p>Tags semânticas dizem <b>o que</b> cada parte da página é, e não só como ela aparece.
        Isso ajuda leitores de tela, mecanismos de busca e quem vai manter o código.</p>
        <ul>
          <li><code>&lt;header&gt;</code>: cabeçalho;</li>
          <li><code>&lt;nav&gt;</code>: navegação;</li>
          <li><code>&lt;main&gt;</code>: conteúdo principal (um por página);</li>
          <li><code>&lt;article&gt;</code> e <code>&lt;section&gt;</code>: blocos de conteúdo;</li>
          <li><code>&lt;footer&gt;</code>: rodapé.</li>
        </ul>`,
      arquivos: html(`  <header>
    <h1>Blog da Turma</h1>
    <nav>
      <a href="#">Início</a> |
      <a href="#">Artigos</a> |
      <a href="#">Sobre</a>
    </nav>
  </header>

  <main>
    <article>
      <h2>Por que aprender HTML?</h2>
      <p>Porque toda página da web começa por ele.</p>
    </article>
    <section>
      <h2>Próximas aulas</h2>
      <p>CSS com W3.CSS e depois PHP.</p>
    </section>
  </main>

  <footer>
    <p>&copy; Turma de Informática</p>
  </footer>`, { titulo: 'HTML semântico' }),
    },
    {
      id: 'html-semantica',
      tipo: 'problema',
      titulo: 'Estrutura semântica',
      dificuldade: 'medio',
      enunciado: `
        <p>Organize a página com tags semânticas:</p>
        <ul>
          <li>um <code>&lt;header&gt;</code> com um <code>&lt;h1&gt;</code> e um <code>&lt;nav&gt;</code> de <b>3 links</b>;</li>
          <li>um único <code>&lt;main&gt;</code> com pelo menos <b>2</b> <code>&lt;article&gt;</code>, cada um com um <code>&lt;h2&gt;</code>;</li>
          <li>um <code>&lt;footer&gt;</code> no final.</li>
        </ul>`,
      dica: 'Os links do menu ficam dentro do <nav>, que fica dentro do <header>.',
      arquivos: html(`  <div>
    <h1>Notícias da Escola</h1>
  </div>
  <div>
    <h2>Feira de ciências</h2>
    <p>Inscrições abertas.</p>
  </div>`, { titulo: 'Notícias' }),
      solucao: html(`  <header>
    <h1>Notícias da Escola</h1>
    <nav>
      <a href="#">Início</a>
      <a href="#">Eventos</a>
      <a href="#">Contato</a>
    </nav>
  </header>
  <main>
    <article>
      <h2>Feira de ciências</h2>
      <p>Inscrições abertas.</p>
    </article>
    <article>
      <h2>Jogos internos</h2>
      <p>Começam na próxima semana.</p>
    </article>
  </main>
  <footer>
    <p>Escola Técnica</p>
  </footer>`, { titulo: 'Notícias' }),
      testes: [
        {
          regras: [
            { seletor: 'header h1', msg: 'Coloque o <h1> dentro do <header>' },
            { seletor: 'header nav a', igual: 3, msg: 'O <nav> do <header> deve ter 3 links' },
            { seletor: 'main', igual: 1, msg: 'Use exatamente um <main>' },
            { seletor: 'main article h2', min: 2, msg: 'Crie pelo menos 2 <article> com <h2> dentro do <main>' },
            { seletor: 'footer', msg: 'Adicione um <footer>' },
          ],
        },
      ],
    },
    {
      id: 'html-perfil',
      tipo: 'problema',
      titulo: 'Página de perfil completa',
      dificuldade: 'dificil',
      enunciado: `
        <p>Junte tudo numa página de perfil:</p>
        <ul>
          <li><code>&lt;header&gt;</code> com <code>&lt;h1&gt;</code> (seu nome) e um <code>&lt;nav&gt;</code> com links para
            <code>#sobre</code>, <code>#habilidades</code> e <code>#contato</code>;</li>
          <li><code>&lt;section id="sobre"&gt;</code> com uma imagem com <code>alt</code> e um parágrafo;</li>
          <li><code>&lt;section id="habilidades"&gt;</code> com uma lista de pelo menos <b>3</b> habilidades;</li>
          <li><code>&lt;section id="contato"&gt;</code> com um formulário que tenha um campo <b>email</b> e um <code>&lt;textarea&gt;</code>;</li>
          <li><code>&lt;footer&gt;</code> com o símbolo <b>©</b> (<code>&amp;copy;</code>).</li>
        </ul>`,
      dica: 'Faça por partes: estrutura semântica primeiro, depois o conteúdo de cada seção.',
      arquivos: html('  <!-- sua página de perfil -->', { titulo: 'Perfil' }),
      solucao: html(`  <header>
    <h1>Ana Souza</h1>
    <nav>
      <a href="#sobre">Sobre</a>
      <a href="#habilidades">Habilidades</a>
      <a href="#contato">Contato</a>
    </nav>
  </header>
  <main>
    <section id="sobre">
      <h2>Sobre mim</h2>
      <img src="https://picsum.photos/id/64/200/200" alt="Foto de perfil" width="150">
      <p>Estudante de informática apaixonada por desenvolvimento web.</p>
    </section>
    <section id="habilidades">
      <h2>Habilidades</h2>
      <ul>
        <li>HTML</li>
        <li>W3.CSS</li>
        <li>PHP</li>
      </ul>
    </section>
    <section id="contato">
      <h2>Contato</h2>
      <form>
        <input type="email" name="email" placeholder="Seu e-mail">
        <textarea name="mensagem"></textarea>
        <button>Enviar</button>
      </form>
    </section>
  </main>
  <footer>
    <p>&copy; 2026 Ana Souza</p>
  </footer>`, { titulo: 'Perfil' }),
      testes: [
        {
          descricao: 'Estrutura',
          regras: [
            { seletor: 'header h1' },
            { seletor: 'header nav a[href="#sobre"]', msg: 'O menu deve ter link para #sobre' },
            { seletor: 'header nav a[href="#habilidades"]', msg: 'O menu deve ter link para #habilidades' },
            { seletor: 'header nav a[href="#contato"]', msg: 'O menu deve ter link para #contato' },
            { seletor: 'footer', texto: '©' },
          ],
        },
        {
          descricao: 'Seções',
          regras: [
            { seletor: 'section#sobre img[alt]', msg: 'A seção #sobre precisa de uma imagem com alt' },
            { seletor: 'section#sobre p', msg: 'A seção #sobre precisa de um parágrafo' },
            { seletor: 'section#habilidades li', min: 3, msg: 'Liste pelo menos 3 habilidades' },
            { seletor: 'section#contato form input[type="email"]', msg: 'O formulário de contato precisa de um campo email' },
            { seletor: 'section#contato form textarea', msg: 'O formulário de contato precisa de um <textarea>' },
          ],
        },
      ],
    },
  ],
};
