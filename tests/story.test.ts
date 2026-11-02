import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, advise, endDay, newGame, type GameState, type SpeciesId } from '../src/rules';
import { initialState, reduce, type Action, type AppState } from '../src/store';
import { setup } from './helpers';

const ALL: SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];
const run = (s: AppState, ...actions: Action[]) => actions.reduce(reduce, s);
const playing = (g: GameState): AppState => initialState(g, ALL);

describe('Requirement: Intro', () => {
  it('una partida nueva abre con tres cartas, de una frase cada una', () => {
    const s = initialState(newGame(), ALL, true);
    expect(s.ui.story).toEqual({ kind: 'intro', page: 0 });
    expect(es.story.intro).toHaveLength(3);
    for (const card of es.story.intro) expect(card.text.split(/[.!?]\s/).length).toBe(1);
    const pages = [1, 2].map((n) => run(s, ...Array<Action>(n).fill({ type: 'storyNext' })).ui.story);
    expect(pages).toEqual([{ kind: 'intro', page: 1 }, { kind: 'intro', page: 2 }]);
    expect(run(s, { type: 'storyNext' }, { type: 'storyNext' }, { type: 'storyNext' }).ui.story).toBeNull();
  });

  it('Scenario: Saltar la intro — se cierra y la bitácora invita a elegir un miembro', () => {
    for (const close of [{ type: 'storyClose' }, { type: 'cancel' }] as Action[]) {
      const s = run(initialState(newGame(), ALL, true), close);
      expect(s.ui.story).toBeNull();
      expect(s.ui.notice).toEqual({ text: es.hints.pickMember, tone: 'info' });
    }
  });

  it('con una carta abierta, el resto del juego espera', () => {
    const s = initialState(newGame(), ALL, true);
    expect(run(s, { type: 'select', id: 1 })).toBe(s);
    expect(run(s, { type: 'endDay' })).toBe(s);
  });
});

describe('Requirement: Llegada dla maga', () => {
  it('Scenario: Amanecer con la maga — al empezar el día en que llega se abre su carta', () => {
    const due = setup({ alive: [{ x: 0, y: 3 }] });
    const s = run(playing({ ...due, mageDue: true }), { type: 'endDay' });
    expect(s.game.mageArrived).toBe(true);
    expect(s.ui.story).toEqual({ kind: 'mage' });
    expect(es.story.mage.text).toBe('El bosque volvió a hablar, y alguien escuchó.');
    expect(es.story.mage.spells).toHaveLength(2);
    expect(run(s, { type: 'storyNext' }).ui.story).toBeNull();
  });
});

describe('Requirement: Finales', () => {
  it('Scenario: Victoria — al despertar al Árbol Padre se abre la carta con el día y los árboles', () => {
    const near = playAdvisedUntilAwaken();
    const amanita = near.game.members.find((m) => m.species === 'amanita' && !m.used)!;
    const mother = near.game.tiles.find((t) => t.kind === 'mother')!;
    const s = run(near, { type: 'select', id: amanita.id }, { type: 'tapTile', x: mother.x, y: mother.y });
    expect(s.game.status).toBe('won');
    expect(s.ui.story).toEqual({ kind: 'won' });
    expect(es.story.won.text(s.game.wonDay!)).toBe(`El Árbol Padre despertó en el día ${s.game.wonDay}.`);
  });

  it('Scenario: Fin del invierno — al pasar a lost se abre la carta con la pista', () => {
    const s = run(playing(setup({ day: 12 })), { type: 'endDay' });
    expect(s.game.status).toBe('lost');
    expect(s.ui.story).toEqual({ kind: 'lost' });
    expect(es.story.lost.text).toBe('El bosque esperará la próxima primavera.');
    expect(es.story.lost.tip).toMatch(/temprano/);
  });

  it('«Ver el claro» cierra la carta; «Jugar otra vez» empieza una partida sin intro', () => {
    const over = run(playing(setup({ day: 12 })), { type: 'endDay' });
    expect(run(over, { type: 'storyClose' }).ui.story).toBeNull();
    const fresh = newGame();
    for (const from of [over, run(over, { type: 'storyClose' })]) {
      const again = run(from, { type: 'playAgain', game: fresh });
      expect(again.game).toBe(fresh);
      expect(again.ui.story).toBeNull();
      expect(again.ui.seen).toEqual(ALL);
    }
  });
});

/** Estado jugando con la Amanita lista para despertar al Árbol Padre (siguiendo las pistas). */
function playAdvisedUntilAwaken(): AppState {
  let g = newGame();
  for (let guard = 0; g.status === 'playing' && guard < 1000; guard++) {
    const a = advise(g);
    if (a.kind === 'awaken') return playing(g);
    if (a.kind === 'over') break;
    g = a.kind === 'endDay' ? endDay(g).state : a.kind === 'recruit' ? reduce(playing(g), { type: 'recruit', species: a.species }).game : act(g, a.memberId, a.target.x, a.target.y).state;
  }
  throw new Error('las pistas no llegaron a despertar al Árbol Padre');
}
