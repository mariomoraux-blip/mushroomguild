// Puntaje, estrellas y resultado verificable (015 · scoring). Lógica pura: sin DOM ni reloj.
import { act, endMonth, recruit } from './actions';
import { playAdvised } from './autoplay';
import { MAP, MAX_GUILD, MONTHS, REFERENCE_SECONDS_PER_MONTH, SCORE, SCORE_VERSION, STARS } from './config';
import { generateMap } from './mapgen';
import { newGame, recruitableCount } from './state';
import type { GameState, LoggedAction, SpeciesId } from './types';

/** Desglose del puntaje, por componente (en el orden en que se muestra). */
export interface ScoreBreakdown {
  readonly victory: number;
  readonly months: number;
  readonly trees: number;
  readonly reserves: number;
  readonly guild: number;
  readonly activity: number;
  readonly variety: number;
  readonly time: number;
}
export type ScoreKey = keyof ScoreBreakdown;
export const SCORE_KEYS: readonly ScoreKey[] = ['victory', 'months', 'trees', 'reserves', 'guild', 'activity', 'variety', 'time'];

export interface Score {
  readonly total: number;
  readonly breakdown: ScoreBreakdown;
}

/** Umbrales de estrellas de un claro: 90 % y 110 % de la partida de referencia del bot con criterio. */
export interface Thresholds {
  /** Puntaje de la partida de referencia (0 si el bot no gana ese claro). */
  readonly reference: number;
  readonly two: number;
  readonly three: number;
}

export type Stars = 1 | 2 | 3;

/** Resultado de una victoria, listo para que un servidor futuro lo verifique rejugando `actionLog`. */
export interface ScoreResult {
  readonly scoringVersion: number;
  readonly mapId: string;
  readonly wonMonth: number;
  readonly timeMs: number;
  readonly total: number;
  readonly breakdown: ScoreBreakdown;
  readonly stars: Stars;
  readonly actionLog: readonly LoggedAction[];
}

const ALL_SPECIES: readonly SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];

/** Acciones de miembros (actuar, pasar la voz y hechizos): reclutar y terminar el mes no cuentan. */
export const actionsOf = (s: GameState): number => s.log.filter((a) => a.type === 'act').length;

/** Especies que actuaron al menos una vez (Maestra Bruma cuenta con un hechizo). */
export function speciesActed(s: GameState): ReadonlySet<SpeciesId> {
  const byId = new Map(s.members.map((m) => [m.id, m.species]));
  const acted = new Set<SpeciesId>();
  for (const a of s.log) if (a.type === 'act') acted.add(byId.get(a.memberId)!);
  return acted;
}

/** Puntaje de una victoria. Con la partida perdida o en juego no hay puntaje (total 0). */
export function score(final: GameState, timeMs: number): Score {
  if (final.status !== 'won' || final.wonMonth === null) {
    const zero: ScoreBreakdown = { victory: 0, months: 0, trees: 0, reserves: 0, guild: 0, activity: 0, variety: 0, time: 0 };
    return { total: 0, breakdown: zero };
  }
  const acted = speciesActed(final);
  const seconds = Math.floor(Math.max(0, timeMs) / 1000);
  const breakdown: ScoreBreakdown = {
    victory: SCORE.victory,
    months: SCORE.perMonthLeft * (MONTHS - final.wonMonth),
    trees: SCORE.perTree * final.tiles.filter((t) => t.kind === 'tree' && t.alive).length,
    reserves: SCORE.perNutrient * final.nutrients + SCORE.perSpore * final.spores,
    guild: SCORE.perFreeSlot * Math.max(0, MAX_GUILD - recruitableCount(final)),
    activity: SCORE.perAction * Math.min(actionsOf(final), SCORE.actionCap),
    variety: ALL_SPECIES.every((sp) => acted.has(sp)) ? SCORE.variety : 0,
    time: Math.min(SCORE.timeParS, Math.max(0, SCORE.timeParS - seconds)),
  };
  return { total: SCORE_KEYS.reduce((sum, k) => sum + breakdown[k], 0), breakdown };
}

/** Estado inicial del claro de un `mapId` (`clasico` o `seed-<n>`), o null si no se puede reconstruir. */
export function startOf(mapId: string): GameState | null {
  if (mapId === 'clasico') return newGame(MAP, 'clasico');
  const m = /^seed-(\d+)$/.exec(mapId);
  return m ? newGame(generateMap(Number(m[1])), mapId) : null;
}

/** Umbrales del claro: el bot con criterio juega una partida determinista desde `start` (25 s por mes). */
export function thresholds(start: GameState): Thresholds {
  const ref = playAdvised(start);
  const reference = ref.status === 'won' ? score(ref, ref.wonMonth! * REFERENCE_SECONDS_PER_MONTH * 1000).total : 0;
  // Sin referencia (un estado de depuración que el bot no gana), toda victoria vale 1 estrella.
  if (!reference) return { reference: 0, two: Infinity, three: Infinity };
  return { reference, two: Math.round(reference * STARS.two), three: Math.round(reference * STARS.three) };
}

/** Estrellas de una victoria: 1 siempre; 2 desde `two`; 3 desde `three`. */
export function stars(total: number, th: Thresholds): Stars {
  return total >= th.three ? 3 : total >= th.two ? 2 : 1;
}

/** Rejuega un registro de acciones desde el claro de `mapId`. Lanza si el claro no se puede reconstruir. */
export function replay(mapId: string, log: readonly LoggedAction[]): GameState {
  let s = startOf(mapId);
  if (!s) throw new Error(`No se puede reconstruir el claro ${mapId}`);
  for (const a of log) {
    if (a.type === 'act') s = act(s, a.memberId, a.x, a.y).state;
    else if (a.type === 'recruit') s = recruit(s, a.species).state;
    else s = endMonth(s).state;
  }
  return s;
}

/** Resultado verificable de una victoria. */
export function scoreResult(final: GameState, timeMs: number, th: Thresholds): ScoreResult {
  const sc = score(final, timeMs);
  return {
    scoringVersion: SCORE_VERSION,
    mapId: final.mapId,
    wonMonth: final.wonMonth ?? final.month,
    timeMs,
    total: sc.total,
    breakdown: sc.breakdown,
    stars: stars(sc.total, th),
    actionLog: final.log,
  };
}
