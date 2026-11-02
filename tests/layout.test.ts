import { describe, expect, it } from 'vitest';
import { MAX_TILE, tileSize, tileToScreen } from '../src/layout';

describe('layout', () => {
  it('la casilla es la mayor que deja el tablero 5×8 completo, sin pasar de 96 px', () => {
    expect(tileSize(370, 640)).toBe(74); // limita el ancho
    expect(tileSize(370, 472)).toBe(59); // limita el alto
    expect(tileSize(2000, 2000)).toBe(MAX_TILE);
    expect(tileSize(0, 0)).toBe(0);
  });

  it('tileToScreen ubica cada casilla por columna y fila', () => {
    expect(tileToScreen(2, 7, 60)).toEqual({ left: 120, top: 420 });
  });
});
