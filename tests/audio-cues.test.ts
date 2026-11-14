import { describe, expect, it } from 'vitest';
import { ambientLevel, cuesFor, PENTATONIC, SPORES_AFTER_MONTH_MS, VICTORY_AFTER_AWAKEN_MS, type Cue } from '../src/audio-cues';
import { newGame, type GameState, type SpeciesId } from '../src/rules';
import { initialState, reduce, type Action, type AppState } from '../src/store';
import { BRUNO, INDI, RUBI, setup } from './helpers';

const ALL: SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];
const init = (g: GameState = newGame()) => initialState(g, ALL);

/** Aplica las acciones y devuelve las cues de la última (y el estado al que llega). */
function last(state: AppState, ...actions: Action[]): { cues: Cue[]; weaves: number; next: AppState } {
  let s = state;
  for (const a of actions.slice(0, -1)) s = reduce(s, a);
  const action = actions.at(-1)!;
  const next = reduce(s, action);
  return { ...cuesFor(s, next, action), next };
}
const ids = (cues: Cue[]) => cues.map((c) => c.id);

describe('Requirement: El sonido acompaña', () => {
  it('Scenario: Tejer suena — sfx-weave en la nota base y sin «tic» de interfaz', () => {
    const { cues, weaves } = last(init(), { type: 'select', id: INDI }, { type: 'tapTile', x: 2, y: 6 });
    expect(cues).toEqual([{ id: 'sfx-weave', step: 0, delay: 0 }]);
    expect(weaves).toBe(1);
  });

  it('cada tejido del mismo mes sube un grado de re mayor pentatónica; el mes nuevo vuelve a la base', () => {
    const s = reduce(init(), { type: 'select', id: INDI });
    const next = reduce(s, { type: 'tapTile', x: 2, y: 6 });
    expect(cuesFor(s, next, { type: 'tapTile', x: 2, y: 6 }, 2).cues[0]).toMatchObject({ id: 'sfx-weave', step: PENTATONIC[2] });
    expect(cuesFor(s, next, { type: 'tapTile', x: 2, y: 6 }, 99).cues[0]).toMatchObject({ step: 12 });
    const ended = reduce(next, { type: 'endMonth' });
    expect(cuesFor(next, ended, { type: 'endMonth' }, 3).weaves).toBe(0);
  });

  it('descomponer, revivir y despertar tienen su sonido', () => {
    expect(ids(last(init(), { type: 'select', id: BRUNO }, { type: 'tapTile', x: 1, y: 7 }).cues)).toContain('sfx-decompose');
    const g = newGame();
    const m = g.tiles.find((t) => t.kind === 'mother')!;
    const trees = g.tiles.filter((t) => t.kind === 'tree').slice(0, 3);
    const near = g.tiles.filter((t) => t.kind === 'soil' && Math.abs(t.x - m.x) + Math.abs(t.y - m.y) === 1);
    const won = setup({ nutrients: 10, alive: trees.map(({ x, y }) => ({ x, y })), net: near.map(({ x, y }) => ({ x, y })) });
    const { cues } = last(init(won), { type: 'select', id: RUBI }, { type: 'tapTile', x: m.x, y: m.y });
    expect(cues).toContainEqual({ id: 'sfx-awaken' });
    expect(cues.at(-1)).toEqual({ id: 'stg-victory', delay: VICTORY_AFTER_AWAKEN_MS });
  });

  it('Scenario: Toque que no se puede — sfx-invalid, sin cambiar el juego', () => {
    const { cues, next } = last(init(), { type: 'select', id: INDI }, { type: 'tapTile', x: 0, y: 0 });
    expect(next.ui.notice.tone).toBe('warn');
    expect(ids(cues)).toEqual(['sfx-invalid']);
  });

  it('reclutar sin esporas suena como «no se puede»; con esporas, el jingle', () => {
    expect(ids(last(init(), { type: 'recruit', species: 'morchella' }).cues)).toEqual(['sfx-invalid']);
    expect(ids(last(init(setup({ spores: 20 })), { type: 'recruit', species: 'morchella' }).cues)).toEqual(['sfx-recruit']);
  });

  it('terminar el mes: el bloque de madera y, cuando vuelan, las esporas de los árboles vivos', () => {
    const g = setup({ alive: [newGame().tiles.find((t) => t.kind === 'tree')!] });
    const { cues } = last(init(g), { type: 'endMonth' });
    expect(cues).toEqual([{ id: 'sfx-month-end' }, { id: 'sfx-spores', delay: SPORES_AFTER_MONTH_MS }]);
  });

  it('Scenario: Victoria — la cortina suena solo cuando la partida termina, no al volver a «Ver final»', () => {
    const lost = last(init({ ...newGame(), month: 12 }), { type: 'endMonth' });
    expect(ids(lost.cues)).toEqual(['sfx-month-end', 'stg-defeat']);
    const board = reduce(lost.next, { type: 'closeStory' });
    expect(ids(last(board, { type: 'showEnd' }).cues)).toEqual([]);
  });
});

describe('cues de interfaz', () => {
  it('elegir un miembro: ui-select; la ficha de Maestra Bruma que se abre sola no suma otro sonido', () => {
    expect(ids(last(init(), { type: 'select', id: INDI }).cues)).toEqual(['ui-select']);
    const mage = setup({ mage: true });
    const id = mage.members.find((m) => m.species === 'mago')!.id;
    expect(ids(last(init(mage), { type: 'select', id }).cues)).toEqual(['ui-select']);
  });

  it('hojas: abrir y cerrar con su sonido de pergamino', () => {
    expect(ids(last(init(), { type: 'openSheet', sheet: { kind: 'help' } }).cues)).toEqual(['ui-sheet-open']);
    expect(ids(last(init(), { type: 'openSheet', sheet: { kind: 'help' } }, { type: 'cancel' }).cues)).toEqual(['ui-sheet-close']);
  });

  it('tocar una casilla sin nadie elegido muestra su ayuda con un «tic»', () => {
    expect(ids(last(init(), { type: 'tapTile', x: 0, y: 0 }).cues)).toEqual(['ui-select']);
  });

  it('una partida nueva no suena como jugada', () => {
    expect(last(init(), { type: 'restart', game: newGame() }).cues).toEqual([]);
  });
});

describe('ambiente', () => {
  it('a −6 dB en la portada y en «Elige tu dificultad»; entero en el tablero', () => {
    const title = initialState(newGame(), [], { title: true });
    expect(ambientLevel(title)).toBe(0.5);
    expect(ambientLevel(reduce(title, { type: 'play' }))).toBe(0.5);
    expect(ambientLevel(init())).toBe(1);
  });
});
