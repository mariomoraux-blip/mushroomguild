import { describe, expect, it } from 'vitest';
import { act, newGame } from '../src/rules';
import { paintBoard } from '../src/scenes/paint';
import { BRUNO } from './helpers';

/** Contexto 2D de mentira: acepta cualquier llamada y devuelve gradientes vacíos. */
function fakeCtx(): CanvasRenderingContext2D {
  const gradient = { addColorStop: () => undefined };
  return new Proxy({} as CanvasRenderingContext2D, {
    get: (_t, prop) => (prop === 'createLinearGradient' || prop === 'createRadialGradient' ? () => gradient : () => undefined),
    set: () => true,
  });
}

const paint = (game = newGame()) => {
  const occupied = new Set(game.members.filter((m) => m.at).map((m) => `${m.at!.x},${m.at!.y}`));
  return paintBoard(fakeCtx(), 64, { game, valid: new Set(), star: null, occupied });
};

describe('Requirement: Casilla ocupada', () => {
  it('Scenario: Hongo sobre un tronco — el objeto de la casilla no se pinta debajo del sprite', () => {
    expect(paint().find((p) => p.x === 1 && p.y === 7)?.object).toBe('log');
    const worked = act(newGame(), BRUNO, 1, 7).state;
    expect(paint(worked).find((p) => p.x === 1 && p.y === 7)?.object).toBe('none');
  });

  it('las demás casillas siguen pintando su objeto', () => {
    const painted = paint(act(newGame(), BRUNO, 1, 7).state);
    expect(painted.find((p) => p.x === 2 && p.y === 7)?.object).toBe('home');
    expect(painted.filter((p) => p.object === 'tree')).toHaveLength(5);
  });
});
