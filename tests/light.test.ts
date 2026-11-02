import { describe, expect, it } from 'vitest';
import { cloneState, newGame, treeTotal, type GameState } from '../src/rules';
import { grade, gradeMatrix, mixGrade, saturation, stageLight } from '../src/scenes/light';
import { SATURATION, SEASON_LIGHT } from '../src/theme';

const withTrees = (n: number, father = false): GameState => {
  const s = cloneState(newGame());
  s.tiles.filter((t) => t.kind === 'tree').slice(0, n).forEach((t) => (t.alive = true));
  if (father) s.tiles.find((t) => t.kind === 'mother')!.alive = true;
  return s;
};
const onDay = (day: number): GameState => ({ ...newGame(), day });

describe('Requirement: El color vuelve', () => {
  it('Scenario: Inicio y final — casi gris al empezar, color pleno al despertar al Árbol Padre', () => {
    expect(saturation(newGame())).toBeCloseTo(SATURATION.min);
    expect(saturation(withTrees(3, true))).toBe(1);
  });

  it('cada árbol revivido suma color: 0,15 + 0,85 × vivos / (árboles + 2)', () => {
    const total = treeTotal(newGame());
    const values = Array.from({ length: total + 1 }, (_, n) => saturation(withTrees(n)));
    expect(values[1]).toBeCloseTo(0.15 + 0.85 / (total + 2));
    for (let i = 1; i < values.length; i++) expect(values[i]!).toBeGreaterThan(values[i - 1]!);
    expect(values[total]!).toBeLessThan(1);
  });
});

describe('Requirement: La luz sigue a las estaciones', () => {
  it('cada estación usa su hora: mañana, mediodía, atardecer, anochecer', () => {
    expect([1, 4, 7, 10].map((d) => stageLight(onDay(d)).light.hour)).toEqual(['mañana', 'mediodía', 'atardecer', 'anochecer']);
  });

  it('Scenario: Otoño — el día 7 usa el atardecer y el follaje vivo es naranja', () => {
    const l = stageLight(onDay(7));
    expect(l.light).toBe(SEASON_LIGHT[2]);
    expect(l.light.foliage[0]).toBe('leafAutumn');
  });

  it('Scenario: Invierno — el día 10 usa el anochecer y el micelio brilla al máximo', () => {
    const l = stageLight(onDay(10));
    expect(l.light.hour).toBe('anochecer');
    expect(l.light.mycelium).toBe(Math.max(...SEASON_LIGHT.map((s) => s.mycelium)));
    expect(l.light.brightness).toBe(Math.min(...SEASON_LIGHT.map((s) => s.brightness)));
  });

  it('el brillo del micelio crece de 0,2 a 1,0 con las estaciones', () => {
    expect(SEASON_LIGHT.map((s) => s.mycelium)).toEqual([0.2, 0.4, 0.65, 1]);
  });
});

describe('gradación', () => {
  it('con saturación 1, sin tinte ni brillo, la matriz es la identidad', () => {
    const g = { ...grade(stageLight(withTrees(0, true))), tint: [1, 1, 1] as const, brightness: 1 };
    expect(gradeMatrix(g).map((v) => Math.round(v * 1e6) / 1e6)).toEqual([1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0]);
  });

  it('con saturación 0 las tres filas dan la misma luminancia (gris)', () => {
    const g = { ...grade(stageLight(newGame())), saturation: 0, tint: [1, 1, 1] as const, brightness: 1 };
    const m = gradeMatrix(g);
    expect(m.slice(0, 3)).toEqual(m.slice(5, 8));
    expect(m.slice(0, 3)).toEqual(m.slice(10, 13));
  });

  it('la transición interpola de una estación a otra', () => {
    const a = grade(stageLight(onDay(9)));
    const b = grade(stageLight(onDay(10)));
    expect(mixGrade(a, b, 0)).toEqual(a);
    expect(mixGrade(a, b, 1)).toEqual(b);
    expect(mixGrade(a, b, 0.5).mycelium).toBeCloseTo((a.mycelium + b.mycelium) / 2);
  });
});
