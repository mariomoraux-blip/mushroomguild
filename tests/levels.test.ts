import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, check, cloneState, endMonth, FADED_REVIVE, LEVEL_IDS, LEVELS, mulberry32, newGame, newRandomGame, tile, weaveCost, type GameState, type Level, type Point } from '../src/rules';
import { randomMonth } from './bots';
import { INDI, RUBI, setup, type Setup } from './helpers';

// 019 · Niveles de dificultad, sobre el mapa clásico (Hogar en (2,7)).
const at = (level: Level, o: Setup = {}): GameState => ({ ...setup(o), level });
/** Termina meses sin actuar hasta que empieza `month`. */
const toMonth = (s: GameState, month: number) => {
  let n = s;
  while (n.month < month) n = endMonth(n).state;
  return n;
};
/** Árbol más lejano de la red en el clásico: (1,0) y (4,1) están a 8 pasos; gana la fila más alta. */
const FAR: Point = { x: 1, y: 0 };
const marked = (s: GameState) => s.tiles.filter((t) => t.fading).map(({ x, y }) => ({ x, y }));
const fadedCount = (s: GameState) => s.tiles.filter((t) => t.faded).length;

describe('Requirement: Niveles de dificultad', () => {
  it('los niveles van de menos a más rocas y de ×1 a ×2', () => {
    expect(LEVEL_IDS.map((l) => LEVELS[l].rocks)).toEqual([6, 8, 10]);
    expect(LEVEL_IDS.map((l) => LEVELS[l].multiplier)).toEqual([1, 1.5, 2]);
    expect(LEVELS.ancestral.hints).toBe(false);
  });

  it('Scenario: Brote es el juego de siempre', () => {
    let s = newGame();
    for (let month = 1; month <= 12; month++) {
      expect(weaveCost(s)).toBe(1);
      expect(marked(s)).toEqual([]);
      s = endMonth(s).state;
    }
    expect(fadedCount(s)).toBe(0);
  });

  it('Scenario: Nada se pierde — en 1000 partidas al azar por nivel, terminar el mes nunca quita red, árboles vivos ni reservas', () => {
    const rng = mulberry32(19);
    const starts = Object.fromEntries(LEVEL_IDS.map((l) => [l, Array.from({ length: 10 }, (_, i) => newRandomGame(i + 1, l))]));
    const count = (s: GameState) => ({ net: s.tiles.filter((t) => t.net).length, alive: s.tiles.filter((t) => t.alive).length });
    for (const level of LEVEL_IDS)
      for (let g = 0; g < 1000; g++) {
        let s = starts[level]![g % 10]!;
        const month = randomMonth(rng);
        while (s.status === 'playing') {
          s = month(s);
          if (s.status !== 'playing') break;
          const before = count(s);
          const next = endMonth(s).state;
          const after = count(next);
          if (after.net < before.net || after.alive < before.alive || next.nutrients < s.nutrients || next.spores < s.spores) throw new Error(`${level}: se perdió progreso en el mes ${s.month}`);
          s = next;
        }
      }
  }, 120_000);
});

describe('Requirement: Escarcha', () => {
  it('Scenario: Llega la escarcha — en Bosque, el otoño cuesta 2 por tejer y los árboles siguen produciendo', () => {
    const before = at('bosque', { month: 6, alive: [{ x: 2, y: 5 }] });
    const { state, message } = endMonth(before);
    expect(state.month).toBe(7);
    expect(weaveCost(state)).toBe(2);
    expect(message).toContain(es.log.frostStart(2));
    expect(state.nutrients).toBe(before.nutrients + 1);
    expect(state.spores).toBe(before.spores + 1);
  });

  it('Scenario: Tejer con escarcha — la casilla entra a la red y cuesta 2', () => {
    const s = at('bosque', { month: 7, nutrients: 3 });
    const n = act(s, INDI, 3, 7).state;
    expect(tile(n, 3, 7)!.net).toBe(true);
    expect(n.nutrients).toBe(1);
  });

  it('Scenario: Tejer sin nutrientes suficientes con escarcha', () => {
    expect(check(at('bosque', { month: 7, nutrients: 1 }), INDI, 3, 7)).toEqual({ ok: false, reason: 'Faltan 2 nutrientes para tejer con escarcha.', short: 'nutrients' });
  });

  it('Scenario: Invierno en Bosque — tejer vuelve a costar 1; en Ancestral, el invierno sigue con escarcha y no se anuncia otra vez', () => {
    expect(weaveCost(toMonth(at('bosque', { month: 9 }), 10))).toBe(1);
    const { state, message } = endMonth(at('ancestral', { month: 9 }));
    expect(weaveCost(state)).toBe(2);
    expect(message).not.toContain(es.log.frostStart(2));
  });
});

describe('Requirement: Árboles que se apagan', () => {
  it('Scenario: Se marca el más lejano', () => {
    const { state, message } = endMonth(at('bosque', { month: 5 }));
    expect(state.month).toBe(6);
    expect(marked(state)).toEqual([FAR]);
    expect(message).toContain(es.log.treeFading);
  });

  it('Scenario: Se apaga — y revivirlo cuesta más', () => {
    const { state, message } = endMonth(toMonth(at('bosque', { month: 5 }), 6));
    const t = tile(state, FAR.x, FAR.y)!;
    expect(t.faded).toBe(true);
    expect(t.fading).toBe(false);
    expect(message).toContain(es.log.treeFaded(FADED_REVIVE));
    const s = cloneState(state);
    s.tiles.find((t) => t.x === 0 && t.y === 0)!.net = true;
    s.nutrients = FADED_REVIVE - 1;
    expect(check(s, RUBI, FAR.x, FAR.y)).toEqual({ ok: false, reason: es.reasons.reviveCost(FADED_REVIVE), short: 'nutrients' });
    s.nutrients = FADED_REVIVE;
    const n = act(s, RUBI, FAR.x, FAR.y).state;
    expect(tile(n, FAR.x, FAR.y)).toMatchObject({ alive: true, net: true, faded: false });
    expect(n.nutrients).toBe(0);
  });

  it('Scenario: Se salva — revivir el marcado lo salva y no se apaga otro', () => {
    const s = cloneState(toMonth(at('bosque', { month: 5 }), 6));
    s.tiles.find((t) => t.x === 0 && t.y === 0)!.net = true;
    s.nutrients = 3;
    const saved = act(s, RUBI, FAR.x, FAR.y).state;
    expect(tile(saved, FAR.x, FAR.y)).toMatchObject({ alive: true, fading: false });
    const { state, message } = endMonth(saved);
    expect(fadedCount(state)).toBe(0);
    expect(message).not.toContain(es.log.treeFaded(FADED_REVIVE));
  });

  it('Scenario: Ancestral, tres veces', () => {
    let s = at('ancestral');
    const faded: number[] = [];
    while (s.month < 11) {
      s = endMonth(s).state;
      faded.push(fadedCount(s));
    }
    // Índice = mes que empieza − 2: se apaga al terminar los meses 3, 6 y 9.
    expect(faded).toEqual([0, 0, 1, 1, 1, 2, 2, 2, 3, 3]);
  });

  it('sin árboles grises sin apagar, no se marca ninguno', () => {
    const trees = newGame().tiles.filter((t) => t.kind === 'tree').map(({ x, y }) => ({ x, y }));
    expect(marked(endMonth(at('bosque', { month: 5, alive: trees })).state)).toEqual([]);
  });
});
