// Módulo extra: projetos completos construídos em etapas encadeadas.
import { projetoTarefas } from './tarefas.js';
import { projetoBlog } from './blog.js';
import { projetoRede } from './rede.js';
import { projetoLoja } from './loja.js';
import { projetoBiblioteca } from './biblioteca.js';
import { projetoForum } from './forum.js';

const projetos = [projetoTarefas, projetoBlog, projetoRede, projetoLoja, projetoBiblioteca, projetoForum];

export const moduloProjetos = {
  id: 'projetos',
  titulo: 'Projetos',
  icone: '🏗️',
  extra: true,
  descricao: 'Sistemas completos construídos em etapas: cada etapa parte do código da anterior.',
  grupos: projetos.map((p) => p.grupo),
  itens: projetos.flatMap((p) => p.itens),
};
