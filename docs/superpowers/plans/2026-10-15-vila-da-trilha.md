# Vila da trilha — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** O cenário de cada módulo vai de uma borda à outra da janela, a estrada faz curvas pelos nós do caminho, e uma vila (casas, filhos e filhotes) cresce com os exercícios resolvidos, nos três sites.

**Architecture:** Tudo continua em `src/ui/cenarios/`. O mapa (`mapa.js`, funções puras) ganha a estrada por linha a partir dos centros dos nós; a vila (`vila.js`, novo, função pura) sai de `(mapa, cenário, semente, exercícios feitos)`, sem nada gravado; o palco (`palco.js`) mede os nós e a largura da tela, aplica a vila e desenha casas, filhos e filhotes. O código é o mesmo nos três sites; muda só a lista de cenários (casas e quem é pessoa). Implementa no php, depois copia para o terraform e o python.

**Tech Stack:** JavaScript (ES modules), canvas 2D, Vite, vitest (happy-dom), eslint.

**Spec:** `docs/superpowers/specs/2026-10-15-vila-da-trilha-design.md` (no php-playground; copiada para os outros dois na Task 6 e 7).

## Global Constraints

- Só decoração: `aria-hidden`, sem foco, sem clique, sem texto; "reduzir movimento" e alto contraste valem como hoje.
- A vila é calculada de `(semente do módulo, exercícios concluídos)`; nenhum dado novo no navegador.
- Ciclo: o exercício nº *i* acrescenta 🏠 casa, 👶 filho, 🐣 filhote, e repete (7 exercícios → 3 casas, 2 filhos, 2 filhotes).
- Casas em chão livre a até 3 tiles da estrada, sem outra casa vizinha (nem na diagonal); candidatas embaralhadas uma vez com a semente `${semente}-vila`; a vila de *n + 1* contém a de *n*.
- No máximo **30** personagens por módulo: primeiro os de sempre (3 por tela, 1 no celular), depois filhos e filhotes.
- Estrada: curva Catmull-Rom pelos centros dos nós; estrada = até **2 tiles** da curva; sem nós medidos, a reta do centro de hoje (`colunasDaEstrada`).
- 100vw: a camada vai de uma borda à outra da área da trilha (`.tela-inicio`), sem rolagem horizontal; a coluna da esquerda fica acima, com o fundo do tema.
- Uma casa por cenário, 16×16; filho e filhote = sprite do pai ou da mãe com `escala 1`, no pé do tile.
- Versões: php **1.9.0**, terraform **1.10.0**; no python, a vila entra no `fase5` e sai na **0.5.0**. Publicar (push, PR, merge) só com o "sim".
- Commits como `Cláudio Raposo <engcfraposo@gmail.com>` (`git -c user.name=... -c user.email=...`), terminando com `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Build local com segredo aleatório: `CERTIFICADO_SEGREDO=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))") npm run build`.
- Neste Windows, `rtk` esconde saídas: use `rtk proxy <comando>`; edite JS com a ferramenta de edição (heredocs com Python estragam `\n`).

## Review Focus

1. **Módulo com mais exercícios feitos do que lugares para casa** (mapa estreito no celular): as casas param, filhos e filhotes continuam, sem laço infinito. Teste na Task 2 (`vila` com 100 feitos num mapa 11×10).
2. **Nós medidos fora de ordem ou com dois nós na mesma altura** (o troféu e o último nó lado a lado): a curva não pode dividir por zero nem sair do mapa. Teste na Task 1 (pontos repetidos na mesma linha e fora do mapa).
3. **Janela redimensionada para o celular depois de montar**: o mapa é refeito com a largura nova e a vila continua a mesma (mesma semente e feitos). Coberto pelo teste de redimensionar que já existe e pelo da Task 3 (`data-feitos` refeito).
4. **Cenário sem pessoa ou sem animal**: o filho vira filhote e vice-versa. Teste na Task 2.
5. **Módulo bloqueado com progresso** (aluno restaurou pelo certificado só um módulo adiante): a vila aparece cinza, como o mapa, e não anda. Teste na Task 3 (camada `.bloqueada` com feitos > 0 monta sem temporizador próprio).

---

## File Structure

| Arquivo | Responsabilidade |
|---|---|
| `src/ui/cenarios/mapa.js` | `estradaPorLinha` (nova) e `gerarMapa({ ..., caminho })` com `mapa.estrada`. |
| `src/ui/cenarios/fisica.js` | Começo dos personagens pelos lados da estrada de cada linha; a casa não se pisa (só quem voa). |
| `src/ui/cenarios/vila.js` (novo) | `lugaresDeCasa`, `vila`, `comCasas`, `MAX_PERSONAGENS`. |
| `src/ui/cenarios/casas.js` (novo) | Os sprites das casas do site. |
| `src/ui/cenarios/<cenário>.js` | `casa` e `tipo` em cada personagem. |
| `src/ui/cenarios/palco.js` | Mede os nós e a tela, aplica a vila, desenha casas, filhos e filhotes. |
| `src/ui/cenarios/index.js`, `src/ui/inicio.js` | `data-feitos` na camada. |
| `src/cenarios.css` | 100vw, `.pequeno`, a coluna da esquerda acima. |

---

### Task 1: A estrada curva no mapa

**Files:**
- Modify: `src/ui/cenarios/mapa.js`, `src/ui/cenarios/fisica.js`, `src/ui/cenarios/palco.js` (só o meio-fio)
- Test: `tests/cenarios-mapa.test.js`, `tests/cenarios-fisica.test.js`

**Interfaces:**
- Produces: `estradaPorLinha(colunas, linhas, caminho = [])` → `[[de, ate], ...]` (uma faixa de colunas, inclusiva, por linha); `gerarMapa({ colunas, linhas, cenario, semente, caminho = [] })` → `{ colunas, linhas, tiles, estrada }`; `RAIO_ESTRADA = 2`.
- `caminho`: lista de `{ c, l }` em tiles (números com fração: o centro de um nó no pixel `x, y` do mundo é `{ c: x / 32, l: y / 32 }`).

- [ ] **Step 1: Write the failing tests**

Em `tests/cenarios-mapa.test.js`, importe também `estradaPorLinha` de `mapa.js` e acrescente, dentro de `describe('mapa', ...)`:

```js
  it('sem caminho, a estrada de cada linha é a faixa reta de hoje', () => {
    const cols = colunasDaEstrada(40);
    expect(estradaPorLinha(40, 5)).toEqual(Array(5).fill([Math.min(...cols), Math.max(...cols)]));
  });

  it('com o caminho em ziguezague, o tile de cada nó é estrada, e a faixa tem até 5 tiles', () => {
    const caminho = [{ c: 17.5, l: 2.5 }, { c: 22.5, l: 6.5 }, { c: 16.5, l: 10.5 }, { c: 23.5, l: 14.5 }];
    const faixa = estradaPorLinha(40, 18, caminho);
    for (const { c, l } of caminho) {
      const [de, ate] = faixa[Math.floor(l)];
      expect(Math.floor(c)).toBeGreaterThanOrEqual(de);
      expect(Math.floor(c)).toBeLessThanOrEqual(ate);
    }
    for (const [de, ate] of faixa) {
      expect(ate - de + 1).toBeLessThanOrEqual(5);
      expect(de).toBeGreaterThanOrEqual(1);
      expect(ate).toBeLessThanOrEqual(38);
    }
  });

  it('nós repetidos na mesma linha ou fora do mapa não quebram a curva', () => {
    const faixa = estradaPorLinha(20, 10, [{ c: 8, l: 3 }, { c: 12, l: 3 }, { c: 50, l: -4 }, { c: 9, l: 30 }]);
    expect(faixa).toHaveLength(10);
    for (const [de, ate] of faixa) {
      expect(Number.isInteger(de) && Number.isInteger(ate) && de <= ate).toBe(true);
      expect(de).toBeGreaterThanOrEqual(1);
      expect(ate).toBeLessThanOrEqual(18);
    }
  });

  it('com caminho, a estrada do mapa segue a faixa de cada linha, e manchas e objetos ficam a 2 tiles dela', () => {
    const caminho = [{ c: 14.5, l: 3.5 }, { c: 24.5, l: 12.5 }, { c: 15.5, l: 21.5 }];
    const m = gerarMapa({ colunas: 40, linhas: 25, cenario: CENARIOS.forja, semente: 'php', caminho });
    for (let l = 0; l < 25; l++) {
      const [de, ate] = m.estrada[l];
      for (let c = 0; c < 40; c++) {
        const t = tileEm(m, c, l);
        expect(t.tipo === 'estrada').toBe(c >= de && c <= ate);
        if (t.tipo === 'bloqueio' || t.tipo === 'objeto') expect(c <= de - 2 || c >= ate + 2).toBe(true);
      }
    }
  });
```

