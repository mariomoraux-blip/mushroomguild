import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import {
  act,
  check,
  COST,
  endDay,
  H,
  MAX_GUILD,
  newGame,
  recruit,
  revivedCount,
  RuleError,
  season,
  tile,
  validTargets,
  W,
  type GameState,
} from '../src/rules';
import { BRUNO, OLA, RUBI, setup } from './helpers';

// Coordenadas del mapa vertical (config.ts)
const HOME = { x: 2, y: 7 };
const MOTHER = { x: 2, y: 0 };
const SOIL_NEAR_HOME = { x: 3, y: 7 };
const LOG_NEAR_HOME = { x: 1, y: 7 };
const FAR_SOIL = { x: 0, y: 0 };
const FAR_LOG = { x: 1, y: 1 };
const FAR_TREE = { x: 1, y: 0 };
const TREE = { x: 4, y: 6 };
const SOIL_NEAR_TREE = { x: 4, y: 7 };
const OTHER_TREE = { x: 2, y: 5 };
const SOIL_NEAR_MOTHER = { x: 2, y: 1 };

const reasonOf = (s: GameState, id: number, p: { x: number; y: number }) => {
  const c = check(s, id, p.x, p.y);
  return c.ok ? null : c.reason;
};

/** Ejecuta `fn` y verifica que no mutó el estado recibido. */
function pure<T>(s: GameState, fn: (s: GameState) => T): T {
  const before = structuredClone(s);
  const out = fn(s);
  expect(s).toEqual(before);
  return out;
}

describe('Requirement: Tablero inicial', () => {
  it('Scenario: Partida nueva — día 1, 2 nutrientes, 0 esporas, gremio disponible, solo el Hogar en la red', () => {
    const s = newGame();
    expect(s.day).toBe(1);
    expect(s.nutrients).toBe(2);
    expect(s.spores).toBe(0);
    expect(s.status).toBe('playing');
    expect(s.members.map((m) => m.species)).toEqual(['ostra', 'champi', 'amanita']);
    expect(s.members.every((m) => !m.used)).toBe(true);
    const net = s.tiles.filter((t) => t.net);
    expect(net).toHaveLength(1);
    expect(net[0]).toMatchObject({ ...HOME, kind: 'home' });
  });

  it('el tablero es vertical de 5×8, con el Hogar en la fila inferior y el Árbol Madre en la superior', () => {
    const s = newGame();
    expect([W, H]).toEqual([5, 8]);
    expect(s.tiles).toHaveLength(40);
    expect(tile(s, HOME.x, HOME.y)?.kind).toBe('home');
    expect(tile(s, MOTHER.x, MOTHER.y)?.kind).toBe('mother');
    expect(HOME.y).toBe(H - 1);
    expect(MOTHER.y).toBe(0);
  });
});

describe('Requirement: Alcance de la red', () => {
  it('Scenario: Casilla lejana — la acción se rechaza con "Muy lejos: … debe tocar la red."', () => {
    const s = setup({ nutrients: 9 });
    const far = /^Muy lejos: .+ debe tocar la red\.$/;
    expect(reasonOf(s, OLA, FAR_SOIL)).toMatch(far);
    expect(reasonOf(s, BRUNO, FAR_LOG)).toMatch(far);
    expect(reasonOf(s, RUBI, FAR_TREE)).toMatch(far);
    expect(() => act(s, OLA, FAR_SOIL.x, FAR_SOIL.y)).toThrow(RuleError);
  });

  it('validTargets solo ofrece casillas que tocan la red', () => {
    const s = newGame();
    expect(validTargets(s, OLA).map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 2, y: 6 },
      SOIL_NEAR_HOME,
    ]);
    expect(validTargets(s, BRUNO).map(({ x, y }) => ({ x, y }))).toEqual([LOG_NEAR_HOME]);
  });
});

describe('Requirement: Una acción por día', () => {
  it('Scenario: Miembro cansado — se rechaza indicando que descansa hasta el amanecer', () => {
    const { state } = act(newGame(), OLA, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y);
    expect(reasonOf(state, OLA, { x: 2, y: 6 })).toBe(es.reasons.tired('Ola'));
    expect(reasonOf(state, OLA, { x: 2, y: 6 })).toContain('Descansa hasta el amanecer');
  });
});

