// Plaga (032, 035, 043) y red unida al Hogar (043): game-rules › Plaga y Red unida al Hogar; player-guidance › Avisos de la
// presión; story-presentation › Llega el frío.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, cloneState, endMonth, GAIN, guarded, LEVELS, plagueCount, plagueTarget, PLAGUE_REACH, producingCount, tile, type GameState, type Level, type Point } from '../src/rules';
import { initialState, reduce } from '../src/store';
import { INDI, setup, type Setup } from './helpers';

// Mapa clásico: Hogar (2,7), Árbol Padre (2,0), árbol gris en (2,5). Una red tejida hacia arriba por la columna 2.
const at = (level: Level, o: Setup = {}): GameState => ({ ...setup(o), level });
const NET: Point[] = [{ x: 2, y: 6 }, { x: 2, y: 4 }, { x: 2, y: 3 }];
const marked = (s: GameState) => s.tiles.filter((t) => t.blighted).map(({ x, y }) => ({ x, y }));
/** Pone plaga en casillas (marchitas si `withered`). */
const blight = (s: GameState, points: Point[], withered = false): GameState => {
  const n = cloneState(s);
  for (const p of points) {
    const t = n.tiles.find((tt) => tt.x === p.x && tt.y === p.y)!;
    t.blighted = true;
    if (withered) t.net = false;
  }
  return n;
};

