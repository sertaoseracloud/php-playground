// Falas dos moradores dos cenários da trilha (src/ui/cenarios): clicar ou tocar num personagem, ou
// abrir "Conhecer a vila", mostra a definição curta de um conceito do curso, para revisar. Texto
// simples, sem resposta de exercício e sem detalhe de como a correção funciona. Cada site tem as suas.
export const FALAS_DA_VILA = {
  tipografa: { nome: 'Tipógrafa', falas: ['HTML: a linguagem de marcação que dá estrutura e sentido ao conteúdo de uma página.', 'Tag: o marcador entre sinais de menor e maior, como p ou h1, que abre e fecha um elemento.', 'Atributo: informação extra dentro da tag de abertura, como o href de um link.'] },
  aprendiz: { nome: 'Aprendiz', falas: ['Semântica: usar a tag que diz o que o conteúdo é (título, lista, navegação), não só como ele parece.', 'Texto alternativo: a descrição de uma imagem no atributo alt, lida por quem não vê a imagem.'] },
  letra: { nome: 'Letra saltitante', falas: ['Formulário: o elemento form, que reúne campos e envia os dados para o servidor.'] },
  costureira: { nome: 'Costureira', falas: ['CSS: a linguagem que define a aparência da página: cores, espaços e disposição.', 'Classe: um nome no atributo class que aplica o mesmo estilo a vários elementos.'] },
  vendedor: { nome: 'Vendedor', falas: ['W3.CSS: um conjunto pronto de classes CSS para montar páginas sem escrever o estilo do zero.', 'Responsivo: o layout que se ajusta a telas de tamanhos diferentes, do celular ao computador.'] },
  borboleta: { nome: 'Borboleta', falas: ['Contraste: a diferença de cor entre texto e fundo, que deixa a leitura possível para mais gente.'] },
  ferreira: { nome: 'Ferreira', falas: ['PHP: a linguagem que roda no servidor e monta a página antes de ela chegar ao navegador.', 'Variável: um nome que guarda um valor; no PHP, começa com o cifrão.', 'Função: um bloco de código com nome, que recebe valores e devolve um resultado.'] },
  ajudante: { nome: 'Ajudante', falas: ['Array: uma lista de valores, com índices numéricos ou chaves com nome.', 'Laço: repete um trecho de código, como o foreach que passa por cada item de um array.'] },
  elefante: { nome: 'Elefantinho', falas: ['Superglobal: variável que o PHP preenche sozinho, como $_GET e $_POST com os dados do pedido.', 'htmlspecialchars: transforma caracteres especiais em texto seguro antes de mostrá-los no HTML.'] },
  arquivista: { nome: 'Arquivista', falas: ['Banco de dados: o lugar organizado onde os dados ficam guardados entre um acesso e outro.', 'Tabela: dados em linhas e colunas, como uma planilha dentro do banco.'] },
  mensageiro: { nome: 'Mensageiro', falas: ['PDO: a forma do PHP de conversar com bancos de dados, do mesmo jeito para vários tipos de banco.', 'Prepared statement: a consulta com lugares marcados para os valores, que protege contra injeção de SQL.'] },
  coruja: { nome: 'Coruja', falas: ['SQL: a linguagem para consultar e alterar os dados de um banco, com SELECT, INSERT, UPDATE e DELETE.'] },
  operaria: { nome: 'Operária da noite', falas: ['CRUD: as quatro operações básicas com dados: criar, ler, atualizar e apagar.', 'Filtrar a entrada: conferir se o dado que chegou tem o formato esperado antes de usá-lo.'] },
  robozinho: { nome: 'Robozinho', falas: ['Sessão: o jeito de o servidor lembrar de um visitante entre uma página e outra.'] },
  gato: { nome: 'Gato da cidade', falas: ['include: traz o conteúdo de outro arquivo PHP para dentro do atual, para reaproveitar código.'] },
};

/** Emojis das conversas, por cenário (o balão de quem conversa). */
export const EMOJIS_DA_CONVERSA = {
  tipografia: ['🔤', '📜', '🏷️'],
  feira: ['🎨', '🧵', '📐'],
  forja: ['🐘', '🔨', '🔥'],
  arquivo: ['🗄️', '📇', '🔎'],
  cidade: ['🌙', '🏗️', '💡'],
};