describe('Requirement: Tejer micelio (Ostra)', () => {
  it('Scenario: Tejer con nutrientes — la casilla pasa a la red y los nutrientes bajan en 1', () => {
    const s = newGame();
    const { state, message } = pure(s, (s) => act(s, OLA, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y));
    expect(tile(state, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y)?.net).toBe(true);
    expect(state.nutrients).toBe(s.nutrients - 1);
    expect(message).toBe(es.log.wove('Ola'));
  });

  it('Scenario: Tejer sin nutrientes — se rechaza con "Falta 1 nutriente para tejer."', () => {
    const s = setup({ nutrients: 0 });
    expect(reasonOf(s, OLA, SOIL_NEAR_HOME)).toBe('Falta 1 nutriente para tejer.');
  });

  it('no teje fuera de la tierra libre ni sobre micelio existente', () => {
    const s = setup({ net: [SOIL_NEAR_HOME] });
    expect(reasonOf(s, OLA, LOG_NEAR_HOME)).toBe(es.reasons.ostraNeedsSoil);
    expect(reasonOf(s, OLA, SOIL_NEAR_HOME)).toBe(es.reasons.alreadyNet);
  });
});

describe('Requirement: Descomponer (Champiñón)', () => {
  it('primer uso: +3 nutrientes y el tronco sigue en pie', () => {
    const { state } = act(newGame(), BRUNO, LOG_NEAR_HOME.x, LOG_NEAR_HOME.y);
    expect(state.nutrients).toBe(5);
    expect(tile(state, LOG_NEAR_HOME.x, LOG_NEAR_HOME.y)).toMatchObject({ kind: 'log', uses: 1 });
  });

  it('Scenario: Segundo uso de un tronco — se suman 3 nutrientes y queda tierra sin micelio', () => {
    const s = setup({ uses: [{ ...LOG_NEAR_HOME, n: 1 }] });
    const { state, message } = pure(s, (s) => act(s, BRUNO, LOG_NEAR_HOME.x, LOG_NEAR_HOME.y));
    expect(state.nutrients).toBe(s.nutrients + 3);
    expect(tile(state, LOG_NEAR_HOME.x, LOG_NEAR_HOME.y)).toMatchObject({ kind: 'soil', net: false });
    expect(message).toBe(es.log.logDone('Bruno', 3));
  });

  it('solo descompone troncos', () => {
    expect(reasonOf(newGame(), BRUNO, SOIL_NEAR_HOME)).toBe(es.reasons.champiNeedsLog);
  });
});

describe('Requirement: Revivir árboles (Amanita)', () => {
  it('Scenario: Revivir extiende la red — el árbol queda vivo y en la red, y los nutrientes bajan en 3', () => {
    const s = setup({ net: [SOIL_NEAR_TREE], nutrients: 3 });
    const { state } = pure(s, (s) => act(s, RUBI, TREE.x, TREE.y));
    expect(tile(state, TREE.x, TREE.y)).toMatchObject({ kind: 'tree', alive: true, net: true });
    expect(state.nutrients).toBe(0);
    expect(revivedCount(state)).toBe(1);
  });

  it('rechaza sin nutrientes suficientes, árboles ya vivos y casillas que no son árboles', () => {
    expect(reasonOf(setup({ net: [SOIL_NEAR_TREE], nutrients: 2 }), RUBI, TREE)).toBe(es.reasons.reviveCost(3));
    expect(reasonOf(setup({ alive: [TREE], nutrients: 9 }), RUBI, TREE)).toBe(es.reasons.treeAlive);
    expect(reasonOf(newGame(), RUBI, SOIL_NEAR_HOME)).toBe(es.reasons.amanitaNeedsTree);
  });
});

describe('Requirement: Amanecer', () => {
  it('Scenario: Dos árboles vivos — se suman 2 esporas y 2 nutrientes, y el día avanza en 1', () => {
    const s = setup({ alive: [TREE, OTHER_TREE], nutrients: 4, spores: 1, used: [OLA, BRUNO, RUBI] });
    const { state } = pure(s, endDay);
    expect(state.spores).toBe(3);
    expect(state.nutrients).toBe(6);
    expect(state.day).toBe(2);
    expect(state.members.every((m) => !m.used && m.at === null)).toBe(true);
  });
});

