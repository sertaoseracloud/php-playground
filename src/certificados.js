// Certificados: um por módulo e um de conclusão total, emitidos pela Sertão será cloud.
//
// O site não tem servidor: o certificado é montado no navegador a partir do
// progresso salvo ali, e o link compartilhável guarda nome, módulo e data.
// Por isso ele é um comprovante de participação, não um documento verificável.
import { paraBase64Url, deBase64Url } from './compartilhar.js';

export const EMISSOR = {
  organizacao: 'Sertão será cloud',
  responsavel: 'Cláudio Raposo',
  cargo: 'Instrutor responsável',
  curso: 'PHP Playground: do HTML ao banco de dados',
  logo: 'https://github.com/sertaoseracloud.png?size=160',
};

export const CERTIFICADOS = {
  html: {
    titulo: 'Fundamentos de HTML',
    resumo: 'concluiu o módulo de HTML, resolvendo os 10 problemas práticos',
    conteudos: ['Estrutura de documentos', 'Links e imagens acessíveis', 'Listas e tabelas', 'Formulários', 'HTML semântico'],
  },
  w3css: {
    titulo: 'Interfaces responsivas com W3.CSS',
    resumo: 'concluiu o módulo de W3.CSS, resolvendo os 10 problemas práticos',
    conteudos: ['Cores e containers', 'Botões, painéis e cards', 'Barra de navegação', 'Grade responsiva', 'Tabelas e formulários estilizados'],
  },
  php: {
    titulo: 'Programação web com PHP',
    resumo: 'concluiu o módulo de PHP, resolvendo os 10 problemas práticos',
    conteudos: ['Variáveis e condicionais', 'Laços e arrays', 'Funções', 'Formulários com $_GET e $_POST', 'Segurança com htmlspecialchars'],
  },
  pdo: {
    titulo: 'Banco de dados com PHP e PDO',
    resumo: 'concluiu o módulo de PHP + PDO, resolvendo os 10 problemas práticos',
    conteudos: ['Conexão com PDO', 'Consultas preparadas e SQL injection', 'JOIN, GROUP BY e LEFT JOIN', 'INSERT a partir de formulários', 'Paginação com LIMIT e OFFSET'],
  },
  projetos: {
    titulo: 'Projetos web completos com PHP',
    resumo: 'construiu os 6 projetos completos da trilha, em 33 etapas',
    conteudos: ['Lista de tarefas (CRUD)', 'Blog com login', 'Rede social', 'Loja virtual com carrinho e transações', 'Biblioteca escolar', 'Fórum de perguntas'],
  },
  final: {
    titulo: 'Desenvolvedor Web PHP: trilha completa',
    resumo: 'concluiu a trilha completa: os 4 módulos, 40 problemas práticos e 6 projetos (33 etapas)',
    conteudos: ['HTML', 'W3.CSS', 'PHP', 'Banco de dados com PDO', '6 projetos completos'],
  },
};

const DATA = /^\d{4}-\d{2}-\d{2}$/;

/** Hash FNV-1a de 32 bits: só para dar um número curto e estável a cada certificado. */
function fnv1a(texto) {
  let h = 0x811c9dc5;
  for (const ch of new TextEncoder().encode(texto)) {
    h ^= ch;
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return h;
}

export function idCertificado({ nome, modulo, data }) {
  const numero = fnv1a(`${nome.trim()}|${modulo}|${data}`).toString(36).toUpperCase().padStart(6, '0').slice(-6);
  return `SSC-${data.slice(0, 4)}-${numero}`;
}

export function codificarCertificado({ nome, modulo, data }) {
  return paraBase64Url(new TextEncoder().encode(JSON.stringify({ n: nome, m: modulo, d: data })));
}

export function decodificarCertificado(codigo) {
  try {
    const { n, m, d } = JSON.parse(new TextDecoder().decode(deBase64Url(codigo)));
    const nome = typeof n === 'string' ? n.trim() : '';
    if (!nome || nome.length > 80 || !(m in CERTIFICADOS) || !DATA.test(d)) return null;
    const cert = { nome, modulo: m, data: d };
    return { ...cert, id: idCertificado(cert) };
  } catch {
    return null;
  }
}

export const linkCertificado = (cert) => `#/certificado/${codificarCertificado(cert)}`;

/** "Adicionar ao perfil" do LinkedIn, já com os campos da certificação preenchidos. */
export function linkLinkedInPerfil(cert, urlCertificado) {
  const parametros = new URLSearchParams({
    startTask: 'CERTIFICATION_NAME',
    name: CERTIFICADOS[cert.modulo].titulo,
    organizationName: EMISSOR.organizacao,
    issueYear: cert.data.slice(0, 4),
    issueMonth: String(Number(cert.data.slice(5, 7))),
    certUrl: urlCertificado,
    certId: idCertificado(cert),
  });
  return `https://www.linkedin.com/profile/add?${parametros}`;
}

/** Abre a janela de publicação do LinkedIn com o link do certificado. */
export const linkLinkedInPublicar = (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
