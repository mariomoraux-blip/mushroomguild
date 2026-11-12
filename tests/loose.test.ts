// Árbol suelto (044): player-guidance › Avisos de la presión (aviso previo) y story-presentation › Un árbol suelto.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { cloneState, endMonth, looseAtRisk, type GameState, type Level, type Point } from '../src/rules';
import { initialState, reduce, type AppState } from '../src/store';
import { setup, type Setup } from './helpers';

// Mapa clásico: Hogar (2,7) y un árbol en (2,5); la red (2,6) lo une al Hogar.
const at = (level: Level, o: Setup = {}): GameState => ({ ...setup(o), level });
const TREE: Point = { x: 2, y: 5 };
const LINK: Point = { x: 2, y: 6 };
const blight = (s: GameState, p: Point): GameState => {
  const n = cloneState(s);
  n.tiles.find((t) => t.x === p.x && t.y === p.y)!.blighted = true;
  return n;
};
const end = (s: AppState) => reduce(s, { type: 'endMonth' });

describe('Requirement: Avisos de la presión (árbol suelto)', () => {
  it('Scenario: Aviso previo del árbol suelto — la plaga marca la única casilla que une el árbol al Hogar', () => {
    const { state, message } = endMonth(at('bosque', { month: 9, alive: [TREE], net: [LINK] }));
    expect(state.tiles.find((t) => t.x === LINK.x && t.y === LINK.y)!.blighted).toBe(true);
    expect(es.log.looseAtRisk(1, 1)).toBe('Si se marchita, un árbol quedará suelto y no dará nada.');
    expect(message).toContain(es.log.plagueMarked(2) + ' ' + es.log.looseAtRisk(1, 1));
  });

  it('cuenta los árboles en riesgo y concuerda con las casillas marcadas', () => {
    expect(looseAtRisk(blight(at('bosque', { alive: [TREE], net: [LINK] }), LINK))).toBe(1);
    expect(es.log.looseAtRisk(2, 3)).toBe('Si se marchitan, 2 árboles quedarán sueltos y no darán nada.');
  });

  it('sin árboles que dependan de esas casillas, o en Brote, no hay aviso', () => {
    const { message } = endMonth(at('ancestral', { month: 6, net: [LINK, { x: 2, y: 4 }] }));
    expect(message).not.toContain('quedará suelto');
    expect(looseAtRisk(blight(at('brote', { alive: [TREE], net: [LINK] }), LINK))).toBe(0);
  });
});

describe('Requirement: Un árbol suelto', () => {
  // Mes 8 de Ancestral: (2,6) con plaga se marchita al terminarlo y el árbol queda suelto.
  const cut = () => initialState(blight(at('ancestral', { month: 8, alive: [TREE], net: [LINK] }), LINK));

  it('Scenario: La plaga deja el primer árbol suelto — aparece la carta', () => {
    const s = end(cut());
    expect(s.ui.story).toEqual({ kind: 'loose' });
    expect(s.ui.looseShown).toBe(true);
  });

  it('Scenario: Otro árbol suelto — no aparece otra vez en la misma partida', () => {
    const s = cut();
    expect(end({ ...s, ui: { ...s.ui, looseShown: true } }).ui.story).toBeNull();
  });

  it('Scenario: Partida nueva — la carta vuelve a aparecer', () => {
    const shown = end(cut());
    const fresh = reduce(shown, { type: 'start', game: cut().game, intro: false });
    expect(fresh.ui.looseShown).toBeFalsy();
    expect(end(fresh).ui.story).toEqual({ kind: 'loose' });
  });

  it('con el frío en el mismo mes, la carta del árbol suelto va después', () => {
    const s = initialState(blight(at('bosque', { month: 6, alive: [TREE], net: [LINK] }), LINK));
    const a = end(s);
    expect(a.ui.story).toEqual({ kind: 'cold', then: { kind: 'loose' } });
    expect(reduce(a, { type: 'closeStory' }).ui.story).toEqual({ kind: 'loose' });
  });

  it('un árbol que ya estaba suelto no abre la carta', () => {
    expect(end(initialState(at('bosque', { month: 3, alive: [TREE] }))).ui.story).toBeNull();
  });
});
