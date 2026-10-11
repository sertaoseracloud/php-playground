import { documento } from './util.js';

const w3 = (corpo, opcoes = {}) => ({ 'index.html': documento(corpo, { w3: true, ...opcoes }) });

export const moduloW3 = {
  id: 'w3css',
  titulo: 'W3.CSS',
  icone: '🎨',
  descricao: 'Deixe as páginas bonitas e responsivas só com classes: cores, cards, botões, grade e barras.',
  itens: [
    {
      id: 'licao-w3-classes',
      tipo: 'licao',
      titulo: 'Classes essenciais da W3.CSS',
      resumo: `
        <p>A W3.CSS é um arquivo CSS pronto. Basta incluir o <code>&lt;link&gt;</code> no <code>&lt;head&gt;</code>
        e usar <b>classes</b> no atributo <code>class</code>. Várias classes são separadas por espaço.</p>
        <ul>
          <li><b>Cores:</b> <code>w3-red</code>, <code>w3-teal</code>, <code>w3-pale-green</code>, <code>w3-text-blue</code>…</li>
          <li><b>Espaço:</b> <code>w3-container</code>, <code>w3-padding</code>, <code>w3-margin</code>, <code>w3-padding-16</code></li>
          <li><b>Forma:</b> <code>w3-round</code>, <code>w3-round-large</code>, <code>w3-border</code>, <code>w3-card</code></li>
          <li><b>Componentes:</b> <code>w3-button</code>, <code>w3-tag</code>, <code>w3-badge</code>, <code>w3-panel</code></li>
        </ul>`,
      arquivos: w3(`  <div class="w3-container w3-teal">
    <h1>W3.CSS</h1>
  </div>

  <div class="w3-container w3-padding-16">
    <button class="w3-button w3-blue">Azul</button>
    <button class="w3-button w3-green w3-round">Arredondado</button>
    <button class="w3-button w3-red w3-round-xxlarge">Bem redondo</button>

    <div class="w3-panel w3-pale-yellow w3-leftbar w3-border-yellow">
      <p>Um painel de aviso com borda à esquerda.</p>
    </div>

    <p>Tags: <span class="w3-tag w3-indigo">PHP</span> <span class="w3-tag w3-round w3-orange">HTML</span>
       Notificações <span class="w3-badge w3-red">3</span></p>

    <div class="w3-card w3-padding w3-margin-top" style="max-width:320px">
      <h3>Card</h3>
      <p>w3-card cria uma sombra ao redor.</p>
    </div>
  </div>`, { titulo: 'Classes W3.CSS' }),
    },
    {
      id: 'w3-container-cores',
      tipo: 'problema',
      titulo: 'Container colorido',
      dificuldade: 'facil',
      enunciado: `
        <p>A página já tem o <code>&lt;link&gt;</code> da W3.CSS. Crie:</p>
        <ul>
          <li>um <code>&lt;div&gt;</code> com as classes <code>w3-container</code> e <code>w3-teal</code>
            contendo um <code>&lt;h2&gt;</code> <b>Bem-vindo</b>;</li>
          <li>um segundo <code>w3-container</code> com a cor de texto <code>w3-text-grey</code> e um parágrafo.</li>
        </ul>`,
      dica: 'Várias classes no mesmo elemento: class="w3-container w3-teal".',
      arquivos: w3('  <h2>Bem-vindo</h2>\n  <p>Texto da página.</p>', { titulo: 'Cores' }),
      solucao: w3(`  <div class="w3-container w3-teal">
    <h2>Bem-vindo</h2>
  </div>
  <div class="w3-container w3-text-grey">
    <p>Texto da página.</p>
  </div>`, { titulo: 'Cores' }),
      testes: [
        {
          regras: [
            { seletor: 'link[href*="w3css"]', msg: 'Mantenha o <link> da W3.CSS no <head>' },
            { seletor: '.w3-container.w3-teal h2', texto: 'Bem-vindo' },
            { seletor: '.w3-container.w3-text-grey p', msg: 'Crie um w3-container w3-text-grey com um parágrafo' },
          ],
        },
      ],
    },
    {
      id: 'w3-botoes',
      tipo: 'problema',
      titulo: 'Botões',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie <b>3 botões</b> com a classe <code>w3-button</code>:</p>
        <ul>
          <li><b>Salvar</b> com <code>w3-green</code>;</li>
          <li><b>Excluir</b> com <code>w3-red</code>;</li>
          <li><b>Cancelar</b> com <code>w3-blue</code> e cantos bem arredondados (<code>w3-round-large</code>).</li>
        </ul>`,
      dica: 'Funciona tanto com <button> quanto com <a>: os dois aceitam a classe w3-button.',
      arquivos: w3('  <div class="w3-container w3-padding-16">\n    <button>Salvar</button>\n  </div>', { titulo: 'Botões' }),
      solucao: w3(`  <div class="w3-container w3-padding-16">
    <button class="w3-button w3-green">Salvar</button>
    <button class="w3-button w3-red">Excluir</button>
    <button class="w3-button w3-blue w3-round-large">Cancelar</button>
  </div>`, { titulo: 'Botões' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-button', igual: 3, msg: 'Crie exatamente 3 elementos w3-button' },
            { seletor: '.w3-button.w3-green', texto: 'Salvar' },
            { seletor: '.w3-button.w3-red', texto: 'Excluir' },
            { seletor: '.w3-button.w3-blue.w3-round-large', texto: 'Cancelar' },
          ],
        },
      ],
    },
    {
      id: 'w3-paineis',
      tipo: 'problema',
      titulo: 'Painéis de alerta',
      dificuldade: 'facil',
      enunciado: `
        <p>Crie dois painéis (<code>w3-panel</code>) com borda à esquerda (<code>w3-leftbar</code>):</p>
        <ul>
          <li>um de <b>erro</b>: <code>w3-pale-red</code> e <code>w3-border-red</code>, com o texto <b>Atenção</b>;</li>
          <li>um de <b>sucesso</b>: <code>w3-pale-green</code> e <code>w3-border-green</code>, com o texto <b>Salvo com sucesso</b>.</li>
        </ul>`,
      dica: 'w3-leftbar cria a borda grossa; w3-border-red define a cor dela.',
      arquivos: w3('  <div class="w3-container">\n    <h2>Alertas</h2>\n  </div>', { titulo: 'Alertas' }),
      solucao: w3(`  <div class="w3-container">
    <h2>Alertas</h2>
    <div class="w3-panel w3-pale-red w3-leftbar w3-border-red">
      <p>Atenção: preencha todos os campos.</p>
    </div>
    <div class="w3-panel w3-pale-green w3-leftbar w3-border-green">
      <p>Salvo com sucesso!</p>
    </div>
  </div>`, { titulo: 'Alertas' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-panel.w3-pale-red.w3-leftbar.w3-border-red', texto: 'Atenção' },
            { seletor: '.w3-panel.w3-pale-green.w3-leftbar.w3-border-green', texto: 'Salvo com sucesso' },
          ],
        },
      ],
    },
    {
      id: 'w3-tags-badges',
      tipo: 'problema',
      titulo: 'Tags e badges',
      dificuldade: 'facil',
      enunciado: `
        <p>Em um card de curso:</p>
        <ul>
          <li>mostre <b>3</b> tecnologias usando <code>&lt;span class="w3-tag"&gt;</code> (cores à sua escolha);</li>
          <li>mostre a quantidade de alunos inscritos (<b>25</b>) num <code>&lt;span class="w3-badge"&gt;</code>.</li>
        </ul>`,
      dica: 'w3-tag é um rótulo retangular; w3-badge é um rótulo redondo, bom para números.',
      arquivos: w3(`  <div class="w3-card w3-container w3-margin" style="max-width:400px">
    <h3>Desenvolvimento Web</h3>
    <p>HTML, W3.CSS, PHP</p>
    <p>Inscritos: 25</p>
  </div>`, { titulo: 'Tags' }),
      solucao: w3(`  <div class="w3-card w3-container w3-margin" style="max-width:400px">
    <h3>Desenvolvimento Web</h3>
    <p>
      <span class="w3-tag w3-orange">HTML</span>
      <span class="w3-tag w3-blue">W3.CSS</span>
      <span class="w3-tag w3-indigo">PHP</span>
    </p>
    <p>Inscritos: <span class="w3-badge w3-green">25</span></p>
  </div>`, { titulo: 'Tags' }),
      testes: [
        {
          regras: [
            { seletor: 'span.w3-tag', igual: 3, msg: 'Use exatamente 3 span.w3-tag' },
            { seletor: 'span.w3-badge', texto: '25' },
          ],
        },
      ],
    },
    {
      id: 'w3-card-perfil',
      tipo: 'problema',
      titulo: 'Card de perfil',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie um card <code>w3-card-4</code> com três partes:</p>
        <ul>
          <li><code>&lt;header class="w3-container w3-indigo"&gt;</code> com um <code>&lt;h3&gt;</code> (nome);</li>
          <li><code>&lt;div class="w3-container"&gt;</code> com uma imagem <code>w3-circle</code> e um parágrafo;</li>
          <li><code>&lt;footer class="w3-container"&gt;</code> com um botão <code>w3-button</code>.</li>
        </ul>`,
      dica: 'w3-card-4 tem uma sombra mais forte que w3-card. w3-circle deixa a imagem redonda.',
      arquivos: w3('  <div style="max-width:320px" class="w3-margin">\n    <!-- seu card aqui -->\n  </div>', { titulo: 'Perfil' }),
      solucao: w3(`  <div style="max-width:320px" class="w3-margin">
    <div class="w3-card-4">
      <header class="w3-container w3-indigo">
        <h3>Carlos Lima</h3>
      </header>
      <div class="w3-container w3-center w3-padding">
        <img src="https://picsum.photos/id/91/120/120" alt="Foto do Carlos" class="w3-circle" width="100">
        <p>Desenvolvedor PHP em formação.</p>
      </div>
      <footer class="w3-container w3-padding">
        <button class="w3-button w3-indigo w3-block">Seguir</button>
      </footer>
    </div>
  </div>`, { titulo: 'Perfil' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-card-4', igual: 1, msg: 'Crie um elemento com a classe w3-card-4' },
            { seletor: '.w3-card-4 > header.w3-container.w3-indigo h3', msg: 'O card deve começar com header.w3-container.w3-indigo contendo um h3' },
            { seletor: '.w3-card-4 div.w3-container img.w3-circle', msg: 'Coloque uma imagem w3-circle num div.w3-container' },
            { seletor: '.w3-card-4 div.w3-container p', msg: 'Adicione um parágrafo no corpo do card' },
            { seletor: '.w3-card-4 > footer.w3-container .w3-button', msg: 'O card deve terminar com footer.w3-container contendo um w3-button' },
          ],
        },
      ],
    },
    {
      id: 'w3-navbar',
      tipo: 'problema',
      titulo: 'Barra de navegação',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie uma barra <code>w3-bar w3-black</code> com <b>4 links</b>, todos com as classes
        <code>w3-bar-item w3-button</code>:</p>
        <ul>
          <li>Início, Cursos e Notícias à esquerda;</li>
          <li><b>Entrar</b> à direita, com a classe extra <code>w3-right</code>.</li>
        </ul>`,
      dica: 'Os itens de uma w3-bar ficam lado a lado. w3-right empurra o item para a direita.',
      arquivos: w3(`  <div>
    <a href="#">Início</a>
  </div>
  <div class="w3-container"><h1>Escola</h1></div>`, { titulo: 'Navbar' }),
      solucao: w3(`  <div class="w3-bar w3-black">
    <a href="#" class="w3-bar-item w3-button">Início</a>
    <a href="#" class="w3-bar-item w3-button">Cursos</a>
    <a href="#" class="w3-bar-item w3-button">Notícias</a>
    <a href="#" class="w3-bar-item w3-button w3-right">Entrar</a>
  </div>
  <div class="w3-container"><h1>Escola</h1></div>`, { titulo: 'Navbar' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-bar.w3-black', igual: 1, msg: 'Crie um elemento w3-bar w3-black' },
            { seletor: '.w3-bar a.w3-bar-item.w3-button', igual: 4, msg: 'A barra deve ter 4 links w3-bar-item w3-button' },
            { seletor: '.w3-bar .w3-bar-item.w3-right', texto: 'Entrar' },
            { seletor: '.w3-bar .w3-bar-item', texto: 'Cursos' },
          ],
        },
      ],
    },
    {
      id: 'licao-w3-grade',
      tipo: 'licao',
      titulo: 'Grade responsiva',
      resumo: `
        <p>A grade da W3.CSS divide a linha em colunas: <code>w3-row-padding</code> é a linha e
        <code>w3-half</code>, <code>w3-third</code>, <code>w3-quarter</code> são colunas de 1/2, 1/3 e 1/4.</p>
        <p>Em telas pequenas as colunas <b>empilham</b> sozinhas. Para ver isso, diminua a largura do painel de resultado.</p>`,
      arquivos: w3(`  <div class="w3-bar w3-indigo">
    <a href="#" class="w3-bar-item w3-button">Início</a>
    <a href="#" class="w3-bar-item w3-button">Cursos</a>
    <a href="#" class="w3-bar-item w3-button">Contato</a>
  </div>

  <header class="w3-container w3-center w3-padding-32 w3-light-grey">
    <h1>Escola Técnica</h1>
    <p>Três colunas com w3-row-padding e w3-third</p>
  </header>

  <div class="w3-row-padding w3-margin-top">
    <div class="w3-third">
      <div class="w3-card w3-container w3-margin-bottom">
        <h3>Informática</h3>
        <p>Programação, redes e banco de dados.</p>
      </div>
    </div>
    <div class="w3-third">
      <div class="w3-card w3-container w3-margin-bottom">
        <h3>Eletrônica</h3>
        <p>Circuitos e automação.</p>
      </div>
    </div>
    <div class="w3-third">
      <div class="w3-card w3-container w3-margin-bottom">
        <h3>Design</h3>
        <p>Identidade visual e UI.</p>
      </div>
    </div>
  </div>

  <div class="w3-row-padding">
    <div class="w3-half"><div class="w3-panel w3-pale-blue">w3-half</div></div>
    <div class="w3-half"><div class="w3-panel w3-pale-green">w3-half</div></div>
  </div>

  <footer class="w3-container w3-dark-grey w3-center">
    <p>Feito com W3.CSS</p>
  </footer>`, { titulo: 'Grade W3.CSS' }),
    },
    {
      id: 'w3-grade',
      tipo: 'problema',
      titulo: 'Grade de 3 colunas',
      dificuldade: 'medio',
      enunciado: `
        <p>Crie uma <code>w3-row-padding</code> com <b>3 colunas</b> <code>w3-third</code>.
        Cada coluna deve ter um <code>w3-card</code> com um <code>&lt;h3&gt;</code> e um parágrafo.</p>
        <p>Abaixo, crie outra <code>w3-row-padding</code> com <b>2 colunas</b> <code>w3-half</code>.</p>`,
      dica: 'Estrutura: div.w3-row-padding > div.w3-third > div.w3-card',
      arquivos: w3('  <div class="w3-container"><h1>Serviços</h1></div>', { titulo: 'Grade' }),
      solucao: w3(`  <div class="w3-container"><h1>Serviços</h1></div>
  <div class="w3-row-padding">
    <div class="w3-third"><div class="w3-card w3-container"><h3>Sites</h3><p>Páginas institucionais.</p></div></div>
    <div class="w3-third"><div class="w3-card w3-container"><h3>Lojas</h3><p>Comércio eletrônico.</p></div></div>
    <div class="w3-third"><div class="w3-card w3-container"><h3>Sistemas</h3><p>Aplicações web.</p></div></div>
  </div>
  <div class="w3-row-padding w3-margin-top">
    <div class="w3-half"><p>Coluna da esquerda</p></div>
    <div class="w3-half"><p>Coluna da direita</p></div>
  </div>`, { titulo: 'Grade' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-row-padding > .w3-third', igual: 3, msg: 'Crie 3 colunas w3-third dentro de uma w3-row-padding' },
            { seletor: '.w3-third .w3-card h3', igual: 3, msg: 'Cada w3-third deve ter um w3-card com <h3>' },
            { seletor: '.w3-third .w3-card p', min: 3, msg: 'Cada card deve ter um parágrafo' },
            { seletor: '.w3-row-padding > .w3-half', igual: 2, msg: 'Crie 2 colunas w3-half dentro de outra w3-row-padding' },
          ],
        },
      ],
    },
    {
      id: 'w3-tabela',
      tipo: 'problema',
      titulo: 'Tabela estilizada',
      dificuldade: 'medio',
      enunciado: `
        <p>Estilize a tabela de produtos:</p>
        <ul>
          <li>a <code>&lt;table&gt;</code> deve ter as classes <code>w3-table-all</code> e <code>w3-hoverable</code>;</li>
          <li>a linha de cabeçalho deve ter a cor <code>w3-indigo</code>;</li>
          <li>a tabela deve ficar dentro de um <code>w3-responsive</code> (rolagem em telas pequenas);</li>
          <li>adicione o produto <b>Monitor</b> (R$ 899,00) como <b>quarta</b> linha de dados.</li>
        </ul>`,
      dica: 'w3-table-all já inclui bordas e listras. w3-hoverable destaca a linha sob o mouse.',
      arquivos: w3(`  <div class="w3-container">
    <h2>Produtos</h2>
    <table>
      <tr><th>Produto</th><th>Preço</th></tr>
      <tr><td>Teclado</td><td>R$ 149,90</td></tr>
      <tr><td>Mouse</td><td>R$ 79,90</td></tr>
      <tr><td>Headset</td><td>R$ 229,50</td></tr>
    </table>
  </div>`, { titulo: 'Tabela' }),
      solucao: w3(`  <div class="w3-container">
    <h2>Produtos</h2>
    <div class="w3-responsive">
      <table class="w3-table-all w3-hoverable">
        <tr class="w3-indigo"><th>Produto</th><th>Preço</th></tr>
        <tr><td>Teclado</td><td>R$ 149,90</td></tr>
        <tr><td>Mouse</td><td>R$ 79,90</td></tr>
        <tr><td>Headset</td><td>R$ 229,50</td></tr>
        <tr><td>Monitor</td><td>R$ 899,00</td></tr>
      </table>
    </div>
  </div>`, { titulo: 'Tabela' }),
      testes: [
        {
          regras: [
            { seletor: '.w3-responsive table.w3-table-all.w3-hoverable', msg: 'A tabela deve ter w3-table-all e w3-hoverable, dentro de um w3-responsive' },
            { seletor: 'tr.w3-indigo th', min: 2, msg: 'A linha de cabeçalho deve ter a classe w3-indigo' },
            { seletor: 'table tr', igual: 5, msg: 'A tabela deve ter o cabeçalho e 4 produtos' },
            { seletor: 'td', texto: 'Monitor' },
            { contem: 'R$ 899,00' },
          ],
        },
      ],
    },
    {
      id: 'w3-formulario',
      tipo: 'problema',
      titulo: 'Formulário com W3.CSS',
      dificuldade: 'medio',
      enunciado: `
        <p>Transforme o formulário em um card bonito:</p>
        <ul>
          <li>o <code>&lt;form&gt;</code> deve ter <code>w3-container w3-card-4</code>;</li>
          <li>os dois campos de texto devem ter <code>w3-input</code> e <code>w3-border</code>;</li>
          <li>o <code>&lt;select&gt;</code> deve ter <code>w3-select</code>;</li>
          <li>o botão deve ocupar a largura toda: <code>w3-button w3-block w3-teal</code>.</li>
        </ul>`,
      dica: 'w3-block faz o botão ocupar 100% da largura do container.',
      arquivos: w3(`  <form style="max-width:420px" class="w3-margin">
    <h2>Inscrição</h2>
    <p><label>Nome</label><input type="text" name="nome"></p>
    <p><label>E-mail</label><input type="email" name="email"></p>
    <p><select name="turno">
      <option>Manhã</option><option>Tarde</option><option>Noite</option>
    </select></p>
    <p><button>Inscrever</button></p>
  </form>`, { titulo: 'Inscrição' }),
      solucao: w3(`  <form style="max-width:420px" class="w3-container w3-card-4 w3-margin">
    <h2>Inscrição</h2>
    <p><label>Nome</label><input class="w3-input w3-border" type="text" name="nome"></p>
    <p><label>E-mail</label><input class="w3-input w3-border" type="email" name="email"></p>
    <p><select class="w3-select" name="turno">
      <option>Manhã</option><option>Tarde</option><option>Noite</option>
    </select></p>
    <p><button class="w3-button w3-block w3-teal">Inscrever</button></p>
  </form>`, { titulo: 'Inscrição' }),
      testes: [
        {
          regras: [
            { seletor: 'form.w3-container.w3-card-4', msg: 'O formulário deve ter w3-container e w3-card-4' },
            { seletor: 'input.w3-input.w3-border', igual: 2, msg: 'Os 2 campos devem ter w3-input e w3-border' },
            { seletor: 'select.w3-select', msg: 'O select deve ter w3-select' },
            { seletor: 'button.w3-button.w3-block.w3-teal', texto: 'Inscrever' },
          ],
        },
      ],
    },
    {
      id: 'w3-landing',
      tipo: 'problema',
      titulo: 'Landing page completa',
      dificuldade: 'dificil',
      enunciado: `
        <p>Monte a página de um curso com:</p>
        <ul>
          <li>uma barra <code>w3-bar</code> com pelo menos <b>3</b> <code>w3-bar-item</code>;</li>
          <li>um <code>&lt;header&gt;</code> <code>w3-container w3-center</code> com um <code>&lt;h1&gt;</code> e um link
            <code>w3-button</code> <b>Inscreva-se</b>;</li>
          <li>uma <code>w3-row-padding</code> com <b>3</b> <code>w3-third</code>, cada uma com um <code>w3-card</code>;</li>
          <li>um <code>&lt;footer&gt;</code> <code>w3-container w3-center</code> com cor de fundo (qualquer classe <code>w3-</code> de cor).</li>
        </ul>`,
      dica: 'Reaproveite o que fez nos problemas anteriores: barra, grade e cards.',
      arquivos: w3('  <!-- sua landing page -->', { titulo: 'Curso de PHP' }),
      solucao: w3(`  <div class="w3-bar w3-indigo">
    <a href="#" class="w3-bar-item w3-button">Início</a>
    <a href="#" class="w3-bar-item w3-button">Conteúdo</a>
    <a href="#" class="w3-bar-item w3-button">Contato</a>
  </div>
  <header class="w3-container w3-center w3-padding-64 w3-light-grey">
    <h1>Curso de PHP</h1>
    <p>Do HTML ao banco de dados.</p>
    <a href="#" class="w3-button w3-indigo w3-round-large">Inscreva-se</a>
  </header>
  <div class="w3-row-padding w3-padding-32">
    <div class="w3-third"><div class="w3-card w3-container"><h3>HTML</h3><p>Estrutura.</p></div></div>
    <div class="w3-third"><div class="w3-card w3-container"><h3>W3.CSS</h3><p>Estilo.</p></div></div>
    <div class="w3-third"><div class="w3-card w3-container"><h3>PHP + PDO</h3><p>Lógica e dados.</p></div></div>
  </div>
  <footer class="w3-container w3-center w3-dark-grey">
    <p>Escola Técnica</p>
  </footer>`, { titulo: 'Curso de PHP' }),
      testes: [
        {
          descricao: 'Topo',
          regras: [
            { seletor: '.w3-bar .w3-bar-item', min: 3, msg: 'A w3-bar deve ter pelo menos 3 w3-bar-item' },
            { seletor: 'header.w3-container.w3-center h1', msg: 'Crie um header w3-container w3-center com <h1>' },
            { seletor: 'header a.w3-button', texto: 'Inscreva-se' },
          ],
        },
        {
          descricao: 'Conteúdo e rodapé',
          regras: [
            { seletor: '.w3-row-padding > .w3-third .w3-card', igual: 3, msg: 'Crie 3 colunas w3-third com um w3-card cada' },
            { seletor: 'footer.w3-container.w3-center', msg: 'Crie um footer w3-container w3-center' },
            {
              seletor: 'footer[class*="w3-dark-grey"], footer[class*="w3-black"], footer[class*="w3-indigo"], footer[class*="w3-teal"], footer[class*="w3-blue"], footer[class*="w3-light-grey"], footer[class*="w3-grey"], footer[class*="w3-green"], footer[class*="w3-red"], footer[class*="w3-purple"]',
              msg: 'Dê uma cor de fundo ao footer (ex.: w3-dark-grey)',
            },
          ],
        },
      ],
    },
  ],
};
