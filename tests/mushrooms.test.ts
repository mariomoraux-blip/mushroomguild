// Hongos para reclutar (039): game-rules › Reclutar, Romper rocas, Curar a distancia, Soplar esporas.
import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { diffEffects } from '../src/effects';
import { act, idleReason, RECRUITABLE, recruit, RuleError, STARTING_GUILD, tile, validTargets, type GameState } from '../src/rules';
import { idOf, setup, type Setup } from './helpers';

// Mapa clásico: Hogar (2,7); árboles (1,0) (4,1) (0,3) (2,5) (4,6); rocas (2,2) (4,2) (0,4) (1,4) (3,5).
const withSpecies = (species: 'morchella' | 'ganoderma' | 'lycoperdon', o: Setup = {}): [GameState, number] => {
  const s = setup({ ...o, extraMembers: [species] });
  return [s, idOf(s, species)];
};

describe('Requirement: Reclutar (039)', () => {
  it('Scenario: Los del inicio no se reclutan — se elige entre Gliophorus, Morchella, Ganoderma y Lycoperdon', () => {
    expect(RECRUITABLE).toEqual(['gliophorus', 'morchella', 'ganoderma', 'lycoperdon']);
    expect(STARTING_GUILD.some((sp) => (RECRUITABLE as readonly string[]).includes(sp))).toBe(false);
  });

  it('Scenario: Una de cada especie — con Panal en el gremio, otra Morchella se rechaza', () => {
    const s = recruit(setup({ spores: 10 }), 'morchella').state;
    expect(s.members.at(-1)!.name).toBe('Panal');
    expect(() => recruit(s, 'morchella')).toThrow(new RuleError('Ya hay una Morchella en el gremio.'));
    expect(() => recruit(recruit(s, 'ganoderma').state, 'ganoderma')).toThrow(new RuleError('Ya hay un Ganoderma en el gremio.'));
  });

  it('los reclutas nuevos se llaman Panal, Ámbar y Pompón', () => {
    let s = setup({ spores: 15 });
    for (const sp of ['morchella', 'ganoderma', 'lycoperdon'] as const) s = recruit(s, sp).state;
    expect(s.members.slice(3).map((m) => m.name)).toEqual(['Panal', 'Ámbar', 'Pompón']);
  });
});

describe('Requirement: Romper rocas (Morchella esculenta)', () => {
  const NET = [{ x: 2, y: 6 }, { x: 3, y: 6 }];

  it('Scenario: Rompe una roca — queda tierra fuera de la red y bajan 2 nutrientes', () => {
    const [s, panal] = withSpecies('morchella', { nutrients: 2, net: NET });
    const { state, message } = act(s, panal, 3, 5);
    expect(tile(state, 3, 5)).toMatchObject({ kind: 'soil', net: false });
    expect(state.nutrients).toBe(0);
    expect(message).toBe(es.log.brokeRock('extra-4'));
  });

  it('Scenario: Roca lejos — se rechaza', () => {
    const [s, panal] = withSpecies('morchella', { nutrients: 2, net: NET });
    expect(() => act(s, panal, 2, 2)).toThrow('Muy lejos: la roca debe tocar la red.');
  });

  it('Scenario: Sin nutrientes — se rechaza con el costo', () => {
    const [s, panal] = withSpecies('morchella', { nutrients: 1, net: NET });
    expect(() => act(s, panal, 3, 5)).toThrow(new RuleError('Faltan nutrientes: romper una roca cuesta 2.', 'nutrients'));
  });

  it('solo rompe rocas; sin rocas junto a la red dice por qué no trabaja', () => {
    const [s, panal] = withSpecies('morchella', { nutrients: 5 });
    expect(() => act(s, panal, 2, 6)).toThrow(es.reasons.morchellaNeedsRock);
    expect(idleReason(s, panal)).toBe('noRocks');
  });

  it('la roca rota se ve: se parte en polvo y queda tierra', () => {
    const [s, panal] = withSpecies('morchella', { nutrients: 2, net: NET });
    expect(diffEffects(s, act(s, panal, 3, 5).state)).toContainEqual(expect.objectContaining({ kind: 'crumble', at: { x: 3, y: 5 } }));
  });
});

