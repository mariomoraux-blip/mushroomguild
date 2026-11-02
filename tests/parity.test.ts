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
  recruitableCount,
  validTargets,
  type GameState,
  type RecruitableSpecies,
} from '../src/rules';
import pocSource from '../poc/rules.js?raw';

// El PoC es la fuente de las 3 especies portadas: el port debe comportarse igual, con el mapa rotado.
// Se carga como texto y se evalúa aislado (sin editar poc/).
// Fuera del PoC: la Gliophorus no se recluta, Maese Bruma nunca actúa y se ignora al comparar,
// y los nombres/especies se traducen (Ostra → Lactarius, nombres nuevos del GDD).
const Poc = new Function(`${pocSource}\nreturn Rules;`)();

const PORTED: readonly RecruitableSpecies[] = ['champi', 'lactarius', 'amanita'];
const toPocSpecies = (sp: string) => (sp === 'lactarius' ? 'ostra' : sp);

/** Vertical (x, y) → PoC (7 - y, x). Inversa de la rotación de design.md. */
const toPoc = (x: number, y: number) => ({ x: H - 1 - y, y: x });

function summary(s: GameState) {
  return {
    day: s.day,
    nutrients: s.nutrients,
    spores: s.spores,
    status: s.status,
    members: s.members.filter((m) => m.species !== 'mago').map((m) => [toPocSpecies(m.species), m.used]),
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
    members: p.members.map((m: any) => [m.sp, m.used]),
    tiles: p.tiles.map((t: any) => ({ x: t.x, y: t.y, kind: t.t, net: t.net, uses: t.uses, alive: t.alive })),
  };
}

describe('paridad con poc/rules.js (especies portadas)', () => {
  it('300 partidas al azar producen el mismo estado y los mismos motivos en cada paso', () => {
    const rng = mulberry32(7);
    for (let g = 0; g < 300; g++) {
      let s = newGame();
      const p = Poc.newGame();
      // Pares [id del port, id del PoC] de los miembros portados, en orden de llegada.
      const pairs: [number, number][] = s.members.map((m, i) => [m.id, p.members[i].id]);
      const names = new Map<string, string>(s.members.map((m, i) => [p.members[i].name, m.name]));
      const normalize = (msg: string) => {
        // Un solo reemplazo por pasada: los nombres del PoC y los nuevos se cruzan (Gordo/Migas/Trufo).
        const re = new RegExp(`(?<!\\p{L})(${[...names.keys()].join('|')})(?!\\p{L})`, 'gu');
        return msg.replace('La Ostra', 'La Lactarius').replace(re, (n) => names.get(n) ?? n);
      };
      expect(summary(s)).toEqual(pocSummary(p));

      while (s.status === 'playing') {
        if (s.spores >= COST.recruit && recruitableCount(s) < MAX_GUILD && rng() < 0.7) {
          const sp = PORTED[Math.floor(rng() * 3)]!;
          s = recruit(s, sp).state;
          Poc.recruit(p, toPocSpecies(sp));
          const ours = s.members.at(-1)!;
          const theirs = p.members.at(-1);
          pairs.push([ours.id, theirs.id]);
          names.set(theirs.name, ours.name);
        }
        for (const [id, pocId] of pairs) {
          if (s.status !== 'playing' || rng() < 0.15) continue;
          // Probar también una casilla cualquiera: el motivo de rechazo debe coincidir.
          const any = s.tiles[Math.floor(rng() * s.tiles.length)]!;
          const q = toPoc(any.x, any.y);
          const ours = check(s, id, any.x, any.y);
          const theirs = Poc.check(p, pocId, q.x, q.y);
          expect(ours.ok).toBe(theirs.ok);
          if (!ours.ok) expect(ours.reason).toBe(normalize(theirs.reason));
          const targets = validTargets(s, id);
          expect(targets.length).toBe(Poc.validTargets(p, pocId).length);
          if (!targets.length) continue;
          const t = targets[Math.floor(rng() * targets.length)]!;
          const pt = toPoc(t.x, t.y);
          const r = act(s, id, t.x, t.y);
          expect(r.message).toBe(normalize(Poc.act(p, pocId, pt.x, pt.y)));
          s = r.state;
        }
        const r = endDay(s);
        Poc.endDay(p);
        s = r.state;
        expect(summary(s)).toEqual(pocSummary(p));
      }
    }
  }, 60_000);
});
