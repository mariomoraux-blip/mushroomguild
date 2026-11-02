import { describe, expect, it } from 'vitest';
import { addMage, cloneState, newGame, newRandomGame, playAdvised, replay, SCORE_VERSION, score, scoreResult, stars, thresholds, type GameState, type LoggedAction, type SpeciesId } from '../src/rules';
import { addMember } from '../src/rules/state';

/** Victoria armada a mano: mes, árboles vivos, reservas, gremio y acciones por especie. */
function victory(o: { month: number; trees: number; nutrients: number; spores: number; extra: ('gliophorus' | 'champi' | 'lactarius' | 'amanita')[]; actions: number; species: SpeciesId[] }): GameState {
  const s = cloneState(newGame());
  o.extra.forEach((sp) => addMember(s, sp));
  if (o.species.includes('mago')) addMage(s);
  let left = o.trees;
  for (const t of s.tiles) if (t.kind === 'tree' && left > 0) (t.alive = true), (t.net = true), left--;
  const idOf = (sp: SpeciesId) => s.members.find((m) => m.species === sp)!.id;
  s.log = Array.from({ length: o.actions }, (_, i): LoggedAction => ({ type: 'act', memberId: idOf(o.species[i % o.species.length]!), x: 0, y: 0 }));
  s.status = 'won';
  s.wonMonth = o.month;
  s.month = o.month;
  s.nutrients = o.nutrients;
  s.spores = o.spores;
  return s;
}
const FIVE: SpeciesId[] = ['champi', 'lactarius', 'amanita', 'gliophorus', 'mago'];

describe('Requirement: Puntaje', () => {
  it('Scenario: Victoria conocida — mes 8, 5 árboles, 4 nutrientes, 3 esporas, 5 reclutables, 30 acciones, 5 especies, 3:20', () => {
    const s = victory({ month: 8, trees: 5, nutrients: 4, spores: 3, extra: ['gliophorus', 'champi'], actions: 30, species: FIVE });
    const sc = score(s, 200_000);
    expect(sc.breakdown).toEqual({ victory: 500, months: 320, trees: 600, reserves: 100, guild: 60, activity: 150, variety: 150, time: 280 });
    expect(sc.total).toBe(2160);
  });

  it('Scenario: Tope de actividad — 47 acciones valen lo mismo que 40', () => {
    const base = { month: 9, trees: 3, nutrients: 0, spores: 0, extra: ['gliophorus'] as ('gliophorus')[], species: FIVE };
    expect(score(victory({ ...base, actions: 47 }), 0).breakdown.activity).toBe(200);
    expect(score(victory({ ...base, actions: 40 }), 0).breakdown.activity).toBe(200);
  });

  it('Scenario: Variedad sin Gliophorus — vale 0', () => {
    const s = victory({ month: 9, trees: 3, nutrients: 0, spores: 0, extra: [], actions: 20, species: ['champi', 'lactarius', 'amanita', 'mago'] });
    expect(score(s, 0).breakdown.variety).toBe(0);
  });

  it('Scenario: Derrota — no hay puntaje', () => {
    expect(score({ ...newGame(), status: 'lost' }, 60_000).total).toBe(0);
  });

  it('el tiempo da 1 punto por segundo por debajo de 8:00, con máximo 480', () => {
    const s = victory({ month: 9, trees: 3, nutrients: 0, spores: 0, extra: ['gliophorus'], actions: 0, species: FIVE });
    expect(score(s, 0).breakdown.time).toBe(480);
    expect(score(s, 479_999).breakdown.time).toBe(1);
    expect(score(s, 600_000).breakdown.time).toBe(0);
  });

  it('reclutar y terminar el mes no cuentan como acciones', () => {
    const s = victory({ month: 9, trees: 3, nutrients: 0, spores: 0, extra: ['gliophorus'], actions: 0, species: FIVE });
    const withOthers = { ...s, log: [...s.log, { type: 'recruit', species: 'champi' } as const, { type: 'endMonth' } as const] };
    expect(score(withOthers, 0).breakdown.activity).toBe(0);
  });
});

describe('Requirement: Estrellas', () => {
  const th = thresholds(newGame());

  it('Scenario: Límites exactos — umbral2 − 1, umbral2 y umbral3 dan 1, 2 y 3', () => {
    expect([stars(th.two - 1, th), stars(th.two, th), stars(th.three, th)]).toEqual([1, 2, 3]);
  });

  it('Scenario: Calibración por claro — semilla 1: 90 % y 110 % del bot con criterio, que saca 2 estrellas', () => {
    const start = newRandomGame(1);
    const t = thresholds(start);
    const ref = playAdvised(start);
    expect(t.reference).toBe(score(ref, ref.wonMonth! * 25_000).total);
    expect(t.two).toBe(Math.round(t.reference * 0.9));
    expect(t.three).toBe(Math.round(t.reference * 1.1));
    expect(stars(t.reference, t)).toBe(2);
  });

  it('sin referencia (el bot no gana), toda victoria vale 1 estrella', () => {
    const t = thresholds({ ...newGame(), month: 12, nutrients: 0 });
    expect(t.reference).toBe(0);
    expect(stars(99_999, t)).toBe(1);
  });
});

describe('Requirement: Resultado verificable', () => {
  it('Scenario: Rejugar — el actionLog reproduce el estado final y el total', () => {
    const final = playAdvised(newRandomGame(3));
    expect(final.status).toBe('won');
    const r = scoreResult(final, 212_000, thresholds(newRandomGame(3)));
    expect(r).toMatchObject({ scoringVersion: SCORE_VERSION, mapId: 'seed-3', wonMonth: final.wonMonth, timeMs: 212_000 });
    const again = replay(r.mapId, r.actionLog);
    expect(again).toEqual(final);
    expect(score(again, r.timeMs).total).toBe(r.total);
  });

  it('el mapa clásico también se rejuega', () => {
    const final = playAdvised(newGame());
    expect(replay('clasico', final.log)).toEqual(final);
  });
});
