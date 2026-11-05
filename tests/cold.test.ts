// Temporadas frías (028, 030) y Árbol Padre de Ancestral (031): game-rules › Temporadas frías, Despertar al Árbol Padre y Niveles de dificultad;
// story-presentation › Llega el frío; player-guidance › Avisos de la presión.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, endMonth, LEVELS, motherCost, motherTrees, type GameState, type Level } from '../src/rules';
import { initialState, reduce } from '../src/store';
import { RUBI, setup, type Setup } from './helpers';

const at = (level: Level, o: Setup = {}): GameState => ({ ...setup(o), level });
const TREE = { x: 2, y: 5 };

describe('Requirement: Temporadas frías', () => {
  it('Scenario: El gremio come en otoño — 1 árbol y 3 nutrientes dejan 3 y nadie con hambre', () => {
    const s = at('bosque', { month: 7, nutrients: 3, alive: [TREE], extraMembers: ['champi'] });
    const { state, message } = endMonth(s);
    expect(state.nutrients).toBe(3);
    expect(state.members.every((m) => !m.used && !m.hungry)).toBe(true);
    expect(message).toContain(es.log.guildAte(1));
  });

  it('Scenario: No hay nutrientes — el primero en llegar descansa con hambre y el mes siguiente vuelve', () => {
    const s = at('ancestral', { month: 8, nutrients: 0 });
    const { state, message } = endMonth(s);
    expect(state.nutrients).toBe(0);
    expect(state.members.map((m) => Boolean(m.hungry))).toEqual([true, false, false]);
    expect(state.members.map((m) => m.used)).toEqual([true, false, false]);
    expect(message).toContain(es.log.hungry([state.members[0]!.name]));
    expect(message).not.toContain(es.log.guildAte(1));
    const next = endMonth({ ...state, month: 7, nutrients: 5 }).state;
    expect(next.members.every((m) => !m.used && !m.hungry)).toBe(true);
  });

  it('Maestra Bruma nunca se queda con hambre aunque haya llegado primero a la lista', () => {
    const s = at('bosque', { month: 7, nutrients: 0, mage: true });
    const mageFirst = { ...s, members: [s.members.at(-1)!, ...s.members.slice(0, -1)] };
    const state = endMonth(mageFirst).state;
    expect(state.members.find((m) => m.species === 'mago')!.hungry).toBeFalsy();
    expect(state.members.filter((m) => m.hungry)).toHaveLength(1);
  });

  it('Scenario: Invierno sin esporas — al terminar el mes 9 los árboles solo dan nutrientes y la bitácora lo avisa', () => {
    const s = at('bosque', { month: 9, nutrients: 10, alive: [TREE, { x: 4, y: 6 }] });
    const { state, message } = endMonth(s);
    expect(state.spores).toBe(s.spores);
    // Los árboles dan 2 nutrientes y el gremio come 1 (el mes 9 es de otoño).
    expect(state.nutrients).toBe(11);
    expect(message).toContain(es.log.guildAte(1));
    expect(message).toContain(es.log.sporelessStart);
    expect(message).toContain(es.log.treesGave(0, 2));
  });

  it('Scenario: Otoño con esporas — al terminar el mes 6 los árboles dan esporas y nutrientes', () => {
    const s = at('bosque', { month: 6, nutrients: 0, alive: [TREE, { x: 4, y: 6 }] });
    const { state } = endMonth(s);
    expect(state.spores).toBe(s.spores + 2);
    expect(state.nutrients).toBe(2);
  });

  it('Scenario: El verano no hace comer — terminar el mes 6 en Ancestral no gasta nutrientes', () => {
    expect(endMonth(at('ancestral', { month: 6, nutrients: 4 })).state.nutrients).toBe(4);
  });

  it('en invierno el gremio también come — el mes 11 en Bosque gasta 1', () => {
    expect(endMonth(at('bosque', { month: 11, nutrients: 4 })).state.nutrients).toBe(3);
  });

  it('terminar el mes 12 es el final: no se come', () => {
    const s = at('bosque', { month: 12, nutrients: 4 });
    expect(endMonth(s).state).toMatchObject({ status: 'lost', nutrients: 4 });
  });

  it('Scenario: Brote no come — el mes 11 da esporas y nutrientes como siempre', () => {
    const s = at('brote', { month: 11, nutrients: 0, alive: [TREE] });
    const { state } = endMonth(s);
    expect(state.nutrients).toBe(1);
    expect(state.spores).toBe(s.spores + 1);
    expect(state.members.every((m) => !m.used)).toBe(true);
  });
});

