import { addMage, cloneState, newGame, type GameState, type Point, type RecruitableSpecies } from '../src/rules';

export interface Setup {
  day?: number;
  nutrients?: number;
  spores?: number;
  /** Casillas que se agregan a la red. */
  net?: Point[];
  /** Árboles revividos (también entran a la red). */
  alive?: Point[];
  /** Usos ya hechos de un tronco. */
  uses?: (Point & { n: number })[];
  /** Ids de miembros que ya actuaron hoy. */
  used?: number[];
  /** Miembros reclutables extra que se agregan al gremio (disponibles). */
  extraMembers?: RecruitableSpecies[];
  /** Maestra Bruma ya está en el gremio (se agrega después de los extra). */
  mage?: boolean;
  /** Estación (0–3) del último hechizo de Maestra Bruma. */
  lastSpellSeason?: number;
}

/** Arma un estado de prueba a partir de una partida nueva. */
export function setup(o: Setup = {}): GameState {
  const s = cloneState(newGame());
  const at = (p: Point) => s.tiles.find((t) => t.x === p.x && t.y === p.y)!;
  if (o.day !== undefined) s.day = o.day;
  if (o.nutrients !== undefined) s.nutrients = o.nutrients;
  if (o.spores !== undefined) s.spores = o.spores;
  o.net?.forEach((p) => (at(p).net = true));
  o.alive?.forEach((p) => {
    const t = at(p);
    t.alive = true;
    t.net = true;
  });
  o.uses?.forEach((p) => (at(p).uses = p.n));
  o.extraMembers?.forEach((species) => {
    const id = s.nextId++;
    s.members.push({ id, species, name: `extra-${id}`, used: false, at: null });
  });
  if (o.mage) addMage(s);
  o.used?.forEach((id) => (s.members.find((m) => m.id === id)!.used = true));
  if (o.lastSpellSeason !== undefined) s.lastSpellSeason = o.lastSpellSeason;
  return s;
}

/** Id del miembro de una especie (el primero, o el n-ésimo). */
export const idOf = (s: GameState, species: string, nth = 1): number =>
  s.members.filter((m) => m.species === species)[nth - 1]!.id;

// Ids del gremio inicial.
export const ANIL = 1; // Lactarius indigo
export const BRUNO = 2; // Champiñón
export const RUBI = 3; // Amanita muscaria
