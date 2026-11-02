import { describe, expect, it } from 'vitest';
import { act, endDay, H, mulberry32, newGame, recruit, type GameState, type Point, type RecruitableSpecies, type SpeciesId } from '../src/rules';
import { playGame, randomDay, smartDay } from './bots';

const SEED = 2026;
const GAMES = 2000;

function simulate(day: (rng: () => number) => (s: GameState) => GameState) {
  const rng = mulberry32(SEED);
  let wins = 0;
  let winDays = 0;
  for (let i = 0; i < GAMES; i++) {
    const s = playGame(newGame(), day(rng));
    if (s.status === 'won') {
      wins++;
      winDays += s.wonDay!;
    }
  }
  return { rate: wins / GAMES, avgDay: wins ? winDays / wins : Infinity };
}

const report = (name: string, r: { rate: number; avgDay: number }) =>
  console.info(`[balance] ${name}: victorias ${(r.rate * 100).toFixed(1)} % · día medio ${r.avgDay.toFixed(1)}`);

// ─── Partida guiada ────────────────────────────────────────────────────────────
// Escrita en coordenadas del PoC (mapa horizontal 8×5) y traducida al mapa vertical
// con la rotación de design.md: (x, y) del PoC → (y, 7 - x).
// Los miembros se nombran por especie y orden de llegada (Maestra Bruma llega el día 3 y corre los ids).
const rotate = ({ x, y }: Point): Point => ({ x: y, y: H - 1 - x });

type Who = readonly [species: SpeciesId, nth: number];
type Step = readonly [who: Who, x: number, y: number] | readonly ['recruit', RecruitableSpecies];
const ANIL: Who = ['lactarius', 1];
const OLA: Who = ['lactarius', 2];
const BRUNO: Who = ['champi', 1];
const RUBI: Who = ['amanita', 1];

const GUIDED: readonly (readonly Step[])[] = [
  /* día 1 */ [[BRUNO, 0, 1], [ANIL, 1, 2], [RUBI, 2, 2]], // tronco junto al Hogar, tejer, revivir el árbol cercano
  /* día 2 */ [[BRUNO, 0, 1], [ANIL, 1, 3], [RUBI, 1, 4]], // terminar el tronco, tejer, segundo árbol
  /* día 3 */ [['recruit', 'lactarius'], [ANIL, 3, 2]], // llega Maestra Bruma; reclutar a Ola, tejer hacia el este
  /* día 4 */ [[ANIL, 4, 2], [OLA, 4, 1], [BRUNO, 4, 3], [RUBI, 4, 0]], // tejer ×2, tronco, tercer árbol
  /* día 5 */ [[ANIL, 5, 1], [OLA, 5, 0], [BRUNO, 4, 3]], // tejer ×2, terminar el tronco
  /* día 6 */ [[ANIL, 6, 0], [OLA, 7, 0], [RUBI, 7, 1]], // la red llega al cuarto árbol, vecino del Árbol Madre
  /* día 7 */ [[RUBI, 7, 2]], // despertar al Árbol Madre
];

function playGuided(): GameState {
  let s = newGame();
  for (const day of GUIDED) {
    for (const step of day) {
      if (step[0] === 'recruit') {
        s = recruit(s, step[1]).state;
      } else {
        const [[species, nth], x, y] = step;
        const id = s.members.filter((m) => m.species === species)[nth - 1]!.id;
        const p = rotate({ x, y });
        s = act(s, id, p.x, p.y).state;
      }
    }
    if (s.status !== 'playing') break;
    s = endDay(s).state;
  }
  return s;
}

describe('balance', () => {
  it(`bot con criterio (semilla ${SEED}, ${GAMES} partidas): gana ≥ 95 % y en promedio antes del día 9`, () => {
    const r = simulate(smartDay);
    report('bot con criterio', r);
    expect(r.rate).toBeGreaterThanOrEqual(0.95);
    expect(r.avgDay).toBeLessThan(9);
  }, 120_000);

  it(`bot al azar (semilla ${SEED}, ${GAMES} partidas): gana entre 15 % y 60 %`, () => {
    const r = simulate(randomDay);
    report('bot al azar', r);
    expect(r.rate).toBeGreaterThanOrEqual(0.15);
    expect(r.rate).toBeLessThanOrEqual(0.6);
  }, 120_000);

  it('partida guiada: gana en el día 9 o antes', () => {
    const s = playGuided();
    console.info(`[balance] partida guiada: ${s.status} en el día ${s.wonDay ?? s.day}`);
    expect(s.status).toBe('won');
    expect(s.wonDay).toBeLessThanOrEqual(9);
  });

  it('la rotación del PoC conserva el Hogar y el Árbol Madre', () => {
    expect(rotate({ x: 0, y: 2 })).toEqual({ x: 2, y: 7 }); // Hogar
    expect(rotate({ x: 7, y: 2 })).toEqual({ x: 2, y: 0 }); // Árbol Madre
  });
});
