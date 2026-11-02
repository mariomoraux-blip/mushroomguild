import { act, endMonth, recruit } from './actions';
import { advise, type PolicyOptions } from './advice';
import { MONTHS } from './config';
import { motherTile, revivedCount } from './state';
import type { GameState } from './types';

/** Juega una partida completa siguiendo las pistas (`advise`). Sirve para validar mapas y para el balance. */
export function playAdvised(start: GameState, o: PolicyOptions = {}): GameState {
  let s = start;
  for (let guard = 0; s.status === 'playing' && guard < 1000; guard++) {
    const a = advise(s, o);
    if (a.kind === 'over') break;
    if (a.kind === 'endMonth') s = endMonth(s).state;
    else if (a.kind === 'recruit') s = recruit(s, a.species).state;
    else s = act(s, a.memberId, a.target.x, a.target.y).state;
  }
  return s;
}

/**
 * Variantes del bot experto (019): la política de las pistas midiendo caminos alrededor de las rocas, salvando
 * el árbol marcado y con distintos órdenes de reclutar. Certifica que un claro se puede ganar.
 */
export const EXPERT_VARIANTS: readonly PolicyOptions[] = [
  { path: true, saveMarked: true },
  { path: true, saveMarked: true, recruitOrder: ['lactarius', 'gliophorus', 'amanita'] },
  { path: true, saveMarked: true, recruitOrder: ['gliophorus', 'lactarius', 'amanita'] },
  { path: true, saveMarked: true, recruitOrder: ['champi', 'lactarius', 'gliophorus'] },
  {},
];

/** Bot experto: juega cada variante y devuelve la primera victoria (o el final de la última si ninguna gana). */
export function playExpert(start: GameState): GameState {
  let end = start;
  for (const o of EXPERT_VARIANTS) {
    end = playAdvised(start, o);
    if (end.status === 'won') return end;
  }
  return end;
}

/** Variantes que la búsqueda prueba cada mes: las del experto y dos órdenes de reclutar más. */
const SEARCH_VARIANTS: readonly PolicyOptions[] = [
  ...EXPERT_VARIANTS,
  { path: true },
  { path: true, recruitOrder: ['amanita', 'lactarius', 'gliophorus'] },
];
/** Estados que la búsqueda conserva por mes. */
export const CERTIFY_BEAM = 12;

/** Juega un mes con la variante `o` (sin reclutar si `noRecruit`) y lo termina. */
function playMonth(start: GameState, o: PolicyOptions, noRecruit: boolean): GameState {
  let s = start;
  for (let guard = 0; s.status === 'playing' && guard < 200; guard++) {
    const a = advise(s, o);
    if (a.kind === 'over') break;
    if (a.kind === 'endMonth' || (a.kind === 'recruit' && noRecruit)) return endMonth(s).state;
    if (a.kind === 'recruit') s = recruit(s, a.species).state;
    else s = act(s, a.memberId, a.target.x, a.target.y).state;
  }
  return s;
}

/** Qué tan prometedor es un estado: árboles vivos, reservas y cercanía de la red al Árbol Padre. */
function promise(s: GameState): number {
  const m = motherTile(s);
  const gap = Math.min(...s.tiles.filter((t) => t.net).map((t) => Math.abs(t.x - m.x) + Math.abs(t.y - m.y)));
  return revivedCount(s) * 40 + Math.min(s.nutrients, 14) * 3 + s.spores - gap * 12 + s.members.length * 4;
}

const key = (s: GameState) => `${s.tiles.map((t) => +t.net + 2 * +t.alive).join('')}|${s.nutrients}|${s.spores}|${s.members.length}`;

/**
 * Certificador de Bosque y Ancestral (019): el bot experto y, si no gana, una búsqueda por haz que cada mes
 * prueba todas las variantes (reclutando o no) y se queda con los `CERTIFY_BEAM` estados más prometedores.
 * Devuelve el final ganador o `null`. Es determinista; tarda ~150 ms en Node, así que la app usa la tabla de
 * `level-seeds.ts` y solo llama a `playExpert` fuera de ella.
 */
export function certify(start: GameState): GameState | null {
  const expert = playExpert(start);
  if (expert.status === 'won') return expert;
  let frontier = [start];
  for (let month = 0; month <= MONTHS && frontier.length; month++) {
    const next = frontier.flatMap((s) => SEARCH_VARIANTS.flatMap((o) => [playMonth(s, o, false), playMonth(s, o, true)]));
    const won = next.find((s) => s.status === 'won');
    if (won) return won;
    const seen = new Set<string>();
    frontier = next
      .filter((s) => s.status === 'playing')
      .sort((a, b) => promise(b) - promise(a))
      .filter((s) => !seen.has(key(s)) && Boolean(seen.add(key(s))))
      .slice(0, CERTIFY_BEAM);
  }
  return null;
}
