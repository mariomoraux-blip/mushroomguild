import { describe, expect, it } from 'vitest';
import { es } from '../src/copy/es';
import { act, advise, certify, endMonth, newGame, newRandomGame, noWorkThisMonth, recruit, validTargets, type GameState } from '../src/rules';
import { initialState, reduce } from '../src/store';
import { INDI, BRUNO, RUBI } from './helpers';

// Reporte de producción (024): Ancestral, semilla 745. El jugador hizo lo mismo que la línea ganadora del
// certificador y en el mes 4 nadie del gremio tenía trabajo.
// Sin `endMonth` del mes 3 si `closeLast` es falso (para cerrarlo desde el store).
function report(closeLast = true): GameState {
  let s = newRandomGame(745, 'ancestral');
  const moves: [number, number, number][][] = [
    [[BRUNO, 2, 7], [INDI, 4, 7]],
    [[BRUNO, 2, 7], [INDI, 4, 6], [RUBI, 4, 5]],
    [[INDI, 2, 7]],
  ];
  moves.forEach((month, i) => {
    for (const [id, x, y] of month) s = act(s, id, x, y).state;
    if (closeLast || i < moves.length - 1) s = endMonth(s).state;
  });
  return s;
}

describe('Requirement: Aviso de mes vacío', () => {
  it('el estado del reporte es un mes vacío y todavía se puede ganar', () => {
    const s = report();
    expect(s.month).toBe(4);
    expect(s.nutrients).toBe(2);
    expect(s.spores).toBe(2);
    expect(noWorkThisMonth(s)).toBe(true);
    expect(certify(s)?.status).toBe('won');
  });

  it('reclutar no lo apaga: el recluta llega cansado', () => {
    expect(noWorkThisMonth(recruit(report(), 'lactarius').state)).toBe(true);
  });

  it('no es un mes vacío si alguien ya actuó este mes', () => {
    // Clásico: Bruno descompone el tronco junto al Hogar y Indi teje; a Rubí no le queda ningún árbol.
    const s = act(act(newGame(), BRUNO, 1, 7).state, INDI, 3, 7).state;
    expect(validTargets(s, RUBI)).toHaveLength(0);
    expect(noWorkThisMonth(s)).toBe(false);
  });

  it('con la partida terminada no hay aviso', () => {
    expect(noWorkThisMonth({ ...report(), status: 'lost' })).toBe(false);
  });

  it('la política de las pistas en el clásico no pasa por ningún mes vacío', () => {
    let s = newGame();
    for (let guard = 0; s.status === 'playing' && guard < 1000; guard++) {
      expect(noWorkThisMonth(s)).toBe(false);
      const a = advise(s);
      if (a.kind === 'over') break;
      if (a.kind === 'endMonth') s = endMonth(s).state;
      else if (a.kind === 'recruit') s = recruit(s, a.species).state;
      else s = act(s, a.memberId, a.target.x, a.target.y).state;
    }
    expect(s.status).toBe('won');
  });

  it('Ancestral: al empezar el mes vacío la bitácora lo dice, sin «Pista:»', () => {
    const next = reduce(initialState(report(false)), { type: 'endMonth' });
    expect(next.ui.notice.text).toContain(es.log.emptyMonth(1));
    expect(next.ui.notice.text).toContain(es.log.newMonth(4));
    expect(next.ui.notice.text).not.toContain('Pista:');
    expect(initialState(next.game).ui.notice.text).toBe(es.log.emptyMonth(1));
  });

  it('después de reclutar en un mes vacío, la bitácora lo sigue diciendo', () => {
    const next = reduce(initialState(report()), { type: 'recruit', species: 'lactarius' });
    expect(next.ui.notice.text).toContain(es.log.emptyMonth(1));
  });

  it('con pistas, la pista de reclutar se queda; la de terminar el mes cede al aviso', () => {
    const bosque = { ...report(), level: 'bosque' as const };
    expect(initialState(bosque).ui.notice.text).toMatch(/^Pista: tienes 2 esporas/);
    expect(initialState({ ...bosque, spores: 0 }).ui.notice.text).toBe(es.log.emptyMonth(1));
  });

  it('texto sin árboles vivos', () => {
    expect(es.log.emptyMonth(0)).toBe('Nadie tiene trabajo este mes. Termina el mes.');
    expect(es.log.emptyMonth(1)).toBe('Nadie tiene trabajo este mes. Termina el mes: la hojarasca traerá 1 nutriente.');
  });
});
