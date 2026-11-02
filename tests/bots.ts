// Bots sembrados para balance.test.ts. Solo usan la API pública de las reglas.
import {
  act,
  COST,
  endDay,
  MAX_GUILD,
  motherTile,
  recruit,
  recruitableCount,
  RECRUITABLE,
  touchesNet,
  validTargets,
  type GameState,
  type Member,
  type RecruitableSpecies,
  type Tile,
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

// Umbrales de la política del bot con criterio (design.md).
const GLIO_RECRUIT_BELOW = 3; // recluta Gliophorus con menos de 3 nutrientes
const GLIO_TRADE_BELOW = 4; // pasa la voz con menos de 4 nutrientes

const canRecruit = (s: GameState) => s.spores >= COST.recruit && recruitableCount(s) < MAX_GUILD;

/** Juega una partida completa: `day` decide lo que pasa en cada día y luego se termina el día. */
export function playGame(start: GameState, day: (s: GameState) => GameState): GameState {
  let s = start;
  while (s.status === 'playing') {
    s = day(s);
    if (s.status === 'playing') s = endDay(s).state;
  }
  return s;
}

// ─── Bot al azar (piso de dificultad) ───────────────────────────────────────────
// Recluta una especie al azar si puede; cada miembro, en orden aleatorio, actúa sobre
// una casilla válida al azar (la maga, con cualquier hechizo válido).
export function randomDay(rng: Rng) {
  return (start: GameState): GameState => {
    let s = start;
    if (canRecruit(s)) s = recruit(s, pick(rng, RECRUITABLE)).state;
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

// ─── Bot con criterio (design.md) ───────────────────────────────────────────────
const dist = (a: Tile, b: Tile) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** El más cercano al Árbol Padre; empates resueltos con la semilla. */
function closestToMother(rng: Rng, s: GameState, tiles: readonly Tile[]): Tile | undefined {
  if (!tiles.length) return undefined;
  const mother = motherTile(s);
  const best = Math.min(...tiles.map((t) => dist(t, mother)));
  return pick(rng, tiles.filter((t) => dist(t, mother) === best));
}

function smartRecruit(s: GameState): RecruitableSpecies {
  const logNearNet = s.tiles.some((t) => t.kind === 'log' && touchesNet(s, t.x, t.y));
  const mother = motherTile(s);
  if (s.nutrients < GLIO_RECRUIT_BELOW && !logNearNet) return 'gliophorus';
  if (!touchesNet(s, mother.x, mother.y)) return 'lactarius';
  return 'amanita';
}

/** Prioridad de una acción (menor es mejor) o `null` si el bot no la haría. */
function priority(s: GameState, m: Member, t: Tile): number | null {
  switch (m.species) {
    case 'amanita':
      return t.kind === 'mother' ? 0 : 2;
    case 'gliophorus':
      return s.nutrients < GLIO_TRADE_BELOW ? 1 : null;
    case 'champi':
      return 3;
    case 'lactarius':
      return 4;
    default:
      return null;
  }
}

/**
 * Política: reclutar (Gliophorus si hay < 3 nutrientes y ningún tronco toca la red; si no, Lactarius
 * mientras la red no toque al Árbol Padre; después Amanita) → Maestra Bruna (Brote arcano en la roca
 * válida más cercana al Árbol Padre; si no hay, Lluvia de esporas) → en bucle, la acción de mayor
 * prioridad: Árbol Padre > pasar la voz (< 4 nutrientes) > revivir > descomponer > tejer hacia arriba.
 */
export function smartDay(rng: Rng) {
  return (start: GameState): GameState => {
    let s = start;
    if (canRecruit(s)) s = recruit(s, smartRecruit(s)).state;

    const mage = s.members.find((m) => m.species === 'mago' && !m.used);
    if (mage) {
      const target =
        closestToMother(rng, s, validTargets(s, mage.id, 'sprout')) ??
        closestToMother(rng, s, validTargets(s, mage.id, 'rain'));
      if (target) s = act(s, mage.id, target.x, target.y).state;
    }

    for (;;) {
      if (s.status !== 'playing') break;
      let best: { m: Member; t: Tile; p: number } | null = null;
      for (const m of s.members) {
        if (m.used || m.species === 'mago') continue;
        const targets = validTargets(s, m.id);
        const t = targets.find((tt) => tt.kind === 'mother') ?? closestToMother(rng, s, targets);
        if (!t) continue;
        const p = priority(s, m, t);
        if (p !== null && (!best || p < best.p)) best = { m, t, p };
      }
      if (!best) break;
      s = act(s, best.m.id, best.t.x, best.t.y).state;
    }
    return s;
  };
}
