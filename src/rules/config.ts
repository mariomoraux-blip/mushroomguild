import type { RecruitableSpecies, TileKind } from './types';

// Palancas de balance del GDD. Ninguna otra parte del código repite estos números.
export const W = 5;
export const H = 8;
export const MONTHS = 12;
export const MONTHS_PER_SEASON = 3;
export const MAX_GUILD = 6;
export const START_NUTRIENTS = 2;
export const START_SPORES = 0;
export const COST = { weave: 1, revive: 3, mother: 10, recruit: 2, call: 1 } as const;
export const GAIN = { log: 2, treeSpores: 1, treeNutrients: 1 } as const;
export const LOG_USES = 2;
export const TREES_FOR_MOTHER = 3;
/** Árboles revividos que hacen llegar a Maestra Bruma al empezar el mes siguiente. */
export const TREES_FOR_MAGE = 2;

/** Especies reclutables; la maga no está aquí y no cuenta en `MAX_GUILD`. */
export const RECRUITABLE: readonly RecruitableSpecies[] = ['champi', 'lactarius', 'amanita', 'gliophorus'];
export const STARTING_GUILD: readonly RecruitableSpecies[] = ['lactarius', 'champi', 'amanita'];

/**
 * Generador de mapas (cada partida nueva es un claro distinto). Un mapa solo se acepta si la
 * política de las pistas (`advise`) lo gana entre `minMonth` y `maxMonth`: ni regalado ni imposible.
 */
export const MAP_GEN = { trees: 7, logs: 5, rocks: 6, minMonth: 8, maxMonth: 11, attempts: 400 } as const;

// Capítulo 1 · El Claro Gris (mapa clásico, el del PoC rotado 90°: (x, y) del PoC → (y, 7 - x)).
// Se usa en las pruebas y como respaldo si el generador no encuentra un mapa válido.
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
