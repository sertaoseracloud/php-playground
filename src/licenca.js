// Política de licenciamento (copyleft). A página #/licenca e o README usam estes dados;
// tests/licenca.test.js confere que toda dependência do site está na lista de terceiros.
//
// Por que AGPL: o PHP que roda no navegador (@php-wasm) é GPL-2.0-or-later e vai junto
// com o site, então o projeto precisa de uma licença compatível com a GPL. A AGPL-3.0 é
// compatível e, além disso, exige publicar o código de versões modificadas oferecidas pela
// internet, que é exatamente como este site é usado.

export const ATUALIZADA_EM = '2026-10-22';
export const TITULAR = 'Sertão será cloud';
export const REPOSITORIO = 'https://github.com/sertaoseracloud/php-playground';

export const CODIGO = {
  nome: 'GNU Affero General Public License v3.0 ou posterior',
  spdx: 'AGPL-3.0-or-later',
  url: 'https://www.gnu.org/licenses/agpl-3.0.html',
  arquivo: `${REPOSITORIO}/blob/main/LICENSE`,
};

export const CONTEUDO = {
  nome: 'Creative Commons Atribuição-CompartilhaIgual 4.0 Internacional',
  spdx: 'CC-BY-SA-4.0',
  url: 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt-br',
  arquivo: `${REPOSITORIO}/blob/main/LICENSE-CONTEUDO.md`,
  atribuicao: 'DivergePHP, Sertão será cloud (CC BY-SA 4.0)',
};

/** Componentes de terceiros que vão junto com o site, com a licença de cada um. */
export const TERCEIROS = [
  { nome: 'PHP no navegador (@php-wasm/web, @php-wasm/universal)', pacotes: ['@php-wasm/web', '@php-wasm/universal'], licenca: 'GPL-2.0-or-later' },
  { nome: 'Editor de código (CodeMirror)', pacotes: ['codemirror', '@codemirror/lang-php', '@codemirror/lang-html', '@codemirror/lang-css', '@codemirror/lang-javascript', '@codemirror/lang-json', '@codemirror/language', '@codemirror/state', '@codemirror/view', '@lezer/highlight'], licenca: 'MIT' },
  { nome: 'Assinatura digital (@noble/ed25519, @noble/hashes)', pacotes: ['@noble/ed25519', '@noble/hashes'], licenca: 'MIT' },
  { nome: 'Fontes Fira Code e Atkinson Hyperlegible', pacotes: ['@fontsource/fira-code', '@fontsource/atkinson-hyperlegible'], licenca: 'OFL-1.1' },
  { nome: 'W3.CSS (carregado do site da W3Schools nos exercícios)', pacotes: [], licenca: 'termos de uso da W3Schools' },
  { nome: 'QR Code do PIX (qrcode-generator)', pacotes: ['qrcode-generator'], licenca: 'MIT' },
  { nome: 'Cores do tema Dracula', pacotes: [], licenca: 'MIT' },
  { nome: 'Sprites de cenário (Kenney Tiny Town)', pacotes: [], licenca: 'CC0-1.0' },
  // Só na tela da trilha, com placa de vídeo (src/ui/cenarios/palco-pixi.js), com as dependências que entram junto.
  { nome: 'Desenho dos cenários da trilha (PixiJS)', pacotes: ['pixi.js', '@pixi/colord', 'eventemitter3', 'ismobilejs', 'parse-svg-path'], licenca: 'MIT' },
  { nome: 'Triangulação do PixiJS (earcut)', pacotes: ['earcut'], licenca: 'ISC' },
  { nome: 'Cache do PixiJS (tiny-lru)', pacotes: ['tiny-lru'], licenca: 'BSD-3-Clause' },
];
