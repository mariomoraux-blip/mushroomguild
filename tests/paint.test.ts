import { describe, expect, it } from 'vitest';
import { act, newGame } from '../src/rules';
import { groundKey, objectKey, paintBoard } from '../src/scenes/paint';
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

describe('Requirement: Árbol Padre de Blender', () => {
  it('Scenario: Alguien trabaja sobre el Árbol Padre — con sprite, el árbol se sigue viendo (el miembro va delante)', () => {
    const game = newGame();
    const father = game.tiles.find((t) => t.kind === 'mother')!;
    const occupied = new Set([`${father.x},${father.y}`]);
    const at = (fatherSprite: boolean) =>
      paintBoard(fakeCtx(), 64, { game, valid: new Set(), star: null, occupied, fatherSprite }).find((p) => p.x === father.x && p.y === father.y)?.object;
    expect(at(true)).toBe('mother');
    expect(at(false)).toBe('none');
  });
});

describe('Requirement: Tablero pintado por estación', () => {
  // Arte de mentira: cualquier clave existe (100 × 100).
  const art = () => ({ width: 100, height: 100 }) as unknown as CanvasImageSource;
  const paintArt = (game = newGame()) => {
    const occupied = new Set(game.members.filter((m) => m.at).map((m) => `${m.at!.x},${m.at!.y}`));
    return paintBoard(fakeCtx(), 64, { game, valid: new Set(), star: null, occupied, art });
  };
  const at = (game: ReturnType<typeof newGame>, kind: string) => game.tiles.find((t) => t.kind === kind)!;

  it('Scenario: Primavera — pasto de primavera, árbol dormido gris y tronco entero', () => {
    const g = newGame();
    const tree = g.tiles.find((t) => t.kind === 'tree' && !t.net)!;
    expect(groundKey(at(g, 'soil'), 'spring')).toMatch(/^board\/terrain\/grass(-b|-c)?$/);
    expect(objectKey(tree, 'spring')).toBe('board/trees/grey');
    expect(objectKey(at(g, 'log'), 'spring')).toBe('board/logs/log');
    expect(paintArt(g).find((p) => p.x === tree.x && p.y === tree.y)?.art).toBe('board/trees/grey');
  });

  it('Scenario: Otoño e invierno — pasto, rocas y árboles vivos cambian de pieza', () => {
    const g = newGame();
    const tree = { ...g.tiles.find((t) => t.kind === 'tree')!, alive: true };
    expect(groundKey(at(g, 'soil'), 'autumn')).toBe('board/terrain/grass-autumn');
    expect(groundKey(at(g, 'soil'), 'winter')).toBe('board/terrain/grass-winter');
    expect(objectKey(tree, 'autumn')).toBe('board/trees/autumn');
    expect(objectKey(tree, 'winter')).toBe('board/trees/winter');
    expect(objectKey(at(g, 'rock'), 'winter')).toBe('board/rocks/rock-winter');
    expect(objectKey(at(g, 'rock'), 'summer')).toBe('board/rocks/rock');
  });

  it('la red se pinta como casilla de micelio y un árbol dormido en la red empieza a despertar', () => {
    const g = newGame();
    const soil = { ...at(g, 'soil'), net: true };
    const tree = { ...g.tiles.find((t) => t.kind === 'tree')!, net: true, alive: false };
    expect(groundKey(soil, 'winter')).toMatch(/^board\/mycelium\/net(-b)?$/);
    expect(objectKey(tree, 'spring')).toBe('board/trees/waking');
  });

  it('un tronco usado una vez cambia de pieza', () => {
    expect(objectKey({ ...at(newGame(), 'log'), uses: 1 }, 'spring')).toBe('board/logs/log-used');
  });

  it('Scenario: Hongo sobre la casa — la casa no se pinta debajo del retrato (queda la red)', () => {
    const g = newGame();
    const home = at(g, 'home');
    expect(groundKey(home, 'spring')).toBe('board/terrain/home');
    expect(groundKey(home, 'spring', true)).toMatch(/^board\/mycelium\/net(-b)?$/);
    expect(paintArt(g).find((p) => p.x === home.x && p.y === home.y)).toMatchObject({ object: 'home', art: 'board/terrain/home' });
  });

  it('con arte, un objeto bajo un hongo sigue sin pintarse', () => {
    const worked = act(newGame(), BRUNO, 1, 7).state;
    expect(paintArt(worked).find((p) => p.x === 1 && p.y === 7)?.object).toBe('none');
  });
});
