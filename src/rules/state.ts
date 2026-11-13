import { es } from '../copy/es';
import { COST, FADED_REVIVE, FROST_WEAVE, HEAL_REACH, LEVELS, MAX_GUILD, MONTHS, MONTHS_PER_SEASON, H, KIND, MAP, PLAGUE_HOME_GAP, PLAGUE_REACH, RECRUIT_COSTS, START_NUTRIENTS, START_SPORES, STARTING_GUILD, W } from './config';
import { hashString, mulberry32 } from './rng';
import type { GameState, GuildSpecies, Level, Member, Mutable, Point, Tile } from './types';

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
    nutrients: LEVELS[level].start?.nutrients ?? START_NUTRIENTS,
    spores: LEVELS[level].start?.spores ?? START_SPORES,
    status: 'playing',
    wonMonth: null,
    members: [],
    nameIdx: { champi: 0, lactarius: 0, amanita: 0, gliophorus: 0, morchella: 0, ganoderma: 0, lycoperdon: 0 },
    nextId: 1,
    mageDue: false,
    mageArrived: false,
    lastSpellSeason: null,
  };
  STARTING_GUILD.forEach((sp) => addMember(s, sp));
  return s;
}

/** Agrega un miembro reclutable a un estado ya copiado (uso interno). */
export function addMember(s: MutableState, species: GuildSpecies): Mutable<Member> {
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

/**
 * Casillas de la red unidas al Hogar por casillas de la red (pasos en cruz; 043). `withoutBlight` (044): como si las
 * casillas tejidas con plaga ya se hubieran marchitado.
 */
export function rootedNet(s: GameState, withoutBlight = false): ReadonlySet<Tile> {
  const home = s.tiles.find((t) => t.kind === 'home')!;
  const seen = new Set<Tile>([home]);
  const queue = [home];
  for (let i = 0; i < queue.length; i++) {
    const p = queue[i]!;
    for (const n of neighbors(s, p.x, p.y)) {
      if (seen.has(n) || !n.net || (withoutBlight && n.blighted)) continue;
      seen.add(n);
      queue.push(n);
    }
  }
  return seen;
}

/** Árboles vivos que no producen porque la red no los une al Hogar (043; solo en niveles con `rooted`). */
export function unrootedTrees(s: GameState): Tile[] {
  if (!LEVELS[s.level].rooted) return [];
  const rooted = rootedNet(s);
  return s.tiles.filter((t) => t.kind === 'tree' && t.alive && !rooted.has(t));
}

/**
 * Red cortada (045): casillas de la red, sin plaga, que ya no llegan al Hogar (solo en niveles con `rooted`). Se ven
 * apagadas, sin la luz de la red.
 */
export function cutNet(s: GameState): Tile[] {
  if (!LEVELS[s.level].rooted) return [];
  const rooted = rootedNet(s);
  return s.tiles.filter((t) => t.net && !t.blighted && t.kind !== 'home' && !rooted.has(t));
}

/**
 * Casillas desde donde un hongo frena la plaga (045): las que están a `PLAGUE_REACH` pasos o menos de una casilla con
 * plaga (tejida o marchita) que nadie frenó este mes.
 */
export function guardsPlague(s: GameState, t: Point): boolean {
  return s.tiles.some((b) => b.blighted && !guarded(s, b) && steps(b, t) <= PLAGUE_REACH);
}

/** Árboles vivos que hoy la red une al Hogar y que quedarían sueltos si se marchitaran las casillas con plaga (044). */
export function looseAtRisk(s: GameState): number {
  if (!LEVELS[s.level].rooted || !s.tiles.some((t) => t.blighted && t.net)) return 0;
  const now = rootedNet(s);
  const after = rootedNet(s, true);
  return s.tiles.filter((t) => t.kind === 'tree' && t.alive && now.has(t) && !after.has(t)).length;
}

/** Árboles que producen al terminar el mes (043: solo los que la red une al Hogar, en niveles con `rooted`). */
export const producingCount = (s: GameState): number => revivedCount(s) - unrootedTrees(s).length;
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
/** Nutrientes para despertar al Árbol Ancestral en el nivel (028). */
export const motherCost = (s: GameState): number => LEVELS[s.level].mother;
/** Árboles revividos que pide el Árbol Ancestral en el nivel de la partida (031). */
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
export const steps = (a: Point, b: Point): number => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

/**
 * Casilla que marca la plaga (032; 043; 045: junto a un árbol): una casilla tejida sin plaga (tierra de la red; nunca el
 * Hogar, un árbol ni el Árbol Ancestral) a 2 pasos o más del Hogar y vecina en cruz de un árbol vivo. Si no hay, la más
 * cercana al Hogar entre las de 2 pasos o más; si tampoco, entre todas las tejidas. Al azar con el claro, el mes y `k`
 * (la `k`-ésima que marca ese mes).
 */
export function plagueTarget(s: GameState, k = 0): Tile | null {
  const home = s.tiles.find((t) => t.kind === 'home');
  const woven = s.tiles.filter((t) => t.net && t.kind === 'soil' && !t.blighted);
  if (!home || !woven.length) return null;
  const pick = (list: Tile[]) => list[Math.floor(mulberry32((hashString(s.mapId) ^ s.month ^ (k << 8)) >>> 0)() * list.length)]!;
  const far = woven.filter((t) => steps(t, home) >= PLAGUE_HOME_GAP);
  const pool = far.length ? far : woven;
  const alive = s.tiles.filter((t) => t.kind === 'tree' && t.alive);
  const byTree = pool.filter((t) => alive.some((a) => steps(a, t) === 1));
  if (byTree.length) return pick(byTree);
  const near = Math.min(...pool.map((t) => steps(t, home)));
  return pick(pool.filter((t) => steps(t, home) === near));
}

/** Casillas que marca la plaga al empezar el mes (043): en las estaciones con plaga, 1, 2 y 3 según el mes de la estación. */
export const plagueCount = (s: GameState, month = s.month): number =>
  LEVELS[s.level].plague.includes(seasonIndex(month)) ? ((month - 1) % MONTHS_PER_SEASON) + 1 : 0;

/** Algún hongo trabajó este mes a `PLAGUE_REACH` casillas o menos de `t` (032). */
export const guarded = (s: GameState, t: Point): boolean => s.members.some((m) => m.at && steps(m.at, t) <= PLAGUE_REACH);

/** Pasos en cruz desde la casilla de la red más cercana, sin importar las rocas (039 · Ganoderma). Sin red, `Infinity`. */
export const netDistance = (s: GameState, t: Point): number => Math.min(...s.tiles.filter((n) => n.net).map((n) => steps(n, t)));
/** El Ganoderma alcanza la casilla (039): a `HEAL_REACH` pasos o menos de la red. */
export const inHealReach = (s: GameState, t: Point): boolean => netDistance(s, t) <= HEAL_REACH;
/** La especie ya está en el gremio (039: cada especie reclutable llega una sola vez). */
export const hasSpecies = (s: GameState, species: GuildSpecies): boolean => s.members.some((m) => m.species === species);

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
