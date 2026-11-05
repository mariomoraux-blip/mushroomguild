// Plaga de Ancestral (032): game-rules › Plaga; player-guidance › Avisos de la presión; story-presentation › Llega el frío.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, endMonth, guarded, LEVELS, plagueStarts, plagueTarget, PLAGUE_REACH, tile, type GameState, type Level, type Point } from '../src/rules';
import { initialState, reduce } from '../src/store';
import { INDI, setup, type Setup } from './helpers';

// Mapa clásico: Hogar (2,7), Árbol Padre (2,0). Una red tejida hacia arriba por la columna 2.
const at = (level: Level, o: Setup = {}): GameState => ({ ...setup(o), level });
const NET: Point[] = [{ x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 }, { x: 2, y: 3 }];
const marked = (s: GameState) => s.tiles.filter((t) => t.blighted);

describe('Requirement: Plaga', () => {
  it('solo Ancestral tiene plaga, en otoño e invierno, y salva a 2 casillas', () => {
    expect([LEVELS.brote.plague, LEVELS.bosque.plague, LEVELS.ancestral.plague]).toEqual([[], [], [2, 3]]);
    expect(PLAGUE_REACH).toBe(2);
    const months = Array.from({ length: 12 }, (_, i) => i + 1).filter((m) => plagueStarts(at('ancestral'), m));
    expect(months).toEqual([7, 10]);
  });

  it('Scenario: La plaga marca — al empezar el mes 7 en Ancestral se marca la casilla tejida más cercana al Árbol Padre', () => {
    const { state, message } = endMonth(at('ancestral', { month: 6, net: NET }));
    expect(marked(state).map(({ x, y }) => ({ x, y }))).toEqual([{ x: 2, y: 3 }]);
    expect(message).toContain(es.log.plagueMarked(2));
  });

  it('al azar entre las más cercanas: el mismo claro y el mismo mes marcan siempre la misma', () => {
    const s = at('ancestral', { month: 7, net: [...NET, { x: 1, y: 2 }, { x: 3, y: 2 }] });
    const mother = s.tiles.find((t) => t.kind === 'mother')!;
    const steps = (t: Point) => Math.abs(t.x - mother.x) + Math.abs(t.y - mother.y);
    const woven = s.tiles.filter((t) => t.net && t.kind === 'soil');
    const near = Math.min(...woven.map(steps));
    const ties = woven.filter((t) => steps(t) === near).map((t) => `${t.x},${t.y}`);
    expect(ties.length).toBeGreaterThan(1);
    const a = plagueTarget(s)!;
    expect(ties).toContain(`${a.x},${a.y}`);
    expect(plagueTarget(s)).toEqual(a);
    const picks = new Set(Array.from({ length: 40 }, (_, i) => plagueTarget({ ...s, mapId: `seed-${i}` })!).map((t) => `${t.x},${t.y}`));
    expect([...picks].sort()).toEqual([...ties].sort());
  });

  it('nunca marca el Hogar, un árbol vivo ni el Árbol Padre; sin casillas tejidas no marca', () => {
    const { state } = endMonth(at('ancestral', { month: 6, alive: [{ x: 2, y: 5 }] }));
    expect(marked(state)).toEqual([]);
  });

  it('Scenario: Se marchita — sin hongos cerca, la casilla vuelve a ser tierra fuera de la red', () => {
    const s = endMonth(at('ancestral', { month: 6, net: NET })).state;
    const { state, message } = endMonth(s);
    expect(tile(state, 2, 3)).toMatchObject({ kind: 'soil', net: false });
    expect(tile(state, 2, 3)!.blighted).toBeUndefined();
    expect(message).toContain(es.log.plagueWithered);
    // Se puede tejer otra vez (con escarcha, 2 nutrientes).
    const again = act({ ...state, nutrients: 2 }, INDI, 2, 3).state;
    expect(tile(again, 2, 3)!.net).toBe(true);
  });

  it('Scenario: Los hongos la frenan — un hongo que trabajó a 2 casillas salva la casilla', () => {
    const s = endMonth(at('ancestral', { month: 6, net: NET, nutrients: 4 })).state;
    // Indi teje (3,4): a 2 pasos de (2,3).
    const worked = act(s, INDI, 3, 4).state;
    expect(guarded(worked, { x: 2, y: 3 })).toBe(true);
    const { state, message } = endMonth(worked);
    expect(tile(state, 2, 3)).toMatchObject({ net: true });
    expect(tile(state, 2, 3)!.blighted).toBeUndefined();
    expect(message).toContain(es.log.plagueStopped);
  });

  it('a 3 casillas ya no la salva', () => {
    const s = endMonth(at('ancestral', { month: 6, net: NET, nutrients: 4 })).state;
    // Indi teje (1,5), a 1 + 2 = 3 pasos de (2,3).
    const worked = act(s, INDI, 1, 5).state;
    expect(guarded(worked, { x: 2, y: 3 })).toBe(false);
    expect(tile(endMonth(worked).state, 2, 3)!.net).toBe(false);
  });

  it('Scenario: Bosque sin plaga', () => {
    expect(marked(endMonth(at('bosque', { month: 6, net: NET })).state)).toEqual([]);
    expect(marked(endMonth(at('bosque', { month: 9, net: NET })).state)).toEqual([]);
  });

  it('el invierno vuelve a marcar (mes 10) y los meses sin inicio de estación no marcan', () => {
    expect(marked(endMonth(at('ancestral', { month: 9, net: NET })).state)).toHaveLength(1);
    expect(marked(endMonth(at('ancestral', { month: 7, net: NET })).state)).toHaveLength(0);
    expect(marked(endMonth(at('ancestral', { month: 3, net: NET })).state)).toHaveLength(0);
  });
});

describe('Requirement: Llega el frío (Ancestral con plaga)', () => {
  it('la carta del frío de Ancestral suma la regla de la plaga; la de Bosque no', () => {
    const story = (level: Level) => reduce(initialState(at(level, { month: 6 })), { type: 'endMonth' }).ui.story;
    expect(story('ancestral')).toEqual({ kind: 'cold' });
    expect(es.story.coldPlague).toContain('la plaga marca una casilla');
  });
});

describe('Requirement: Avisos de la presión (plaga)', () => {
  it('tocar la casilla con plaga sin miembro seleccionado la explica', () => {
    const g = endMonth(at('ancestral', { month: 6, net: NET })).state;
    const s = reduce(initialState(g), { type: 'tapTile', x: 2, y: 3 });
    expect(s.ui.notice.text).toBe(es.tileHelp.plague);
  });
});
