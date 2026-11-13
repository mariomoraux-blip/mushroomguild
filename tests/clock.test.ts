import { describe, expect, it } from 'vitest';
import { formatClock, newClock, pause, read, resume, sync } from '../src/clock';
import { recordKey, readBest, saveIfBest } from '../src/records';
import { newGame, SCORE_VERSION, type ScoreResult } from '../src/rules';
import { clockShouldRun, initialState, reduce, type AppState } from '../src/store';
import { BRUNO } from './helpers';

const run = (s: AppState, ...a: Parameters<typeof reduce>[1][]) => a.reduce(reduce, s);

describe('Requirement: Cronómetro', () => {
  it('cuenta solo mientras corre y se puede pausar y reanudar', () => {
    let c = resume(newClock(), 1000);
    expect(read(c, 4000)).toBe(3000);
    c = pause(c, 4000);
    expect(read(c, 60_000)).toBe(3000);
    c = sync(c, true, 60_000);
    expect(read(c, 61_500)).toBe(4500);
    expect(formatClock(75_000)).toBe('01:15');
    expect(formatClock(3_725_000)).toBe('62:05');
  });

  it('Scenario: Antes de la primera acción — no corre hasta que el tablero acepta una acción', () => {
    const start = initialState(newGame());
    expect(clockShouldRun(start, true)).toBe(false);
    const acted = run(start, { type: 'select', id: BRUNO }, { type: 'tapTile', x: 1, y: 7 });
    expect(clockShouldRun(acted, true)).toBe(true);
  });

  it('Scenario: Carta u hoja abierta — se pausa con cualquier hoja, carta o pantalla y con la pestaña oculta', () => {
    const acted = run(initialState(newGame()), { type: 'select', id: BRUNO }, { type: 'tapTile', x: 1, y: 7 });
    expect(clockShouldRun(acted, false)).toBe(false);
    expect(clockShouldRun(run(acted, { type: 'openSheet', sheet: { kind: 'recruit' } }), true)).toBe(false);
    expect(clockShouldRun(run(acted, { type: 'openSheet', sheet: { kind: 'creature', species: 'champi' } }), true)).toBe(false);
    expect(clockShouldRun(run(acted, { type: 'openSheet', sheet: { kind: 'help' } }), true)).toBe(false);
    expect(clockShouldRun(run(acted, { type: 'openScreen', screen: { kind: 'guild', back: 'game' } }), true)).toBe(false);
    expect(clockShouldRun({ ...acted, ui: { ...acted.ui, story: { kind: 'mage' } } }, true)).toBe(false);
  });

  it('Scenario: Fin de la partida — se detiene al ganar o al perder', () => {
    const acted = run(initialState(newGame()), { type: 'select', id: BRUNO }, { type: 'tapTile', x: 1, y: 7 });
    expect(clockShouldRun({ ...acted, game: { ...acted.game, status: 'won' } }, true)).toBe(false);
    expect(clockShouldRun({ ...acted, game: { ...acted.game, status: 'lost' } }, true)).toBe(false);
  });
});

describe('Requirement: Mejor resultado local', () => {
  const result = (total: number, mapId = 'seed-7', level: ScoreResult['level'] = 'brote'): ScoreResult => ({
    scoringVersion: SCORE_VERSION, mapId, level, wonMonth: 9, timeMs: 200_000, total, stars: 2,
    breakdown: { victory: 500, months: 0, trees: 0, reserves: 0, guild: 0, activity: 0, variety: 0, time: 0 }, actionLog: [],
  });
  const memory = () => {
    const m = new Map<string, string>();
    return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => void m.set(k, v), m };
  };

  it('Scenario: Primer resultado de un claro — se guarda sin "Nuevo récord"', () => {
    const st = memory();
    expect(saveIfBest(result(2000), st)).toEqual({ newRecord: false });
    expect(st.m.has(recordKey('seed-7'))).toBe(true);
    expect(recordKey('seed-7')).toBe(`gremio.best.v${SCORE_VERSION}.seed-7`);
  });

  it('Scenario: Nuevo récord — solo al superar el récord guardado del mismo mapId', () => {
    const st = memory();
    saveIfBest(result(2000), st);
    expect(saveIfBest(result(1900), st)).toEqual({ newRecord: false });
    expect(readBest('seed-7', st)?.total).toBe(2000);
    expect(saveIfBest(result(2100), st)).toEqual({ newRecord: true });
    expect(readBest('seed-7', st)?.total).toBe(2100);
    expect(saveIfBest(result(9999, 'seed-8'), st)).toEqual({ newRecord: false }); // otro claro
  });

  it('Scenario: Récord entre niveles — un solo récord por claro, con el total ya multiplicado', () => {
    const st = memory();
    saveIfBest(result(2000, 'seed-1', 'brote'), st);
    expect(saveIfBest(result(4000, 'seed-1', 'ancestral'), st)).toEqual({ newRecord: true });
    expect(readBest('seed-1', st)).toMatchObject({ total: 4000, level: 'ancestral' });
  });

  it('Scenario: Almacenamiento que falla — no lanza y no hay récord', () => {
    const broken = { getItem: () => { throw new Error('bloqueado'); }, setItem: () => { throw new Error('lleno'); } };
    expect(readBest('seed-7', broken)).toBeNull();
    expect(saveIfBest(result(2000), broken)).toEqual({ newRecord: false });
  });

  it('Scenario: Estado de depuración — no se lee ni se guarda récord', () => {
    const st = memory();
    expect(saveIfBest(result(2000, 'debug'), st)).toEqual({ newRecord: false });
    expect(st.m.size).toBe(0);
  });
});
