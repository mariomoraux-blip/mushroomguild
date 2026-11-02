// Store mínimo: estado del juego (de src/rules) + estado de la interfaz, `dispatch` y suscriptores.
// Toda acción del jugador pasa por aquí y por las reglas; las escenas y el DOM solo leen.
import { es } from './copy/es';
import {
  act,
  advise,
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
  type Advice,
  type Tile,
} from './rules';

export type Sheet =
  | { kind: 'recruit' }
  | { kind: 'creature'; species: SpeciesId }
  | { kind: 'member'; id: number }
  | { kind: 'spell' }
  | { kind: 'help' };

/** Carta de historia abierta (003): intro en tres páginas, llegada de la maga o un final. */
export type Story = { kind: 'intro'; page: number } | { kind: 'mage' } | { kind: 'won' } | { kind: 'lost' };
export const INTRO_PAGES = 3;

export interface Notice {
  readonly text: string;
  readonly tone: 'info' | 'warn';
}

export interface UiState {
  /** Miembro seleccionado. */
  readonly selected: number | null;
  /** Hechizo elegido para Maestra Bruna. */
  readonly spell: Spell | null;
  readonly sheet: Sheet | null;
  readonly notice: Notice;
  /** Especies cuya ficha ya se mostró al seleccionarlas (se recuerdan entre visitas). */
  readonly seen: readonly SpeciesId[];
  /** Carta de historia abierta; mientras está, el resto del juego espera. */
  readonly story: Story | null;
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
  | { type: 'closeSheet' }
  | { type: 'storyNext' }
  | { type: 'storyClose' }
  /** Partida nueva (el claro lo elige main.ts: aleatorio, o el mismo con `?seed=` / `?map=`). */
  | { type: 'playAgain'; game: GameState };

const info = (text: string): Notice => ({ text, tone: 'info' });
const warn = (text: string): Notice => ({ text, tone: 'warn' });

/** Texto de la pista para un consejo de `advise()`. */
export function adviceText(game: GameState, a: Advice): string {
  const name = 'memberId' in a ? (member(game, a.memberId)?.name ?? '') : '';
  switch (a.kind) {
    case 'over':
      return game.status === 'won' ? es.hints.won : es.hints.lost;
    case 'awaken':
      return es.advice.awaken(name);
    case 'revive':
      return es.advice.revive(name);
    case 'recruit':
      return es.advice.recruit(game.spores, es.species[a.species].short);
    case 'decompose':
      return es.advice.decompose(name);
    case 'weave':
      return a.toward === 'tree' ? es.advice.weaveTree(name) : es.advice.weaveMother(name);
    case 'call':
      return es.advice.call(name, member(game, a.calledId)?.name ?? '');
    case 'spell':
      return es.advice.spell(name, es.spells[a.spell]);
    case 'endDay':
      return es.advice.endDay;
  }
}

/** Pista de la bitácora cuando no hay nada seleccionado: el siguiente paso sugerido. */
export function idleHint(game: GameState): Notice {
  return info(adviceText(game, advise(game)));
}

/** Miembro sugerido (★ en el dock), si el consejo es de un miembro. */
export function suggestedMember(state: AppState): number | null {
  const a = advise(state.game);
  return 'memberId' in a ? a.memberId : null;
}

/** Casilla sugerida (★ en el tablero): solo con el miembro sugerido seleccionado (y su hechizo, si es la maga). */
export function suggestedTile(state: AppState): Tile | null {
  const a = advise(state.game);
  if (!('memberId' in a) || a.memberId !== state.ui.selected) return null;
  if (a.kind === 'spell' && a.spell !== state.ui.spell) return null;
  return a.target;
}

function tileHelp(t: Tile): string {
  if (t.kind === 'mother') return t.alive ? es.tileHelp.motherAwake : es.tileHelp.mother;
  if (t.kind === 'tree') return t.alive ? es.tileHelp.treeAlive : es.tileHelp.tree;
  if (t.kind === 'soil') return t.net ? es.tileHelp.soilNet : es.tileHelp.soil;
  return es.tileHelp[t.kind];
}

/** Estado inicial. Con `intro`, la partida abre con las tres cartas de la intro. */
export function initialState(game: GameState = newGame(), seen: readonly SpeciesId[] = [], intro = false): AppState {
  const story: Story | null = intro ? { kind: 'intro', page: 0 } : null;
  return { game, ui: { selected: null, spell: null, sheet: null, notice: idleHint(game), seen, story } };
}

/** Cierra la carta abierta. Al cerrar la intro, la bitácora invita a elegir un miembro. */
function closeStory(state: AppState): AppState {
  const { game, ui } = state;
  const notice = ui.story?.kind === 'intro' ? info(es.hints.pickMember) : ui.notice;
  return { game, ui: { ...ui, story: null, notice } };
}

/** Abre la carta que toque tras una jugada: un final, o la llegada de la maga. */
function withStory(prev: AppState, next: AppState): AppState {
  if (next === prev) return next;
  const was = prev.game;
  const now = next.game;
  let story: Story | null = null;
  if (was.status === 'playing' && now.status === 'won') story = { kind: 'won' };
  else if (was.status === 'playing' && now.status === 'lost') story = { kind: 'lost' };
  else if (!was.mageArrived && now.mageArrived) story = { kind: 'mage' };
  return story ? { game: now, ui: { ...next.ui, selected: null, spell: null, sheet: null, story } } : next;
}

/** Si es la primera vez que se selecciona esta especie, abre su ficha (y la marca como vista). */
function withFirstCard(next: AppState, id: number, species: SpeciesId): AppState {
  if (next.ui.seen.includes(species)) return next;
  return { ...next, ui: { ...next.ui, sheet: { kind: 'member', id }, seen: [...next.ui.seen, species] } };
}

/** Al cerrar una hoja: la del hechizo cancela la selección; la ficha dla maga da paso a elegir el hechizo. */
function afterSheet(state: AppState): AppState {
  const { game, ui } = state;
  const sheet = ui.sheet;
  if (sheet?.kind === 'spell') return { game, ui: { ...ui, sheet: null, selected: null } };
  if (sheet?.kind === 'member' && ui.selected === sheet.id) {
    const m = member(game, sheet.id);
    if (m?.species === 'mago' && !ui.spell && !idleReason(game, m.id)) return { game, ui: { ...ui, sheet: { kind: 'spell' } } };
  }
  return { game, ui: { ...ui, sheet: null } };
}

/** Casillas a resaltar: las válidas del miembro seleccionado (para la maga, solo con hechizo elegido). */
export function highlighted(state: AppState): Tile[] {
  const { selected, spell } = state.ui;
  if (selected === null) return [];
  const m = member(state.game, selected);
  if (!m || (m.species === 'mago' && !spell)) return [];
  return validTargets(state.game, selected, spell ?? undefined);
}

const cleared = (ui: UiState, notice: Notice): UiState => ({ ...ui, selected: null, spell: null, sheet: null, notice });

export function reduce(state: AppState, action: Action): AppState {
  return withStory(state, reduceAction(state, action));
}

function reduceAction(state: AppState, action: Action): AppState {
  const { game, ui } = state;
  // Con una carta abierta solo cuentan sus botones (Esc la cierra como «Saltar» o «Ver el claro»).
  if (ui.story) {
    if (action.type === 'storyNext') {
      const story = ui.story;
      if (story.kind === 'intro' && story.page < INTRO_PAGES - 1) return { game, ui: { ...ui, story: { kind: 'intro', page: story.page + 1 } } };
      return closeStory(state);
    }
    if (action.type === 'storyClose' || action.type === 'cancel') return closeStory(state);
    if (action.type === 'playAgain') return initialState(action.game, ui.seen);
    return state;
  }
  switch (action.type) {
    case 'select': {
      if (game.status !== 'playing') return state;
      if (ui.selected === action.id) return { game, ui: cleared(ui, idleHint(game)) };
      const m = member(game, action.id);
      if (!m) return state;
      if (m.used) return { game, ui: { ...cleared(ui, warn(es.reasons.tired(m.name))) } };
      const idle = idleReason(game, m.id);
      const pick = suggestedMember(state) === m.id ? es.advice.pickTile(m.name) : es.hints.pickTile(m.name);
      const next: AppState = idle
        ? { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: warn(es.idleLine(m.name, es.idle[idle])) } }
        : m.species === 'mago'
          ? { game, ui: { ...ui, selected: m.id, spell: null, sheet: { kind: 'spell' }, notice: info(es.hints.pickSpell(m.name)) } }
          : { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: info(pick) } };
      return withFirstCard(next, m.id, m.species);
    }
    case 'chooseSpell': {
      const m = ui.selected === null ? undefined : member(game, ui.selected);
      if (!m || m.species !== 'mago') return state;
      return { game, ui: { ...ui, spell: action.spell, sheet: null, notice: info(es.hints.pickTile(m.name)) } };
    }
    case 'tapTile': {
      if (game.status !== 'playing') return state;
      if (ui.selected === null) {
        const t = game.tiles.find((tt) => tt.x === action.x && tt.y === action.y);
        return t ? { game, ui: { ...ui, notice: info(tileHelp(t)) } } : state;
      }
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
      if (ui.sheet) return afterSheet(state);
      return { game, ui: cleared(ui, ui.selected === null ? ui.notice : idleHint(game)) };
    case 'openSheet':
      return { game, ui: { ...ui, sheet: action.sheet } };
    case 'closeSheet':
      return afterSheet(state);
    case 'storyNext':
    case 'storyClose':
      return state;
    case 'playAgain':
      return initialState(action.game, ui.seen);
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
