import { playAdvised } from './autoplay';
import { H, MAP, MAP_GEN, TREES_FOR_MOTHER, W } from './config';
import { mulberry32 } from './rng';
import { newGame } from './state';
import type { GameState } from './types';

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

  // Alcance: todo lo que no es roca es transitable para la red (troncos y árboles acaban en ella).
  const seen = new Set<string>([`${home.x},${home.y}`]);
  const queue = [home];
  while (queue.length) {
    const p = queue.shift()!;
    for (const [ddx, ddy] of DIRS) {
      const x = p.x + ddx;
      const y = p.y + ddy;
      if (x < 0 || y < 0 || x >= W || y >= H || seen.has(`${x},${y}`) || g[y]![x] === 'R') continue;
      seen.add(`${x},${y}`);
      queue.push({ x, y });
    }
  }
  if (!seen.has(`${mother.x},${mother.y}`)) return null;
  const trees = g.flatMap((row, y) => row.map((c, x) => (c === 'T' ? `${x},${y}` : null))).filter(Boolean);
  if (trees.length < TREES_FOR_MOTHER + 2 || trees.some((t) => !seen.has(t!))) return null;
  return g.map((row) => row.join(''));
}

/** ¿El mapa se gana siguiendo las pistas, ni muy pronto ni muy tarde? */
export function isFairMap(map: readonly string[]): boolean {
  const end = playAdvised(newGame(map));
  return end.status === 'won' && end.wonDay! >= MAP_GEN.minDay && end.wonDay! <= MAP_GEN.maxDay;
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

/** Partida nueva sobre un claro generado con la semilla dada. */
export function newRandomGame(seed: number): GameState {
  return newGame(generateMap(seed));
}