describe('Requirement: Despertar al Árbol Padre', () => {
  it('el Árbol Padre pide 3 árboles y 10 nutrientes en Brote y Bosque, y 4 árboles y 12 nutrientes en Ancestral', () => {
    expect([LEVELS.brote.mother, LEVELS.bosque.mother, LEVELS.ancestral.mother]).toEqual([10, 10, 12]);
    expect([LEVELS.brote.motherTrees, LEVELS.bosque.motherTrees, LEVELS.ancestral.motherTrees]).toEqual([3, 3, 4]);
    expect([motherCost(at('ancestral')), motherTrees(at('ancestral'))]).toEqual([12, 4]);
  });

  // En el mapa clásico la red toca al Árbol Padre (2,0) desde (2,1); los árboles son (1,0), (4,1), (0,3), (2,5) y (4,6).
  const THREE = [TREE, { x: 4, y: 6 }, { x: 0, y: 3 }];
  const FOUR = [...THREE, { x: 4, y: 1 }];
  const awaken = (s: GameState) => {
    const mother = s.tiles.find((t) => t.kind === 'mother')!;
    return act(s, RUBI, mother.x, mother.y);
  };

  it('Scenario: Diez nutrientes en Bosque — con 9 se rechaza y con 10 se gana', () => {
    const s = at('bosque', { nutrients: 9, net: [{ x: 2, y: 1 }], alive: THREE });
    expect(() => awaken(s)).toThrow(es.reasons.motherCost(10));
    expect(awaken({ ...s, nutrients: 10 }).state.status).toBe('won');
  });

  it('Scenario: Ancestral pide cuatro árboles — con 3 se rechaza aunque haya 12 nutrientes', () => {
    expect(() => awaken(at('ancestral', { nutrients: 12, net: [{ x: 2, y: 1 }], alive: THREE }))).toThrow(es.reasons.forestSilent(4));
  });

  it('Scenario: Doce nutrientes en Ancestral — con 4 árboles y 11 se rechaza; con 12 se gana', () => {
    const s = at('ancestral', { nutrients: 11, net: [{ x: 2, y: 1 }], alive: FOUR });
    expect(() => awaken(s)).toThrow(es.reasons.motherCost(12));
    expect(awaken({ ...s, nutrients: 12 }).state.status).toBe('won');
  });
});

describe('Requirement: Llega el frío', () => {
  const end = (g: GameState) => reduce(initialState(g), { type: 'endMonth' });

  it('Scenario: Empieza el otoño en Bosque — aparece la carta del frío', () => {
    expect(end(at('bosque', { month: 6 })).ui.story).toEqual({ kind: 'cold' });
    expect(end(at('bosque', { month: 5 })).ui.story).toBeNull();
    expect(end(at('bosque', { month: 7 })).ui.story).toBeNull();
  });

  it('Scenario: Empieza el invierno en Bosque — no aparece otra vez la carta', () => {
    expect(end(at('bosque', { month: 9 })).ui.story).toBeNull();
  });

  it('Scenario: Llegan la maga y el frío — primero la maga, al cerrarla la del frío', () => {
    const g = { ...at('ancestral', { month: 6 }), mageDue: true };
    const s = end(g);
    expect(s.ui.story).toEqual({ kind: 'mage', then: { kind: 'cold' } });
    const after = reduce(s, { type: 'closeStory' });
    expect(after.ui.story).toEqual({ kind: 'cold' });
    expect(reduce(after, { type: 'closeStory' }).ui.story).toBeNull();
    // Esc también pasa a la siguiente carta.
    expect(reduce(s, { type: 'cancel' }).ui.story).toEqual({ kind: 'cold' });
  });

  it('Scenario: Brote sin carta', () => {
    expect(end(at('brote', { month: 6 })).ui.story).toBeNull();
  });
});
