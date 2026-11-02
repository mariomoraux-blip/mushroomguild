import { describe, expect, it } from 'vitest';
import { newGame, type GameState } from '../src/rules';
import { initialState, reduce, type AppState } from '../src/store';
import { progressSaturation, SATURATION_FLOOR } from '../src/scenes/paint';
import { RUBI, setup } from './helpers';

const run = (state: AppState, ...actions: Parameters<typeof reduce>[1][]) => actions.reduce(reduce, state);
const mother = (g: GameState) => g.tiles.find((t) => t.kind === 'mother')!;

/** Tres árboles vivos, 10 nutrientes y la red tocando al Árbol Padre: Rubí puede despertarlo. */
function nearWin(): GameState {
  const g = newGame();
  const m = mother(g);
  const trees = g.tiles.filter((t) => t.kind === 'tree').slice(0, 3);
  const near = g.tiles.filter((t) => t.kind === 'soil' && Math.abs(t.x - m.x) + Math.abs(t.y - m.y) === 1);
  return setup({ nutrients: 10, alive: trees.map(({ x, y }) => ({ x, y })), net: near.map(({ x, y }) => ({ x, y })) });
}

describe('Requirement: Intro', () => {
  it('Scenario: Saltar la intro — se cierra y la bitácora invita a elegir un miembro', () => {
    const s = initialState(newGame(), [], true);
    expect(s.ui.story).toEqual({ kind: 'intro', step: 0 });
    const skipped = run(s, { type: 'closeStory' });
    expect(skipped.ui.story).toBeNull();
    expect(skipped.ui.notice.text).toBe(s.ui.notice.text);
  });

  it('tres cartas: "Siguiente" avanza y la tercera cierra la intro', () => {
    const s = initialState(newGame(), [], true);
    expect(run(s, { type: 'storyNext' }).ui.story).toEqual({ kind: 'intro', step: 1 });
    expect(run(s, { type: 'storyNext' }, { type: 'storyNext' }).ui.story).toEqual({ kind: 'intro', step: 2 });
    expect(run(s, { type: 'storyNext' }, { type: 'storyNext' }, { type: 'storyNext' }).ui.story).toBeNull();
  });

  it('Esc (cancel) también cierra la carta', () => {
    expect(run(initialState(newGame(), [], true), { type: 'cancel' }).ui.story).toBeNull();
  });

  it('sin intro pedida, la partida empieza en el tablero', () => {
    expect(initialState(newGame()).ui.story).toBeNull();
  });
});

describe('Requirement: Llegada de la maga', () => {
  it('Scenario: Amanecer con la maga — al terminar el día en que llega, se abre su carta', () => {
    const g = { ...newGame(), mageDue: true };
    const next = run(initialState(g), { type: 'endDay' });
    expect(next.game.members.some((m) => m.species === 'mago')).toBe(true);
    expect(next.ui.story).toEqual({ kind: 'mage' });
  });

  it('un día normal no abre ninguna carta', () => {
    expect(run(initialState(newGame()), { type: 'endDay' }).ui.story).toBeNull();
  });
});

describe('Requirement: Finales', () => {
  it('Scenario: Victoria — al despertar al Árbol Padre se abre la carta de victoria', () => {
    const g = nearWin();
    const m = mother(g);
    const next = run(initialState(g), { type: 'select', id: RUBI }, { type: 'tapTile', x: m.x, y: m.y });
    expect(next.game.status).toBe('won');
    expect(next.ui.story).toEqual({ kind: 'won' });
  });

  it('Scenario: Fin del invierno — al terminar el día 12 se abre la carta del final suave', () => {
    const next = run(initialState({ ...newGame(), day: 12 }), { type: 'endDay' });
    expect(next.game.status).toBe('lost');
    expect(next.ui.story).toEqual({ kind: 'lost' });
  });

  it('"Ver el claro" cierra la carta y "Jugar de nuevo" empieza otra partida conservando las fichas vistas', () => {
    const lost = run(initialState({ ...newGame(), day: 12 }, ['champi']), { type: 'endDay' });
    expect(run(lost, { type: 'closeStory' }).ui.story).toBeNull();
    const again = run(lost, { type: 'restart', game: newGame() });
    expect(again.game.status).toBe('playing');
    expect(again.game.day).toBe(1);
    expect(again.ui.story).toBeNull();
    expect(again.ui.seen).toEqual(['champi']);
  });
});

describe('Requirement: El color vuelve', () => {
  it('Scenario: Inicio y final — apagado al empezar, color pleno al despertar al Árbol Padre', () => {
    const start = newGame();
    expect(progressSaturation(start)).toBeCloseTo(SATURATION_FLOOR, 5);
    const g = nearWin();
    const won = run(initialState(g), { type: 'select', id: RUBI }, { type: 'tapTile', x: mother(g).x, y: mother(g).y }).game;
    expect(progressSaturation(won)).toBeGreaterThan(progressSaturation(g));
    const allAlive = { ...won, tiles: won.tiles.map((t) => (t.kind === 'tree' ? { ...t, alive: true } : t)) };
    expect(progressSaturation(allAlive)).toBe(1);
  });

  it('cada árbol revivido suma color', () => {
    const t = newGame().tiles.find((tt) => tt.kind === 'tree')!;
    const one = setup({ alive: [{ x: t.x, y: t.y }] });
    expect(progressSaturation(one)).toBeGreaterThan(progressSaturation(newGame()));
  });
});
