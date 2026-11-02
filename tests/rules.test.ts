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
  RECRUITABLE,
  type RecruitableSpecies,
  recruit,
  revivedCount,
  RuleError,
  season,
  tile,
  validTargets,
  W,
  type GameState,
} from '../src/rules';
import { ANIL, BRUNO, idOf, RUBI, setup } from './helpers';

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
    expect(s.members.map((m) => m.species)).toEqual(['lactarius', 'champi', 'amanita']);
    expect(s.members.map((m) => m.name)).toEqual(['Añil', 'Bruno', 'Rubí']);
    expect(s.members.every((m) => !m.used)).toBe(true);
    expect(s.members.some((m) => m.species === 'mago')).toBe(false);
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
    expect(reasonOf(s, ANIL, FAR_SOIL)).toMatch(far);
    expect(reasonOf(s, BRUNO, FAR_LOG)).toMatch(far);
    expect(reasonOf(s, RUBI, FAR_TREE)).toMatch(far);
    expect(() => act(s, ANIL, FAR_SOIL.x, FAR_SOIL.y)).toThrow(RuleError);
  });

  it('validTargets solo ofrece casillas que tocan la red', () => {
    const s = newGame();
    expect(validTargets(s, ANIL).map(({ x, y }) => ({ x, y }))).toEqual([
      { x: 2, y: 6 },
      SOIL_NEAR_HOME,
    ]);
    expect(validTargets(s, BRUNO).map(({ x, y }) => ({ x, y }))).toEqual([LOG_NEAR_HOME]);
  });
});

describe('Requirement: Una acción por día', () => {
  it('Scenario: Miembro cansado — se rechaza indicando que descansa hasta el amanecer', () => {
    const { state } = act(newGame(), ANIL, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y);
    expect(reasonOf(state, ANIL, { x: 2, y: 6 })).toBe(es.reasons.tired('Añil'));
    expect(reasonOf(state, ANIL, { x: 2, y: 6 })).toContain('Descansa hasta el amanecer');
  });
});

