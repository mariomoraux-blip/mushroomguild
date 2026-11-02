import { validTargets } from './actions';
import { COST, MAX_GUILD, TREES_FOR_MOTHER } from './config';
import { magicSpent, motherTile, recruitableCount, revivedCount, touchesNet, workerAt } from './state';
import type { GameState, Member, RecruitableSpecies, Spell, Tile } from './types';

/** Siguiente paso sugerido al jugador (player-guidance). */
export type Advice =
  | { kind: 'awaken' | 'revive' | 'decompose'; memberId: number; target: Tile }
  | { kind: 'call'; memberId: number; target: Tile; calledId: number }
  | { kind: 'weave'; memberId: number; target: Tile; toward: 'tree' | 'mother' }
  | { kind: 'spell'; memberId: number; target: Tile; spell: Spell }
  | { kind: 'recruit'; species: RecruitableSpecies }
  | { kind: 'endMonth' }
  | { kind: 'over' };

const dist = (a: Tile, b: Tile) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
const closest = (tiles: readonly Tile[], to: Tile) =>
  tiles.reduce<Tile | undefined>((best, t) => (!best || dist(t, to) < dist(best, to) ? t : best), undefined);

/** Meta del tejido: el árbol gris más cercano a la red mientras falten árboles; después, el Árbol Padre. */
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

/**
 * Especie que conviene reclutar: un segundo Lactarius mientras la red no llegue al Árbol Padre;
 * después una Gliophorus (para repetir la mejor jugada del mes); después otra Amanita.
 */
export function recruitPick(s: GameState): RecruitableSpecies {
  const mother = motherTile(s);
  const count = (sp: string) => s.members.filter((m) => m.species === sp).length;
  if (!touchesNet(s, mother.x, mother.y) && count('lactarius') < 2) return 'lactarius';
  if (count('gliophorus') === 0) return 'gliophorus';
  return 'amanita';
}

/**
 * A quién conviene que la Gliophorus le pase la voz: el compañero que ya trabajó este mes y que,
 * despierto, tendría trabajo útil. Rango: 0 Amanita, 1 Champiñón, 2 Lactarius.
 */
function callOption(s: GameState, glio: Member): (Advice & { kind: 'call'; rank: number }) | null {
  if (s.spores < COST.call) return null;
  const rank: Record<string, number> = { amanita: 0, champi: 1, lactarius: 2 };
  let best: (Advice & { kind: 'call'; rank: number }) | null = null;
  for (const t of s.tiles) {
    const w = workerAt(s, t.x, t.y);
    if (!w || rank[w.species] === undefined) continue;
    const awake: GameState = { ...s, spores: s.spores - COST.call, members: s.members.map((m) => (m.id === w.id ? { ...m, used: false } : m)) };
    if (!validTargets(awake, w.id).length) continue;
    const r = rank[w.species]!;
    if (!best || r < best.rank) best = { kind: 'call', memberId: glio.id, target: t, calledId: w.id, rank: r };
  }
  return best;
}

const canRecruit = (s: GameState) => s.spores >= COST.recruit && recruitableCount(s) < MAX_GUILD;

/**
 * Falta el rol del siguiente paso (015): un compañero que ya trabajó este mes (Amanita o Champiñón) tendría
 * trabajo útil si le pasaran la voz, y el gremio no tiene Gliophorus.
 */
export function missingMessenger(s: GameState): boolean {
  if (s.members.some((m) => m.species === 'gliophorus')) return false;
  return s.tiles.some((t) => {
    const w = workerAt(s, t.x, t.y);
    if (!w || (w.species !== 'amanita' && w.species !== 'champi')) return false;
    const awake: GameState = { ...s, members: s.members.map((m) => (m.id === w.id ? { ...m, used: false } : m)) };
    return validTargets(awake, w.id).length > 0;
  });
}

/**
 * Siguiente paso sugerido. Prioridad: despertar al Árbol Padre > revivir > hechizo > pasar la voz a una
 * Amanita > descomponer > pasar la voz a un Champiñón > tejer > pasar la voz a un Lactarius > reclutar >
 * terminar el mes. Reclutar solo se sugiere si nadie tiene una acción útil, o si falta la Gliophorus que
 * pide el siguiente paso (player-guidance › Cómo reclutar).
 */
export function advise(s: GameState): Advice {
  const work = adviseWork(s);
  if (work.kind === 'over' || !canRecruit(s)) return work;
  if (work.kind === 'endMonth') return { kind: 'recruit', species: recruitPick(s) };
  if (missingMessenger(s)) return { kind: 'recruit', species: 'gliophorus' };
  return work;
}

/** Mejor trabajo del mes para los miembros listos, sin contar reclutar. */
function adviseWork(s: GameState): Advice {
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
  for (const m of of('mago')) {
    if (magicSpent(s)) break;
    const rock = closest(targetsOf(m, 'sprout'), mother);
    if (rock) return { kind: 'spell', memberId: m.id, target: rock, spell: 'sprout' };
    const tree = closest(targetsOf(m, 'rain'), mother);
    if (tree) return { kind: 'spell', memberId: m.id, target: tree, spell: 'rain' };
  }
  const calls = of('gliophorus').map((g) => callOption(s, g)).filter((c) => c !== null);
  const call = (maxRank: number): Advice | null => {
    const c = calls.find((cc) => cc.rank <= maxRank);
    return c ? { kind: 'call', memberId: c.memberId, target: c.target, calledId: c.calledId } : null;
  };
  const callAmanita = call(0);
  if (callAmanita) return callAmanita;
  for (const m of of('champi')) {
    const t = closest(targetsOf(m), mother);
    if (t) return { kind: 'decompose', memberId: m.id, target: t };
  }
  const callChampi = call(1);
  if (callChampi) return callChampi;
  const { goal, toward } = weaveGoal(s);
  for (const m of of('lactarius')) {
    const t = closest(targetsOf(m), goal);
    if (t) return { kind: 'weave', memberId: m.id, target: t, toward };
  }
  const callAny = call(2);
  if (callAny) return callAny;
  return { kind: 'endMonth' };
}