describe('Requirement: Reclutar', () => {
  it('con 2 esporas recluta un miembro de cualquier especie, que trabaja desde el día siguiente', () => {
    for (const sp of ['ostra', 'champi', 'amanita'] as const) {
      const s = setup({ spores: 2, net: [SOIL_NEAR_HOME] });
      const { state } = pure(s, (s) => recruit(s, sp));
      const m = state.members.at(-1)!;
      expect(m.species).toBe(sp);
      expect(state.spores).toBe(0);
      expect(m.used).toBe(true);
      expect(endDay(state).state.members.at(-1)!.used).toBe(false);
    }
  });

  it('Scenario: Gremio completo — reclutar se rechaza con "El gremio está completo."', () => {
    const s = setup({ spores: 10, extraMembers: ['ostra', 'champi', 'amanita'] });
    expect(s.members).toHaveLength(MAX_GUILD);
    expect(() => recruit(s, 'ostra')).toThrow(new RuleError('El gremio está completo.'));
  });

  it('sin esporas suficientes se rechaza', () => {
    expect(() => recruit(setup({ spores: 1 }), 'ostra')).toThrow(new RuleError(es.reasons.recruitCost(COST.recruit)));
  });
});

describe('Requirement: Estaciones', () => {
  it('Scenario: Cambio de estación — al terminar el día 3, el día 4 pertenece a Verano', () => {
    const { state, message } = endDay(setup({ day: 3 }));
    expect(state.day).toBe(4);
    expect(season(state.day)).toBe('Verano');
    expect(message).toContain('Comienza verano.');
  });

  it('12 días en 4 estaciones de 3 días', () => {
    const seasons = Array.from({ length: 12 }, (_, i) => season(i + 1));
    expect(seasons).toEqual([
      ...Array(3).fill('Primavera'),
      ...Array(3).fill('Verano'),
      ...Array(3).fill('Otoño'),
      ...Array(3).fill('Invierno'),
    ]);
  });
});

describe('Requirement: Victoria', () => {
  it('Scenario: Bosque que aún no habla — con 1 árbol revivido se pide revivir al menos 2', () => {
    const s = setup({ net: [SOIL_NEAR_MOTHER], alive: [TREE], nutrients: 6 });
    expect(reasonOf(s, RUBI, MOTHER)).toBe(es.reasons.forestSilent(2));
    expect(reasonOf(s, RUBI, MOTHER)).toContain('revive al menos 2 árboles');
  });

  it('con la red tocándolo, 6 nutrientes y 2 árboles revividos, despertar al Árbol Madre gana la partida', () => {
    const s = setup({ day: 7, net: [SOIL_NEAR_MOTHER], alive: [TREE, OTHER_TREE], nutrients: 6 });
    const { state } = pure(s, (s) => act(s, RUBI, MOTHER.x, MOTHER.y));
    expect(state.status).toBe('won');
    expect(state.wonDay).toBe(7);
    expect(state.nutrients).toBe(0);
    expect(reasonOf(state, OLA, SOIL_NEAR_HOME)).toBe(es.reasons.gameOver);
  });

  it('rechaza si la red no llega o faltan nutrientes', () => {
    expect(reasonOf(setup({ alive: [TREE, OTHER_TREE], nutrients: 6 }), RUBI, MOTHER)).toBe(es.reasons.motherFar);
    const poor = setup({ net: [SOIL_NEAR_MOTHER], alive: [TREE, OTHER_TREE], nutrients: 5 });
    expect(reasonOf(poor, RUBI, MOTHER)).toBe(es.reasons.motherCost(6));
  });
});

describe('Requirement: Final suave', () => {
  it('Scenario: Fin del invierno — al terminar el día 12 sin ganar, el estado es `lost`', () => {
    const { state } = endDay(setup({ day: 12 }));
    expect(state.status).toBe('lost');
    expect(state.day).toBe(12);
  });

  it('sin penalización: terminar el día otra vez no cambia nada y se puede reiniciar', () => {
    const lost = endDay(setup({ day: 12 })).state;
    const again = endDay(lost);
    expect(again.state).toBe(lost);
    expect(again.message).toBe('');
    expect(() => recruit(lost, 'ostra')).toThrow(RuleError);
    expect(newGame().status).toBe('playing');
  });
});
