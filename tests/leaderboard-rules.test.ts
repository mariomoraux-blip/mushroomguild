import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import {
  aliasFor,
  firstCertified,
  isValidAlias,
  LEADERBOARD,
  newRandomGame,
  playAdvised,
  rankedSeed,
  rollAlias,
  SCORE_VERSION,
  scoreResult,
  thresholds,
  verifyResult,
  mulberry32,
  type ScoreResult,
} from '../src/rules';

/** Victoria real del bot con criterio sobre un claro, con un tiempo humano plausible. */
function botWin(seed: number, level: 'brote' | 'bosque' = 'brote', timeMs = 200_000): ScoreResult {
  const start = newRandomGame(seed, level);
  const final = playAdvised(start);
  expect(final.status).toBe('won');
  return scoreResult(final, timeMs, thresholds(start));
}

describe('Requirement: Alias generado', () => {
  it('Scenario: Sortear — «Otro nombre» da un alias distinto, formado con las listas del juego', () => {
    const a = aliasFor('token-a', 0);
    let n = 1;
    while (aliasFor('token-a', n) === a) n++;
    const b = aliasFor('token-a', n);
    expect(b).not.toBe(a);
    expect(isValidAlias(a)).toBe(true);
    expect(isValidAlias(b)).toBe(true);
    expect(a).toMatch(/^\S+ (del|de la) \S+$/);
  });

  it('es determinista por clave y contador', () => {
    expect(aliasFor('token-a', 3)).toBe(aliasFor('token-a', 3));
  });

  it('Scenario: Alias inventado — «xXx» no es válido', () => {
    expect(isValidAlias('xXx')).toBe(false);
    expect(isValidAlias('Bruno del Musgo ')).toBe(false);
    expect(isValidAlias(42)).toBe(false);
  });

  it('todas las combinaciones son alias válidos', () => {
    const rng = mulberry32(7);
    for (let i = 0; i < 200; i++) expect(isValidAlias(rollAlias(rng))).toBe(true);
    expect(es.leaderboard.alias.names.length * es.leaderboard.alias.places.length).toBe(576);
  });
});

describe('Requirement: Verificación en el servidor', () => {
  const win = botWin(1);

  it('Scenario: Victoria real — el resultado del bot verifica y se recalcula igual', () => {
    const v = verifyResult(JSON.parse(JSON.stringify(win)));
    expect(v.ok).toBe(true);
    if (v.ok) {
      expect(v.result.total).toBe(win.total);
      expect(v.result.stars).toBe(win.stars);
      expect(v.result.actionLog).toEqual(win.actionLog);
    }
  });

  it('Scenario: Total alterado — 100 puntos de más se rechazan', () => {
    expect(verifyResult({ ...win, total: win.total + 100 })).toEqual({ ok: false, reason: 'score' });
  });

  it('estrellas alteradas se rechazan', () => {
    expect(verifyResult({ ...win, stars: win.stars === 3 ? 1 : 3 })).toEqual({ ok: false, reason: 'score' });
  });

  it('Scenario: Tiempo imposible — menos de acciones × minMsPerAction', () => {
    const fast = win.actionLog.length * LEADERBOARD.minMsPerAction - 1;
    expect(verifyResult({ ...win, timeMs: fast })).toEqual({ ok: false, reason: 'time' });
    expect(verifyResult({ ...win, timeMs: LEADERBOARD.maxTimeMs + 1 })).toEqual({ ok: false, reason: 'time' });
  });

  it('un tiempo menor con su total recalculado verifica (el servidor solo acota el tiempo)', () => {
    const quick = botWin(1, 'brote', win.actionLog.length * LEADERBOARD.minMsPerAction);
    expect(verifyResult(quick).ok).toBe(true);
  });

  it('una versión vieja se rechaza con outdated', () => {
    expect(verifyResult({ ...win, scoringVersion: SCORE_VERSION - 1 })).toEqual({ ok: false, reason: 'outdated' });
  });

  it('un registro que no gana, con acciones de más o inválidas se rechaza', () => {
    expect(verifyResult({ ...win, actionLog: win.actionLog.slice(0, -1) })).toEqual({ ok: false, reason: 'replay' });
    expect(verifyResult({ ...win, actionLog: [...win.actionLog, { type: 'endMonth' }] })).toEqual({ ok: false, reason: 'replay' });
    expect(verifyResult({ ...win, wonMonth: win.wonMonth === 12 ? 11 : win.wonMonth + 1 })).toEqual({ ok: false, reason: 'replay' });
    const bad = win.actionLog.map((a, i) => (i === 0 && a.type === 'act' ? { ...a, x: (a.x + 2) % 5, y: (a.y + 3) % 8 } : a));
    expect(verifyResult({ ...win, actionLog: bad }).ok).toBe(false);
  });

  it('claros que no cuentan: clásico, depuración, semillas fuera de rango o no certificadas', () => {
    expect(verifyResult({ ...win, mapId: 'clasico' })).toEqual({ ok: false, reason: 'map' });
    expect(verifyResult({ ...win, mapId: 'debug' })).toEqual({ ok: false, reason: 'map' });
    expect(verifyResult({ ...win, mapId: 'seed-0' })).toEqual({ ok: false, reason: 'map' });
    expect(rankedSeed('seed-99999999999', 'brote')).toBeNull();
    expect(rankedSeed('seed-12', 'brote')).toBe(12);
    const certified = firstCertified('bosque');
    expect(rankedSeed(`seed-${certified}`, 'bosque')).toBe(certified);
    expect(rankedSeed('seed-100000', 'bosque')).toBeNull();
  });

  it('formas inválidas se rechazan con shape', () => {
    expect(verifyResult(null)).toEqual({ ok: false, reason: 'shape' });
    expect(verifyResult({ ...win, level: 'experto' })).toEqual({ ok: false, reason: 'shape' });
    expect(verifyResult({ ...win, actionLog: Array.from({ length: LEADERBOARD.maxLog + 1 }, () => ({ type: 'endMonth' })) })).toEqual({ ok: false, reason: 'shape' });
    expect(verifyResult({ ...win, actionLog: [{ type: 'hack' }] })).toEqual({ ok: false, reason: 'shape' });
    expect(verifyResult({ ...win, timeMs: Number.NaN })).toEqual({ ok: false, reason: 'shape' });
  });

  it('una victoria de Bosque sobre un claro certificado verifica', () => {
    const seed = firstCertified('bosque');
    const start = newRandomGame(seed, 'bosque');
    const final = playAdvised(start);
    if (final.status !== 'won') return; // el bot con criterio no siempre gana en Bosque
    expect(verifyResult(scoreResult(final, 300_000, thresholds(start))).ok).toBe(true);
  });
});
