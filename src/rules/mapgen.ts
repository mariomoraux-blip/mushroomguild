import { playAdvised, playExpert } from './autoplay';
import { H, LEVEL_SALT, LEVELS, MAP, MAP_GEN, TREES_FOR_MOTHER, W } from './config';
import { LEVEL_SEEDS } from './level-seeds';
import { mulberry32 } from './rng';
import { newGame } from './state';
import type { GameState, Level } from './types';

type Rng = () => number;
const int = (rng: Rng, n: number) => Math.floor(rng() * n);
const DIRS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
] as const;

/**
 * Un intento de mapa (filas de texto como `MAP`): Hogar en la fila inferior y Árbol Padre en la
 * superior (columna 1–3), un tronco junto al Hogar, árboles a 2 o más casillas del Hogar y rocas
 * en las filas intermedias. Devuelve `null` si la red no podría llegar al Árbol Padre o a algún árbol.
 */
export function roughMap(rng: Rng): string[] | null {
  const g: string[][] = Array.from({ length: H }, () => Array<string>(W).fill('.'));
  const home = { x: 1 + int(rng, W - 2), y: H - 1 };
  const mother = { x: 1 + int(rng, W - 2), y: 0 };
  g[home.y]![home.x] = 'H';
  g[mother.y]![mother.x] = 'M';
  const free = (x: number, y: number) => g[y]?.[x] === '.';
  const place = (ch: string, ok: (x: number, y: number) => boolean, n: number) => {
    for (let i = 0, tries = 0; i < n && tries < 500; tries++) {
      const x = int(rng, W);
      const y = int(rng, H);
      if (free(x, y) && ok(x, y)) {
        g[y]![x] = ch;
        i++;
      }
    }
  };
  // Un tronco junto al Hogar (primer trabajo del Champiñón).
  const [dx, dy] = DIRS.filter(([ddx, ddy]) => free(home.x + ddx, home.y + ddy))[int(rng, 3)] ?? [1, 0];
  if (free(home.x + dx, home.y + dy)) g[home.y + dy]![home.x + dx] = 'L';
  const far = (x: number, y: number) => Math.abs(x - home.x) + Math.abs(y - home.y) >= 2;
  place('T', far, MAP_GEN.trees);
  place('R', (_x, y) => y > 0 && y < H - 1, MAP_GEN.rocks);
  place('L', () => true, MAP_GEN.logs - 1);

  const rows = g.map((row) => row.join(''));
  return reachable(rows) ? rows : null;
}

/** ¿La red puede llegar desde el Hogar al Árbol Padre y a todos los árboles? Todo lo que no es roca es transitable. */
export function reachable(map: readonly string[]): boolean {
  const find = (ch: string) => {
    const y = map.findIndex((row) => row.includes(ch));
    return { x: map[y]!.indexOf(ch), y };
  };
  const home = find('H');
  const mother = find('M');
  const seen = new Set<string>([`${home.x},${home.y}`]);
  const queue = [home];
  while (queue.length) {
    const p = queue.shift()!;
    for (const [ddx, ddy] of DIRS) {
      const x = p.x + ddx;
      const y = p.y + ddy;
      if (x < 0 || y < 0 || x >= W || y >= H || seen.has(`${x},${y}`) || map[y]![x] === 'R') continue;
      seen.add(`${x},${y}`);
      queue.push({ x, y });
    }
  }
  if (!seen.has(`${mother.x},${mother.y}`)) return false;
  const trees = map.flatMap((row, y) => [...row].map((c, x) => (c === 'T' ? `${x},${y}` : null))).filter(Boolean);
  return trees.length >= TREES_FOR_MOTHER + 2 && trees.every((t) => seen.has(t!));
}

/** ¿El mapa se gana siguiendo las pistas, ni muy pronto ni muy tarde? */
export function isFairMap(map: readonly string[]): boolean {
  const end = playAdvised(newGame(map));
  return end.status === 'won' && end.wonMonth! >= MAP_GEN.minMonth && end.wonMonth! <= MAP_GEN.maxMonth;
}

/** Mapa aleatorio y justo para una semilla (o el clásico si no aparece ninguno). */
export function generateMap(seed: number): readonly string[] {
  const rng = mulberry32(seed);
  for (let i = 0; i < MAP_GEN.attempts; i++) {
    const map = roughMap(rng);
    if (map && isFairMap(map)) return map;
  }
  return MAP;
}