(No terraform e no python, troque `CENARIOS.forja` por um cenário com bloqueio do site: `CENARIOS.porto` e `CENARIOS.rio`.)

Em `tests/cenarios-fisica.test.js`, importe `gerarMapa` (já importa) e acrescente:

```js
  it('com a estrada curva, ninguém começa nela', () => {
    const c = CENARIOS[Object.keys(CENARIOS)[0]];
    const caminho = [{ c: 14.5, l: 3.5 }, { c: 24.5, l: 12.5 }, { c: 15.5, l: 21.5 }];
    const mapa = gerarMapa({ colunas: 40, linhas: 25, cenario: c, semente: 'curva', caminho });
    const ps = posicoesIniciais(mapa, Array(12).fill(c.personagens[0]), sorteador('curva'));
    for (const p of ps.filter(Boolean)) expect(tileEm(mapa, p.c, p.l).tipo).not.toBe('estrada');
  });
```

- [ ] **Step 2: Run them to verify they fail**

Run: `rtk proxy npx vitest run tests/cenarios-mapa.test.js tests/cenarios-fisica.test.js 2>&1 | grep -E "Tests |×" | head`
Expected: FAIL (`estradaPorLinha is not a function`; `m.estrada` indefinido).

- [ ] **Step 3: Implement in `mapa.js`**

Depois de `colunasDaEstrada`, acrescente:

```js
/** Até quantos tiles da curva é estrada (a faixa tem uns 5 tiles: cobre o nó e a legenda). */
export const RAIO_ESTRADA = 2;

/** Catmull-Rom em uma dimensão: o valor entre p1 e p2, com p0 e p3 dando a curvatura. */
const catmull = (p0, p1, p2, p3, t) => 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (3 * p1 - p0 - 3 * p2 + p3) * t * t * t);

/**
 * A faixa de estrada de cada linha: [de, ate] (colunas, inclusivo). Com o `caminho` (os centros
 * dos nós, em tiles), a curva passa por eles; antes do primeiro e depois do último, segue reta.
 * Sem caminho, é a faixa reta do centro (colunasDaEstrada).
 */
export function estradaPorLinha(colunas, linhas, caminho = []) {
  const reta = colunasDaEstrada(colunas);
  if (!caminho.length) return Array.from({ length: linhas }, () => [Math.min(...reta), Math.max(...reta)]);
  // Um ponto por linha (a média, se dois nós estão na mesma altura), em ordem de cima para baixo.
  const porLinha = new Map();
  for (const { c, l } of caminho) {
    const chave = Math.round(l * 2) / 2;
    porLinha.set(chave, [...(porLinha.get(chave) ?? []), c]);
  }
  const pontos = [...porLinha].sort((a, b) => a[0] - b[0]).map(([l, cs]) => ({ l, c: cs.reduce((s, x) => s + x, 0) / cs.length }));
  const x = (y) => {
    if (y <= pontos[0].l) return pontos[0].c;
    if (y >= pontos.at(-1).l) return pontos.at(-1).c;
    const i = pontos.findIndex((p, k) => y >= p.l && y <= pontos[k + 1].l);
    const p = (k) => pontos[Math.max(0, Math.min(pontos.length - 1, k))].c;
    const t = (y - pontos[i].l) / (pontos[i + 1].l - pontos[i].l);
    return catmull(p(i - 1), p(i), p(i + 1), p(i + 2), t);
  };
  // Sobra pelo menos 1 tile de chão de cada lado.
  const minimo = RAIO_ESTRADA + 1;
  const maximo = Math.max(minimo, colunas - RAIO_ESTRADA - 1);
  return Array.from({ length: linhas }, (_, l) => {
    const centro = Math.min(maximo, Math.max(minimo, x(l + 0.5)));
    return [Math.floor(centro - RAIO_ESTRADA), Math.ceil(centro + RAIO_ESTRADA) - 1];
  });
}
```

Troque `gerarMapa` pelo que usa a faixa de cada linha:

```js
export function gerarMapa({ colunas, linhas, cenario, semente, caminho = [] }) {
  const sortear = sorteador(semente);
  const estrada = estradaPorLinha(colunas, linhas, caminho);
  const naEstrada = (c, l) => c >= estrada[l][0] && c <= estrada[l][1];
  // Manchas e objetos ficam a pelo menos 2 colunas da estrada da linha: sobra um corredor para andar.
  const longeDaEstrada = (c, l) => c <= estrada[l][0] - 2 || c >= estrada[l][1] + 2;
  const tiles = Array.from({ length: colunas * linhas }, (_, i) => (naEstrada(i % colunas, Math.floor(i / colunas))
    ? { tipo: 'estrada', variante: 0 }
    : { tipo: 'chao', variante: variante(cenario.chao.pesos, sortear()) }));
  const livre = (c, l) => l >= 0 && l < linhas && longeDaEstrada(c, l) && tileEm({ colunas, linhas, tiles }, c, l)?.tipo === 'chao';

  if (cenario.bloqueio) {
    const manchas = 2 + Math.floor(sortear() * 2);
    for (let k = 0; k < manchas; k++) {
      // O centro de cada mancha é sorteado entre as colunas permitidas da sua linha: o rio sempre tem água.
      const l0 = Math.floor(sortear() * linhas);
      const permitidas = Array.from({ length: colunas }, (_, c) => c).filter((c) => longeDaEstrada(c, l0));
      if (!permitidas.length) continue;
      const c0 = permitidas[Math.floor(sortear() * permitidas.length)];
      const rc = 1 + Math.floor(sortear() * 2);
      const rl = 1 + Math.floor(sortear() * 2);
      for (let l = l0 - rl; l <= l0 + rl; l++) {
        for (let c = c0 - rc; c <= c0 + rc; c++) {
          const dentro = ((c - c0) / (rc + 0.5)) ** 2 + ((l - l0) / (rl + 0.5)) ** 2 <= 1;
          if (dentro && livre(c, l)) tiles[l * colunas + c] = { tipo: 'bloqueio', variante: 0 };
        }
      }
    }
  }
  for (let i = 0; i < tiles.length; i++) {
    const [c, l] = [i % colunas, Math.floor(i / colunas)];
    if (livre(c, l) && sortear() < 0.06) tiles[i] = { tipo: 'objeto', variante: Math.floor(sortear() * cenario.objetos.length) };
  }
  return { colunas, linhas, tiles, estrada };
}
```

(Com `caminho` vazio, os sorteios mudam de ordem, então o desenho das manchas muda em relação a hoje; os testes atuais só conferem propriedades, não posições. Se algum teste fixar uma posição, ele é o que deve ser atualizado.)

