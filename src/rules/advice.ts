import { validTargets } from './actions';
import { COST, MAX_GUILD, TREES_FOR_MOTHER } from './config';
import { magicSpent, motherTile, recruitableCount, revivedCount, touchesNet } from './state';
import type { GameState, Member, RecruitableSpecies, Spell, Tile } from './types';

/** Siguiente paso sugerido al jugador (player-guidance). */
export type Advice =
  | { kind: 'awaken' | 'revive' | 'decompose' | 'message'; memberId: number; target: Tile }
  | { kind: 'weave'; memberId: number; target: Tile; toward: 'tree' | 'mother' }
  | { kind: 'spell'; memberId: number; target: Tile; spell: Spell }
  | { kind: 'recruit'; species: RecruitableSpecies }
  | { kind: 'endDay' }
  | { kind: 'over' };

const dist = (a: Tile, b: Tile) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const closest = (tiles: readonly Tile[], to: Tile) =>
  tiles.reduce<Tile | undefined>((best, t) => (!best || dist(t, to) < dist(best, to) ? t : best), undefined);

/** Meta del tejido: el árbol gris más cercano a la red mientras falten árboles; después, el Árbol Madre. */
export function weaveGoal(s: GameState): { goal: Tile; toward: 'tree' | 'mother' } {
  const mother = motherTile(s);
  if (revivedCount(s) >= TREES_FOR_MOTHER) return { goal: mother, toward: 'mother' };
  const net = s.tiles.filter((t) => t.net);
  const grey = s.tiles.filter((t) => t.kind === 'tree' && !t.alive);
  const nearest = grey.reduce<{ t: Tile; d: number } | undefined>((best, t) => {
    const d = Math.min(...net.map((n) => dist(n, t)));
    return !best || d < best.d ? { t, d } : best;
  }, undefined);
  return nearest ? { goal: nearest.t, toward: 'tree' } : { goal: mother, toward: 'mother' };
}

/** Especie que conviene reclutar (misma política que el bot con criterio de 001). */
export function recruitPick(s: GameState): RecruitableSpecies {
  const logNearNet = s.tiles.some((t) => t.kind === 'log' && touchesNet(s, t.x, t.y));
  const mother = motherTile(s);
  if (s.nutrients < COST.revive && !logNearNet) return 'gliophorus';
  if (!touchesNet(s, mother.x, mother.y)) return 'lactarius';
  return 'amanita';
}

/**
 * Siguiente paso sugerido. Prioridad: despertar al Árbol Madre > revivir > reclutar > descomponer >
 * tejer > pasar la voz > hechizo > terminar el día.
 */
export function advise(s: GameState): Advice {
  if (s.status !== 'playing') return { kind: 'over' };
  const ready = s.members.filter((m) => !m.used);
  const targetsOf = (m: Member, spell?: Spell) => validTargets(s, m.id, spell);
  const mother = motherTile(s);
  const of = (species: string) => ready.filter((m) => m.species === species);

  for (const m of of('amanita')) {
    const t = targetsOf(m).find((tt) => tt.kind === 'mother');
    if (t) return { kind: 'awaken', memberId: m.id, target: t };
  }
  for (const m of of('amanita')) {
    const t = closest(targetsOf(m), mother);
    if (t) return { kind: 'revive', memberId: m.id, target: t };
  }
  if (s.spores >= COST.recruit && recruitableCount(s) < MAX_GUILD) return { kind: 'recruit', species: recruitPick(s) };
  for (const m of of('champi')) {
    const t = closest(targetsOf(m), mother);
    if (t) return { kind: 'decompose', memberId: m.id, target: t };
  }
  const { goal, toward } = weaveGoal(s);
  for (const m of of('lactarius')) {
    const t = closest(targetsOf(m), goal);
    if (t) return { kind: 'weave', memberId: m.id, target: t, toward };
  }
  if (s.nutrients < COST.revive) {
    for (const m of of('gliophorus')) {
      const t = closest(targetsOf(m), mother);
      if (t) return { kind: 'message', memberId: m.id, target: t };
    }
  }
  for (const m of of('mago')) {
    if (magicSpent(s)) break;
    const rock = closest(targetsOf(m, 'sprout'), mother);
    if (rock) return { kind: 'spell', memberId: m.id, target: rock, spell: 'sprout' };
    const tree = closest(targetsOf(m, 'rain'), mother);
    if (tree) return { kind: 'spell', memberId: m.id, target: tree, spell: 'rain' };
  }
  return { kind: 'endDay' };
}