describe('Requirement: Curar a distancia (Ganoderma lucidum)', () => {
  it('Scenario: Cura sin que la red lo toque — el árbol a 2 pasos entra a la red; bajan 3 nutrientes y 1 espora', () => {
    const [s, ambar] = withSpecies('ganoderma', { nutrients: 3, spores: 1, net: [{ x: 3, y: 7 }] });
    const { state, message } = act(s, ambar, 4, 6);
    expect(tile(state, 4, 6)).toMatchObject({ alive: true, net: true });
    expect([state.nutrients, state.spores]).toEqual([0, 0]);
    expect(message).toBe(es.log.healed('extra-4'));
    expect(diffEffects(s, state)).toContainEqual({ kind: 'thread', from: { x: 3, y: 7 }, to: { x: 4, y: 6 } });
  });

  it('Scenario: Demasiado lejos — a 3 pasos se rechaza', () => {
    const [s, ambar] = withSpecies('ganoderma', { nutrients: 3, spores: 1 });
    expect(() => act(s, ambar, 4, 6)).toThrow('Muy lejos: el Ganoderma cura árboles a 2 casillas o menos de la red.');
  });

  it('Scenario: Sin espora — se rechaza', () => {
    const [s, ambar] = withSpecies('ganoderma', { nutrients: 3, spores: 0, net: [{ x: 3, y: 7 }] });
    expect(() => act(s, ambar, 4, 6)).toThrow(new RuleError('Falta 1 espora: curar a distancia cuesta 1.', 'spores'));
    expect(idleReason(s, ambar)).toBe('noHealSpores');
  });

  it('no despierta al Árbol Padre ni cura árboles vivos', () => {
    const [s, ambar] = withSpecies('ganoderma', { nutrients: 20, spores: 2, net: [{ x: 2, y: 1 }], alive: [{ x: 2, y: 5 }] });
    expect(validTargets(s, ambar).some((t) => t.kind === 'mother')).toBe(false);
    expect(() => act(s, ambar, 2, 5)).toThrow(es.reasons.treeAlive);
  });

  it('Scenario: Limpia la plaga — la casilla marchita vuelve a ser tierra sin plaga y baja 1 espora', () => {
    const [base, ambar] = withSpecies('ganoderma', { spores: 1, net: [{ x: 2, y: 6 }, { x: 2, y: 5 }, { x: 2, y: 4 }] });
    const s: GameState = { ...base, level: 'ancestral', tiles: base.tiles.map((t) => (t.x === 2 && t.y === 3 ? { ...t, blighted: true } : t)) };
    const { state, message } = act(s, ambar, 2, 3);
    expect(tile(state, 2, 3)!.blighted).toBeUndefined();
    expect(tile(state, 2, 3)).toMatchObject({ kind: 'soil', net: false });
    expect(state.spores).toBe(0);
    expect(message).toBe(es.log.plagueHealed('extra-4'));
  });
});

describe('Requirement: Soplar esporas (Lycoperdon perlatum)', () => {
  it('Scenario: Sopla — baja 1 nutriente y suben 2 esporas, desde el árbol', () => {
    const [s, pompon] = withSpecies('lycoperdon', { nutrients: 1, spores: 0, alive: [{ x: 2, y: 5 }] });
    const { state } = act(s, pompon, 2, 5);
    expect([state.nutrients, state.spores]).toEqual([0, 2]);
    expect(diffEffects(s, state)).toContainEqual({ kind: 'spores', from: [{ x: 2, y: 5 }], amount: 2, leaves: 0 });
  });

  it('Scenario: Sin árbol vivo — se rechaza', () => {
    const [s, pompon] = withSpecies('lycoperdon', { nutrients: 1 });
    expect(() => act(s, pompon, 2, 6)).toThrow('El Lycoperdon sopla esporas desde un árbol vivo.');
    expect(idleReason(s, pompon)).toBe('noLiveTrees');
  });

  it('Scenario: Sin nutriente — se rechaza', () => {
    const [s, pompon] = withSpecies('lycoperdon', { nutrients: 0, alive: [{ x: 2, y: 5 }] });
    expect(() => act(s, pompon, 2, 5)).toThrow(new RuleError('Falta 1 nutriente para soplar esporas.', 'nutrients'));
  });
});
