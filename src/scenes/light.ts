// Luz del escenario a partir del estado: estación, saturación del progreso y brillo del micelio.
// Puro (sin Phaser ni DOM): lo usan GameScene y el fondo vivo, y se prueba con Vitest.
import { motherTile, revivedCount, seasonIndex, treeTotal, type GameState } from '../rules';
import { SATURATION, SEASON_LIGHT, vec3, type SeasonLight } from '../theme';

export interface StageLight {
  readonly season: number;
  readonly light: SeasonLight;
  /** 0 = gris, 1 = color pleno. */
  readonly saturation: number;
}

/**
 * Saturación = 0,15 + 0,85 × vivos / (árboles del claro + 2) durante la partida, y color pleno al
 * despertar al Árbol Padre (spec › El color vuelve).
 */
export function saturation(game: GameState): number {
  if (motherTile(game).alive) return SATURATION.max;
  const total = treeTotal(game) + 2;
  return SATURATION.min + (SATURATION.max - SATURATION.min) * (revivedCount(game) / total);
}

export function stageLight(game: GameState): StageLight {
  const season = seasonIndex(game.day);
  return { season, light: SEASON_LIGHT[season] ?? SEASON_LIGHT[0], saturation: saturation(game) };
}

/** Valores numéricos que se interpolan en la transición de luz. */
export interface Grade {
  readonly saturation: number;
  readonly brightness: number;
  readonly tint: readonly [number, number, number];
  readonly skyTop: readonly [number, number, number];
  readonly skyBottom: readonly [number, number, number];
  readonly mycelium: number;
}

export function grade(s: StageLight): Grade {
  return {
    saturation: s.saturation,
    brightness: s.light.brightness,
    tint: vec3(s.light.tint),
    skyTop: vec3(s.light.sky[0]),
    skyBottom: vec3(s.light.sky[1]),
    mycelium: s.light.mycelium,
  };
}

const lerp = (a: number, b: number, t: number) => a * (1 - t) + b * t; // exacto en t = 0 y t = 1
const lerp3 = (a: readonly number[], b: readonly number[], t: number) =>
  [lerp(a[0]!, b[0]!, t), lerp(a[1]!, b[1]!, t), lerp(a[2]!, b[2]!, t)] as const;

export function mixGrade(a: Grade, b: Grade, t: number): Grade {
  return {
    saturation: lerp(a.saturation, b.saturation, t),
    brightness: lerp(a.brightness, b.brightness, t),
    tint: lerp3(a.tint, b.tint, t),
    skyTop: lerp3(a.skyTop, b.skyTop, t),
    skyBottom: lerp3(a.skyBottom, b.skyBottom, t),
    mycelium: lerp(a.mycelium, b.mycelium, t),
  };
}

export const sameGrade = (a: Grade, b: Grade): boolean => JSON.stringify(a) === JSON.stringify(b);

/**
 * Matriz de color 4×5 (formato de Phaser, desplazamientos en 0–255): primero la saturación del
 * progreso (luminancia Rec. 709), después tinte × brillo de la estación.
 */
export function gradeMatrix(g: Grade): number[] {
  const s = g.saturation;
  const lr = 0.2126, lg = 0.7152, lb = 0.0722;
  const sat = [
    [lr * (1 - s) + s, lg * (1 - s), lb * (1 - s)],
    [lr * (1 - s), lg * (1 - s) + s, lb * (1 - s)],
    [lr * (1 - s), lg * (1 - s), lb * (1 - s) + s],
  ];
  const rows: number[] = [];
  for (let i = 0; i < 3; i++) {
    const k = g.tint[i]! * g.brightness;
    const r = sat[i]!;
    rows.push(r[0]! * k, r[1]! * k, r[2]! * k, 0, 0);
  }
  rows.push(0, 0, 0, 1, 0);
  return rows;
}
