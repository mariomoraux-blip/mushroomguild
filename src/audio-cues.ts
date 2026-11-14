// Qué suena en cada cambio del store (049, P0 de docs/sound-design.md). Es presentación pura: sin DOM ni Web Audio.
// `src/audio.ts` reproduce estas cues; nada de aquí cambia el estado del juego.
import { diffEffects } from './effects';
import type { Action, AppState } from './store';

export const SOUNDS = [
  'ui-tap',
  'ui-tap-primary',
  'ui-select',
  'ui-sheet-open',
  'ui-sheet-close',
  'sfx-weave',
  'sfx-decompose',
  'sfx-revive',
  'sfx-awaken',
  'sfx-spores',
  'sfx-recruit',
  'sfx-month-end',
  'sfx-invalid',
  'stg-victory',
  'stg-defeat',
] as const;
export type SoundId = (typeof SOUNDS)[number];

/** Buses de la mezcla: «Sonido» enciende `game` y `ui`; «Música», `music`. */
export type Bus = 'music' | 'game' | 'ui';
export const busOf = (id: SoundId): Bus => (id.startsWith('stg-') ? 'music' : id.startsWith('sfx-') ? 'game' : 'ui');

/** Una reproducción: `delay` en ms; `step`, semitonos sobre la nota de la toma. */
export interface Cue {
  readonly id: SoundId;
  readonly delay?: number;
  readonly step?: number;
}

/** Re mayor pentatónica en semitonos sobre re: cada tejido del mismo mes sube un grado. */
export const PENTATONIC = [0, 2, 4, 7, 9, 12] as const;
/** Las esporas del mes nuevo suenan cuando vuelan, no al pulsar «Fin del mes». */
export const SPORES_AFTER_MONTH_MS = 450;
/** `stg-victory` entra cuando la luz del Árbol Ancestral ya subió. */
export const VICTORY_AFTER_AWAKEN_MS = 900;
/** Varios tejidos en la misma jugada no suenan juntos: se escalonan. */
const WEAVE_STAGGER_MS = 80;

export interface CueResult {
  readonly cues: Cue[];
  /** Tejidos que ya sonaron en el mes de `next` (para el grado del próximo). */
  readonly weaves: number;
}

/**
 * Cues de pasar de `prev` a `next` por `action`. `weaves`: tejidos que ya sonaron en el mes de `prev`.
 * Una sola cue de interfaz por acción y ninguna si ya suena algo del tablero.
 */
export function cuesFor(prev: AppState, next: AppState, action: Action, weaves = 0): CueResult {
  const game: Cue[] = [];
  const music: Cue[] = [];
  const g0 = prev.game;
  const g1 = next.game;
  const changed = g1 !== g0;
  const sameGame = g1.mapId === g0.mapId && g1.level === g0.level && g1.log.length >= g0.log.length;
  let w = sameGame && g1.month === g0.month ? weaves : 0;
  const effects = changed && sameGame ? diffEffects(g0, g1) : [];

  if (action.type === 'endMonth' && changed) game.push({ id: 'sfx-month-end' });
  if (action.type === 'recruit' && changed) game.push({ id: 'sfx-recruit' });
  let woven = 0;
  for (const e of effects) {
    switch (e.kind) {
      case 'weave':
        game.push({ id: 'sfx-weave', step: PENTATONIC[Math.min(w, PENTATONIC.length - 1)]!, delay: woven * WEAVE_STAGGER_MS });
        w++;
        woven++;
        break;
      case 'decompose':
        game.push({ id: 'sfx-decompose' });
        break;
      case 'revive':
        game.push({ id: 'sfx-revive' });
        break;
      case 'awaken':
        game.push({ id: 'sfx-awaken' });
        break;
      case 'spores':
        game.push(action.type === 'endMonth' ? { id: 'sfx-spores', delay: SPORES_AFTER_MONTH_MS } : { id: 'sfx-spores' });
        break;
      default:
        // P1: rocas, hilos, plaga, pasar la voz. Por ahora, la jugada aceptada suena como interfaz (abajo).
        break;
    }
  }

  // Lo que no se puede: un toque rechazado, un recluta que no alcanza o un miembro cansado (nunca un zumbido).
  const warned = next.ui.notice !== prev.ui.notice && next.ui.notice.tone === 'warn' && !changed;
  if (warned && ((action.type === 'tapTile' && prev.ui.selected !== null) || action.type === 'recruit' || (action.type === 'select' && next.ui.selected === null))) {
    game.push({ id: 'sfx-invalid' });
  }

  // Cortinas: solo cuando la partida termina (no al volver a «Ver final»).
  if (g0.status === 'playing' && next.ui.story?.kind !== prev.ui.story?.kind) {
    if (next.ui.story?.kind === 'won') music.push({ id: 'stg-victory', delay: effects.some((e) => e.kind === 'awaken') ? VICTORY_AFTER_AWAKEN_MS : 0 });
    if (next.ui.story?.kind === 'lost') music.push({ id: 'stg-defeat' });
  }

  const ui = game.length ? null : uiCue(prev, next, action, changed);
  return { cues: [...game, ...music, ...(ui ? [ui] : [])], weaves: w };
}

/** La cue de interfaz de la acción, por prioridad: elegir, abrir una hoja, cerrarla. */
function uiCue(prev: AppState, next: AppState, action: Action, changed: boolean): Cue | null {
  const picked = next.ui.selected !== null && next.ui.selected !== prev.ui.selected;
  // Tocar una casilla sin nadie elegido muestra su ayuda; una jugada aceptada sin sonido propio (P1) también es un «tic».
  const tile = action.type === 'tapTile' && (changed || (prev.ui.selected === null && next.ui.notice !== prev.ui.notice));
  if (picked || tile) return { id: 'ui-select' };
  const a = prev.ui.sheet;
  const b = next.ui.sheet;
  if (b && (!a || a.kind !== b.kind)) return { id: 'ui-sheet-open' };
  if (a && !b) return { id: 'ui-sheet-close' };
  return null;
}

/** Fuera del tablero (portada, «Elige tu dificultad», «El gremio», ranking) no suena nada (050). */
export const silentScreen = (state: AppState): boolean => state.ui.screen !== null;