- [ ] **Step 4: Start each character beside the road of its own row (`fisica.js`)**

Troque `posicoesIniciais`:

```js
/** Onde cada personagem começa: os pares à esquerda da estrada da linha, os ímpares à direita. */
export function posicoesIniciais(mapa, personagens, sortear) {
  return personagens.map((per, i) => {
    for (let tentativa = 0; tentativa < 200; tentativa++) {
      const l = Math.floor(sortear() * mapa.linhas);
      const [primeira, ultima] = mapa.estrada[l];
      const [de, ate] = i % 2 ? [ultima + 1, mapa.colunas - 1] : [0, primeira - 1];
      if (ate < de) continue;
      const c = de + Math.floor(sortear() * (ate - de + 1));
      if (podePisar(mapa, per.movimento, c, l)) return { c, l, movimento: per.movimento, direcao: null, quadro: 0, parado: true };
    }
    return null;
  });
}
```

e tire o `colunasDaEstrada` do `import` de `fisica.js` se ele não for mais usado.

- [ ] **Step 5: The curb follows the road (`palco.js`)**

No fim de `desenharMapa`, troque as duas linhas do meio-fio (as que usam `Math.min(...estrada)`) por um meio-fio por tile:

```js
  // Meio-fio: uma linha escura na borda da estrada, em cada linha do mapa (a estrada faz curvas).
  ctx.fillStyle = contorno ?? cen.estrada.cores[1];
  for (let l = 0; l < mapa.linhas; l++) {
    const [de, ate] = mapa.estrada[l];
    ctx.fillRect(de * TILE, l * TILE, 2, TILE);
    ctx.fillRect((ate + 1) * TILE - 2, l * TILE, 2, TILE);
  }
```

