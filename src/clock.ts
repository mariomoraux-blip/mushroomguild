// Cronómetro de juego activo (015 · scoring) como datos puros: quien lo usa le pasa la hora (`now`, en ms).
export interface Clock {
  /** Tiempo acumulado mientras corrió. */
  readonly elapsedMs: number;
  /** Desde cuándo corre, o null si está en pausa. */
  readonly since: number | null;
}

export const newClock = (): Clock => ({ elapsedMs: 0, since: null });
export const isRunning = (c: Clock): boolean => c.since !== null;
export const resume = (c: Clock, now: number): Clock => (c.since === null ? { ...c, since: now } : c);
export const pause = (c: Clock, now: number): Clock => (c.since === null ? c : { elapsedMs: c.elapsedMs + Math.max(0, now - c.since), since: null });
export const read = (c: Clock, now: number): number => c.elapsedMs + (c.since === null ? 0 : Math.max(0, now - c.since));
/** Corre o se pausa según `run`. */
export const sync = (c: Clock, run: boolean, now: number): Clock => (run ? resume(c, now) : pause(c, now));

/** mm:ss (los minutos pueden pasar de 59: el cronómetro no tiene límite). */
export function formatClock(ms: number): string {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}
