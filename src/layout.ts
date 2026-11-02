import { H, W } from './rules';

/** Tamaño máximo de casilla (escritorio). */
export const MAX_TILE = 96;

/** Lado de casilla en px CSS para que el tablero de W×H quepa completo en el área disponible. */
export function tileSize(areaWidth: number, areaHeight: number): number {
  return Math.max(0, Math.min(MAX_TILE, Math.floor(Math.min(areaWidth / W, areaHeight / H))));
}

/** Esquina superior izquierda de la casilla (x, y) en px CSS dentro del tablero. */
export function tileToScreen(x: number, y: number, tile: number): { left: number; top: number } {
  return { left: x * tile, top: y * tile };
}
