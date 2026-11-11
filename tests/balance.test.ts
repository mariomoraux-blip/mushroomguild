import { describe, expect, it } from 'vitest';
import { certify, generateMap, LEVELS, levelMap, MAP, MAP_GEN, mulberry32, newGame, newRandomGame, playAdvised, stars, thresholds, TREES_FOR_MOTHER } from '../src/rules';
import { LEVEL_SEEDS } from '../src/rules/level-seeds';
import { playGame, randomMonth } from './bots';

// Balance como test (game-rules › Dificultad medida). Semillas fijas: resultados reproducibles.
const MAPS = 100;
const RANDOM_GAMES_PER_MAP = 10;

describe('balance en claros generados', () => {
  const maps = Array.from({ length: MAPS }, (_, i) => generateMap(i + 1));

  it(`las pistas ganan los ${MAPS} mapas entre el mes ${MAP_GEN.minMonth} y el ${MAP_GEN.maxMonth}, con mes medio entre 8 y 10`, () => {
    const months = maps.map((m) => {
      const end = playAdvised(newGame(m));
      expect(end.status).toBe('won');
      return end.wonMonth!;
    });
    const avg = months.reduce((a, b) => a + b, 0) / months.length;
    console.info(`[balance] pistas: 100 % de victorias · mes medio ${avg.toFixed(1)} · mapas de respaldo ${maps.filter((m) => m === MAP).length}`);
    expect(Math.min(...months)).toBeGreaterThanOrEqual(MAP_GEN.minMonth);
    expect(Math.max(...months)).toBeLessThanOrEqual(MAP_GEN.maxMonth);
    expect(avg).toBeGreaterThanOrEqual(8);
    expect(avg).toBeLessThanOrEqual(10);
  }, 120_000);

  it('el bot al azar gana entre el 5 % y el 30 %', () => {
    const rng = mulberry32(2026);
    let wins = 0;
    for (const m of maps) for (let k = 0; k < RANDOM_GAMES_PER_MAP; k++) if (playGame(newGame(m), randomMonth(rng)).status === 'won') wins++;
    const rate = wins / (MAPS * RANDOM_GAMES_PER_MAP);
    console.info(`[balance] bot al azar: victorias ${(rate * 100).toFixed(1)} %`);
    expect(rate).toBeGreaterThanOrEqual(0.05);
    expect(rate).toBeLessThanOrEqual(0.3);
  }, 120_000);

  it('el mapa clásico del Capítulo 1 también se gana siguiendo las pistas', () => {
    const end = playAdvised(newGame());
    console.info(`[balance] mapa clásico: ${end.status} el mes ${end.wonMonth ?? end.month}`);
    expect(end.status).toBe('won');
  });

  it(`despertar al Árbol Padre exige ${TREES_FOR_MOTHER} árboles revividos`, () => {
    expect(TREES_FOR_MOTHER).toBe(3);
    expect(newRandomGame(7).status).toBe('playing');
  });
});

describe('estrellas por claro (015)', () => {
  it('en cada claro el bot con criterio saca 2 estrellas, y calibrar tarda menos de 100 ms', () => {
    let slowest = 0;
    for (let seed = 1; seed <= 100; seed++) {
      const start = newRandomGame(seed);
      const t0 = performance.now();
      const th = thresholds(start);
      slowest = Math.max(slowest, performance.now() - t0);
      expect(th.reference).toBeGreaterThan(0);
      expect(stars(th.reference, th)).toBe(2);
    }
    console.info(`[balance] calibración por claro: máx ${slowest.toFixed(1)} ms (Node)`);
    expect(slowest).toBeLessThan(100);
  }, 120_000);
});