describe('Requirement: Plaga', () => {
  it('Bosque tiene plaga en invierno y Ancestral en otoño e invierno; marca 1, 2 y 3 casillas según el mes de la estación (043); salva a 2 casillas', () => {
    expect([LEVELS.brote.plague, LEVELS.bosque.plague, LEVELS.ancestral.plague]).toEqual([[], [3], [2, 3]]);
    expect(PLAGUE_REACH).toBe(2);
    const counts = (level: Level) => Array.from({ length: 12 }, (_, i) => plagueCount(at(level), i + 1));
    expect(counts('ancestral')).toEqual([0, 0, 0, 0, 0, 0, 1, 2, 3, 1, 2, 3]);
    expect(counts('bosque')).toEqual([0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 2, 3]);
    expect(counts('brote')).toEqual(Array(12).fill(0));
  });

  it('Scenario: La plaga marca — al empezar el mes 7 en Ancestral se marca la casilla tejida más cercana al Hogar', () => {
    const { state, message } = endMonth(at('ancestral', { month: 6, net: NET }));
    expect(marked(state)).toEqual([{ x: 2, y: 6 }]);
    expect(message).toContain(es.log.plagueMarked(2));
  });

  it('Scenario: La plaga crece — al empezar el mes 8 marca dos casillas tejidas más, las más cercanas al Hogar', () => {
    const s = blight(at('ancestral', { month: 7, net: NET }), [{ x: 2, y: 6 }], true);
    const { state, message } = endMonth(s);
    expect(marked(state)).toEqual([{ x: 2, y: 3 }, { x: 2, y: 4 }, { x: 2, y: 6 }]);
    expect(message).toContain(es.log.plagueMarkedMany(2, 2));
  });

  it('sin casillas tejidas suficientes, marca las que hay', () => {
    const { state } = endMonth(at('ancestral', { month: 8, net: [{ x: 2, y: 6 }] }));
    expect(marked(state)).toEqual([{ x: 2, y: 6 }]);
  });

  it('al azar entre las más cercanas: el mismo claro y el mismo mes marcan siempre la misma', () => {
    const s = at('ancestral', { month: 7, net: [...NET, { x: 3, y: 7 }] });
    const home = s.tiles.find((t) => t.kind === 'home')!;
    const steps = (t: Point) => Math.abs(t.x - home.x) + Math.abs(t.y - home.y);
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

  it('Scenario: Se marchita — sin hongos cerca, la casilla sale de la red y sigue con plaga', () => {
    const { state, message } = endMonth(blight(at('ancestral', { month: 10, net: NET }), [{ x: 2, y: 3 }]));
    expect(tile(state, 2, 3)).toMatchObject({ kind: 'soil', net: false, blighted: true });
    expect(message).toContain(es.log.plagueWithered(PLAGUE_REACH));
  });

  it('Scenario: No se puede tejer — la casilla marchita rechaza al Lactarius', () => {
    const s = blight(at('ancestral', { month: 10, net: NET, nutrients: 4 }), [{ x: 2, y: 3 }], true);
    expect(() => act(s, INDI, 2, 3)).toThrow(es.reasons.plagueBlocks(PLAGUE_REACH));
  });

  it('Scenario: Se queda — otro mes sin hongos cerca, sigue con plaga y la bitácora no repite el aviso', () => {
    const { state, message } = endMonth(blight(at('ancestral', { month: 7, net: NET }), [{ x: 2, y: 3 }], true));
    expect(tile(state, 2, 3)).toMatchObject({ net: false, blighted: true });
    expect(message).not.toContain(es.log.plagueWithered(PLAGUE_REACH));
  });

  it('Scenario: Los hongos la limpian — un hongo a 2 casillas la deja como tierra que se puede tejer', () => {
    const s = blight(at('ancestral', { month: 7, net: NET, nutrients: 4 }), [{ x: 2, y: 3 }], true);
    // Indi teje (3,4), vecina de (2,4) y a 2 pasos de (2,3).
    const { state, message } = endMonth(act(s, INDI, 3, 4).state);
    expect(tile(state, 2, 3)).toMatchObject({ kind: 'soil', net: false });
    expect(tile(state, 2, 3)!.blighted).toBeUndefined();
    expect(message).toContain(es.log.plagueCleared);
    const again = act({ ...state, nutrients: 2 }, INDI, 2, 3).state;
    expect(tile(again, 2, 3)!.net).toBe(true);
  });

  it('Scenario: Dos plagas — la del otoño sigue cuando el invierno marca otra casilla', () => {
    const s = blight(at('ancestral', { month: 9, net: NET }), [{ x: 2, y: 3 }], true);
    expect(marked(endMonth(s).state)).toEqual([{ x: 2, y: 3 }, { x: 2, y: 6 }]);
  });

  it('Scenario: Los hongos la frenan — un hongo que trabajó a 2 casillas salva la casilla', () => {
    const s = blight(at('ancestral', { month: 7, net: NET, nutrients: 4 }), [{ x: 2, y: 3 }]);
    const worked = act(s, INDI, 3, 4).state;
    expect(guarded(worked, { x: 2, y: 3 })).toBe(true);
    const { state, message } = endMonth(worked);
    expect(tile(state, 2, 3)).toMatchObject({ net: true });
    expect(tile(state, 2, 3)!.blighted).toBeUndefined();
    expect(message).toContain(es.log.plagueStopped);
  });

  it('a 3 casillas ya no la salva', () => {
    const s = blight(at('ancestral', { month: 7, net: NET, nutrients: 4 }), [{ x: 2, y: 3 }]);
    // Indi teje (1,6), a 1 + 3 = 4 pasos de (2,3).
    const worked = act(s, INDI, 1, 6).state;
    expect(guarded(worked, { x: 2, y: 3 })).toBe(false);
    expect(tile(endMonth(worked).state, 2, 3)!.net).toBe(false);
  });

  it('Scenario: Bosque sin plaga — ni en otoño ni en Brote', () => {
    expect(marked(endMonth(at('bosque', { month: 6, net: NET })).state)).toEqual([]);
    expect(marked(endMonth(at('brote', { month: 9, net: NET })).state)).toEqual([]);
  });

  it('Scenario: Plaga del invierno en Bosque — al empezar el mes 10 marca la casilla tejida más cercana al Hogar', () => {
    const { state, message } = endMonth(at('bosque', { month: 9, net: NET }));
    expect(marked(state)).toEqual([{ x: 2, y: 6 }]);
    expect(message).toContain(es.log.plagueMarked(2));
  });
});

describe('Requirement: Red unida al Hogar', () => {
  // (2,5) es un árbol del clásico: la red (2,6) lo une al Hogar (2,7).
  const TREE: Point = { x: 2, y: 5 };

  it('Bosque y Ancestral piden la red unida; Brote no', () => {
    expect([LEVELS.brote.rooted, LEVELS.bosque.rooted, LEVELS.ancestral.rooted]).toEqual([false, true, true]);
  });

  it('Scenario: Árbol unido — produce al terminar el mes', () => {
    const s = at('bosque', { month: 3, alive: [TREE], net: [{ x: 2, y: 6 }] });
    expect(producingCount(s)).toBe(1);
    const { state, message } = endMonth(s);
    expect(state.nutrients).toBe(s.nutrients + GAIN.treeNutrients);
    expect(message).not.toContain(es.log.treesUnrooted(1));
  });

  it('Scenario: Árbol suelto — sin camino de red al Hogar no produce, y la bitácora lo dice', () => {
    const s = at('bosque', { month: 3, alive: [TREE] });
    expect(producingCount(s)).toBe(0);
    const { state, message } = endMonth(s);
    expect(state.nutrients).toBe(s.nutrients);
    expect(state.spores).toBe(s.spores);
    expect(message).toContain(es.log.treesUnrooted(1));
  });

  it('Scenario: La plaga corta la red — al marchitarse la casilla que unía al árbol, deja de producir', () => {
    const s = blight(at('ancestral', { month: 7, alive: [TREE], net: [{ x: 2, y: 6 }] }), [{ x: 2, y: 6 }]);
    const { state, message } = endMonth(s);
    expect(tile(state, 2, 6)!.net).toBe(false);
    expect(producingCount(state)).toBe(0);
    expect(message).toContain(es.log.treesUnrooted(1));
  });

  it('Scenario: Brote no pide la red unida', () => {
    const s = at('brote', { month: 3, alive: [TREE] });
    expect(producingCount(s)).toBe(1);
    expect(endMonth(s).state.nutrients).toBe(s.nutrients + GAIN.treeNutrients);
  });
});

describe('Requirement: Llega el frío (con plaga)', () => {
  it('la carta del frío suma la regla de la plaga que crece y de la red unida al Hogar: en Bosque, la del invierno; en Ancestral, la del otoño y el invierno', () => {
    const story = (level: Level) => reduce(initialState(at(level, { month: 6 })), { type: 'endMonth' }).ui.story;
    expect(story('ancestral')).toEqual({ kind: 'cold' });
    expect(story('bosque')).toEqual({ kind: 'cold' });
    expect(es.story.coldPlague(false)).toMatch(/^En otoño y en invierno, la plaga marca casillas de la red cerca del Hogar, cada mes más/);
    expect(es.story.coldPlague(true)).toMatch(/^En invierno, la plaga marca casillas/);
    expect(es.story.coldPlague(true)).toContain('Un árbol que la red ya no une al Hogar no da nada.');
  });
});

describe('Requirement: Avisos de la presión (plaga)', () => {
  it('tocar la casilla con plaga sin miembro seleccionado la explica', () => {
    const g = endMonth(at('ancestral', { month: 6, net: NET })).state;
    const s = reduce(initialState(g), { type: 'tapTile', x: 2, y: 6 });
    expect(s.ui.notice.text).toBe(es.tileHelp.plague);
    // Marchita, explica que no se puede tejer hasta limpiarla (035).
    const w = reduce(initialState(blight(g, [{ x: 2, y: 6 }], true)), { type: 'tapTile', x: 2, y: 6 });
    expect(w.ui.notice.text).toBe(es.tileHelp.plagueWithered);
  });
});
