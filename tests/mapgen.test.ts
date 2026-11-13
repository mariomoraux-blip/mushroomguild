import { describe, expect, it } from 'vitest';
import { generateMap, H, MAP_GEN, newRandomGame, W } from '../src/rules';

const count = (map: readonly string[], ch: string) => map.join('').split(ch).length - 1;

describe('Requirement: Tablero inicial (claros aleatorios)', () => {
  it('Scenario: Claros distintos — cambian con la semilla y siempre tienen 7 árboles, Hogar abajo y Árbol Ancestral arriba', () => {
    const maps = [1, 2, 3, 4, 5].map(generateMap);
    expect(new Set(maps.map((m) => m.join('/'))).size).toBe(5);
    for (const m of maps) {
      expect(m).toHaveLength(H);
      m.forEach((row) => expect(row).toHaveLength(W));
      expect(count(m, 'T')).toBe(MAP_GEN.trees);
      expect(m[H - 1]).toContain('H');
      expect(m[0]).toContain('M');
      expect(m[0]!.indexOf('M')).toBeGreaterThanOrEqual(1);
      expect(m[0]!.indexOf('M')).toBeLessThanOrEqual(3);
    }
  });

  it('Scenario: Misma semilla — el mapa es idéntico', () => {
    expect(generateMap(42)).toEqual(generateMap(42));
  });

  it('Scenario: Partida nueva — mes 1, 2 nutrientes, 0 esporas y solo el Hogar en la red, también en claros generados', () => {
    const s = newRandomGame(9);
    expect([s.month, s.nutrients, s.spores]).toEqual([1, 2, 0]);
    expect(s.tiles.filter((t) => t.net).map((t) => t.kind)).toEqual(['home']);
    // Un tronco junto al Hogar: el Champiñón tiene trabajo el mes 1.
    const home = s.tiles.find((t) => t.kind === 'home')!;
    expect(s.tiles.some((t) => t.kind === 'log' && Math.abs(t.x - home.x) + Math.abs(t.y - home.y) === 1)).toBe(true);
  });
});
