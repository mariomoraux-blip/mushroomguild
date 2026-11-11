// Recetas visuales (026): qué hace cada hongo, en una tira «antes → después» con las piezas del tablero.
// Es presentación: los números salen de las reglas (COST, GAIN) y no se lee el estado de la partida.
import { es } from '../copy/es';
import { COST, GAIN, type SpeciesId } from '../rules';
import { assetUrl, BOARD_ART, SEASON_SLUGS, type SeasonSlug } from '../theme';
import { el, portrait } from './dom';

/** Una casilla (tierra o red, con un objeto encima) o el medallón de un compañero (Chispa). */
export type Piece =
  | { ground: 'grass' | 'net'; object?: 'log' | 'logUsed' | 'rock' | 'grey' | 'alive'; valid?: boolean }
  | { member: SpeciesId; tired: boolean };
/** Lo que gana (+) o gasta (−): un recurso con su número («+» si depende de cuántos árboles vivos haya). */
export type Chip = { icon: 'nutrients' | 'spores'; n: number | '+' };

export interface Recipe {
  readonly before: readonly Piece[];
  readonly after: readonly Piece[];
  readonly chips: readonly Chip[];
  readonly label: string;
  /** Nombre del hechizo, arriba de la tira (Maestra Bruma). */
  readonly title?: string;
}

const NET = { ground: 'net' } as const;
/** Entre receta y receta, en la Libreta y en las dos de Maestra Bruma. */
export const RECIPE_STAGGER = 40;

/** Recetas de cada especie; Maestra Bruma tiene una por hechizo. */
export const RECIPES: Readonly<Record<SpeciesId, readonly Recipe[]>> = {
  lactarius: [{ before: [NET, { ground: 'grass', valid: true }], after: [NET, NET], chips: [{ icon: 'nutrients', n: -COST.weave }], label: es.recipe.lactarius }],
  champi: [{ before: [NET, { ground: 'grass', object: 'log', valid: true }], after: [NET, { ground: 'grass', object: 'logUsed' }], chips: [{ icon: 'nutrients', n: GAIN.log }], label: es.recipe.champi }],
  amanita: [{ before: [NET, { ground: 'grass', object: 'grey', valid: true }], after: [NET, { ground: 'net', object: 'alive' }], chips: [{ icon: 'nutrients', n: -COST.revive }], label: es.recipe.amanita }],
  morchella: [{ before: [NET, { ground: 'grass', object: 'rock', valid: true }], after: [NET, { ground: 'grass' }], chips: [{ icon: 'nutrients', n: -COST.breakRock }], label: es.recipe.morchella }],
  ganoderma: [{
    before: [NET, { ground: 'grass' }, { ground: 'grass', object: 'grey', valid: true }],
    after: [{ ground: 'net', object: 'alive' }],
    chips: [{ icon: 'nutrients', n: -COST.revive }, { icon: 'spores', n: -COST.heal }],
    label: es.recipe.ganoderma,
  }],
  lycoperdon: [{ before: [{ ground: 'net', object: 'alive', valid: true }], after: [{ ground: 'net', object: 'alive' }], chips: [{ icon: 'nutrients', n: -COST.puff }, { icon: 'spores', n: GAIN.puff }], label: es.recipe.lycoperdon }],
  gliophorus: [{ before: [{ member: 'champi', tired: true }], after: [{ member: 'champi', tired: false }], chips: [{ icon: 'spores', n: -COST.call }], label: es.recipe.gliophorus }],
  mago: [
    { before: [NET, { ground: 'grass', object: 'rock', valid: true }], after: [NET, NET], chips: [], label: es.recipe.sprout, title: es.spells.sprout },
    { before: [{ ground: 'net', object: 'alive', valid: true }], after: [{ ground: 'net', object: 'alive' }], chips: [{ icon: 'spores', n: '+' }, { icon: 'nutrients', n: '+' }], label: es.recipe.rain, title: es.spells.rain },
  ],
};

/** Pieza pintada de cada parte de una casilla en la estación dada. */
function art(part: string, season: SeasonSlug): string {
  switch (part) {
    case 'grass': return BOARD_ART.grass[season][0];
    case 'net': return BOARD_ART.net[0];
    case 'log': return BOARD_ART.log[0];
    case 'logUsed': return BOARD_ART.log[1];
    case 'rock': return BOARD_ART.rock[season];
    case 'grey': return BOARD_ART.tree.grey;
    default: return BOARD_ART.tree[season];
  }
}

/** Casilla o medallón de una receta; también lo usan las miniaturas de «Cómo jugar» (029). */
export function piece(p: Piece, seasonIndex: number): HTMLElement {
  const season = SEASON_SLUGS[seasonIndex] ?? 'spring';
  if ('member' in p) {
    return el('span', { class: `recipe__member${p.tired ? ' is-tired' : ''}` },
      el('span', { class: 'medal' }, portrait(p.member, p.tired ? 'reposo' : 'feliz', seasonIndex)),
      ...(p.tired ? [el('span', { class: 'recipe__zz' }, 'Zz')] : []));
  }
  const tile = el('span', { class: `recipe__tile${p.valid ? ' is-valid' : ''}` });
  tile.style.backgroundImage = `url("${assetUrl(art(p.ground, season))}")`;
  if (p.object) tile.append(el('img', { src: assetUrl(art(p.object, season)), alt: '', draggable: 'false', decoding: 'async' }));
  return tile;
}

/** Pastilla «±n» de una receta (también en «Cómo jugar», 029). */
export function chip(c: Chip): HTMLElement {
  const sign = c.n === '+' || c.n > 0 ? '+' : '-';
  const text = c.n === '+' ? '+' : `${c.n > 0 ? '+' : '−'}${Math.abs(c.n)}`;
  return el('span', { class: 'recipe__chip', 'data-sign': sign },
    el('img', { src: assetUrl(`ui/icons/${c.icon}`), alt: '', draggable: 'false' }), text);
}

/**
 * Dibuja una receta: `role="img"` con su frase (las piezas son decorativas). Al montarse, el «después» entra con un
 * saltito una sola vez (styles.css › .recipe); `delay` (ms) escalona varias recetas en la Libreta.
 */
export function recipe(r: Recipe, seasonIndex: number, delay = 0): HTMLElement {
  const node = el('div', { class: `recipe${r.title ? ' recipe--titled' : ''}`, role: 'img', 'aria-label': r.label },
    ...(r.title ? [el('span', { class: 'recipe__title' }, r.title)] : []),
    el('span', { class: 'recipe__side' }, ...r.before.map((p) => piece(p, seasonIndex))),
    el('span', { class: 'recipe__arrow', 'aria-hidden': 'true' }, '→'),
    el('span', { class: 'recipe__side recipe__after' }, ...r.after.map((p) => piece(p, seasonIndex)), ...r.chips.map(chip)));
  if (delay) node.style.setProperty('--recipe-delay', `${delay}ms`);
  return node;
}

/** Las recetas de una especie (Maestra Bruma, dos). */
export const recipesFor = (species: SpeciesId, seasonIndex: number, delay = 0): HTMLElement[] =>
  RECIPES[species].map((r, i) => recipe(r, seasonIndex, delay + i * RECIPE_STAGGER));
