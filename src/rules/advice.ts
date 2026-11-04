import { validTargets } from './actions';
import { COST, STARTING_GUILD, TREES_FOR_MOTHER } from './config';
import { magicSpent, motherTile, neighbors, recruitableCount, recruitCost, revivedCount, touchesNet, workerAt } from './state';
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

/**
 * Variantes de la política (019). Sin opciones es la de las pistas, tal cual la ve el jugador. El bot experto
 * mide distancias rodeando rocas (`path`), cambia el orden de reclutar y revive primero el árbol marcado.
 */
export interface PolicyOptions {
  readonly path?: boolean;
  readonly recruitOrder?: readonly RecruitableSpecies[];
  readonly saveMarked?: boolean;
}

const manhattan = (a: Tile, b: Tile) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/** Distancia en pasos sin atravesar rocas desde `to` (la red ni los árboles la bloquean). */
function pathFrom(s: GameState, to: Tile): (t: Tile) => number {
  const d = new Map<string, number>([[`${to.x},${to.y}`, 0]]);
  const queue: Tile[] = [to];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]!;
    for (const n of neighbors(s, p.x, p.y)) {
      const k = `${n.x},${n.y}`;
      if (n.kind === 'rock' || d.has(k)) continue;
      d.set(k, d.get(`${p.x},${p.y}`)! + 1);
      queue.push(n);
    }
  }
  return (t) => d.get(`${t.x},${t.y}`) ?? 99;
}

const distTo = (s: GameState, to: Tile, o: PolicyOptions) => (o.path ? pathFrom(s, to) : (t: Tile) => manhattan(t, to));
const closestBy = (tiles: readonly Tile[], d: (t: Tile) => number) =>
  tiles.reduce<Tile | undefined>((best, t) => (!best || d(t) < d(best) ? t : best), undefined);
const dist = manhattan;
const closest = (tiles: readonly Tile[], to: Tile) => closestBy(tiles, (t) => dist(t, to));

/** Meta del tejido: el árbol gris más cercano a la red mientras falten árboles; después, el Árbol Padre. */
export function weaveGoal(s: GameState, o: PolicyOptions = {}): { goal: Tile; toward: 'tree' | 'mother' } {
  const mother = motherTile(s);
  if (revivedCount(s) >= TREES_FOR_MOTHER) return { goal: mother, toward: 'mother' };
  const net = s.tiles.filter((t) => t.net);
  // El experto prefiere el árbol marcado y evita los apagados (cuestan más).
  const grey = s.tiles.filter((t) => t.kind === 'tree' && !t.alive && !(o.saveMarked && t.faded));
  const marked = o.saveMarked ? grey.find((t) => t.fading) : undefined;
  if (marked) return { goal: marked, toward: 'tree' };
  const nearest = grey.reduce<{ t: Tile; d: number } | undefined>((best, t) => {
    const from = distTo(s, t, o);
    const d = Math.min(...net.map((n) => from(n)));
    return !best || d < best.d ? { t, d } : best;
  }, undefined);
  return nearest ? { goal: nearest.t, toward: 'tree' } : { goal: mother, toward: 'mother' };
}

/**
 * Especie que conviene reclutar: un segundo Lactarius mientras la red no llegue al Árbol Padre;
 * después una Gliophorus (para repetir la mejor jugada del mes); después otra Amanita.
 */
export function recruitPick(s: GameState, o: PolicyOptions = {}): RecruitableSpecies {
  const mother = motherTile(s);
  const count = (sp: string) => s.members.filter((m) => m.species === sp).length;
  // Orden fijo del experto: el n-ésimo recluta es la n-ésima especie de la lista (y vuelve a empezar).
  if (o.recruitOrder?.length) return o.recruitOrder[(recruitableCount(s) - STARTING_GUILD.length) % o.recruitOrder.length]!;
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

/** Hay cupo y esporas para el próximo recluta (027: el costo sube con cada uno). */
export const canRecruit = (s: GameState): boolean => {
  const cost = recruitCost(s);
  return cost !== null && s.spores >= cost;
};

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
export function advise(s: GameState, o: PolicyOptions = {}): Advice {
  const work = adviseWork(s, o);
  if (work.kind === 'over' || !canRecruit(s)) return work;
  if (work.kind === 'endMonth') return { kind: 'recruit', species: recruitPick(s, o) };
  if (missingMessenger(s)) return { kind: 'recruit', species: 'gliophorus' };
  return work;
}

/** Mejor trabajo del mes para los miembros listos, sin contar reclutar. */
function adviseWork(s: GameState, o: PolicyOptions): Advice {
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
    const targets = targetsOf(m);
    const t = (o.saveMarked && targets.find((tt) => tt.fading)) || closest(targets, mother);
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
  const { goal, toward } = weaveGoal(s, o);
  const toGoal = distTo(s, goal, o);
  for (const m of of('lactarius')) {
    const t = closestBy(targetsOf(m), toGoal);
    if (t) return { kind: 'weave', memberId: m.id, target: t, toward };
  }
  const callAny = call(2);
  if (callAny) return callAny;
  return { kind: 'endMonth' };
}
