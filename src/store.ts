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

/** Carta de historia (003): intro de 3 pasos, llegada de Maestra Bruna o final. */
export type Story = { kind: 'intro'; step: number } | { kind: 'mage' } | { kind: 'won' } | { kind: 'lost' };
export const INTRO_STEPS = 3;

/** Pantallas fuera de la partida (012): portada, "Cómo jugar" (carrusel) y "El gremio". `back` dice a dónde vuelven. */
export type Screen = { kind: 'title' } | { kind: 'howto'; step: number; back: 'title' | 'game' } | { kind: 'guild'; back: 'title' | 'game' };
export const HOWTO_STEPS = 5;

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
  /** Carta de historia abierta sobre el tablero. */
  readonly story: Story | null;
  /** Pantalla abierta sobre la partida (las hojas, como la ficha, van encima). */
  readonly screen: Screen | null;
  readonly notice: Notice;
  /** Especies cuya ficha ya se mostró al seleccionarlas (se recuerdan entre visitas). */
  readonly seen: readonly SpeciesId[];
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
  | { type: 'openScreen'; screen: Screen }
  | { type: 'howtoStep'; step: number }
  /** Vuelve de "Cómo jugar" o "El gremio" a donde se abrieron. */
  | { type: 'closeScreen' }
  /** "Nueva partida" en la portada: cierra la portada y abre la intro. */
  | { type: 'play' }
  | { type: 'storyNext' }
  | { type: 'closeStory' }
  /** Partida nueva (la crea quien llama: el store no usa azar). */
  | { type: 'restart'; game: GameState };

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

/**
 * Estado inicial. `title`: empieza en la portada (y "Nueva partida" abre la intro);
 * `intro`: empieza directo en la intro.
 */
export function initialState(game: GameState = newGame(), seen: readonly SpeciesId[] = [], opts: { title?: boolean; intro?: boolean } | boolean = {}): AppState {
  const o = typeof opts === 'boolean' ? { intro: opts } : opts;
  return {
    game,
    ui: {
      selected: null,
      spell: null,
      sheet: null,
      story: o.intro && !o.title ? { kind: 'intro', step: 0 } : null,
      screen: o.title ? { kind: 'title' } : null,
      notice: idleHint(game),
      seen,
    },
  };
}

/** Pantalla a la que se vuelve al cerrar "Cómo jugar" o "El gremio". */
const backFrom = (screen: Screen | null): Screen | null => (screen && screen.kind !== 'title' && screen.back === 'title' ? { kind: 'title' } : null);

/** Carta que abre un cambio del juego: final al ganar o al acabar el invierno; presentación al llegar la maga. */
function storyFor(prev: GameState, next: GameState): Story | null {
  if (prev.status === 'playing' && next.status === 'won') return { kind: 'won' };
  if (prev.status === 'playing' && next.status === 'lost') return { kind: 'lost' };
  const mages = (g: GameState) => g.members.filter((m) => m.species === 'mago').length;
  if (next.status === 'playing' && mages(next) > mages(prev)) return { kind: 'mage' };
  return null;
}

/** Aplica un nuevo estado del juego y abre la carta de historia que corresponda. */
function advance(game: GameState, next: GameState, ui: UiState): UiState {
  const story = storyFor(game, next);
  return story ? { ...ui, story } : ui;
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
  const { game, ui } = state;
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
      return { game: r.state, ui: advance(game, r.state, cleared(ui, info(r.message))) };
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
      return { game: r.state, ui: advance(game, r.state, cleared(ui, info(r.message))) };
    }
    case 'cancel':
      if (ui.sheet) return afterSheet(state);
      if (ui.story) return { game, ui: { ...ui, story: null } };
      if (ui.screen && ui.screen.kind !== 'title') return { game, ui: { ...ui, screen: backFrom(ui.screen) } };
      if (ui.screen) return state;
      return { game, ui: cleared(ui, ui.selected === null ? ui.notice : idleHint(game)) };
    case 'openSheet':
      return { game, ui: { ...ui, sheet: action.sheet } };
    case 'closeSheet':
      return afterSheet(state);
    case 'openScreen':
      return { game, ui: { ...cleared(ui, ui.notice), screen: action.screen } };
    case 'howtoStep':
      if (ui.screen?.kind !== 'howto') return state;
      return { game, ui: { ...ui, screen: { ...ui.screen, step: Math.max(0, Math.min(HOWTO_STEPS - 1, action.step)) } } };
    case 'closeScreen':
      return ui.screen ? { game, ui: { ...ui, sheet: null, screen: backFrom(ui.screen) } } : state;
    case 'play':
      return { game, ui: { ...ui, sheet: null, screen: null, story: { kind: 'intro', step: 0 } } };
    case 'storyNext': {
      const st = ui.story;
      if (st?.kind !== 'intro' || st.step + 1 >= INTRO_STEPS) return { game, ui: { ...ui, story: null } };
      return { game, ui: { ...ui, story: { kind: 'intro', step: st.step + 1 } } };
    }
    case 'closeStory':
      return ui.story ? { game, ui: { ...ui, story: null } } : state;
    case 'restart':
      return { game: action.game, ui: { selected: null, spell: null, sheet: null, story: null, screen: null, notice: idleHint(action.game), seen: ui.seen } };
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
