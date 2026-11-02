import { describe, expect, it } from 'vitest';
import { act, endMonth, newGame, newRandomGame, validTargets, type GameState } from '../src/rules';
import { diffEffects } from '../src/effects';
import { ANIL, BRUNO, RUBI, setup } from './helpers';

const first = (g: GameState, id: number) => validTargets(g, id)[0]!;
const kinds = (prev: GameState, next: GameState) => diffEffects(prev, next).map((e) => e.kind);

describe('Requirement: Respuesta a cada acción', () => {
  it('Scenario: Tejer — el micelio nuevo crece desde una casilla vecina de la red', () => {
    const g = newGame();
    const t = first(g, ANIL);
    const fx = diffEffects(g, act(g, ANIL, t.x, t.y).state);
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

  it('otra partida (reinicio) o el mismo estado no producen efectos', () => {
    const g = newGame();
    expect(diffEffects(g, g)).toEqual([]);
    expect(diffEffects({ ...g, month: 5 }, newGame())).toEqual([]);
    expect(diffEffects(g, newRandomGame(7))).toEqual([]);
  });
});
