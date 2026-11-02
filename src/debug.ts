// Estados de prueba solo para desarrollo (`?debugState=<nombre>`, `?debugDay=N`); en producción no existe.
import { act, advise, endDay, newGame, playAdvised, recruit, type GameState, type RecruitableSpecies } from './rules';
import type { Story } from './store';

export interface DebugStart {
  readonly game: GameState;
  /** Carta que se abre al empezar (finales y llegada de la maga). */
  readonly story?: Story;
}

/**
 * Juega el mapa clásico siguiendo las pistas, sin despertar al Árbol Padre, hasta que `stop` diga
 * basta (o termine la partida). Sirve para ver estaciones y cartas sin jugar 12 días.
 */
function playUntil(stop: (s: GameState) => boolean): GameState {
  let s = newGame();
  for (let guard = 0; s.status === 'playing' && !stop(s) && guard < 1000; guard++) {
    const a = advise(s);
    if (a.kind === 'over') break;
    if (a.kind === 'endDay' || a.kind === 'awaken') s = endDay(s).state;
    else if (a.kind === 'recruit') s = recruit(s, a.species).state;
    else s = act(s, a.memberId, a.target.x, a.target.y).state;
  }
  return s;
}

const presets: Record<string, () => DebugStart> = {
  /** Gremio completo: 6 reclutables y Maestra Bruna (escenario "Gremio completo en el dock"). */
  fullGuild: () => {
    let s: GameState = { ...newGame(), spores: 20, nutrients: 10 };
    const tiles = s.tiles.map((t) => (t.kind === 'tree' && (t.x + t.y) % 2 === 0 ? { ...t, alive: true, net: true } : t));
    s = { ...s, tiles, mageDue: true };
    (['lactarius', 'champi', 'gliophorus'] as RecruitableSpecies[]).forEach((sp) => (s = recruit(s, sp).state));
    return { game: endDay(s).state };
  },
  /** Árbol Padre despierto (solo para ver su sprite; no dispara el final). */
  fatherAwake: () => {
    const s = newGame();
    return { game: { ...s, tiles: s.tiles.map((t) => (t.kind === 'mother' ? { ...t, alive: true } : t)) } };
  },
  /** Amanecer en que llega Maestra Bruna, con su carta. */
  mage: () => ({ game: playUntil((s) => s.mageArrived), story: { kind: 'mage' } }),
  /** Victoria siguiendo las pistas, con la carta de final. */
  won: () => ({ game: playAdvised(newGame()), story: { kind: 'won' } }),
  /** Fin del invierno sin despertar al Árbol Padre, con la carta de final. */
  lost: () => ({ game: playUntil(() => false), story: { kind: 'lost' } }),
};

export function debugStart(): DebugStart | null {
  if (!import.meta.env.DEV) return null;
  const params = new URLSearchParams(location.search);
  const day = Number(params.get('debugDay'));
  if (Number.isInteger(day) && day >= 1) return { game: playUntil((s) => s.day >= day) };
  const name = params.get('debugState');
  return name ? (presets[name]?.() ?? null) : null;
}
