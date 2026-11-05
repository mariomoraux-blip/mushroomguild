import { es } from '../copy/es';
import { COST, FADED_REVIVE, FROST_WEAVE, LEVELS, MAX_GUILD, MONTHS, MONTHS_PER_SEASON, H, KIND, MAP, RECRUIT_COSTS, START_NUTRIENTS, START_SPORES, STARTING_GUILD, W } from './config';
import type { GameState, Level, Member, Mutable, RecruitableSpecies, Tile } from './types';

export type MutableState = Mutable<GameState> & { tiles: Mutable<Tile>[]; members: Mutable<Member>[] };

/** Partida nueva sobre un mapa (por defecto, el clásico del Capítulo 1). `mapId` identifica el claro (015); `level`, la dificultad (019). */
export function newGame(map: readonly string[] = MAP, mapId: string = map === MAP ? 'clasico' : 'custom', level: Level = 'brote'): GameState {
  const tiles: Tile[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = map[y]?.[x];
      const kind = ch === undefined ? undefined : KIND[ch];
      if (!kind) throw new Error(`Mapa inválido en (${x}, ${y})`);
      tiles.push({ x, y, kind, net: kind === 'home', uses: 0, alive: false, fading: false, faded: false });
    }
  }
  const s: MutableState = {
    mapId,
    level,
    log: [],
    tiles,
    month: 1,
    nutrients: START_NUTRIENTS,
    spores: START_SPORES,
    status: 'playing',
    wonMonth: null,
    members: [],
    nameIdx: { champi: 0, lactarius: 0, amanita: 0, gliophorus: 0 },
    nextId: 1,
    mageDue: false,
    mageArrived: false,
    lastSpellSeason: null,
  };
  STARTING_GUILD.forEach((sp) => addMember(s, sp));
  return s;
}

/** Agrega un miembro reclutable a un estado ya copiado (uso interno). */
export function addMember(s: MutableState, species: RecruitableSpecies): Mutable<Member> {
  const list = es.memberNames[species];
  const name = list[s.nameIdx[species] % list.length] ?? species;
  s.nameIdx[species]++;
  const m: Mutable<Member> = { id: s.nextId++, species, name, used: false, at: null };
  s.members.push(m);
  return m;
}

/** Agrega a Maestra Bruma a un estado ya copiado (uso interno). */
export function addMage(s: MutableState): Mutable<Member> {
  const m: Mutable<Member> = { id: s.nextId++, species: 'mago', name: es.mageName, used: false, at: null };
  s.members.push(m);
  s.mageArrived = true;
  s.mageDue = false;
  return m;
}

/** Copia profunda del estado para trabajar sin tocar el original. */
export function cloneState(s: GameState): MutableState {
  return structuredClone(s) as MutableState;
}

export function tile(s: GameState, x: number, y: number): Tile | null {
  if (x < 0 || y < 0 || x >= W || y >= H) return null;
  return s.tiles[y * W + x] ?? null;
}

const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

export function neighbors(s: GameState, x: number, y: number): Tile[] {
  return DIRS.map(([dx, dy]) => tile(s, x + dx, y + dy)).filter((t): t is Tile => t !== null);
}

export const touchesNet = (s: GameState, x: number, y: number): boolean => neighbors(s, x, y).some((n) => n.net);
export const revivedCount = (s: GameState): number => s.tiles.filter((t) => t.kind === 'tree' && t.alive).length;
export const treeTotal = (s: GameState): number => s.tiles.filter((t) => t.kind === 'tree').length;
export const member = (s: GameState, id: number): Member | undefined => s.members.find((m) => m.id === id);
/** Compañero que ya trabajó este mes en (x, y) y al que la Gliophorus puede llamar (ni Gliophorus ni la maga). */
export const workerAt = (s: GameState, x: number, y: number): Member | undefined =>
  s.members.find((m) => m.used && m.at?.x === x && m.at?.y === y && m.species !== 'gliophorus' && m.species !== 'mago');
