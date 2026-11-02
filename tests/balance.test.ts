import { describe, expect, it } from 'vitest';
import { generateMap, MAP, MAP_GEN, mulberry32, newGame, newRandomGame, playAdvised, TREES_FOR_MOTHER } from '../src/rules';
import { playGame, randomDay } from './bots';

// Balance como test (game-rules › Dificultad medida). Semillas fijas: resultados reproducibles.
const MAPS = 100;
const RANDOM_GAMES_PER_MAP = 10;

describe('balance en claros generados', () => {
  const maps = Array.from({ length: MAPS }, (_, i) => generateMap(i + 1));

  it(`las pistas ganan los ${MAPS} mapas entre el día ${MAP_GEN.minDay} y el ${MAP_GEN.maxDay}, con día medio entre 8 y 10`, () => {
    const days = maps.map((m) => {
      const end = playAdvised(newGame(m));
      expect(end.status).toBe('won');
      return end.wonDay!;
    });
    const avg = days.reduce((a, b) => a + b, 0) / days.length;
    console.info(`[balance] pistas: 100 % de victorias · día medio ${avg.toFixed(1)} · mapas de respaldo ${maps.filter((m) => m === MAP).length}`);
    expect(Math.min(...days)).toBeGreaterThanOrEqual(MAP_GEN.minDay);
    expect(Math.max(...days)).toBeLessThanOrEqual(MAP_GEN.maxDay);
    expect(avg).toBeGreaterThanOrEqual(8);
    expect(avg).toBeLessThanOrEqual(10);
  }, 120_000);

  it('el bot al azar gana entre el 5 % y el 30 %', () => {
    const rng = mulberry32(2026);
    let wins = 0;
    for (const m of maps) for (let k = 0; k < RANDOM_GAMES_PER_MAP; k++) if (playGame(newGame(m), randomDay(rng)).status === 'won') wins++;
    const rate = wins / (MAPS * RANDOM_GAMES_PER_MAP);
    console.info(`[balance] bot al azar: victorias ${(rate * 100).toFixed(1)} %`);
    expect(rate).toBeGreaterThanOrEqual(0.05);
    expect(rate).toBeLessThanOrEqual(0.3);
  }, 120_000);

  it('el mapa clásico del Capítulo 1 también se gana siguiendo las pistas', () => {
    const end = playAdvised(newGame());
    console.info(`[balance] mapa clásico: ${end.status} el día ${end.wonDay ?? end.day}`);
    expect(end.status).toBe('won');
  });

  it(`despertar al Árbol Padre exige ${TREES_FOR_MOTHER} árboles revividos`, () => {
    expect(TREES_FOR_MOTHER).toBe(3);
    expect(newRandomGame(7).status).toBe('playing');
  });
});
