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
