// Versão do site e resumo das alterações de cada release (página #/novidades e CHANGELOG.md).
// A versão vem do package.json (injetada pelo Vite); o histórico completo vem do git
// (scripts/plugin-historico.mjs).
import historico from 'virtual:historico';

export const VERSAO = typeof __VERSAO__ === 'undefined' ? '0.0.0' : __VERSAO__;
export const HISTORICO = historico;
export const REPOSITORIO = 'https://github.com/sertaoseracloud/php-playground';

/** Releases, da mais nova para a mais antiga. Escritas para quem usa o site, sem jargão. */
export const RELEASES = [
  {
    versao: '1.12.2',
    data: '2026-10-22',
    titulo: 'Mais verde na vila',
    resumo: 'A cidade da trilha ganhou árvores em pixel art do pacote Tiny Town, de Kenney.',
    grupos: [
      { titulo: 'Cenários', itens: ['Árvores aparecem na cidade, mantendo os objetos e personagens de cada tema.', 'A origem e a licença CC0 dos sprites estão registradas na página Licença.'] },
    ],
  },
  {
    versao: '1.12.1',
    data: '2026-10-21',
    titulo: 'Seu código mais protegido',
    resumo: 'Trocar de exercício ou restaurar o exemplo não mistura mais os rascunhos. Os arquivos auxiliares ficaram mais claros para editar.',
    grupos: [
      { titulo: 'Editor', itens: ['Rascunhos preservados nas trocas rápidas de tela e aviso quando o navegador não consegue guardar seus dados.', 'Cada arquivo tem identificação e cores adequadas; excluir um arquivo devolve o foco ao editor.'] },
    ],
  },
  {
    versao: '1.12.0',
    data: '2026-10-20',
    titulo: 'A vila da trilha ganhou vida',
    resumo: 'Os cenários da trilha ficaram mais leves e os moradores agora vão a lugares, se cumprimentam, comemoram com você e ensinam definições para revisar.',
    grupos: [
      {
        titulo: '🏘️ Vila viva',
        itens: [
          'Os moradores andam até um destino (a porta de casa, perto do seu passo atual, um passo concluído), em vez de andar a esmo.',
          'Quem se cruza se cumprimenta com 👋 ou conversa com um emoji. Uns sentam perto dos objetos, outros entram e saem de casa. Filhotes e crianças seguem os pais.',
          'Na cidade à noite, metade dos moradores fica em casa.',
          'Resolveu um exercício? Na volta para a trilha, a vila comemora e a casa nova aparece crescendo.',
          'Clique ou toque num personagem para ver a definição de um conceito do curso, para revisar. O balão nunca cobre o ícone de um passo.',
        ],
      },
      {
        titulo: '♿ Acessibilidade e conforto',
        itens: [
          'Cada módulo tem o botão "Conhecer a vila", com todas as definições dos moradores em texto, para o teclado e o leitor de tela.',
          'O botão "Pausar animação do cenário" para os personagens, e o site lembra a escolha.',
          'Com "reduzir movimento", alto contraste ou o cenário pausado, nada se move e nenhum balão aparece sozinho.',
        ],
      },
      {
        titulo: '⚡ Mais leve',
        itens: [
          'Com placa de vídeo, o cenário é desenhado com WebGL (PixiJS), carregado só na tela da trilha: a trilha abre mais rápido e usa muito menos memória.',
          'Sem placa de vídeo, continua o desenho de antes.',
          'Os personagens param quando a aba fica escondida, quando o módulo sai da tela e quando você sai da trilha.',
        ],
      },
    ],
  },
  {
    versao: '1.11.0',
    data: '2026-10-20',
    titulo: 'Mais fácil para quem está começando, e para quem usa leitor de tela',
    resumo: 'A barra do exercício ficou mais simples, o aviso de apoio parou de interromper, e o site ficou melhor para o teclado e para o leitor de tela.',
    grupos: [
      {
        titulo: '🧭 Mais simples',
        itens: [
          "A barra do exercício mostra só ▶ Executar e ⬆ Enviar. Resetar banco, Restaurar e Compartilhar ficam em \"⋯ Mais ações\", cada um com uma frase dizendo para que serve.",
          "Os botões de posição do código e do resultado agora têm nome escrito: Lado a lado, Empilhado e Descrição.",
          "No celular, o nome do exercício aparece inteiro, sem ser cortado com \"…\".",
          "O aviso de apoio (PIX) aparece no máximo uma vez por dia, só na página inicial e na trilha. Ele não cobre mais um exercício aberto por link.",
          "Um endereço que não existe mostra \"Página não encontrada\", com um botão para a trilha, em vez de voltar calado para a página inicial.",
        ],
      },
      {
        titulo: '♿ Teclado e leitor de tela',
        itens: [
          "A aba 🧪 Testes tem o mesmo nome para quem vê e para quem usa comando de voz.",
          "As tabelas da página de privacidade quebram as palavras em vez de rolar de lado.",
          "No celular, fechar o tutorial ou o painel ♿ devolve o foco ao botão ⚙️. Fechar o aviso de apoio leva o foco ao título da página.",
          "Andando com o Tab, o item focado não fica mais escondido atrás da barra do topo nem dos botões do canto.",
          "O botão \"Dê uma estrela no GitHub\" ganhou texto escuro, legível em todos os temas.",
          "As animações da trilha param sozinhas em poucos segundos.",
        ],
      },
    ],
  },
  {
    versao: '1.10.0',
    data: '2026-10-20',
    titulo: 'Exercício sem nada por cima',
    resumo: 'Na tela do exercício, o tutorial e o aviso de privacidade não cobrem mais o código, e o troféu da trilha fala o mesmo que mostra.',
    grupos: [
      { titulo: '🧭 Tela do exercício', itens: ['O tutorial de boas-vindas abre sozinho só na trilha. Quem chega por um link direto para um exercício vê o código na hora; o tutorial continua no botão ❓.', 'O aviso de privacidade fica dentro da coluna da descrição e não cobre mais o editor.', 'A coluna da descrição tem pelo menos 320 pixels de largura, para o texto continuar fácil de ler.'] },
      { titulo: '♿ Acessibilidade', itens: ['O botão do troféu de cada módulo e os passos da trilha têm como nome o mesmo texto que aparece na tela. Quem usa comando de voz pode falar o que vê, como "Certificado liberado" ou "Começar", e o botão responde.'] },
    ],
  },
  {
    versao: '1.9.7',
    data: '2026-10-20',
    titulo: 'Evolução coordenada dos playgrounds',
    resumo: 'As instruções de desenvolvimento com IA passam a comparar decisões entre os playgrounds de PHP, Python, Terraform e Kubernetes.',
    grupos: [
      { titulo: 'Manutenção', itens: ['Cada demanda deve consultar o conhecimento compartilhado, justificar diferenças entre projetos e registrar as decisões com suas evidências.', 'As instruções orientam a atualização do conhecimento junto à entrega do projeto, sem publicar conteúdo privado.'] },
    ],
  },
  {
    versao: '1.9.5',
    data: '2026-10-19',
    titulo: 'Publicação mais confiável',
    resumo: 'Ajustes nos bastidores para cada nova versão do site ser testada e publicada sem tropeços.',
    grupos: [
      { titulo: '⚙️ Bastidores', itens: ['A versão de testes do site voltou a ser publicada junto com a principal.', 'Cada mudança proposta passa pelos testes automáticos antes de entrar no site.'] },
    ],
  },
  {
    versao: '1.9.4',
    data: '2026-10-18',
    titulo: 'Ferramentas mais seguras',
    resumo: 'As ferramentas que medem a qualidade do site foram atualizadas para versões sem falhas de segurança conhecidas.',
    grupos: [
      { titulo: '🔒 Segurança', itens: ['As ferramentas de medição de desempenho e acessibilidade usam versões corrigidas.'] },
    ],
  },
  {
    versao: '1.9.3',
    data: '2026-10-16',
    titulo: 'Mais leve no celular',
    resumo: 'No celular, os botões de ajuda não cobrem mais o código, e o PHP só carrega quando você abre um exercício.',
    grupos: [
      { titulo: '📱 Celular', itens: ['Os botões de ajuda, acessibilidade e privacidade viram um só (⚙️): no exercício, eles não cobrem mais o código.'] },
      { titulo: '⚡ Mais rápido', itens: ['O PHP só é baixado quando você abre um exercício: a página inicial e a trilha abrem mais rápido no celular.'] },
      { titulo: '🏅 Badges', itens: ['No cartão do badge, o nome do curso aparece inteiro.'] },
    ],
  },
  {
    versao: '1.9.2',
    data: '2026-10-16',
    titulo: 'Tudo cabe no celular',
    resumo: 'No iPhone e no Android, a trilha e o tutorial ficavam um pouco para fora da tela, e o cenário travava a rolagem.',
    grupos: [
      { titulo: '📱 Celular', itens: ['O painel do jogador e o cabeçalho de cada módulo cabem na largura da tela, com a mesma margem dos dois lados.', 'Os contadores do módulo (exercícios, lições e horas) quebram linha em vez de passar da borda.', 'Os botões do tutorial quebram linha, e o Próximo não fica mais escondido na borda.', 'No Android e no iPhone, o cenário da trilha não é mais redesenhado quando a barra de endereço some ou volta durante a rolagem: a rolagem não trava, e os personagens não voltam ao começo.'] },
    ],
  },
  {
    versao: '1.9.1',
    data: '2026-10-15',
    titulo: 'A vila cabe no mapa',
    resumo: 'O número de moradores da vila agora acompanha o tamanho do mapa: quanto mais alto o módulo, mais gente cabe nele.',
    grupos: [
      { titulo: '🏘️ Vila', itens: ['Cabem 10 personagens por tela de altura do módulo (4 no celular). Antes eram no máximo 30 por módulo, e num módulo comprido quase não sobrava lugar para os filhos e os filhotes.'] },
    ],
  },

  {
    versao: '1.9.0',
    data: '2026-10-15',
    titulo: 'A trilha virou uma vila',
    resumo: 'O mapa de cada módulo ocupa a tela toda, a estrada faz curvas pelo caminho dos exercícios, e cada exercício resolvido faz a vila crescer.',
    grupos: [
      { titulo: '🏘️ Vila', itens: ['A cada exercício resolvido, alguém constrói uma casa, nasce um filho ou um animal tem um filhote, nessa ordem.', 'A vila sai do seu progresso: ao restaurar pelo certificado, ela volta igual, sem nada a mais guardado no navegador.'] },
      { titulo: '🗺️ Mapa', itens: ['O mapa vai de uma borda à outra da tela, também por trás da coluna da esquerda.', 'A estrada faz curvas e passa por baixo de cada exercício do caminho.'] },
      { titulo: '♿ Acessibilidade', itens: ['Continua só decoração: o leitor de tela não lê a vila, e os personagens param com "reduzir movimento" e no alto contraste.'] },
    ],
  },

  {
    versao: '1.8.1',
    data: '2026-10-15',
    titulo: 'O cenário rola junto com a página',
    resumo: 'O mapa de cada módulo agora cobre o módulo de cima a baixo e sobe junto com o conteúdo quando você rola a página.',
    grupos: [
      { titulo: '🗺️ Cenários', itens: ['O mapa não fica mais parado atrás da página: ele vai no mesmo sentido da rolagem, como se fosse o chão do módulo.', 'Há personagens em toda a altura do módulo (3 por tela, 1 no celular), então sempre tem alguém andando à vista.'] },
    ],
  },
  {
    versao: '1.8.0',
    data: '2026-10-15',
    titulo: 'Cenários com a cara de cada módulo',
    resumo: 'Os mapas da trilha agora falam do assunto de cada módulo: uma tipografia no HTML, uma feira de tecidos no W3.CSS, uma forja no PHP e um arquivo no PDO.',
    grupos: [
      { titulo: '🗺️ Cenários', itens: ['HTML numa tipografia (texto marcado, como na prensa), W3.CSS numa feira de tecidos (o estilo veste a página), PHP numa forja e PDO num arquivo de pastas e gavetas. Projetos continua na cidade à noite.', 'Personagens novos: tipógrafa e a letra A pulando na tinta, costureira e borboleta, ferreira e o elefantinho azul do PHP, arquivista e coruja.'] },
      { titulo: '♿ Acessibilidade', itens: ['Continua só decoração: o leitor de tela não lê os cenários, e o caminho mantém as cores e o contraste em todos os temas.'] },
    ],
  },
  {
    versao: '1.7.0',
    data: '2026-10-15',
    titulo: 'A trilha virou um mapa',
    resumo: 'Cada módulo da trilha tem agora o seu cenário em pixel art, com personagens andando por ele de quadradinho em quadradinho.',
    grupos: [
      { titulo: '🗺️ Cenários', itens: ['HTML no sertão, W3.CSS num jardim florido, PHP no fogo da forja, PDO no gelo e Projetos na cidade à noite.', 'O mapa é feito de tiles em pixel art, como nos RPGs clássicos, com água, lava, objetos e uma estrada embaixo do caminho dos exercícios.', 'Personagens andam pelo mapa um passo de cada vez, sem entrar na água nem pisar no caminho: vaqueiro, borboleta, salamandra, pinguim, robozinho e outros.'] },
      { titulo: '♿ Acessibilidade', itens: ['Os cenários são só decoração: o leitor de tela não os lê e o caminho mantém as cores e o contraste.', 'Com "reduzir movimento" (no sistema ou no painel ♿), os personagens ficam parados. No alto contraste, o mapa vira contorno.'] },
    ],
  },
  {
    versao: '1.6.0',
    data: '2026-10-14',
    titulo: 'O certificado traz o progresso de volta',
    resumo: 'Trocou de computador ou limpou o navegador? Valide o seu certificado aqui e o progresso dos módulos dele volta.',
    grupos: [
      { titulo: '↩️ Restaurar o progresso', itens: ['Ao validar um certificado pelo link ou código, aparece o botão "Restaurar o meu progresso neste navegador".', 'O progresso só volta se o nome salvo neste navegador for igual ao do certificado, com os mesmos acentos e maiúsculas.', 'Voltam o módulo do certificado e os anteriores da trilha, nas datas do certificado: o certificado emitido de novo é o mesmo. Nada do que já está no navegador é apagado.'] },
    ],
  },
  {
    versao: '1.5.2',
    data: '2026-10-14',
    titulo: 'Solução só depois de tentar',
    resumo: 'A aba Solução aparece depois do tempo estimado de cada exercício, e só enquanto ele não estiver resolvido.',
    grupos: [
      {
        titulo: '🧠 Aprender tentando',
        itens: [
          'A aba Solução aparece depois do tempo estimado do exercício (o ⏱ ~15, 30 ou 45 min ao lado da dificuldade). Até lá, a descrição diz quanto falta.',
          'O tempo conta só com o exercício aberto e a aba do navegador visível, e soma as vezes em que você voltou a ele.',
          'Depois que o exercício é resolvido, a aba Solução não aparece mais.',
          'No perfil sem pressão, o aviso não mostra contagem de minutos; o leitor de tela avisa quando a solução fica disponível.',
        ],
      },
    ],
  },
  {
    versao: '1.5.1',
    data: '2026-10-14',
    titulo: 'Preview sem ficar em branco',
    resumo: 'A página do exercício aparece na hora, mesmo quando o site da W3.CSS está lento.',
    grupos: [
      {
        titulo: '🛠️ Correções',
        itens: [
          'O preview podia ficar em branco depois de validar e ir para o próximo exercício: a página esperava a W3.CSS chegar do site do w3schools. Agora o preview usa uma cópia da W3.CSS que já vem com o DivergePHP.',
          'A aba "HTML gerado" continua mostrando o <link> da W3.CSS que você escreveu.',
        ],
      },
    ],
  },
  {
    versao: '1.5.0',
    data: '2026-10-13',
    titulo: 'Agora é DivergePHP: acessível para todas as pessoas',
    resumo: 'Novo nome e uma plataforma feita para pessoas cegas, surdas, mudas e neurodivergentes.',
    grupos: [
      {
        titulo: '🦯 Pessoas cegas (leitor de tela)',
        itens: [
          'O leitor de tela fala o resultado de cada execução e de cada envio: quantos casos passaram, qual falhou, o motivo e a dica.',
          'O terminal não é mais lido letra por letra, e as execuções automáticas não interrompem o leitor.',
          'Ao trocar de página, o foco vai para o título; o editor anuncia os atalhos de teclado.',
          'Novo perfil 🦯 Leitor de tela no painel ♿: terminal sem animação e todas as falhas faladas.',
          'Corrigido: o link "Pular para o conteúdo" levava para a página inicial.',
        ],
      },
      {
        titulo: '🤟 Pessoas surdas e mudas',
        itens: [
          'Novo perfil 🤟 Libras: tradução com o VLibras, do Governo Federal, carregado só quando você liga.',
          'Nada no site depende de som ou de voz.',
        ],
      },
      {
        titulo: '♿ Página de acessibilidade e design',
        itens: [
          'Nova página Acessibilidade com os recursos para cada público, os atalhos de teclado e como relatar uma barreira.',
          'O tema segue o modo claro e o contraste alto do sistema; botões, títulos e textos pequenos ajustados para a WCAG 2.2 AA.',
          'Telas conferidas com o axe-core nos quatro temas, também nos testes automáticos.',
        ],
      },
      {
        titulo: '🔧 Por dentro',
        itens: [
          'Novo nome (DivergePHP) e busca do Google focada em acessibilidade, com dados de acessibilidade do schema.org.',
          'Os endereços, o progresso salvo e os certificados já emitidos continuam valendo.',
          'Mais testes, código repetido centralizado e dependências atualizadas.',
        ],
      },
    ],
  },
  {
    versao: '1.4.0',
    data: '2026-10-12',
    titulo: 'Quem é o instrutor e apoio ao projeto',
    resumo: 'Nova página sobre o instrutor, Cláudio Filipe Lima Rapôso, e um jeito simples de apoiar o projeto com PIX.',
    grupos: [
      {
        titulo: '👨‍🏫 Quem é o instrutor?',
        itens: [
          'Página com a foto, a atuação, os reconhecimentos (Microsoft MVP, Docker Captain e AWS Golden Jacket), as certificações e a formação do instrutor.',
          'Seção na página inicial e link no menu e no rodapé.',
        ],
      },
      {
        titulo: '☕ Apoie o projeto',
        itens: [
          'Apoio com um PIX de qualquer valor, por QR Code ou pelo código copia e cola (com botão de copiar).',
          'O apoio é voluntário e não muda nada no acesso ao site nem nos certificados.',
        ],
      },
      {
        titulo: '🔧 Por dentro',
        itens: [
          'A lista de novidades é lida do projeto certo, de onde quer que o site seja gerado.',
          'Publicação atualizada para as versões atuais das ferramentas do GitHub.',
          'Mais testes protegendo os projetos em etapas e os casos ocultos.',
        ],
      },
    ],
  },
  {
    versao: '1.3.0',
    data: '2026-10-12',
    titulo: 'Testes mais detalhados',
    resumo: 'Cada caso de teste agora mostra o que foi rodado, o que foi conferido, o que apareceu de fato e, quando falha, onde mexer.',
    grupos: [
      {
        titulo: '🧪 Testes',
        itens: [
          'Cada caso mostra as requisições que o teste faz (página, campos enviados e banco usado), quantas verificações passaram e quanto tempo levou.',
          'Cada verificação mostra o tipo (por exemplo recurso, output, texto da página) e o que a página mostrou, também quando passa.',
          'Quando uma verificação falha, aparecem o motivo e uma dica de onde mexer.',
          'Antes de rodar, cada caso já lista o que vai conferir.',
          'Nos casos ocultos, os valores continuam escondidos e só aparece o que falhou.',
        ],
      },
      {
        titulo: '🐛 Correções',
        itens: [
          'Textos longos não são mais cortados nos cards de teste em telas estreitas.',
          'Rótulos feitos só para leitores de tela não aparecem mais na tela.',
        ],
      },
    ],
  },
  {
    versao: '1.2.0',
    data: '2026-10-12',
    titulo: 'Carga horária',
    resumo: 'Os certificados agora mostram a carga horária, e cada exercício mostra quanto tempo leva, em média.',
    grupos: [
      {
        titulo: '⏱ Carga horária',
        itens: [
          'Cada certificado mostra a carga horária do módulo (no mínimo 1 hora); a trilha completa soma 39 horas.',
          'A carga aparece no certificado, no documento para imprimir, no post do LinkedIn, no arquivo XML e na validação.',
          'Cada módulo da trilha mostra as horas, e cada exercício mostra o tempo estimado ao lado da dificuldade.',
          'Certificados já emitidos continuam válidos e passam a mostrar a carga horária.',
        ],
      },
    ],
  },
  {
    versao: '1.1.0',
    data: '2026-10-12',
    titulo: 'Validador de certificados novo',
    resumo: 'A página de validar certificados ficou mais clara, mostra o resultado primeiro e funciona melhor no celular.',
    grupos: [
      {
        titulo: '🔎 Validar certificado',
        itens: [
          'Quem abre um link de validação vê o resultado primeiro, com o badge e os certificados da trilha numa linha do tempo.',
          'As três formas de validar (link, impresso e arquivo XML) ficam em abas.',
          'Cores diferentes para "válido", "alterado", "não consegui ler" e "link antigo".',
          'Contador de caracteres no selo e resultado que some quando você muda o texto.',
        ],
      },
      {
        titulo: '🐛 Correções',
        itens: [
          'A página de validação não passa mais da largura da tela no celular.',
          'O botão "Abrir o certificado" voltou a mostrar o texto.',
          'O resultado não é mais anunciado duas vezes por leitores de tela.',
          'A mensagem de execução do exercício não aparece mais nas outras páginas.',
        ],
      },
    ],
  },
  {
    versao: '1.0.0',
    data: '2026-10-12',
    titulo: 'Primeira versão oficial',
    resumo: 'Tudo o que foi construído até aqui: a trilha completa, os projetos, os certificados e as ferramentas de acessibilidade.',
    grupos: [
      {
        titulo: '🗺️ Trilha e exercícios',
        itens: [
          'Trilha do HTML ao banco de dados: HTML, W3.CSS, PHP e PHP com banco de dados (PDO), com 73 exercícios e 22 lições.',
          'O PHP roda direto no navegador, com banco de dados, sessões e formulários. Não precisa instalar nada.',
          'Exercícios corrigidos na hora por testes, no estilo LeetCode, com casos ocultos ao enviar.',
          'Módulo extra com 6 projetos completos (tarefas, blog, rede social, loja, biblioteca e fórum), feitos em etapas.',
          'Playground livre para experimentar, com banco de dados que fica salvo no navegador.',
          'Instruções sempre na mesma ordem e palavras técnicas explicadas com analogias do dia a dia.',
        ],
      },
      {
        titulo: '🏆 Gamificação e certificados',
        itens: [
          'Caminho com XP, níveis e sequência de dias; cada módulo abre quando você faz 70% do anterior.',
          'Certificado e badge para cada módulo e um certificado final, emitidos pela Sertão será cloud.',
          'Compartilhamento no LinkedIn com a imagem do badge e opção de imprimir ou salvar em PDF.',
          'Selo de autenticidade: os certificados saem na ordem da trilha, ligados uns aos outros, e qualquer alteração invalida o certificado.',
          'Página para validar certificados por link, pelo certificado impresso ou pelo arquivo XML.',
        ],
      },
      {
        titulo: '♿ Acessibilidade e neurodiversidade',
        itens: [
          'Temas Dracula, Claro, Alto contraste e Suave, texto de 87,5% a 175% e fonte mais legível.',
          'Perfis prontos: Foco (TDAH), Leitura facilitada (dislexia), Calmo (autismo) e Sem pressão (ansiedade).',
          'Modo foco, lista de tarefas, régua de leitura, lembrete de pausa e leitura em voz alta.',
          'Navegação completa pelo teclado e contraste revisado em todas as telas.',
          'Tutorial passo a passo, que se adapta ao celular.',
        ],
      },
      {
        titulo: '📱 Telas e navegação',
        itens: [
          'Página inicial apresentando o projeto; a trilha fica em uma página própria.',
          'Código e resultado lado a lado ou empilhados, conforme o tamanho da tela.',
          'Testes funcionais numa aba ao lado da descrição, com o resultado no nome da aba.',
          'Versão para celular com menu ☰, barra do exercício sempre visível e botões de ajuda flutuantes.',
        ],
      },
      {
        titulo: '🔒 Privacidade, licença e termos',
        itens: [
          'Sem cookies, sem rastreamento e sem cadastro: seus dados ficam só no seu navegador.',
          'Página de privacidade (LGPD), com botões para baixar e apagar seus dados.',
          'Software livre com copyleft: código sob AGPL-3.0 e conteúdo didático sob CC BY-SA 4.0.',
          'Página de termos de uso.',
        ],
      },
      {
        titulo: '🔍 Busca e compartilhamento',
        itens: [
          'Título, descrição e imagem de compartilhamento para buscadores e redes sociais.',
          'A página inicial já chega pronta para buscadores que não executam JavaScript.',
        ],
      },
    ],
  },
];