describe('Requirement: Tejer micelio (Lactarius indigo)', () => {
  it('Scenario: Tejer con nutrientes — la casilla pasa a la red y los nutrientes bajan en 1', () => {
    const s = newGame();
    const { state, message } = pure(s, (s) => act(s, ANIL, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y));
    expect(tile(state, SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y)?.net).toBe(true);
    expect(state.nutrients).toBe(s.nutrients - 1);
    expect(message).toBe(es.log.wove('Añil'));
  });

  it('Scenario: Tejer sin nutrientes — se rechaza con "Falta 1 nutriente para tejer."', () => {
    const s = setup({ nutrients: 0 });
    expect(reasonOf(s, ANIL, SOIL_NEAR_HOME)).toBe('Falta 1 nutriente para tejer.');
  });

  it('no teje fuera de la tierra libre ni sobre micelio existente', () => {
    const s = setup({ net: [SOIL_NEAR_HOME] });
    expect(reasonOf(s, ANIL, LOG_NEAR_HOME)).toBe(es.reasons.lactariusNeedsSoil);
    expect(reasonOf(s, ANIL, SOIL_NEAR_HOME)).toBe(es.reasons.alreadyNet);
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

describe('Requirement: Revivir árboles (Amanita muscaria)', () => {
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

describe('Requirement: Pasar la voz (Gliophorus psittacinus)', () => {
  const withGlio = (o: Parameters<typeof setup>[0] = {}) => setup({ extraMembers: ['gliophorus'], ...o });

  it('Scenario: Trueque — sobre un árbol vivo con 2 o más esporas, esporas −2 y nutrientes +3', () => {
    const s = withGlio({ alive: [TREE], spores: 2, nutrients: 0 });
    const { state, message } = pure(s, (s) => act(s, idOf(s, 'gliophorus'), TREE.x, TREE.y));
    expect(state.spores).toBe(0);
    expect(state.nutrients).toBe(3);
    expect(message).toBe(es.log.passedWord('extra-4', 2, 3));
  });

  it('Scenario: Sin esporas — se rechaza con "Faltan esporas: pasar la voz cuesta 2."', () => {
    const s = withGlio({ alive: [TREE], spores: 1 });
    expect(reasonOf(s, idOf(s, 'gliophorus'), TREE)).toBe('Faltan esporas: pasar la voz cuesta 2.');
  });

  it('Scenario: Pasar la voz desde cualquier árbol vivo — el trueque se aplica igual en un árbol lejos del Hogar', () => {
    const s = withGlio({ alive: [FAR_TREE], spores: 3, nutrients: 1 });
    const { state } = act(s, idOf(s, 'gliophorus'), FAR_TREE.x, FAR_TREE.y);
    expect([state.spores, state.nutrients]).toEqual([1, 4]);
  });

  it('Scenario: Fuera de un árbol vivo — se rechaza con "La Gliophorus solo pasa la voz desde un árbol vivo."', () => {
    const s = withGlio({ spores: 5 });
    const id = idOf(s, 'gliophorus');
    const msg = 'La Gliophorus solo pasa la voz desde un árbol vivo.';
    expect(reasonOf(s, id, SOIL_NEAR_HOME)).toBe(msg);
    expect(reasonOf(s, id, TREE)).toBe(msg); // árbol gris
  });
});

describe('Requirement: Llegada de la maga (Conocybe arcana)', () => {
  it('Scenario: Segundo árbol revivido — si revive el día 4, al empezar el día 5 Maestra Bruma está y disponible', () => {
    // El primer árbol no lo trae.
    const first = endDay(act(setup({ day: 3, net: [SOIL_NEAR_TREE], nutrients: 3 }), RUBI, TREE.x, TREE.y).state).state;
    expect(first.members.some((m) => m.species === 'mago')).toBe(false);

    const s = setup({ day: 4, alive: [OTHER_TREE], net: [SOIL_NEAR_TREE], nutrients: 3 });
    const revived = act(s, RUBI, TREE.x, TREE.y).state;
    expect(revived.members.some((m) => m.species === 'mago')).toBe(false);
    const { state, message } = endDay(revived);
    expect(state.day).toBe(5);
    const mage = state.members.find((m) => m.species === 'mago');
    expect(mage).toMatchObject({ name: 'Maestra Bruma', used: false });
    expect(message).toContain(es.log.mageArrives);
    // Llega una sola vez por partida, aunque se revivan más árboles.
    const third = act({ ...state, nutrients: 3, tiles: state.tiles.map((t) => (t.x === 3 && t.y === 1 ? { ...t, net: true } : t)) }, RUBI, 4, 1);
    const later = endDay(endDay(third.state).state).state;
    expect(later.members.filter((m) => m.species === 'mago')).toHaveLength(1);
  });

  it('Scenario: Reclutar a la maga — la acción no está disponible', () => {
    expect(RECRUITABLE).not.toContain('mago');
    expect(() => recruit(setup({ spores: 10 }), 'mago' as RecruitableSpecies)).toThrow(RuleError);
  });

  it('Scenario: Segundo árbol en el último día — si revive el día 12, Maestra Bruma no se une y la partida sigue', () => {
    const s = setup({ day: 12, alive: [OTHER_TREE], net: [SOIL_NEAR_TREE], nutrients: 3 });
    const revived = act(s, RUBI, TREE.x, TREE.y).state;
    expect(revived.status).toBe('playing');
    expect(revived.mageDue).toBe(false);
    const { state } = endDay(revived);
    expect(state.status).toBe('lost');
    expect(state.members.some((m) => m.species === 'mago')).toBe(false);
  });
});

describe('Requirement: Hechizos', () => {
  // Roca (3, 5): vecina de (3, 6) y del árbol gris (2, 5).
  const ROCK = { x: 3, y: 5 };
  const NEAR_ROCK = { x: 3, y: 6 };
  const TREE_BEHIND_ROCK = OTHER_TREE; // (2, 5)
  const FAR_ROCK = { x: 0, y: 4 };
  const withMage = (o: Parameters<typeof setup>[0] = {}) => setup({ mage: true, ...o });
  const mageId = (s: GameState) => idOf(s, 'mago');

  it('Scenario: Brote arcano — una roca vecina a la red pasa a tierra con micelio', () => {
    const s = withMage({ net: [NEAR_ROCK] });
    const { state, message } = pure(s, (s) => act(s, mageId(s), ROCK.x, ROCK.y));
    expect(tile(state, ROCK.x, ROCK.y)).toMatchObject({ kind: 'soil', net: true });
    expect(message).toBe(es.log.sprouted('Maestra Bruma'));
  });

  it('Scenario: Brote arcano extiende la red — la Amanita puede revivir un árbol que solo toca la red por el brote', () => {
    const s = withMage({ net: [NEAR_ROCK], nutrients: 3 });
    expect(reasonOf(s, RUBI, TREE_BEHIND_ROCK)).toBe(es.reasons.farTree);
    const sprouted = act(s, mageId(s), ROCK.x, ROCK.y).state;
    expect(check(sprouted, RUBI, TREE_BEHIND_ROCK.x, TREE_BEHIND_ROCK.y)).toEqual({ ok: true });
    expect(tile(act(sprouted, RUBI, TREE_BEHIND_ROCK.x, TREE_BEHIND_ROCK.y).state, 2, 5)?.alive).toBe(true);
  });

  it('Scenario: Roca lejana — se rechaza con "El Brote arcano solo despierta rocas que tocan la red."', () => {
    const s = withMage();
    expect(reasonOf(s, mageId(s), FAR_ROCK)).toBe('El Brote arcano solo despierta rocas que tocan la red.');
    expect(check(s, mageId(s), SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y, 'sprout')).toEqual({
      ok: false,
      reason: 'El Brote arcano solo despierta rocas que tocan la red.',
    });
  });

  it('Scenario: Lluvia de esporas es un pago extra — con 3 árboles vivos suma 3 y 3 ya, y el amanecer otras 3 y 3', () => {
    const s = withMage({ alive: [TREE, OTHER_TREE, FAR_TREE], spores: 0, nutrients: 0 });
    const { state, message } = pure(s, (s) => act(s, mageId(s), TREE.x, TREE.y));
    expect([state.spores, state.nutrients]).toEqual([3, 3]);
    expect(message).toBe(es.log.rained('Maestra Bruma', 3, 3));
    const dawn = endDay(state).state;
    expect([dawn.spores, dawn.nutrients]).toEqual([6, 6]);
  });

  it('Scenario: Lluvia fuera de un árbol vivo — se rechaza con "La Lluvia de esporas se lanza sobre un árbol vivo."', () => {
    const s = withMage();
    const msg = 'La Lluvia de esporas se lanza sobre un árbol vivo.';
    expect(reasonOf(s, mageId(s), TREE)).toBe(msg); // árbol gris
    expect(check(s, mageId(s), SOIL_NEAR_HOME.x, SOIL_NEAR_HOME.y, 'rain')).toEqual({ ok: false, reason: msg });
  });

  it('Scenario: El hechizo gasta la acción del día — Maestra Bruma queda cansada hasta el amanecer', () => {
    const s = withMage({ alive: [TREE] });
    const { state } = act(s, mageId(s), TREE.x, TREE.y);
    expect(state.members.find((m) => m.species === 'mago')?.used).toBe(true);
    expect(reasonOf(state, mageId(state), TREE)).toBe(es.reasons.tired('Maestra Bruma'));
  });

  it('Scenario: Segundo hechizo en la misma estación — se rechaza aunque sea otro día de Verano', () => {
    const s = withMage({ day: 4, alive: [TREE] });
    const cast = act(s, mageId(s), TREE.x, TREE.y).state;
    const nextDay = endDay(cast).state;
    expect(season(nextDay.day)).toBe('Verano');
    expect(reasonOf(nextDay, mageId(nextDay), TREE)).toBe(
      'Maestra Bruma descansa: su magia vuelve con la próxima estación.',
    );
    expect(validTargets(nextDay, mageId(nextDay))).toEqual([]);
  });

  it('Scenario: Nueva estación — al empezar Otoño puede lanzar otra vez', () => {
    const s = withMage({ day: 6, alive: [TREE], lastSpellSeason: 1 });
    expect(reasonOf(s, mageId(s), TREE)).toBe(es.reasons.magicSpent);
    const autumn = endDay(s).state;
    expect(season(autumn.day)).toBe('Otoño');
    expect(check(autumn, mageId(autumn), TREE.x, TREE.y)).toEqual({ ok: true });
  });

  it('validTargets con hechizo: Brote solo rocas vecinas, Lluvia solo árboles vivos', () => {
    const s = withMage({ net: [NEAR_ROCK], alive: [TREE] });
    const pts = (spell: 'sprout' | 'rain') => validTargets(s, mageId(s), spell).map(({ x, y }) => ({ x, y }));
    expect(pts('sprout')).toEqual([ROCK]);
    expect(pts('rain')).toEqual([TREE]);
  });
});

describe('Requirement: Amanecer', () => {
  it('Scenario: Dos árboles vivos — se suman 2 esporas y 2 nutrientes, y el día avanza en 1', () => {
    const s = setup({ alive: [TREE, OTHER_TREE], nutrients: 4, spores: 1, used: [ANIL, BRUNO, RUBI] });
    const { state } = pure(s, endDay);
    expect(state.spores).toBe(3);
    expect(state.nutrients).toBe(6);
    expect(state.day).toBe(2);
    expect(state.members.every((m) => !m.used && m.at === null)).toBe(true);
  });
});

describe('Requirement: Reclutar', () => {
  it('con 2 esporas recluta un miembro de cualquier especie, que trabaja desde el día siguiente', () => {
    for (const sp of RECRUITABLE) {
      const s = setup({ spores: 2, net: [SOIL_NEAR_HOME] });
      const { state } = pure(s, (s) => recruit(s, sp));
      const m = state.members.at(-1)!;
      expect(m.species).toBe(sp);
      expect(state.spores).toBe(0);
      expect(m.used).toBe(true);
      expect(endDay(state).state.members.at(-1)!.used).toBe(false);
    }
  });

  it('Scenario: Gremio completo — reclutar se rechaza con "El gremio está completo." (la maga no cuenta)', () => {
    const s = setup({ spores: 10, extraMembers: ['lactarius', 'champi', 'gliophorus'], mage: true });
    expect(s.members).toHaveLength(MAX_GUILD + 1);
    expect(() => recruit(s, 'lactarius')).toThrow(new RuleError('El gremio está completo.'));
    // Sin la maga y con 5 reclutables todavía cabe uno más.
    const five = setup({ spores: 2, extraMembers: ['lactarius', 'champi'], mage: true });
    expect(recruit(five, 'gliophorus').state.members.filter((m) => m.species !== 'mago')).toHaveLength(MAX_GUILD);
  });

  it('sin esporas suficientes se rechaza', () => {
    expect(() => recruit(setup({ spores: 1 }), 'lactarius')).toThrow(new RuleError(es.reasons.recruitCost(COST.recruit)));
  });

  it('los reclutas reciben los nombres en orden', () => {
    let s = setup({ spores: 6 });
    s = recruit(s, 'lactarius').state;
    s = recruit(s, 'gliophorus').state;
    s = recruit(s, 'champi').state;
    expect(s.members.slice(3).map((m) => m.name)).toEqual(['Ola', 'Perico', 'Tomillo']);
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
    expect(reasonOf(state, ANIL, SOIL_NEAR_HOME)).toBe(es.reasons.gameOver);
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
    expect(() => recruit(lost, 'lactarius')).toThrow(RuleError);
    expect(newGame().status).toBe('playing');
  });
});
