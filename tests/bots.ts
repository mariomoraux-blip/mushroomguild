// Bots sembrados para balance.test.ts. Solo usan la API pública de las reglas.
import {
  act,
  canRecruit,
  endMonth,
  recruit,
  RECRUITABLE,
  validTargets,
  type GameState,
} from '../src/rules';

export type Rng = () => number;

export const pick = <T>(rng: Rng, list: readonly T[]): T => list[Math.floor(rng() * list.length)]!;

export function shuffle<T>(rng: Rng, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Juega una partida completa: `month` decide lo que pasa en cada mes y luego se termina el mes. */
export function playGame(start: GameState, month: (s: GameState) => GameState): GameState {
  let s = start;
  while (s.status === 'playing') {
    s = month(s);
    if (s.status === 'playing') s = endMonth(s).state;
  }
  return s;
}

// ─── Bot al azar (piso de dificultad) ───────────────────────────────────────────
// Recluta una especie al azar si puede; cada miembro, en orden aleatorio, actúa sobre
// una casilla válida al azar (la maga, con cualquier hechizo válido).
export function randomMonth(rng: Rng) {
  return (start: GameState): GameState => {
    let s = start;
    if (canRecruit(s)) s = recruit(s, pick(rng, RECRUITABLE.filter((sp) => !s.members.some((m) => m.species === sp)))).state;
    for (const m of shuffle(rng, s.members)) {
      if (s.status !== 'playing') break;
      const targets = validTargets(s, m.id);
      if (targets.length) {
        const t = pick(rng, targets);
        s = act(s, m.id, t.x, t.y).state;
      }
    }
    return s;
  };
}

// El bot con criterio es la política de las pistas: `playAdvised` (src/rules/autoplay.ts).
