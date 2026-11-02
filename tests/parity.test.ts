import { describe, expect, it } from 'vitest';
import {
  act,
  check,
  COST,
  endDay,
  H,
  MAX_GUILD,
  mulberry32,
  newGame,
  recruit,
  SPECIES_IDS,
  validTargets,
  type GameState,
} from '../src/rules';
import pocSource from '../poc/rules.js?raw';

// El PoC es la fuente de verdad: el port debe comportarse igual, con el mapa rotado.
// Se carga como texto y se evalúa aislado (sin editar poc/).
const Poc = new Function(`${pocSource}\nreturn Rules;`)();

/** Vertical (x, y) → PoC (7 - y, x). Inversa de la rotación de design.md. */
const toPoc = (x: number, y: number) => ({ x: H - 1 - y, y: x });

function summary(s: GameState) {
  return {
    day: s.day,
    nutrients: s.nutrients,
    spores: s.spores,
    status: s.status,
    members: s.members.map((m) => [m.id, m.species, m.name, m.used]),
    tiles: s.tiles
      .map((t) => ({ ...toPoc(t.x, t.y), kind: t.kind, net: t.net, uses: t.uses, alive: t.alive }))
      .sort((a, b) => a.y - b.y || a.x - b.x),
  };
}

function pocSummary(p: any) {
  return {
    day: p.day,
    nutrients: p.nutrients,
    spores: p.spores,
    status: p.status,
    members: p.members.map((m: any) => [m.id, m.sp, m.name, m.used]),
    tiles: p.tiles.map((t: any) => ({ x: t.x, y: t.y, kind: t.t, net: t.net, uses: t.uses, alive: t.alive })),
  };
}

describe('paridad con poc/rules.js', () => {
  it('300 partidas al azar producen el mismo estado y los mismos mensajes en cada paso', () => {
    const rng = mulberry32(7);
    for (let g = 0; g < 300; g++) {
      let s = newGame();
      const p = Poc.newGame();
      expect(summary(s)).toEqual(pocSummary(p));
      while (s.status === 'playing') {
        if (s.spores >= COST.recruit && s.members.length < MAX_GUILD && rng() < 0.7) {
          const sp = SPECIES_IDS[Math.floor(rng() * 3)]!;
          const r = recruit(s, sp);
          expect(r.message).toBe(Poc.recruit(p, sp));
          s = r.state;
        }
        for (const m of s.members) {
          if (s.status !== 'playing' || rng() < 0.15) continue;
          // Probar también una casilla cualquiera: el motivo de rechazo debe coincidir.
          const any = s.tiles[Math.floor(rng() * s.tiles.length)]!;
          const q = toPoc(any.x, any.y);
          expect(check(s, m.id, any.x, any.y)).toEqual(Poc.check(p, m.id, q.x, q.y));
          const targets = validTargets(s, m.id);
          expect(targets.length).toBe(Poc.validTargets(p, m.id).length);
          if (!targets.length) continue;
          const t = targets[Math.floor(rng() * targets.length)]!;
          const pt = toPoc(t.x, t.y);
          const r = act(s, m.id, t.x, t.y);
          expect(r.message).toBe(Poc.act(p, m.id, pt.x, pt.y));
          s = r.state;
        }
        const r = endDay(s);
        expect(r.message).toBe(Poc.endDay(p));
        s = r.state;
        expect(summary(s)).toEqual(pocSummary(p));
      }
    }
  }, 60_000);
});
