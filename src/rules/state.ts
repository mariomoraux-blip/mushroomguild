import { es } from '../copy/es';
import { DAYS_PER_SEASON, H, KIND, MAP, START_NUTRIENTS, STARTING_GUILD, W } from './config';
import type { GameState, Member, Mutable, RecruitableSpecies, Tile } from './types';

export type MutableState = Mutable<GameState> & { tiles: Mutable<Tile>[]; members: Mutable<Member>[] };

export function newGame(): GameState {
  const tiles: Tile[] = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const ch = MAP[y]?.[x];
      const kind = ch === undefined ? undefined : KIND[ch];
      if (!kind) throw new Error(`Mapa inválido en (${x}, ${y})`);
      tiles.push({ x, y, kind, net: kind === 'home', uses: 0, alive: false });
    }
  }
  const s: MutableState = {
    tiles,
    day: 1,
    nutrients: START_NUTRIENTS,
    spores: 0,
    status: 'playing',
    wonDay: null,
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

/** Agrega a Maese Bruma a un estado ya copiado (uso interno). */
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
export const mage = (s: GameState): Member | undefined => s.members.find((m) => m.species === 'mago');
/** Miembros que cuentan en el límite del gremio (todos menos el mago). */
export const recruitableCount = (s: GameState): number => s.members.filter((m) => m.species !== 'mago').length;
export const motherTile = (s: GameState): Tile => s.tiles.find((t) => t.kind === 'mother')!;

/** Índice de estación (0 = Primavera … 3 = Invierno). */
export const seasonIndex = (day: number): number => Math.min(3, Math.floor((day - 1) / DAYS_PER_SEASON));
export const season = (day: number): string => es.seasons[seasonIndex(day)] ?? '';
/** ¿Maese Bruma ya lanzó un hechizo en la estación actual? */
export const magicSpent = (s: GameState): boolean => s.lastSpellSeason === seasonIndex(s.day);