(Apague a linha `const estrada = mapa.tiles.slice(...)` que montava a faixa reta.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk proxy npx vitest run tests/cenarios 2>&1 | grep -E "Tests |×" | head` e `rtk proxy npx eslint src/ui/cenarios tests`
Expected: PASS; eslint limpo.

- [ ] **Step 7: Commit**

```bash
git add src/ui/cenarios/mapa.js src/ui/cenarios/fisica.js src/ui/cenarios/palco.js tests/cenarios-mapa.test.js tests/cenarios-fisica.test.js
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Cenários: a estrada faz curvas pelos nós do caminho

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: A vila (função pura), as casas e quem é pessoa

**Files:**
- Create: `src/ui/cenarios/vila.js`, `src/ui/cenarios/casas.js`, `tests/cenarios-vila.test.js`
- Modify: `src/ui/cenarios/fisica.js` (a casa), `src/ui/cenarios/tipografia.js`, `feira.js`, `forja.js`, `arquivo.js`, `cidade.js`, `tests/cenarios.test.js`

**Interfaces:**
- Consumes: `mapa.estrada` e `tileEm` (Task 1).
- Produces: `vila({ mapa, cenario, semente, feitos })` → `{ casas: [{ c, l }], filhos: [{ pai: id }], filhotes: [{ mae: id }] }`; `comCasas(mapa, casas)` → mapa novo com os tiles `{ tipo: 'casa' }`; `MAX_PERSONAGENS = 30`; `lugaresDeCasa(mapa, semente)` → `[[c, l], ...]`.
- Produces (cenários): `cenario.casa` (sprite 16×16) e `personagem.tipo` (`'pessoa' | 'animal'`).

**Quem é pessoa (php):** tipografa, aprendiz, costureira, vendedor, ferreira, ajudante, arquivista, mensageiro, operaria. Todos os outros (letra, borboleta, elefante, coruja, robozinho, gato) são `'animal'`.

- [ ] **Step 1: Write the failing tests**

`tests/cenarios-vila.test.js`:

```js
// A vila de cada módulo: calculada do progresso (sem nada gravado), estável e dentro do limite.
import { describe, it, expect } from 'vitest';
import { gerarMapa, tileEm } from '../src/ui/cenarios/mapa.js';
import { podePisar } from '../src/ui/cenarios/fisica.js';
import { vila, comCasas, lugaresDeCasa } from '../src/ui/cenarios/vila.js';
import { CENARIOS } from '../src/ui/cenarios/index.js';

const ID = Object.keys(CENARIOS)[0];
const mapaDe = (colunas = 40, linhas = 40) => gerarMapa({ colunas, linhas, cenario: CENARIOS[ID], semente: 'm1' });
const daVila = (feitos, mapa = mapaDe(), cenario = CENARIOS[ID]) => vila({ mapa, cenario, semente: 'm1', feitos });

describe('vila', () => {
  it('a mesma semente e o mesmo progresso dão a mesma vila', () => {
    expect(daVila(9)).toEqual(daVila(9));
  });

  it('o ciclo: casa, filho, filhote (7 exercícios → 3 casas, 2 filhos, 2 filhotes)', () => {
    const v = daVila(7);
    expect([v.casas.length, v.filhos.length, v.filhotes.length]).toEqual([3, 2, 2]);
    expect(daVila(0)).toEqual({ casas: [], filhos: [], filhotes: [] });
  });

  it('a vila de n + 1 contém a de n (nada muda de lugar)', () => {
    for (let n = 0; n < 15; n++) {
      const [a, b] = [daVila(n), daVila(n + 1)];
      expect(b.casas.slice(0, a.casas.length)).toEqual(a.casas);
      expect(b.filhos.slice(0, a.filhos.length)).toEqual(a.filhos);
      expect(b.filhotes.slice(0, a.filhotes.length)).toEqual(a.filhotes);
    }
  });

  it('as casas ficam no chão, a até 3 tiles da estrada, sem vizinha (nem na diagonal)', () => {
    const mapa = mapaDe();
    const { casas } = daVila(30, mapa);
    for (const { c, l } of casas) {
      const [de, ate] = mapa.estrada[l];
      const dist = c < de ? de - c : c - ate;
      expect(dist >= 1 && dist <= 3).toBe(true);
      expect(tileEm(mapa, c, l).tipo).toBe('chao');
    }
    for (const a of casas) {
      for (const b of casas) if (a !== b) expect(Math.max(Math.abs(a.c - b.c), Math.abs(a.l - b.l))).toBeGreaterThan(1);
    }
  });

  it('sem lugar para mais casas, as casas param e o resto continua (sem laço infinito)', () => {
    const mapa = mapaDe(11, 10);
    const v = daVila(100, mapa);
    expect(v.casas.length).toBeLessThanOrEqual(lugaresDeCasa(mapa, 'm1').length);
    expect(v.filhos.length + v.filhotes.length).toBe(66);
  });

  it('sem pessoa, o filho vira filhote; sem animal, o filhote vira filho', () => {
    const base = CENARIOS[ID];
    const soAnimais = { ...base, personagens: base.personagens.map((p) => ({ ...p, tipo: 'animal' })) };
    const soPessoas = { ...base, personagens: base.personagens.map((p) => ({ ...p, tipo: 'pessoa' })) };
    expect(daVila(6, mapaDe(), soAnimais).filhos).toEqual([]);
    expect(daVila(6, mapaDe(), soAnimais).filhotes).toHaveLength(4);
    expect(daVila(6, mapaDe(), soPessoas).filhotes).toEqual([]);
    expect(daVila(6, mapaDe(), soPessoas).filhos).toHaveLength(4);
  });

  it('filho é de uma pessoa, filhote é de um animal, em rodízio', () => {
    const c = CENARIOS[ID];
    const v = daVila(12);
    const tipo = (id) => c.personagens.find((p) => p.id === id).tipo;
    expect(v.filhos.every((f) => tipo(f.pai) === 'pessoa')).toBe(true);
    expect(v.filhotes.every((f) => tipo(f.mae) === 'animal')).toBe(true);
  });

  it('ninguém anda pela casa; quem voa passa por cima', () => {
    const mapa = mapaDe();
    const { casas } = daVila(10, mapa);
    const comVila = comCasas(mapa, casas);
    const { c, l } = casas[0];
    expect(tileEm(comVila, c, l).tipo).toBe('casa');
    expect(podePisar(comVila, 'andar', c, l)).toBe(false);
    expect(podePisar(comVila, 'voar', c, l)).toBe(true);
    expect(tileEm(mapa, c, l).tipo).toBe('chao'); // o mapa original não muda
  });
});
```

Em `tests/cenarios.test.js`, no `it.each(IDS)` que confere os sprites, acrescente:

```js
    expect(spriteValido(c.casa)).toBe(true);
    for (const p of c.personagens) expect(['pessoa', 'animal']).toContain(p.tipo);
```

e um teste novo:

```js
  it('quem é pessoa em cada cenário', () => {
    const pessoas = Object.values(CENARIOS).flatMap((c) => c.personagens.filter((p) => p.tipo === 'pessoa').map((p) => p.id)).sort();
    expect(pessoas).toEqual(PESSOAS.sort());
  });
```

com, no topo do arquivo, a lista do site (php):

```js
const PESSOAS = ['tipografa', 'aprendiz', 'costureira', 'vendedor', 'ferreira', 'ajudante', 'arquivista', 'mensageiro', 'operaria'];
```

- [ ] **Step 2: Run them to verify they fail**

Run: `rtk proxy npx vitest run tests/cenarios-vila.test.js tests/cenarios.test.js 2>&1 | grep -E "Tests |Error|×" | head -5`
Expected: FAIL (`vila.js` não existe; `casa` e `tipo` faltam).

- [ ] **Step 3: Write `src/ui/cenarios/vila.js`**

```js
// A vila de um módulo (funções puras): cada exercício resolvido acrescenta, em ciclo, uma casa,
// um filho de uma pessoa e um filhote de um animal do cenário. Nada é gravado: a vila sai da
// semente do módulo e do número de exercícios feitos, e a de n + 1 contém a de n.
import { sorteador, tileEm } from './mapa.js';

export const MAX_PERSONAGENS = 30;
const CICLO = ['casa', 'filho', 'filhote'];

/** Onde dá para construir: chão a até 3 tiles da estrada, embaralhado uma vez pela semente. */
export function lugaresDeCasa(mapa, semente) {
  const lista = [];
  for (let l = 0; l < mapa.linhas; l++) {
    const [de, ate] = mapa.estrada[l];
    for (let c = 0; c < mapa.colunas; c++) {
      const distancia = c < de ? de - c : c > ate ? c - ate : 0;
      if (distancia >= 1 && distancia <= 3 && tileEm(mapa, c, l).tipo === 'chao') lista.push([c, l]);
    }
  }
  const sortear = sorteador(`${semente}-vila`);
  for (let i = lista.length - 1; i > 0; i--) {
    const j = Math.floor(sortear() * (i + 1));
    [lista[i], lista[j]] = [lista[j], lista[i]];
  }
  return lista;
}

export function vila({ mapa, cenario, semente, feitos }) {
  const pessoas = cenario.personagens.filter((p) => p.tipo === 'pessoa');
  const animais = cenario.personagens.filter((p) => p.tipo !== 'pessoa');
  const candidatas = lugaresDeCasa(mapa, semente);
  const ocupadas = new Set();
  const temVizinha = (c, l) => [-1, 0, 1].some((dc) => [-1, 0, 1].some((dl) => ocupadas.has(`${c + dc},${l + dl}`)));
  const casas = [];
  const filhos = [];
  const filhotes = [];
  let proxima = 0;
  for (let i = 0; i < feitos; i++) {
    const passo = CICLO[i % CICLO.length];
    if (passo === 'casa') {
      while (proxima < candidatas.length && temVizinha(...candidatas[proxima])) proxima++;
      if (proxima < candidatas.length) {
        const [c, l] = candidatas[proxima++];
        ocupadas.add(`${c},${l}`);
        casas.push({ c, l });
      }
      continue;
    }
    // Sem pessoa no cenário, o filho vira filhote; sem animal, o filhote vira filho.
    const filho = passo === 'filho' ? pessoas.length > 0 : animais.length === 0;
    if (filho && pessoas.length) filhos.push({ pai: pessoas[filhos.length % pessoas.length].id });
    else if (animais.length) filhotes.push({ mae: animais[filhotes.length % animais.length].id });
  }
  return { casas, filhos, filhotes };
}

/** O mapa com as casas no lugar (um mapa novo: o de entrada não muda). */
export function comCasas(mapa, casas) {
  const tiles = [...mapa.tiles];
  for (const { c, l } of casas) tiles[l * mapa.colunas + c] = { tipo: 'casa', variante: 0 };
  return { ...mapa, tiles };
}
```

Em `fisica.js`, `podePisar` já devolve `false` para tudo que não é `chao` (para quem anda) e `bloqueio` (para quem nada ou salta), e `true` para quem voa: a casa já fica de fora sem mudança. Confira lendo a função; se ela tratar `objeto` à parte, trate `casa` igual.

- [ ] **Step 4: Write `src/ui/cenarios/casas.js` (php)**

```js
// As casas da vila (16×16): uma por cenário, com o tema dele.
import { sprite } from './pixel.js';

const TELHADO = `
................
.......tt.......
......tttt......
.....tttttt.....
....tttttttt....
...tttttttttt...
..tttttttttttt..`;
const PAREDES = `
...pppppppppp...
...pjjppppjjp...
...pjjppppjjp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
..ssssssssssss..
................`;
const casa = (cores, desenho = TELHADO + PAREDES) => sprite(cores, desenho);

// 🖨️ oficina com a placa de uma letra
export const oficina = sprite({ t: '#26324f', p: '#efe6d2', k: '#26324f', w: '#f6efe0', r: '#6e5338', s: '#8a6a48' }, `${TELHADO}
...pppppppppp...
...pkkkkkkkkp...
...pkwkwwkwkp...
...pkkkkkkkkp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
..ssssssssssss..
................`);

// 🧵 casa de lona listrada
export const lona = sprite({ t: '#d64545', u: '#f4efe4', p: '#e6b422', j: '#3d6fb5', r: '#7a5232', s: '#9b948a' }, `
................
.......tu.......
......tutu......
.....tututu.....
....tutututu....
...tututututu...
..tutututututu..${PAREDES}`);

// ⚒️ casa de pedra com a chaminé fumegando
export const pedra = sprite({ f: '#9a9a9a', c: '#5a5653', t: '#3d3a38', p: '#7d7873', j: '#ff8c1a', r: '#2e2b29', s: '#4a4744' }, `
............f...
...........ff...
...........cc...
.......tt..cc...
......tttt.cc...
.....tttttttt...
....tttttttttt..${PAREDES}`);

// 🗄️ chalé de madeira
export const chale = casa({ t: '#5a4330', p: '#a3784e', j: '#f2c94c', r: '#3b2a20', s: '#6e5338' });

// 🌃 prédio pequeno com janelas acesas (o mesmo nos três sites)
export const predio = sprite({ p: '#3a3d47', j: '#ffd166', r: '#1f2128', s: '#8d8f99' }, `
................
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpprrpp....
....pppprrpp....
....pppprrpp....
...ssssssssss...
................
................`);
```

(O `sprite` de `pixel.js` confere 16×16 e as cores; um desenho errado quebra o import, e o teste mostra.)

- [ ] **Step 5: `casa` and `tipo` in each scenario**

Em cada arquivo de cenário, importe a casa de `./casas.js` e acrescente `casa:` ao objeto exportado, logo depois de `objetos:`; em cada personagem, acrescente `tipo:` logo depois de `movimento:`:

| Arquivo | `casa` | `tipo: 'pessoa'` | `tipo: 'animal'` |
|---|---|---|---|
| `tipografia.js` | `oficina` | tipografa, aprendiz | letra |
| `feira.js` | `lona` | costureira, vendedor | borboleta |
| `forja.js` | `pedra` | ferreira, ajudante | elefante |
| `arquivo.js` | `chale` | arquivista, mensageiro | coruja |
| `cidade.js` | `predio` | operaria | robozinho, gato |

Exemplo (`forja.js`):

```js
import { pedra as casaDePedra } from './casas.js';
// ...
  objetos: [bigorna, martelo],
  casa: casaDePedra,
  personagens: [
    { id: 'ferreira', movimento: 'andar', tipo: 'pessoa', quadros: pessoa({ ... }) },
    { id: 'ajudante', movimento: 'andar', tipo: 'pessoa', quadros: pessoa({ ... }) },
    { id: 'elefante', movimento: 'andar', tipo: 'animal', quadros: [elefante, passo(elefante, 'andar')] },
  ],
```

(O nome importado não pode colidir com um nome do arquivo: `forja.js` já tem objetos chamados `bigorna` e `martelo`, e nenhum chamado `pedra`, mas o alias deixa claro.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk proxy npx vitest run tests/cenarios 2>&1 | grep -E "Tests |×" | head` e `rtk proxy npx eslint src/ui/cenarios tests`
Expected: PASS; eslint limpo.

- [ ] **Step 7: Commit**

```bash
git add src/ui/cenarios tests/cenarios-vila.test.js tests/cenarios.test.js
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Cenários: a vila (casas, filhos e filhotes) calculada do progresso

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 3: O palco: 100vw, a estrada pelos nós e a vila na tela

**Files:**
- Modify: `src/ui/cenarios/palco.js`, `src/ui/cenarios/index.js`, `src/ui/inicio.js`, `src/cenarios.css`
- Test: `tests/cenarios-trilha.test.js`, `tests/cenarios.test.js`

**Interfaces:**
- Consumes: `gerarMapa({ ..., caminho })` e `mapa.estrada` (Task 1); `vila`, `comCasas`, `MAX_PERSONAGENS` (Task 2); `cenario.casa`, `personagem.tipo` (Task 2).
- Produces: `htmlDoCenario(id, semente = id, feitos = 0)` com `data-feitos`; filhos e filhotes no DOM como `.personagem.pequeno`; a camada com `--cenario-desvio` e `--cenario-largura` quando há layout.

- [ ] **Step 1: Write the failing tests**

Em `tests/cenarios.test.js`:

```js
  it('a camada leva os exercícios feitos (a vila sai deles)', () => {
    expect(camada(IDS[0], 'basico').dataset.feitos).toBe('0');
    const div = document.createElement('div');
    div.innerHTML = htmlDoCenario(IDS[0], 'basico', 7);
    expect(div.firstElementChild.dataset.feitos).toBe('7');
  });
```

Em `tests/cenarios-trilha.test.js`, dentro de `describe('palco: personagens e temporizador', ...)`:

```js
  it('a vila do módulo: filhos e filhotes pequenos entram depois dos de sempre, até 30', () => {
    const camadaEl = document.querySelector('.cenario');
    const palco = camadaEl.querySelector('.cenario-palco');
    camadaEl.dataset.feitos = '7'; // 3 casas, 2 filhos e 2 filhotes
    let r = ligarCenarios(tela(), { janela: janelaFalsa() });
    expect(palco.querySelectorAll('.personagem.pequeno')).toHaveLength(4);
    expect(palco.querySelectorAll('.personagem:not(.pequeno)').length).toBeLessThanOrEqual(3);
    r.desligar();
    camadaEl.dataset.feitos = '200';
    r = ligarCenarios(tela(), { janela: janelaFalsa() });
    expect(palco.querySelectorAll('.personagem').length).toBeLessThanOrEqual(30);
    r.desligar();
    camadaEl.dataset.feitos = '0';
  });

  it('100vw: com layout, a camada vai da borda esquerda da trilha até a direita', () => {
    const camadaEl = document.querySelector('.cenario');
    const secao = camadaEl.parentElement;
    const telaEl = tela();
    const retangulo = (left, width) => () => ({ left, width, top: 0, height: 800, right: left + width, bottom: 800, x: left, y: 0 });
    Object.defineProperty(telaEl, 'getBoundingClientRect', { value: retangulo(0, 1280), configurable: true });
    Object.defineProperty(telaEl, 'clientWidth', { value: 1265, configurable: true });
    Object.defineProperty(secao, 'getBoundingClientRect', { value: retangulo(442, 800), configurable: true });
    const { desligar } = ligarCenarios(telaEl, { janela: janelaFalsa() });
    expect(camadaEl.style.getPropertyValue('--cenario-desvio')).toBe('-442px');
    expect(camadaEl.style.getPropertyValue('--cenario-largura')).toBe('1265px');
    desligar();
    for (const el of [telaEl, secao]) delete el.getBoundingClientRect;
    delete telaEl.clientWidth;
  });

  it('módulo bloqueado com progresso: a vila monta, mas o módulo não ganha temporizador próprio', () => {
    const bloco = document.querySelector('.bloco-unidade');
    bloco.classList.add('bloqueada');
    bloco.querySelector('.cenario').dataset.feitos = '5';
    const j = janelaFalsa();
    const { desligar } = ligarCenarios(tela(), { janela: j });
    expect(bloco.querySelectorAll('.personagem.pequeno').length).toBeGreaterThan(0);
    expect(j.intervalos).toBe(1); // um só para a página, como sempre
    desligar();
    bloco.classList.remove('bloqueada');
    bloco.querySelector('.cenario').dataset.feitos = '0';
  });
```

E em `describe('CSS dos cenários', ...)`:

```js
  it('100vw: a camada usa as medidas do palco, sem rolagem horizontal, e a coluna da esquerda fica acima', () => {
    expect(css).toMatch(/\.cenario\s*\{[^}]*left:\s*var\(--cenario-desvio/);
    expect(css).toMatch(/\.cenario\s*\{[^}]*width:\s*var\(--cenario-largura/);
    expect(css).not.toMatch(/\.cenario\s*\{[^}]*border-radius/);
    expect(css).toMatch(/\.tela-inicio\s*\{[^}]*overflow-x:\s*hidden/);
    expect(css).toMatch(/\.painel-jogador\s*\{[^}]*z-index:\s*1/);
  });
```

(Confira que `tela()` no topo do arquivo devolve o elemento `#tela-inicio`; se ele tiver outro nome no site, use o mesmo.)

- [ ] **Step 2: Run them to verify they fail**

Run: `rtk proxy npx vitest run tests/cenarios.test.js tests/cenarios-trilha.test.js 2>&1 | grep -E "Tests |×" | head`
Expected: FAIL nos testes novos.

- [ ] **Step 3: `data-feitos` (`index.js` and `inicio.js`)**

Em `src/ui/cenarios/index.js`:

```js
export function htmlDoCenario(id, semente = id, feitos = 0) {
  if (!CENARIOS[id]) return '';
  return `<div class="cenario cenario-${id}" aria-hidden="true" data-cenario="${id}" data-semente="${semente}" data-feitos="${feitos}"><div class="cenario-palco"></div></div>`;
}
```

(Atualize o comentário de cima: "… e `feitos` (os exercícios resolvidos do módulo) faz a vila crescer".)

Em `src/ui/inicio.js`, na função `unidade`:

```js
  // A vila do cenário cresce com os exercícios resolvidos do módulo (src/ui/cenarios/vila.js).
  const feitos = m.itens.filter((i) => i.tipo === 'problema' && i.estado === 'concluido').length;
  const cenario = htmlDoCenario(CENARIO_DO_MODULO[m.id], m.id, feitos);
```

- [ ] **Step 4: The stage (`palco.js`)**

No topo, troque os imports e as constantes:

```js
import { CENARIOS } from './index.js';
import { TILE, gerarMapa, sorteador, tileEm } from './mapa.js';
import { proximoPasso, posicoesIniciais } from './fisica.js';
import { desenharSprite, misturar } from './pixel.js';
import { vila, comCasas, MAX_PERSONAGENS } from './vila.js';
```

(e apague a constante local `MAX_PERSONAGENS = 30`, que agora vem de `vila.js`.)

Em `desenharMapa`, desenhe a casa como os objetos (no alto contraste, em contorno):

```js
        if (t.tipo === 'objeto') desenharSprite(ctx, cen.objetos[t.variante], x, y, { cor: contorno });
        if (t.tipo === 'casa') desenharSprite(ctx, cen.casa, x, y, { cor: contorno });
        continue;
```

e, no ramo normal (o `else` do chão):

```js
        if (t.tipo === 'objeto') desenharSprite(ctx, cen.objetos[t.variante], x, y);
        if (t.tipo === 'casa') desenharSprite(ctx, cen.casa, x, y);
```

(A casa cai no `else` do chão porque o tipo dela não é `estrada` nem `bloqueio`; o chão é desenhado embaixo, como nos objetos.)

Em `desenharPersonagem`, o filho e o filhote são o sprite do pai ou da mãe pela metade, no pé do tile:

```js
    const [x, y, escala] = def.pequeno ? [TILE / 4, TILE / 2, 1] : [0, 0, 2];
    desenharSprite(ctx, def.quadros[estado.quadro], x, y, { escala, espelhar: estado.olhaEsquerda, cor: altoContraste() ? corSuave() : undefined });
```

Antes de `montar`, acrescente as duas medidas:

```js
/** 100vw: a camada vai da borda esquerda da área da trilha até a direita (sem layout, fica no módulo). */
function alargar(camada) {
  const area = camada.closest('.tela-inicio') ?? document.documentElement;
  const r = area.getBoundingClientRect();
  if (!r.width) return;
  const secao = camada.parentElement.getBoundingClientRect();
  camada.style.setProperty('--cenario-desvio', `${Math.round(r.left - secao.left)}px`);
  camada.style.setProperty('--cenario-largura', `${area.clientWidth}px`);
}

/** O centro de cada nó do módulo, em tiles do mundo (sem layout, nenhum: a estrada fica reta). */
function medirCaminho(camada, palco, esquerdaDoMundo) {
  const base = palco.getBoundingClientRect();
  return [...camada.parentElement.querySelectorAll('.trilha .no .circulo')].map((el) => el.getBoundingClientRect())
    .filter((r) => r.width)
    .map((r) => ({ c: (r.left + r.width / 2 - base.left - esquerdaDoMundo) / TILE, l: (r.top + r.height / 2 - base.top) / TILE }));
}
```

Em `montar`, logo depois de `palco.replaceChildren();`, chame `alargar(camada);`. Troque a criação do mapa e dos personagens:

```js
  const esquerdaDoMundo = (largura - colunas * TILE) / 2;
  const caminho = medirCaminho(camada, palco, esquerdaDoMundo);
  const base = gerarMapa({ colunas, linhas, cenario: cen, semente, caminho });
  const daVila = vila({ mapa: base, cenario: cen, semente, feitos: Number(camada.dataset.feitos) || 0 });
  const mapa = comCasas(base, daVila.casas);

  // O mundo tem colunas inteiras de 32px: centraliza para a estrada ficar embaixo dos nós.
  const mundo = document.createElement('div');
  mundo.className = 'cenario-mundo';
  mundo.style.left = `${esquerdaDoMundo}px`;
```

e, no lugar da montagem de `defs`:

```js
  // 3 personagens (1 no celular) por tela de altura; depois, os filhos e os filhotes da vila, até o limite.
  const porTela = (janela.innerWidth ?? 1280) < 600 ? 1 : 3;
  const telas = Math.max(1, Math.round(altura / (janela.innerHeight || 800)));
  const deSempre = Array.from({ length: porTela * telas }, (_, i) => cen.personagens[i % porTela]);
  const porId = Object.fromEntries(cen.personagens.map((p) => [p.id, p]));
  const pequenos = [...daVila.filhos.map((f) => porId[f.pai]), ...daVila.filhotes.map((f) => porId[f.mae])].map((p) => ({ ...p, pequeno: true }));
  const defs = [...deSempre, ...pequenos].slice(0, MAX_PERSONAGENS);
```

e, onde a classe do personagem é montada:

```js
    el.className = `personagem personagem-${i + 1} mov-${defs[i].movimento}${defs[i].pequeno ? ' pequeno' : ''}`;
```

- [ ] **Step 5: CSS (`src/cenarios.css`)**

Troque a regra `.cenario`:

```css
.cenario {
  position: absolute;
  top: 0;
  bottom: 0;
  /* 100vw: o palco mede a área da trilha e põe a camada de uma borda à outra (palco.js, alargar). */
  left: var(--cenario-desvio, 0px);
  width: var(--cenario-largura, 100%);
  z-index: -1;
  overflow: clip;
  pointer-events: none;
}
/* A camada passa da coluna dos módulos: a área da trilha não ganha rolagem horizontal, e a coluna
   da esquerda (perfil, Continuar, certificados) fica acima do mapa, com o fundo do tema. */
.tela-inicio { overflow-x: hidden; }
.painel-jogador { z-index: 1; }
```

(`.painel-jogador` já é `position: sticky` com `background: var(--fundo)` em `caminho.css`; no celular ela vira `position: static`, e aí o `z-index` não vale, mas também não há mapa ao lado dela.)

(O filho e o filhote não precisam de CSS próprio: o `palco.js` desenha o sprite pela metade no canvas do tile; a classe `pequeno` serve aos testes e a quem inspecionar a página.)

- [ ] **Step 6: Run the tests to verify they pass**

Run: `rtk proxy npx vitest run tests/cenarios 2>&1 | grep -E "Tests |×" | head` e `rtk proxy npx eslint .`
Expected: PASS; eslint limpo.

- [ ] **Step 7: See it in the browser**

Build com segredo aleatório, `preview_start` (`php-playground`, porta 4173), abra `#/trilha`:
- com `javascript_tool`, confira que a camada `.cenario` de cada módulo vai de `left` igual ao da `.tela-inicio` até a direita dela (`getBoundingClientRect`), e que `document.querySelector('.tela-inicio').scrollWidth === clientWidth` (sem rolagem horizontal);
- confira que o tile de cada nó (centro do `.circulo`) cai na estrada: compare a coluna do nó com `palco` medido (ou veja na captura de tela que a estrada passa por baixo dos nós);
- marque exercícios como resolvidos, como o `progresso.js` grava: `localStorage.setItem('php-playground:progresso', JSON.stringify({ '<id de um exercício do 1º módulo>': 'resolvido', ... }))` (o prefixo é o `PREFIXO` de `src/progresso.js` de cada site), e recarregue: aparecem casas e personagens `.pequeno` no primeiro módulo;
- axe (`https://cdnjs.cloudflare.com/ajax/libs/axe-core/4.10.2/axe.min.js`) nos 4 temas: nenhuma violação; 375px (`resize_window` mobile): sem rolagem horizontal.

- [ ] **Step 8: Commit**

```bash
git add src/ui/cenarios src/ui/inicio.js src/cenarios.css tests
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Trilha: o cenário na largura da tela, a estrada pelos nós e a vila do progresso

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: php: versão 1.9.0

**Files:**
- Modify: `src/novidades.js`, `package.json`, `package-lock.json`, `README.md`

- [ ] **Step 1: Novidades**

No começo de `RELEASES`:

```js
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
```

- [ ] **Step 2: Version and README**

`package.json` e as duas primeiras ocorrências do `package-lock.json`: `"version": "1.8.1"` → `"version": "1.9.0"`.

No README, no item "🗺️ Cenários da trilha", troque a primeira frase por: "cada módulo tem um mapa em tiles de pixel art (como nos RPGs clássicos) que ocupa a tela toda e rola junto com a página, com uma estrada que faz curvas pelos exercícios e uma vila que cresce a cada exercício resolvido (casas, filhos e filhotes), com o tema do assunto (tipografia no HTML, feira de tecidos no W3.CSS, forja no PHP, arquivo no PDO), com".

- [ ] **Step 3: Full suite and commit**

Run: `rtk proxy npx vitest run > /tmp/v.txt 2>&1; grep -E "Test Files|Tests " /tmp/v.txt` e `rtk proxy npx eslint .`
Expected: tudo passa.

```bash
git add src/novidades.js package.json package-lock.json README.md
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Versão 1.9.0: a trilha virou uma vila

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 5: terraform: a mesma vila, com as casas do site (versão 1.10.0)

**Files:**
- Copy from php (iguais nos dois sites): `src/ui/cenarios/mapa.js`, `fisica.js`, `palco.js`, `vila.js`, `index.js`, `src/cenarios.css`, `tests/cenarios-mapa.test.js`, `tests/cenarios-fisica.test.js`, `tests/cenarios-trilha.test.js`, `tests/cenarios-vila.test.js`
- Create: `src/ui/cenarios/casas.js` (terraform)
- Modify: `src/ui/cenarios/canteiro.js`, `porto.js`, `ceu.js`, `cidade.js`, `src/ui/inicio.js` (a linha do `htmlDoCenario`), `tests/cenarios.test.js`, `src/novidades.js`, `package.json`, `package-lock.json`, `README.md`, a spec (cópia)

**Interfaces:**
- Consumes: tudo das Tasks 1 a 3, sem mudança.

- [ ] **Step 1: Branch and copy**

No `terraform-playground`: `git checkout -b vila-da-trilha origin/cenarios-rolam-junto`. Antes de copiar, confira que os arquivos de base eram iguais: para cada arquivo da lista "Copy from php", `git -C ../php-playground show origin/cenarios-rolam-junto:<arquivo>` deve ser igual ao `<arquivo>` do terraform (`cmp`). Se algum for diferente, não copie: aplique nele as mudanças das Tasks 1 a 3 à mão. Depois copie os arquivos do `php-playground` (branch `vila-da-trilha`). Em `tests/cenarios-mapa.test.js`, troque `CENARIOS.forja` por `CENARIOS.porto`. Copie também `docs/superpowers/specs/2026-10-15-vila-da-trilha-design.md`.

Em `src/ui/inicio.js` do terraform, faça a mesma mudança da Task 3, Step 3 (a contagem `feitos` e o terceiro argumento de `htmlDoCenario`).

- [ ] **Step 2: Write the failing scenario test**

Em `tests/cenarios.test.js`, as mesmas linhas da Task 2, Step 1 (`casa` 16×16 e `tipo` de cada personagem) e o teste "quem é pessoa", com a lista do terraform:

```js
const PESSOAS = ['mestre-de-obras', 'engenheira', 'estivador', 'tecnica', 'operaria'];
```

e o teste do `data-feitos` da Task 3, Step 1.

Run: `rtk proxy npx vitest run tests/cenarios 2>&1 | grep -E "Tests |×" | head`
Expected: FAIL (`casa` e `tipo` faltam nos cenários do terraform).

- [ ] **Step 3: `src/ui/cenarios/casas.js` (terraform)**

```js
// As casas da vila (16×16): uma por cenário, com o tema dele.
import { sprite } from './pixel.js';

// 🏗️ casa em obra, com andaime
export const obra = sprite({ t: '#c0392b', p: '#d9c3a0', j: '#4a5060', r: '#5a4330', s: '#7a5a3a', a: '#f5c518' }, `
................
.......tt.......
......tttt......
.....tttttt.....
....tttttttt....
...tttttttttt...
.a.pppppppppp.a.
aaapjjppppjjpaaa
.a.pjjppppjjp.a.
.a.pppprrpppp.a.
aaapppprrppppaaa
.a.pppprrpppp.a.
.a.pppprrpppp.a.
.assssssssssssa.
................
................`);

// ⚓ casa feita de contêiner
export const conteiner = sprite({ o: '#f28c28', d: '#c26a14', j: '#cfeeff', r: '#2c518a', s: '#6b6b6b' }, `
................
................
................
................
................
..oooooooooooo..
..odjjododjjod..
..odododrrodod..
..odododrrodod..
..oooooorroooo..
.ssssssssssssss.
................
................
................
................
................`);

// ☁️ casa flutuando numa nuvem
export const nuvem = sprite({ t: '#3d78b5', p: '#f4efe4', j: '#4dd0e1', r: '#5a3a20', n: '#ffffff' }, `
................
.......tt.......
......tttt......
.....tttttt.....
....tttttttt....
...tttttttttt...
...pppppppppp...
...pjjpprrjjp...
...pppprrpppp...
...pppprrpppp...
..nnnnnnnnnnnn..
.nnnnnnnnnnnnnn.
nnnnnnnnnnnnnnnn
.nnnnnnnnnnnnnn.
................
................`);

// 🌃 prédio pequeno com janelas acesas (o mesmo nos três sites)
export const predio = sprite({ p: '#3a3d47', j: '#ffd166', r: '#1f2128', s: '#8d8f99' }, `
................
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpprrpp....
....pppprrpp....
....pppprrpp....
...ssssssssss...
................
................`);
```

- [ ] **Step 4: `casa` and `tipo` in each scenario**

| Arquivo | `casa` | `tipo: 'pessoa'` | `tipo: 'animal'` |
|---|---|---|---|
| `canteiro.js` | `obra` | mestre-de-obras, engenheira | passaro |
| `porto.js` | `conteiner` | estivador | rebocador, gaivota |
| `ceu.js` | `nuvem` | tecnica | balao, pipa |
| `cidade.js` | `predio` | operaria | robozinho, gato |

(O rebocador, o balão e a pipa são "animais" só para a vila: ganham filhote.)

- [ ] **Step 5: Run the tests**

Run: `rtk proxy npx vitest run > /tmp/v.txt 2>&1; grep -E "Test Files|Tests |×" /tmp/v.txt | head` e `rtk proxy npx eslint .`
Expected: tudo passa.

- [ ] **Step 6: Version 1.10.0**

`src/novidades.js`, no começo de `RELEASES`, a mesma entrada da Task 4 com `versao: '1.10.0'`. `package.json` e as duas primeiras ocorrências do `package-lock.json`: `"1.9.1"` → `"1.10.0"`. No README, no item "🗺️ Cenários da trilha", a mesma frase da Task 4, com os temas do terraform: "(canteiro de obras no básico, porto na AWS, céu de nuvens na Azure)".

- [ ] **Step 7: See it and commit**

Build com segredo aleatório, `preview_start` (`terraform-playground-preview`, porta 4174) e as mesmas conferências da Task 3, Step 7 (prefixo do progresso: o `PREFIXO` de `src/progresso.js` do terraform).

```bash
git add src/ui/cenarios src/ui/inicio.js src/cenarios.css tests src/novidades.js package.json package-lock.json README.md docs/superpowers/specs/2026-10-15-vila-da-trilha-design.md
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Versão 1.10.0: a trilha virou uma vila

O cenário na largura da tela, a estrada pelos nós e a vila que cresce com os
exercícios resolvidos, como no DivergePHP.

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: python: a mesma vila, no fase5 (sai na 0.5.0)

**Files:**
- Copy from php: os mesmos da Task 5
- Create: `src/ui/cenarios/casas.js` (python)
- Modify: `src/ui/cenarios/sertao.js`, `vale.js`, `gelo.js`, `fogo.js`, `rio.js`, `jardim.js`, `cidade.js`, `src/ui/inicio.js` (a linha do `htmlDoCenario`), `tests/cenarios.test.js`, `src/novidades.js` (a entrada 0.5.0), `README.md`, a spec (cópia)

**Interfaces:**
- Consumes: tudo das Tasks 1 a 3, sem mudança.

**Decisão:** no python a vila vai no branch `fase5`, que já tem a rolagem (o `main` foi integrado nele) e sai inteiro na 0.5.0; assim não há duas versões seguidas no python.

- [ ] **Step 1: Copy**

No `python-playground`, no `fase5`. Antes de copiar, confira com `cmp` que cada arquivo da lista era igual ao do php em `origin/cenarios-rolam-junto`; o que for diferente recebe as mudanças das Tasks 1 a 3 à mão. Copie do `php-playground` (branch `vila-da-trilha`). Em `tests/cenarios-mapa.test.js`, troque `CENARIOS.forja` por `CENARIOS.rio`. Copie a spec. Em `src/ui/inicio.js`, a mesma mudança da Task 3, Step 3.

- [ ] **Step 2: Write the failing scenario test**

Em `tests/cenarios.test.js`, as mesmas linhas da Task 2, Step 1 e o teste do `data-feitos` da Task 3, com a lista do python:

```js
const PESSOAS = ['vaqueiro', 'agricultora', 'ferreiro', 'jangadeiro', 'jardineira', 'operaria'];
```


Run: `rtk proxy npx vitest run tests/cenarios 2>&1 | grep -E "Tests |×" | head`
Expected: FAIL (`casa` e `tipo` faltam).

- [ ] **Step 3: `src/ui/cenarios/casas.js` (python)**

```js
// As casas da vila (16×16): uma por cenário, com o tema dele.
import { sprite } from './pixel.js';

const TELHADO = `
................
.......tt.......
......tttt......
.....tttttt.....
....tttttttt....
...tttttttttt...
..tttttttttttt..`;
const PAREDES = `
...pppppppppp...
...pjjppppjjp...
...pjjppppjjp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
..ssssssssssss..
................`;
const casa = (cores) => sprite(cores, TELHADO + PAREDES);

// 🌵 casa de taipa com telhado de palha
export const taipa = casa({ t: '#d9b45b', p: '#b07a4a', j: '#3d2a1c', r: '#5a3a20', s: '#c9935e' });
// 🌱 casa de sítio
export const sitio = casa({ t: '#a33b2e', p: '#f4efe4', j: '#3d6fb5', r: '#7a5232', s: '#79a956' });
// 🔥 cabana de rocha vulcânica
export const rocha = casa({ t: '#2e2523', p: '#6b5a55', j: '#ff8c1a', r: '#1f1c1c', s: '#4d3f3b' });

// ❄️ iglu
export const iglu = sprite({ w: '#f4f9ff', g: '#bcd4e6', k: '#2c518a' }, `
................
................
................
................
.....wwwwww.....
...wwgwwwwgww...
..wwwwgwwgwwww..
.wwgwwwwwwwwgww.
.wwwwwwkkwwwwww.
.wwwwwkkkkwwwww.
.gggggkkkkggggg.
................
................
................
................
................`);

// 💧 palafita
export const palafita = sprite({ t: '#6b4a35', p: '#c9a66b', j: '#2f7fbf', r: '#4a3b2a', s: '#80552c', e: '#6b4a35' }, `${TELHADO}
...pppppppppp...
...pjjppppjjp...
...pppprrpppp...
...pppprrpppp...
..ssssssssssss..
...e...e..e...e.
...e...e..e...e.
...e...e..e...e.
................`);

// 🌸 casinha com flores na janela
export const flores = sprite({ t: '#e07a2f', p: '#fff4e0', j: '#3d6fb5', f: '#e63946', r: '#7a5232', s: '#4f9a5a' }, `${TELHADO}
...pppppppppp...
...pjjppppjjp...
...fffppppfff...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
...pppprrpppp...
..ssssssssssss..
................`);

// 🌃 prédio pequeno com janelas acesas (o mesmo nos três sites)
export const predio = sprite({ p: '#3a3d47', j: '#ffd166', r: '#1f2128', s: '#8d8f99' }, `
................
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpjpjpp....
....pppppppp....
....pjpprrpp....
....pppprrpp....
....pppprrpp....
...ssssssssss...
................
................`);
```

- [ ] **Step 4: `casa` and `tipo` in each scenario**

| Arquivo | `casa` | `tipo: 'pessoa'` | `tipo: 'animal'` |
|---|---|---|---|
| `sertao.js` | `taipa` | vaqueiro | cabrita, calango |
| `vale.js` | `sitio` | agricultora | jumento, asa-branca |
| `gelo.js` | `iglu` | (nenhum) | pinguim, raposa-do-artico, coruja-das-neves |
| `fogo.js` | `rocha` | ferreiro | salamandra, fenix |
| `rio.js` | `palafita` | jangadeiro | peixe, garca |
| `jardim.js` | `flores` | jardineira | borboleta, beija-flor |
| `cidade.js` | `predio` | operaria | robozinho, gato |

(No gelo não há pessoa: pela regra da vila, todo filho vira filhote.)

- [ ] **Step 5: Run the tests**

Run: `rtk proxy npx vitest run > /tmp/v.txt 2>&1; grep -E "Test Files|Tests |×" /tmp/v.txt | head` e `rtk proxy npx eslint .`
Expected: tudo passa.

- [ ] **Step 6: Release notes (0.5.0) and README**

Em `src/novidades.js`, na entrada `0.5.0`, acrescente um grupo depois do primeiro:

```js
      { titulo: '🏘️ Vila', itens: ['O mapa de cada módulo ocupa a tela toda, e a estrada faz curvas pelo caminho dos exercícios.', 'A cada exercício resolvido, alguém constrói uma casa, nasce um filho ou um animal tem um filhote. A vila sai do seu progresso, sem nada a mais guardado no navegador.'] },
```

No README, no item "🗺️ Cenários da trilha", troque a primeira frase pela da Task 4 (sem a lista de temas do php).

- [ ] **Step 7: See it and commit**

Build com segredo aleatório, `preview_start` (`python-playground`, porta 4176) e as mesmas conferências da Task 3, Step 7.

```bash
git add src/ui/cenarios src/ui/inicio.js src/cenarios.css tests src/novidades.js README.md docs/superpowers/specs/2026-10-15-vila-da-trilha-design.md
git -c user.name="Cláudio Raposo" -c user.email=engcfraposo@gmail.com commit -m "Trilha: a vila (cenário na largura da tela, estrada pelos nós e vila do progresso)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7 (só com o "sim"): publicar

- php e terraform: o branch `vila-da-trilha` está em cima de `cenarios-rolam-junto` (os PRs #2 de cada um). Faça o push de `vila-da-trilha` e abra o PR contra `main` depois do merge do #2 (ou, se o #2 ainda estiver aberto, abra contra `cenarios-rolam-junto` e mude a base quando ele entrar).
- python: entra no PR #2 (`fase5`), com o push do `fase5`.
- Merge com rebase, como os anteriores.