export const mage = (s: GameState): Member | undefined => s.members.find((m) => m.species === 'mago');
/** Miembros que cuentan en el límite del gremio (todos menos la maga). */
export const recruitableCount = (s: GameState): number => s.members.filter((m) => m.species !== 'mago').length;
/** Miembros reclutados en la partida: los reclutables menos el gremio inicial (la maga no cuenta). */
export const recruitedCount = (s: GameState): number => Math.max(0, recruitableCount(s) - STARTING_GUILD.length);
/** Esporas que cuesta el próximo recluta (027: 3, 5, 7), o `null` si el gremio está completo. */
export const recruitCost = (s: GameState): number | null =>
  recruitableCount(s) >= MAX_GUILD ? null : (RECRUIT_COSTS[recruitedCount(s)] ?? null);
export const motherTile = (s: GameState): Tile => s.tiles.find((t) => t.kind === 'mother')!;

/** Índice de estación (0 = Primavera … 3 = Invierno). */
export const seasonIndex = (month: number): number =>
  Math.min(Math.ceil(MONTHS / MONTHS_PER_SEASON) - 1, Math.floor((month - 1) / MONTHS_PER_SEASON));
export const season = (month: number): string => es.seasons[seasonIndex(month)] ?? '';
/** ¿Maestra Bruma ya lanzó un hechizo en la estación actual? */
export const magicSpent = (s: GameState): boolean => s.lastSpellSeason === seasonIndex(s.month);

/** ¿Hay escarcha este mes en el nivel de la partida? (019) */
export const hasFrost = (s: GameState): boolean => LEVELS[s.level].frost.includes(seasonIndex(s.month));
/** Costo de tejer ahora: más caro con escarcha (019). */
export const weaveCost = (s: GameState): number => (hasFrost(s) ? FROST_WEAVE : COST.weave);
/** Nutrientes para despertar al Árbol Padre en el nivel (028). */
export const motherCost = (s: GameState): number => LEVELS[s.level].mother;
/** Árboles revividos que pide el Árbol Padre en el nivel de la partida (031). */
export const motherTrees = (s: GameState): number => LEVELS[s.level].motherTrees;
/** El mes es de una temporada fría del nivel: al terminarlo, el gremio come (028). */
export const isCold = (s: GameState, month = s.month): boolean => LEVELS[s.level].upkeep.includes(seasonIndex(month));
/** En este mes los árboles no dan esporas (028). */
export const isSporeless = (s: GameState, month = s.month): boolean => LEVELS[s.level].sporeless.includes(seasonIndex(month));
/** Costo de revivir un árbol: más caro si está apagado (019). */
export const reviveCost = (t: Tile): number => (t.faded ? FADED_REVIVE : COST.revive);

/**
 * Árbol gris (ni vivo ni apagado) más lejano de la red: mayor distancia en pasos ortogonales desde la red sin
 * atravesar rocas; si hay empate, el de la fila más alta (y menor) y después el de la columna menor (019).
 */
export function farthestGreyTree(s: GameState): Tile | null {
  const dist = new Map<Tile, number>();
  const queue: Tile[] = s.tiles.filter((t) => t.net);
  queue.forEach((t) => dist.set(t, 0));
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]!;
    for (const n of neighbors(s, p.x, p.y)) {
      if (n.kind === 'rock' || dist.has(n)) continue;
      dist.set(n, dist.get(p)! + 1);
      queue.push(n);
    }
  }
  let best: Tile | null = null;
  for (const t of s.tiles) {
    if (t.kind !== 'tree' || t.alive || t.faded || !dist.has(t)) continue;
    const d = dist.get(t)!;
    const b = best ? dist.get(best)! : -1;
    if (d > b || (d === b && (t.y < best!.y || (t.y === best!.y && t.x < best!.x)))) best = t;
  }
  return best;
}
