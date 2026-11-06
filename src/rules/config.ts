import type { Level, RecruitableSpecies, TileKind } from './types';

// Palancas de balance del GDD. Ninguna otra parte del código repite estos números.
export const W = 5;
export const H = 8;
export const MONTHS = 12;
export const MONTHS_PER_SEASON = 3;
export const MAX_GUILD = 6;
export const START_NUTRIENTS = 2;
export const START_SPORES = 0;
export const COST = { weave: 1, revive: 3, call: 1 } as const;
/**
 * Costo en esporas de cada recluta (027): el primero 3, el segundo 5, el tercero 7. Hay un valor por cupo
 * (`MAX_GUILD − STARTING_GUILD`); los miembros iniciales y Maestra Bruma no cuentan como reclutados.
 */
export const RECRUIT_COSTS = [3, 5, 7] as const;
export const GAIN = { log: 2, treeSpores: 1, treeNutrients: 1 } as const;
export const LOG_USES = 2;
export const TREES_FOR_MOTHER = 3;
/** Plaga (032): la casilla marcada se salva si algún hongo trabajó ese mes a esta distancia o menos (pasos en cruz). */
export const PLAGUE_REACH = 2;
/** Árboles revividos que hacen llegar a Maestra Bruma al empezar el mes siguiente. */
export const TREES_FOR_MAGE = 2;

/**
 * Niveles de dificultad (019). `rocks`: rocas del claro; `frost`: estaciones (0 = Primavera … 3 = Invierno)
 * con escarcha; `fading`: meses que empiezan marcando un árbol gris que se apaga al terminarlos;
 * `upkeep`: temporadas frías, en que el gremio come `UPKEEP` al terminar cada mes (028); `sporeless`: estaciones en que
 * los árboles no dan esporas (028); `mother`: nutrientes para despertar al Árbol Padre (028); `motherTrees`: árboles revividos que pide (031); `plague`: estaciones en cuyo primer mes la plaga marca una casilla
 * tejida (032);
 * `hints`: se muestran las pistas; `multiplier`: del puntaje. Ninguna regla de nivel quita progreso del tablero.
 */
export interface LevelRules {
  readonly rocks: number;
  readonly frost: readonly number[];
  readonly fading: readonly number[];
  readonly upkeep: readonly number[];
  readonly sporeless: readonly number[];
  readonly mother: number;
  readonly motherTrees: number;
  readonly plague: readonly number[];
  readonly hints: boolean;
  readonly multiplier: number;
}
export const LEVELS: Readonly<Record<Level, LevelRules>> = {
  brote: { rocks: 6, frost: [], fading: [], upkeep: [], sporeless: [], mother: 10, motherTrees: TREES_FOR_MOTHER, plague: [], hints: true, multiplier: 1 },
  bosque: { rocks: 8, frost: [2], fading: [6], upkeep: [2, 3], sporeless: [3], mother: 10, motherTrees: TREES_FOR_MOTHER, plague: [], hints: true, multiplier: 1.5 },
  ancestral: { rocks: 10, frost: [2, 3], fading: [3, 5, 7, 9, 11], upkeep: [2, 3], sporeless: [3], mother: 12, motherTrees: 4, plague: [2, 3], hints: false, multiplier: 2 },
};
export const LEVEL_IDS: readonly Level[] = ['brote', 'bosque', 'ancestral'];
/** Costo de tejer con escarcha. */
export const FROST_WEAVE = 2;
/** Nutrientes que come el gremio, en total, al terminar un mes de temporada fría (028). */
export const UPKEEP = 1;
/** Costo de revivir un árbol apagado. */
export const FADED_REVIVE = 7;
/** Sal del rng que agrega las rocas de Bosque y Ancestral sobre el claro de Brote de la misma semilla. */
export const LEVEL_SALT = 0x5eed019;

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
export const SCORE_VERSION = 8;
/** Estrellas por claro: 2 desde el 90 % y 3 desde el 110 % del puntaje del bot con criterio en ese claro. */
export const STARS = { two: 0.9, three: 1.1 } as const;
/** Segundos de juego por mes que se suponen para la partida de referencia del bot. */
export const REFERENCE_SECONDS_PER_MONTH = 25;

/**
 * Generador de mapas (cada partida nueva es un claro distinto). Un mapa solo se acepta si la
 * política de las pistas (`advise`) lo gana entre `minMonth` y `maxMonth`: ni regalado ni imposible.
 */
export const MAP_GEN = { trees: 7, logs: 5, rocks: 6, minMonth: 8, maxMonth: 11, attempts: 400, levelAttempts: 20, levelAttemptsOutside: 10 } as const;

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
