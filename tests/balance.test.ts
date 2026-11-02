import { describe, expect, it } from 'vitest';
import {
  act,
  COST,
  endDay,
  MAX_GUILD,
  mulberry32,
  newGame,
  recruit,
  SPECIES_IDS,
  validTargets,
  H,
  type GameState,
  type Point,
  type SpeciesId,
} from '../src/rules';

// ─── Bot aleatorio sembrado ────────────────────────────────────────────────────
// Política (propuesta, pendiente de aprobación):
//   1. Si hay esporas para reclutar y cabe alguien, recluta una especie al azar (una vez al día).
//   2. Cada miembro, en orden aleatorio, actúa sobre una casilla válida al azar (si la hay).
//   3. Termina el día.
const SEED = 2026;
const GAMES = 2000;

function pick<T>(rng: () => number, list: readonly T[]): T {
  return list[Math.floor(rng() * list.length)]!;
}

function shuffle<T>(rng: () => number, list: readonly T[]): T[] {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function playRandom(rng: () => number): GameState {
  let s = newGame();
  while (s.status === 'playing') {
    if (s.spores >= COST.recruit && s.members.length < MAX_GUILD) s = recruit(s, pick(rng, SPECIES_IDS)).state;
    for (const m of shuffle(rng, s.members)) {
      if (s.status !== 'playing') break;
      const targets = validTargets(s, m.id);
      if (targets.length) {
        const t = pick(rng, targets);
        s = act(s, m.id, t.x, t.y).state;
      }
    }
    if (s.status === 'playing') s = endDay(s).state;
  }
  return s;
}

// ─── Partida guiada ────────────────────────────────────────────────────────────
// Escrita en coordenadas del PoC (mapa horizontal 8×5) y traducida al mapa vertical
// con la rotación de design.md: (x, y) del PoC → (y, 7 - x).
// Ids: 1 Ola (Ostra) · 2 Bruno (Champiñón) · 3 Rubí (Amanita) · 4 Nube (Ostra, reclutada el día 3).
const rotate = ({ x, y }: Point): Point => ({ x: y, y: H - 1 - x });

type Step = readonly [memberId: number, x: number, y: number] | readonly ['recruit', SpeciesId];
const GUIDED: readonly (readonly Step[])[] = [
  /* día 1 */ [[2, 0, 1], [1, 1, 2], [3, 2, 2]], // tronco junto al Hogar, tejer, revivir el árbol cercano
  /* día 2 */ [[2, 0, 1], [1, 1, 3], [3, 1, 4]], // terminar el tronco, tejer, segundo árbol
  /* día 3 */ [['recruit', 'ostra'], [1, 3, 2]], // reclutar una segunda Ostra, tejer hacia el este
  /* día 4 */ [[1, 4, 2], [4, 4, 1], [2, 4, 3], [3, 4, 0]], // tejer ×2, tronco, tercer árbol
  /* día 5 */ [[1, 5, 1], [4, 5, 0], [2, 4, 3]], // tejer ×2, terminar el tronco
  /* día 6 */ [[1, 6, 0], [4, 7, 0], [3, 7, 1]], // la red llega al cuarto árbol, vecino del Árbol Madre
  /* día 7 */ [[3, 7, 2]], // despertar al Árbol Madre
];

function playGuided(): GameState {
  let s = newGame();
  for (const day of GUIDED) {
    for (const step of day) {
      if (step[0] === 'recruit') {
        s = recruit(s, step[1]).state;
      } else {
        const [id, x, y] = step;
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
  it(`bot aleatorio (semilla ${SEED}, ${GAMES} partidas): gana entre 20 % y 60 %`, () => {
    const rng = mulberry32(SEED);
    let wins = 0;
    let winDays = 0;
    for (let i = 0; i < GAMES; i++) {
      const s = playRandom(rng);
      if (s.status === 'won') {
        wins++;
        winDays += s.wonDay!;
      }
    }
    const rate = wins / GAMES;
    console.info(`[balance] victorias ${(rate * 100).toFixed(1)} % · día medio de victoria ${(winDays / wins).toFixed(1)}`);
    expect(rate).toBeGreaterThanOrEqual(0.2);
    expect(rate).toBeLessThanOrEqual(0.6);
  }, 60_000);

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