// 019 · Dificultad por nivel, sobre las semillas 1 a 100 de la tabla certificada (`level-seeds.ts`).
const TARGETS = {
  // 039: con los hongos nuevos (sobre todo el Ganoderma, un segundo sanador) las pistas ganan más; se ensanchan los rangos.
  // 041: con cuatro reclutas, Bosque sube a 9 rocas y 11 nutrientes, Ancestral a 11 rocas y 13; las pistas vuelven a los rangos de antes de 039.
  bosque: { hints: [0.55, 0.7], random: 0.1, certified: 90 }, // 028: invierno duro
  // 031: con el Árbol Padre en 4 árboles y 12 nutrientes se certifican 85 de los 100 primeros (905 de 1000); solo se sirven esos.
  // 034: un árbol se apaga cada dos meses; se certifican 86 de los 100 primeros (861 de 1000) y las pistas bajan a 10–25 %.
  // 041: con 11 rocas y 13 nutrientes se certifican 77 de los 100 primeros; el piso baja a 75.
  ancestral: { hints: [0.1, 0.25], random: 0.05, certified: 75 },
} as const;

describe.each(['bosque', 'ancestral'] as const)('balance en %s', (level) => {
  const seeds = Array.from({ length: MAPS }, (_, i) => i + 1).filter((seed) => LEVEL_SEEDS[level][seed] !== '-');
  const starts = seeds.map((seed) => newRandomGame(seed, level));

  it('el bot experto gana todos los claros aceptados', () => {
    console.info(`[balance] ${level} · certificados: ${seeds.length} de ${MAPS}`);
    expect(seeds.length).toBeGreaterThanOrEqual(TARGETS[level].certified);
    for (const start of starts) expect(certify(start)?.status).toBe('won');
  }, 120_000);

  it(`la política de las pistas gana entre el ${TARGETS[level].hints[0] * 100} % y el ${TARGETS[level].hints[1] * 100} %`, () => {
    const rate = starts.filter((s) => playAdvised(s).status === 'won').length / starts.length;
    console.info(`[balance] ${level} · pistas: ${(rate * 100).toFixed(0)} %`);
    expect(rate).toBeGreaterThanOrEqual(TARGETS[level].hints[0]);
    expect(rate).toBeLessThanOrEqual(TARGETS[level].hints[1]);
  }, 120_000);

  it(`el bot al azar gana como máximo el ${TARGETS[level].random * 100} %`, () => {
    const rng = mulberry32(2026);
    let wins = 0;
    for (const s of starts) for (let k = 0; k < RANDOM_GAMES_PER_MAP; k++) if (playGame(s, randomMonth(rng)).status === 'won') wins++;
    const rate = wins / (starts.length * RANDOM_GAMES_PER_MAP);
    console.info(`[balance] ${level} · bot al azar: ${(rate * 100).toFixed(1)} %`);
    expect(rate).toBeLessThanOrEqual(TARGETS[level].random);
  }, 120_000);

  it('generar un claro tarda menos de 75 ms en Node (300 ms con la CPU ×4) en la tabla y menos de 200 ms fuera de ella', () => {
    const slowest = (list: readonly number[]) =>
      Math.max(...list.map((seed) => {
        const t0 = performance.now();
        newRandomGame(seed, level);
        return performance.now() - t0;
      }));
    const inTable = slowest(seeds.slice(0, 30));
    // Fuera de la tabla (solo con ?seed= mayor que 1000) el bot experto juega cada intento (028: más rechazos).
    const outside = slowest([5001, 5002, 5003, 5004, 5005]);
    console.info(`[balance] ${level} · generar un claro: máx ${inTable.toFixed(1)} ms en la tabla, ${outside.toFixed(1)} ms fuera (Node)`);
    expect(inTable).toBeLessThan(75);
    expect(outside).toBeLessThan(200);
  });

  it('el claro es el de Brote con las rocas del nivel sobre casillas de tierra', () => {
    for (const seed of seeds.slice(0, 20)) {
      const brote = generateMap(seed);
      const lv = levelMap(seed, level);
      const diff = lv.flatMap((row, y) => [...row].map((c, x) => [c, brote[y]![x]!] as const)).filter(([a, b]) => a !== b);
      expect(diff).toHaveLength(LEVELS[level].rocks - MAP_GEN.rocks);
      expect(diff.every(([a, b]) => a === 'R' && b === '.')).toBe(true);
    }
  });
});
