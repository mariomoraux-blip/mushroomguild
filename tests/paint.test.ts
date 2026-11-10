import { describe, expect, it } from 'vitest';
import { act, cloneState, newGame } from '../src/rules';
import { groundKey, objectKey, paintBoard, paintMarked, paintMyceliumGlow } from '../src/scenes/paint';
import { MYCELIUM_GLOW } from '../src/theme';
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

describe('Requirement: La red alumbra el invierno', () => {
  it('la luz de la red crece con las estaciones y el invierno es el máximo', () => {
    for (let i = 1; i < MYCELIUM_GLOW.length; i++) expect(MYCELIUM_GLOW[i]!).toBeGreaterThan(MYCELIUM_GLOW[i - 1]!);
    expect(MYCELIUM_GLOW).toEqual([0.2, 0.4, 0.65, 1]);
  });

  it('solo alumbra las casillas de la red', () => {
    const start = newGame();
    const home = start.tiles.find((t) => t.kind === 'home')!;
    expect(paintMyceliumGlow(fakeCtx(), 64, start)).toEqual([{ x: home.x, y: home.y }]);
    const s = cloneState(start);
    s.tiles.find((t) => t.x === 2 && t.y === 6)!.net = true;
    expect(paintMyceliumGlow(fakeCtx(), 64, s)).toEqual([{ x: 2, y: 6 }, { x: home.x, y: home.y }]);
  });
});

describe('Requirement: Árbol marcado y apagado (019)', () => {
  const withTree = (patch: { fading?: boolean; faded?: boolean }) => {
    const s = cloneState(newGame());
    Object.assign(s.tiles.find((t) => t.x === 1 && t.y === 0)!, patch);
    return s;
  };

  it('Scenario: Árbol apagado — lleva el velo fijo (y el copo) en el claro', () => {
    expect(paint(withTree({ faded: true })).find((p) => p.x === 1 && p.y === 0)).toMatchObject({ object: 'tree', faded: true });
    expect(paint().some((p) => p.faded)).toBe(false);
  });

  it('Scenario: Árbol marcado — va en su propia capa (la que late), no en el claro', () => {
    const s = withTree({ fading: true });
    expect(paintMarked(fakeCtx(), 64, s)).toEqual([{ x: 1, y: 0 }]);
    expect(paint(s).some((p) => p.faded)).toBe(false);
    expect(paintMarked(fakeCtx(), 64, newGame())).toEqual([]);
  });
});

describe('Requirement: Plaga pintada (033)', () => {
  const blighted = () => {
    const s = cloneState(newGame());
    const t = s.tiles.find((tt) => tt.x === 2 && tt.y === 6)!;
    t.net = true;
    t.blighted = true;
    return s;
  };

  it('la casilla con plaga usa su pieza pintada (con nieve en invierno) en vez de la red', () => {
    const t = blighted().tiles.find((tt) => tt.x === 2 && tt.y === 6)!;
    expect(groundKey(t, 'autumn')).toBe('board/plague/blight');
    expect(groundKey(t, 'winter')).toBe('board/plague/blight-winter');
    // Marchita (035): la red muerta, en cualquier estación.
    expect(groundKey({ ...t, net: false }, 'autumn')).toBe('board/plague/withered');
    expect(groundKey({ ...t, net: false }, 'winter')).toBe('board/plague/withered');
  });

  it('la casilla con plaga pierde la luz de la red', () => {
    const s = blighted();
    const home = s.tiles.find((t) => t.kind === 'home')!;
    expect(paintMyceliumGlow(fakeCtx(), 64, s)).toEqual([{ x: home.x, y: home.y }]);
  });

  it('el contorno punteado se pinta siempre; con o sin la pieza pintada', () => {
    expect(paintMarked(fakeCtx(), 64, blighted(), true)).toEqual([{ x: 2, y: 6 }]);
    expect(paintMarked(fakeCtx(), 64, blighted(), false)).toEqual([{ x: 2, y: 6 }]);
  });
});
