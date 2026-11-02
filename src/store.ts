// Store mínimo: estado del juego (de src/rules) + estado de la interfaz, `dispatch` y suscriptores.
// Toda acción del jugador pasa por aquí y por las reglas; las escenas y el DOM solo leen.
import { es } from './copy/es';
import {
  act,
  check,
  endDay,
  idleReason,
  member,
  newGame,
  recruit,
  RuleError,
  validTargets,
  type GameState,
  type RecruitableSpecies,
  type SpeciesId,
  type Spell,
  type Tile,
} from './rules';

export type Sheet = { kind: 'recruit' } | { kind: 'creature'; species: SpeciesId } | { kind: 'spell' };

export interface Notice {
  readonly text: string;
  readonly tone: 'info' | 'warn';
}

export interface UiState {
  /** Miembro seleccionado. */
  readonly selected: number | null;
  /** Hechizo elegido para Maestra Bruma. */
  readonly spell: Spell | null;
  readonly sheet: Sheet | null;
  readonly notice: Notice;
}

export interface AppState {
  readonly game: GameState;
  readonly ui: UiState;
}

export type Action =
  | { type: 'select'; id: number }
  | { type: 'chooseSpell'; spell: Spell }
  | { type: 'tapTile'; x: number; y: number }
  | { type: 'recruit'; species: RecruitableSpecies }
  | { type: 'endDay' }
  | { type: 'cancel' }
  | { type: 'openSheet'; sheet: Sheet }
  | { type: 'closeSheet' };

const info = (text: string): Notice => ({ text, tone: 'info' });
const warn = (text: string): Notice => ({ text, tone: 'warn' });

/** Pista de la bitácora cuando no hay nada seleccionado. */
export function idleHint(game: GameState): Notice {
  if (game.status === 'won') return info(es.hints.won);
  if (game.status === 'lost') return info(es.hints.lost);
  return info(game.members.some((m) => !m.used) ? es.hints.pickMember : es.hints.allWorked);
}

export function initialState(game: GameState = newGame()): AppState {
  return { game, ui: { selected: null, spell: null, sheet: null, notice: idleHint(game) } };
}

/** Casillas a resaltar: las válidas del miembro seleccionado (para el mago, solo con hechizo elegido). */
export function highlighted(state: AppState): Tile[] {
  const { selected, spell } = state.ui;
  if (selected === null) return [];
  const m = member(state.game, selected);
  if (!m || (m.species === 'mago' && !spell)) return [];
  return validTargets(state.game, selected, spell ?? undefined);
}

const cleared = (ui: UiState, notice: Notice): UiState => ({ ...ui, selected: null, spell: null, sheet: null, notice });

export function reduce(state: AppState, action: Action): AppState {
  const { game, ui } = state;
  switch (action.type) {
    case 'select': {
      if (game.status !== 'playing') return state;
      if (ui.selected === action.id) return { game, ui: cleared(ui, idleHint(game)) };
      const m = member(game, action.id);
      if (!m) return state;
      if (m.used) return { game, ui: { ...cleared(ui, warn(es.reasons.tired(m.name))) } };
      const idle = idleReason(game, m.id);
      if (idle) return { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: warn(es.idleLine(m.name, es.idle[idle])) } };
      if (m.species === 'mago') {
        return { game, ui: { ...ui, selected: m.id, spell: null, sheet: { kind: 'spell' }, notice: info(es.hints.pickSpell(m.name)) } };
      }
      return { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: info(es.hints.pickTile(m.name)) } };
    }
    case 'chooseSpell': {
      const m = ui.selected === null ? undefined : member(game, ui.selected);
      if (!m || m.species !== 'mago') return state;
      return { game, ui: { ...ui, spell: action.spell, sheet: null, notice: info(es.hints.pickTile(m.name)) } };
    }
    case 'tapTile': {
      if (game.status !== 'playing') return state;
      if (ui.selected === null) return { game, ui: { ...ui, notice: idleHint(game) } };
      const m = member(game, ui.selected);
      if (!m) return state;
      if (m.species === 'mago' && !ui.spell) {
        return { game, ui: { ...ui, sheet: { kind: 'spell' }, notice: info(es.hints.pickSpell(m.name)) } };
      }
      const c = check(game, m.id, action.x, action.y, ui.spell ?? undefined);
      if (!c.ok) return { game, ui: { ...ui, notice: warn(c.reason) } };
      const r = act(game, m.id, action.x, action.y);
      return { game: r.state, ui: cleared(ui, info(r.message)) };
    }
    case 'recruit': {
      try {
        const r = recruit(game, action.species);
        return { game: r.state, ui: cleared(ui, info(r.message)) };
      } catch (e) {
        if (e instanceof RuleError) return { game, ui: { ...ui, notice: warn(e.message) } };
        throw e;
      }
    }
    case 'endDay': {
      const r = endDay(game);
      if (r.state === game) return state;
      return { game: r.state, ui: cleared(ui, info(r.message)) };
    }
    case 'cancel':
      if (ui.sheet) return { game, ui: { ...ui, sheet: null, ...(ui.sheet.kind === 'spell' ? { selected: null } : {}) } };
      return { game, ui: cleared(ui, ui.selected === null ? ui.notice : idleHint(game)) };
    case 'openSheet':
      return { game, ui: { ...ui, sheet: action.sheet } };
    case 'closeSheet':
      return { game, ui: { ...ui, sheet: null, ...(ui.sheet?.kind === 'spell' ? { selected: null } : {}) } };
  }
}

export type Listener = (state: AppState, prev: AppState) => void;

export interface Store {
  getState(): AppState;
  dispatch(action: Action): void;
  subscribe(fn: Listener): () => void;
}

export function createStore(initial: AppState = initialState()): Store {
  let state = initial;
  const listeners = new Set<Listener>();
  return {
    getState: () => state,
    dispatch(action) {
      const prev = state;
      state = reduce(state, action);
      if (state !== prev) listeners.forEach((fn) => fn(state, prev));
    },
    subscribe(fn) {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}
