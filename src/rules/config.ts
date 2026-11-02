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
 * Puntaje (015 · scoring). Solo con victoria. Pesos y topes del desglose; se recalibran con datos de playtest.
 */
export const SCORE = {
  victory: 500,
  perMonthLeft: 80, // × (MONTHS − mes de victoria)
  perTree: 120, // × árboles revividos, sin el Árbol Padre
  perNutrient: 10,
  perSpore: 20,
  perFreeSlot: 60, // × (MAX_GUILD − miembros reclutables)
  perAction: 5,
  actionCap: 40,
  variety: 150, // las 5 especies actuaron al menos una vez
  timeParS: 480, // 1 punto por segundo por debajo de 8:00
} as const;
/** Versión de la fórmula: cambia la clave del récord guardado y el `ScoreResult`. */
export const SCORE_VERSION = 1;
/** Estrellas por claro: 2 desde el 90 % y 3 desde el 110 % del puntaje del bot con criterio en ese claro. */
export const STARS = { two: 0.9, three: 1.1 } as const;
/** Segundos de juego por mes que se suponen para la partida de referencia del bot. */
export const REFERENCE_SECONDS_PER_MONTH = 25;

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
