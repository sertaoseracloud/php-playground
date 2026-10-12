import { describe, it, expect } from 'vitest';
import { GLOSSARIO, termosDoTexto, MAX_TERMOS } from '../src/conteudo/glossario.js';
import { itens } from '../src/conteudo/trilha.js';
import { descreverRegra } from '../src/verificacoes.js';

const texto = (html) => html.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

describe('glossário', () => {
  it('cada termo tem id único, definição e analogia', () => {
    expect(new Set(GLOSSARIO.map((t) => t.id)).size).toBe(GLOSSARIO.length);
    for (const t of GLOSSARIO) {
      expect(t.definicao.length).toBeGreaterThan(20);
      expect(t.analogia.length).toBeGreaterThan(20);
    }
  });

  it('acha termos com acento e na ordem em que aparecem', () => {
    const ids = termosDoTexto('Guarde o valor numa variável e use um laço foreach com PDO.').map((t) => t.id);
    expect(ids).toEqual(['variavel', 'laco', 'pdo']);
  });

  it('não confunde palavras parecidas', () => {
    expect(termosDoTexto('se for preciso, faça o post do blog')).toEqual([]);
    expect(termosDoTexto('o campo usuario_id').map((t) => t.id)).toEqual(['chave-estrangeira']);
  });

  it(`todo exercício tem pelo menos um termo explicado (no máximo ${MAX_TERMOS})`, () => {
    const semTermos = itens.filter((i) => {
      const html = i.tipo === 'problema' ? `${i.titulo} ${i.enunciado} ${i.dica}` : `${i.titulo} ${i.resumo}`;
      return termosDoTexto(texto(html)).length === 0;
    });
    expect(semTermos.map((i) => i.id)).toEqual([]);
  });
});

describe('como saber que deu certo', () => {
  it('descreve as regras em linguagem simples', () => {
    expect(descreverRegra({ contem: 'Total: 8' })).toBe('A página mostra "Total: 8"');
    expect(descreverRegra({ seletor: 'p.autor', texto: 'Ana' })).toBe('Tem um elemento p.autor com o texto "Ana"');
    expect(descreverRegra({ seletor: 'li', min: 3 })).toBe('Tem pelo menos 3 elementos li');
    expect(descreverRegra({ codigo: 'COUNT' })).toBeNull();
    expect(descreverRegra({ codigo: 'COUNT', msg: 'Use COUNT(*)' })).toBe('Use COUNT(*)');
  });
});
