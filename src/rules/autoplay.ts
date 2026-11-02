import { act, endMonth, recruit } from './actions';
import { advise } from './advice';
import type { GameState } from './types';

/** Juega una partida completa siguiendo las pistas (`advise`). Sirve para validar mapas y para el balance. */
export function playAdvised(start: GameState): GameState {
  let s = start;
  for (let guard = 0; s.status === 'playing' && guard < 1000; guard++) {
    const a = advise(s);
    if (a.kind === 'over') break;
    if (a.kind === 'endMonth') s = endMonth(s).state;
    else if (a.kind === 'recruit') s = recruit(s, a.species).state;
    else s = act(s, a.memberId, a.target.x, a.target.y).state;
  }
  return s;
}