/** Claro de Brote de una semilla: el clásico con la semilla 0. */
const broteMap = (seed: number): readonly string[] => (seed === 0 ? MAP : generateMap(seed));

/**
 * Intentos de rocas extra de un nivel sobre el claro de Brote (019): cada intento elige `rocks − 6` casillas de
 * tierra libres (nunca el Hogar, sus vecinas ni las vecinas del Árbol Padre) con `mulberry32(seed ^ LEVEL_SALT)`.
 * Devuelve el primer intento que `accept` acepta, con su número, o `null`.
 */
export function levelAttempt(
  seed: number,
  level: Exclude<Level, 'brote'>,
  accept: (map: readonly string[], i: number) => boolean,
  attempts: number = MAP_GEN.levelAttempts,
): { map: readonly string[]; index: number } | null {
  const base = broteMap(seed);
  const find = (ch: string) => {
    const y = base.findIndex((row) => row.includes(ch));
    return { x: base[y]!.indexOf(ch), y };
  };
  const home = find('H');
  const mother = find('M');
  const near = (p: { x: number; y: number }, x: number, y: number) => Math.abs(p.x - x) + Math.abs(p.y - y) <= 1;
  const free: { x: number; y: number }[] = [];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (base[y]![x] === '.' && !near(home, x, y) && !near(mother, x, y)) free.push({ x, y });
  const rng = mulberry32((seed ^ LEVEL_SALT) >>> 0);
  for (let i = 0; i < attempts; i++) {
    const pool = [...free];
    const g = base.map((row) => [...row]);
    for (let k = 0; k < LEVELS[level].rocks - MAP_GEN.rocks && pool.length; k++) {
      const p = pool.splice(int(rng, pool.length), 1)[0]!;
      g[p.y]![p.x] = 'R';
    }
    const map = g.map((row) => row.join(''));
    if (accept(map, i)) return { map, index: i };
  }
  return null;
}

/**
 * Claro de una semilla en un nivel. En Brote, el de siempre. En Bosque y Ancestral, el de Brote con más rocas,
 * aceptado si la red llega a todo y el bot experto lo gana: para las semillas de `LEVEL_SEEDS` la aceptación ya
 * está calculada (con `certify`, que en el teléfono sería lenta); para las demás se juegan hasta
 * `MAP_GEN.levelAttemptsOutside` intentos con `playExpert`. Si ningún intento sirve, el primer claro certificado del
 * nivel (031: el clásico ya no se gana en Ancestral). La semilla 0 (`?map=clasico`) es el clásico con las rocas
 * certificadas o, si no hay, tal cual.
 */
export function levelMap(seed: number, level: Level): readonly string[] {
  if (level === 'brote') return broteMap(seed);
  const fallback = () => (seed === 0 ? MAP : levelMap(firstCertified(level), level));
  const known = LEVEL_SEEDS[level].charAt(seed);
  if (known === '-') return fallback();
  const hit = known
    ? levelAttempt(seed, level, (_map, i) => i === parseInt(known, 36))
    : levelAttempt(seed, level, (map) => reachable(map) && playExpert(newGame(map, `seed-${seed}`, level)).status === 'won', MAP_GEN.levelAttemptsOutside);
  return hit?.map ?? fallback();
}

/** Primera semilla (desde la 1) con claro certificado en el nivel. */
export const firstCertified = (level: Exclude<Level, 'brote'>): number => [...LEVEL_SEEDS[level]].findIndex((c, i) => i > 0 && c !== '-');

/** Semilla para una partida nueva: en Brote cualquiera; en Bosque y Ancestral, una de la tabla certificada. */
export function randomSeed(level: Level, now: number): number {
  if (level === 'brote') return (now % 2147483647) + 1;
  const table = LEVEL_SEEDS[level];
  const seeds = [...table].flatMap((c, i) => (i > 0 && c !== '-' ? [i] : []));
  return seeds[now % seeds.length]!;
}

/** Partida nueva sobre un claro generado con la semilla dada (la 0 es el clásico). */
export function newRandomGame(seed: number, level: Level = 'brote'): GameState {
  return newGame(levelMap(seed, level), seed === 0 ? 'clasico' : `seed-${seed}`, level);
}
