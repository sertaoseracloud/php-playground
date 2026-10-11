// Tema Dracula (https://draculatheme.com) para o CodeMirror, com a fonte Fira Code.
import { EditorView } from '@codemirror/view';
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

export const dracula = {
  fundo: '#282a36',
  linhaAtual: '#44475a',
  selecao: '#44475a',
  texto: '#f8f8f2',
  comentario: '#6272a4',
  ciano: '#8be9fd',
  verde: '#50fa7b',
  laranja: '#ffb86c',
  rosa: '#ff79c6',
  roxo: '#bd93f9',
  vermelho: '#ff5555',
  amarelo: '#f1fa8c',
};

const c = dracula;

const aparencia = EditorView.theme(
  {
    '&': { color: c.texto, backgroundColor: c.fundo, height: '100%' },
    '.cm-scroller': {
      fontFamily: '"Fira Code", monospace',
      fontVariantLigatures: 'contextual',
      lineHeight: '1.6',
    },
    '.cm-content': { caretColor: c.texto },
    '.cm-cursor, .cm-dropCursor': { borderLeftColor: c.texto },
    '&.cm-focused > .cm-scroller > .cm-selectionLayer .cm-selectionBackground, .cm-selectionBackground, ::selection': {
      backgroundColor: `${c.selecao} !important`,
    },
    '.cm-activeLine': { backgroundColor: '#44475a55' },
    '.cm-gutters': { backgroundColor: c.fundo, color: c.comentario, border: 'none' },
    '.cm-activeLineGutter': { backgroundColor: '#44475a55', color: c.texto },
    '.cm-foldPlaceholder': { backgroundColor: 'transparent', border: 'none', color: c.comentario },
    '.cm-matchingBracket, &.cm-focused .cm-matchingBracket': { backgroundColor: '#6272a466', outline: `1px solid ${c.comentario}` },
    '.cm-searchMatch': { backgroundColor: '#ffb86c44', outline: `1px solid ${c.laranja}` },
    '.cm-tooltip': { backgroundColor: '#21222c', border: `1px solid ${c.linhaAtual}`, color: c.texto },
    '.cm-tooltip-autocomplete > ul > li[aria-selected]': { backgroundColor: c.linhaAtual, color: c.texto },
    '.cm-panels': { backgroundColor: '#21222c', color: c.texto },
  },
  { dark: true },
);

const cores = HighlightStyle.define([
  { tag: t.comment, color: c.comentario, fontStyle: 'italic' },
  { tag: [t.keyword, t.operatorKeyword, t.controlKeyword, t.modifier, t.definitionKeyword], color: c.rosa },
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: c.rosa },
  { tag: [t.string, t.special(t.string), t.attributeValue], color: c.amarelo },
  { tag: [t.number, t.bool, t.null, t.atom], color: c.roxo },
  { tag: [t.function(t.variableName), t.function(t.propertyName)], color: c.verde },
  { tag: [t.definition(t.variableName), t.definition(t.function(t.variableName))], color: c.verde },
  { tag: [t.variableName, t.special(t.variableName)], color: c.texto },
  { tag: [t.typeName, t.className, t.namespace], color: c.ciano, fontStyle: 'italic' },
  { tag: [t.tagName, t.angleBracket], color: c.rosa },
  { tag: t.attributeName, color: c.verde, fontStyle: 'italic' },
  { tag: [t.propertyName], color: c.ciano },
  { tag: [t.processingInstruction, t.meta, t.documentMeta], color: c.rosa, fontWeight: 'bold' },
  { tag: t.escape, color: c.rosa },
  { tag: t.invalid, color: c.vermelho },
  { tag: t.heading, color: c.roxo, fontWeight: 'bold' },
  { tag: t.link, color: c.ciano, textDecoration: 'underline' },
]);

export const temaDracula = [aparencia, syntaxHighlighting(cores)];
