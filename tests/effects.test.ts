import { describe, expect, it } from 'vitest';
import { act, endMonth, newGame, newRandomGame, validTargets, type GameState } from '../src/rules';
import { diffEffects } from '../src/effects';
import { INDI, BRUNO, idOf, RUBI, setup } from './helpers';

const first = (g: GameState, id: number) => validTargets(g, id)[0]!;
const kinds = (prev: GameState, next: GameState) => diffEffects(prev, next).map((e) => e.kind);

describe('Requirement: Respuesta a cada acción', () => {
  it('Scenario: Tejer — el micelio nuevo crece desde una casilla vecina de la red', () => {
    const g = newGame();
    const t = first(g, INDI);
    const fx = diffEffects(g, act(g, INDI, t.x, t.y).state);
    expect(fx).toHaveLength(1);
    const [weave] = fx;
    expect(weave).toMatchObject({ kind: 'weave', at: { x: t.x, y: t.y } });
    if (weave?.kind !== 'weave') throw new Error('sin tejido');
    expect(weave.from).not.toBeNull();
    expect(Math.abs(weave.from!.x - t.x) + Math.abs(weave.from!.y - t.y)).toBe(1);
    expect(weave.before.net).toBe(false);
  });

  it('descomponer un tronco', () => {
    const g = newGame();
    const t = first(g, BRUNO);
    expect(kinds(g, act(g, BRUNO, t.x, t.y).state)).toEqual(['decompose']);
  });

  it('revivir un árbol', () => {
    const g0 = newGame();
    const tree = g0.tiles.find((t) => t.kind === 'tree')!;
    const near = g0.tiles.find((t) => t.kind === 'soil' && Math.abs(t.x - tree.x) + Math.abs(t.y - tree.y) === 1)!;
    const g = setup({ nutrients: 10, net: [{ x: near.x, y: near.y }] });
    const target = validTargets(g, RUBI).find((t) => t.kind === 'tree')!;
    expect(kinds(g, act(g, RUBI, target.x, target.y).state)).toContain('revive');
  });

  it('al empezar el mes, las esporas salen de cada árbol vivo', () => {
    const tree = newGame().tiles.find((t) => t.kind === 'tree')!;
    const g = setup({ alive: [{ x: tree.x, y: tree.y }] });
    const fx = diffEffects(g, endMonth(g).state).find((e) => e.kind === 'spores');
    expect(fx).toMatchObject({ kind: 'spores', from: [{ x: tree.x, y: tree.y }] });
  });

  it('Scenario: Mes nuevo con árboles vivos — la hojarasca sale de los mismos árboles (022)', () => {
    const tree = newGame().tiles.find((t) => t.kind === 'tree')!;
    const g = setup({ alive: [{ x: tree.x, y: tree.y }] });
    const next = endMonth(g).state;
    const fx = diffEffects(g, next).find((e) => e.kind === 'spores');
    expect(next.nutrients).toBeGreaterThan(g.nutrients);
    expect(fx).toMatchObject({ leaves: next.nutrients - g.nutrients });
  });

  it('Scenario: Pasar la voz — Chispa libera a Bruno desde su casilla (022)', () => {
    const g = setup({ spores: 1, extraMembers: ['gliophorus'] });
    const log = first(g, BRUNO);
    const worked = act(g, BRUNO, log.x, log.y).state;
    const chispa = idOf(worked, 'gliophorus');
    const called = act(worked, chispa, log.x, log.y).state;
    expect(diffEffects(worked, called)).toContainEqual({ kind: 'call', at: { x: log.x, y: log.y }, memberId: BRUNO });
    // El mes nuevo despierta a todos, pero no es pasar la voz.
    expect(kinds(worked, endMonth(worked).state)).not.toContain('call');
  });

  it('otra partida (reinicio) o el mismo estado no producen efectos', () => {
    const g = newGame();
    expect(diffEffects(g, g)).toEqual([]);
    expect(diffEffects({ ...g, month: 5 }, newGame())).toEqual([]);
    expect(diffEffects(g, newRandomGame(7))).toEqual([]);
  });
});

describe('Plaga (033): efecto al marchitarse', () => {
  it('la casilla con plaga que sale de la red produce «wither»; si los hongos la frenan, no', () => {
    const base = { ...setup({ month: 6, net: [{ x: 2, y: 6 }, { x: 2, y: 4 }, { x: 2, y: 3 }] }), level: 'ancestral' as const };
    const marked = endMonth(base).state;
    const withered = endMonth(marked).state;
    // 043: la plaga marca la casilla tejida más cercana al Hogar.
    expect(diffEffects(marked, withered)).toContainEqual({ kind: 'wither', at: { x: 2, y: 6 } });
    const nutrients = { ...marked, nutrients: 4 };
    const saved = act(nutrients, INDI, 1, 6).state;
    expect(kinds(saved, endMonth(saved).state)).not.toContain('wither');
  });
});
