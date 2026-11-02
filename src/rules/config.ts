import type { RecruitableSpecies, TileKind } from './types';

// Palancas de balance del GDD. Ninguna otra parte del código repite estos números.
export const W = 5;
export const H = 8;
export const DAYS = 12;
export const DAYS_PER_SEASON = 3;
export const MAX_GUILD = 6;
export const START_NUTRIENTS = 2;
export const START_SPORES = 0;
export const COST = { weave: 1, revive: 3, mother: 6, recruit: 2, message: 2 } as const;
export const GAIN = { log: 3, treeSpores: 1, treeNutrients: 1, message: 3 } as const;
export const LOG_USES = 2;
export const TREES_FOR_MOTHER = 2;
/** Árboles revividos que hacen llegar a Maestra Bruna al amanecer siguiente. */
export const TREES_FOR_MAGE = 2;

/** Especies reclutables; la maga no está aquí y no cuenta en `MAX_GUILD`. */
export const RECRUITABLE: readonly RecruitableSpecies[] = ['champi', 'lactarius', 'amanita', 'gliophorus'];
export const STARTING_GUILD: readonly RecruitableSpecies[] = ['lactarius', 'champi', 'amanita'];

// Capítulo 1 · El Claro Gris. El mapa horizontal del PoC rotado 90°: (x, y) del PoC → (y, 7 - x).
// H hogar · M Árbol Padre · . tierra · L tronco · T árbol gris · R roca
export const MAP: readonly string[] = [
  '.TM..',
  '.L..T',
  '..R.R',
  'T..L.',
  'RR...',
  '..TR.',
  'L...T',
  '.LH..',
];

export const KIND: Readonly<Record<string, TileKind>> = {
  H: 'home',
  M: 'mother',
  '.': 'soil',
  L: 'log',
  T: 'tree',
  R: 'rock',
};
