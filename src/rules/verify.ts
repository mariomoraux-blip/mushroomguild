// Verificación de un resultado para el ranking (036 · leaderboard › Verificación en el servidor). Pura: la usan el
// servidor y las pruebas. Rejuega el `actionLog` con las mismas reglas del cliente y devuelve los números que recalcula.
import { act, endMonth, recruit } from './actions';
import { H, LEADERBOARD, LEVEL_IDS, RECRUITABLE, SCORE_VERSION, W } from './config';
import { LEVEL_SEEDS } from './level-seeds';
import { scoreResult, startOf, stars, thresholds, type ScoreResult } from './scoring';
import type { GameState, Level, LoggedAction } from './types';

export type VerifyReason = 'shape' | 'outdated' | 'map' | 'replay' | 'time' | 'score';
export type Verified = { readonly ok: true; readonly result: ScoreResult } | { readonly ok: false; readonly reason: VerifyReason };

const MAX_SEED = 2147483647;
const isInt = (v: unknown, min: number, max: number): v is number => Number.isInteger(v) && (v as number) >= min && (v as number) <= max;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

function isAction(a: unknown): a is LoggedAction {
  if (!isObj(a)) return false;
  if (a.type === 'endMonth') return true;
  if (a.type === 'recruit') return RECRUITABLE.includes(a.species as never);
  if (a.type !== 'act') return false;
  return isInt(a.memberId, 0, 1000) && isInt(a.x, 0, W - 1) && isInt(a.y, 0, H - 1) && (a.spell === undefined || ['sprout', 'rain', 'spores', 'nutrients'].includes(a.spell as string));
}

/** Semilla de un `mapId` que cuenta para el ranking: un claro generado; en Bosque y Ancestral, uno certificado. */
export function rankedSeed(mapId: string, level: Level): number | null {
  const m = /^seed-(\d{1,10})$/.exec(mapId);
  const seed = m ? Number(m[1]) : NaN;
  if (!isInt(seed, 1, MAX_SEED)) return null;
  if (level === 'brote') return seed;
  const known = LEVEL_SEEDS[level].charAt(seed);
  return known && known !== '-' ? seed : null;
}

/** Rejuega paso a paso: falla si una acción no es válida o si sobran acciones tras el final. */
function replayStrict(start: GameState, log: readonly LoggedAction[]): GameState | null {
  let s = start;
  try {
    for (const a of log) {
      if (s.status !== 'playing') return null;
      if (a.type === 'act') s = act(s, a.memberId, a.x, a.y, a.spell).state;
      else if (a.type === 'recruit') s = recruit(s, a.species).state;
      else s = endMonth(s).state;
    }
  } catch {
    return null;
  }
  return s;
}

/** Verifica un `ScoreResult` que llega de un cliente. Si es válido, devuelve el resultado recalculado. */
export function verifyResult(input: unknown): Verified {
  const fail = (reason: VerifyReason): Verified => ({ ok: false, reason });
  if (!isObj(input)) return fail('shape');
  const { scoringVersion, mapId, level, wonMonth, timeMs, total, stars: claimedStars, actionLog } = input;
  if (
    typeof scoringVersion !== 'number' ||
    typeof mapId !== 'string' ||
    !LEVEL_IDS.includes(level as Level) ||
    !isInt(wonMonth, 1, 12) ||
    typeof timeMs !== 'number' ||
    !Number.isFinite(timeMs) ||
    !isInt(total, 0, 1e7) ||
    !isInt(claimedStars, 1, 3) ||
    !Array.isArray(actionLog) ||
    actionLog.length > LEADERBOARD.maxLog ||
    !actionLog.every(isAction)
  )
    return fail('shape');
  if (scoringVersion !== SCORE_VERSION) return fail('outdated');
  const lv = level as Level;
  const start = rankedSeed(mapId, lv) === null ? null : startOf(mapId, lv);
  if (!start) return fail('map');
  const final = replayStrict(start, actionLog);
  if (!final || final.status !== 'won' || final.wonMonth !== wonMonth) return fail('replay');
  if (timeMs < actionLog.length * LEADERBOARD.minMsPerAction || timeMs > LEADERBOARD.maxTimeMs) return fail('time');
  const th = thresholds(start);
  const result = scoreResult(final, timeMs, th);
  if (result.total !== total || stars(result.total, th) !== claimedStars) return fail('score');
  return { ok: true, result };
}
