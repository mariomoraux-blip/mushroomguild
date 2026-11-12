// Store mínimo: estado del juego (de src/rules) + estado de la interfaz, `dispatch` y suscriptores.
// Toda acción del jugador pasa por aquí y por las reglas; las escenas y el DOM solo leen.
import { es } from './copy/es';
import {
  act,
  advise,
  check,
  endMonth,
  GAIN,
  idleReason,
  idleShort,
  isCold,
  LEVELS,
  member,
  motherCost,
  motherTrees,
  newGame,
  noWorkThisMonth,
  recruit,
  revivedCount,
  RuleError,
  validTargets,
  type GameState,
  type ScoreResult,
  type Choice,
  type RecruitableSpecies,
  type SpeciesId,
  type Advice,
  type Resource,
  type Tile,
  type NameProblem,
  unrootedTrees,
} from './rules';
import type { BoardView, Submission } from './leaderboard';

export type Sheet =
  | { kind: 'recruit' }
  | { kind: 'creature'; species: SpeciesId }
  | { kind: 'member'; id: number }
  | { kind: 'spell' }
  | { kind: 'help' }
  /**
   * «Tu nombre en el gremio» (036): alias propuesto, su número de sorteo y para qué se abrió. `writing`: el campo
   * para escribir el nombre (038); `problem`: por qué no vale lo escrito.
   */
  | { kind: 'alias'; alias: string; n: number; purpose: 'register' | 'rename'; writing?: boolean; problem?: NameProblem | null };

/** Carta de historia (003): intro de 3 pasos, llegada de Maestra Bruma o final. */
/** Carta de historia. `then`: la que sigue al cerrarla (028: la del frío después de la de la maga). */
export type Story =
  | { kind: 'intro'; step: number }
  | { kind: 'mage'; then?: Story }
  | { kind: 'cold'; then?: Story }
  /** 044: la primera vez en la partida que un árbol queda suelto. */
  | { kind: 'loose' }
  | { kind: 'won' }
  | { kind: 'lost' };
/** Al cerrar una carta: la que sigue, si hay. */
const nextStory = (st: Story | null): Story | null => (st && 'then' in st && st.then) || null;
export const INTRO_STEPS = 3;

/**
 * Pantallas fuera de la partida (012): portada, "Elige tu dificultad" (019), "Cómo jugar" (carrusel) y "El gremio".
 * `back` dice a dónde vuelven; "Elige tu dificultad" siempre vuelve a la portada.
 */
export type Screen =
  | { kind: 'title' }
  | { kind: 'level' }
  | { kind: 'howto'; step: number; back: 'title' | 'game' }
  | { kind: 'guild'; back: 'title' | 'game' }
  /** Ranking (036): desde la portada o desde una carta de final (que sigue abierta debajo). */
  | { kind: 'ranking'; back: 'title' | 'game' };
export const HOWTO_STEPS = 5;

export interface Notice {
  readonly text: string;
  readonly tone: 'info' | 'warn';
  /** Recurso que faltó (022): su contador se tiñe en el HUD. */
  readonly short?: Resource;
}

export interface UiState {
  /** Miembro seleccionado. */
  readonly selected: number | null;
  /** Hechizo elegido para Maestra Bruma. */
  /** Hechizo de Maestra Bruma o cambio de Pompón elegido en su hoja (040). */
  readonly spell: Choice | null;
  readonly sheet: Sheet | null;
  /** Carta de historia abierta sobre el tablero. */
  readonly story: Story | null;
  /** Pantalla abierta sobre la partida (las hojas, como la ficha, van encima). */
  readonly screen: Screen | null;
  /** Puntaje de la victoria (015), con si supera el récord guardado de su claro. */
  readonly result: { readonly score: ScoreResult; readonly newRecord: boolean } | null;
  readonly notice: Notice;
  /** Especies cuya ficha ya se abrió alguna vez (se recuerdan entre visitas; las nuevas llevan un punto en "Ficha"). */
  readonly seen: readonly SpeciesId[];
  /** Alias del jugador registrado en este dispositivo (036), o `null`. */
  readonly player: string | null;
  /** ¿Ya se mostró en esta partida la carta «Un árbol suelto»? (044) */
  readonly looseShown?: boolean;
  /** Envío de la victoria actual al ranking; `null` si la partida no cuenta. */
  readonly submission: Submission | null;
  /** Lo que muestra la pantalla «Ranking». */
  readonly board: BoardView | null;
}

export interface AppState {
  readonly game: GameState;
  readonly ui: UiState;
}

export type Action =
  | { type: 'select'; id: number }
  | { type: 'chooseSpell'; spell: Choice }
  | { type: 'tapTile'; x: number; y: number }
  | { type: 'recruit'; species: RecruitableSpecies }
  | { type: 'endMonth' }
  | { type: 'cancel' }
  | { type: 'openSheet'; sheet: Sheet }
  | { type: 'closeSheet' }
  | { type: 'openScreen'; screen: Screen }
  | { type: 'howtoStep'; step: number }
  /** Vuelve de "Cómo jugar" o "El gremio" a donde se abrieron. */
  | { type: 'closeScreen' }
  /** "Nueva partida" en la portada: abre "Elige tu dificultad" (019). */
  | { type: 'play' }
  /** Nivel elegido: partida nueva (la crea quien llama), con la intro si es la primera vez en ese nivel. */
  | { type: 'start'; game: GameState; intro: boolean }
  | { type: 'storyNext' }
  | { type: 'closeStory' }
  /** "Ver final" tras "Ver tablero": la partida terminada vuelve a su carta de final (017). */
  | { type: 'showEnd' }
  /** Partida nueva (la crea quien llama: el store no usa azar). */
  | { type: 'restart'; game: GameState }
  /** Puntaje de la victoria (lo calcula quien tiene el reloj: el store no lee la hora). */
  | { type: 'scored'; score: ScoreResult; newRecord: boolean }
  /** Ranking (036): alias registrado (cierra «Tu nombre en el gremio»), estado del envío y datos del ranking. */
  | { type: 'player'; alias: string | null }
  | { type: 'submission'; submission: Submission | null }
  | { type: 'board'; board: BoardView };

const info = (text: string): Notice => ({ text, tone: 'info' });
const warn = (text: string, short?: Resource | null): Notice => (short ? { text, tone: 'warn', short } : { text, tone: 'warn' });

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
      return es.advice.recruit(game.spores, `${es.species[a.species].article} ${es.species[a.species].short}`);
    case 'decompose':
      return es.advice.decompose(name);
    case 'heal':
      return es.advice.heal(name);
    case 'cleanse':
      return es.advice.cleanse(name);
    case 'breakRock':
      return es.advice.breakRock(name);
    case 'puff':
      return a.puff === 'nutrients' ? es.advice.compost(name) : es.advice.puff(name);
    case 'weave':
      return a.toward === 'tree' ? es.advice.weaveTree(name) : es.advice.weaveMother(name);
    case 'call':
      return es.advice.call(name, member(game, a.calledId)?.name ?? '');
    case 'spell':
      return es.advice.spell(name, es.spells[a.spell]);
    case 'endMonth':
      return es.advice.endMonth;
  }
}

/** ¿El nivel de la partida muestra pistas? En Ancestral no hay ★ ni «Pista:» (019). */
const hintsOn = (game: GameState): boolean => LEVELS[game.level].hints;

/** Aviso de mes vacío (024), o `null`. No es una pista: sale en todos los niveles. */
const emptyMonth = (game: GameState): string | null =>
  noWorkThisMonth(game) ? es.log.emptyMonth(revivedCount(game) * GAIN.treeNutrients) : null;

/** Mensaje de la bitácora seguido del aviso de mes vacío, si lo hay. */
const withEmptyMonth = (game: GameState, text: string): string => {
  const e = emptyMonth(game);
  return e ? `${text} ${e}` : text;
};

/**
 * Pista de la bitácora cuando no hay nada seleccionado: el siguiente paso sugerido (en Ancestral, solo elegir).
 * En un mes vacío, el aviso de mes vacío ocupa el lugar de «elegir» y de la pista de terminar el mes.
 */
export function idleHint(game: GameState): Notice {
  const e = emptyMonth(game);
  if (!hintsOn(game)) return info(e ?? (game.status === 'playing' ? es.hints.pickMember : adviceText(game, { kind: 'over' })));
  const a = advise(game);
  return info(e && a.kind === 'endMonth' ? e : adviceText(game, a));
}

/** Miembro sugerido (★ en el dock), si el consejo es de un miembro. */
export function suggestedMember(state: AppState): number | null {
  if (!hintsOn(state.game)) return null;
  const a = advise(state.game);
  return 'memberId' in a ? a.memberId : null;
}

/** Casilla sugerida (★ en el tablero): solo con el miembro sugerido seleccionado (y su hechizo, si es la maga). */
export function suggestedTile(state: AppState): Tile | null {
  if (!hintsOn(state.game)) return null;
  const a = advise(state.game);
  if (!('memberId' in a) || a.memberId !== state.ui.selected) return null;
  if ((a.kind === 'spell' && a.spell !== state.ui.spell) || (a.kind === 'puff' && a.puff !== state.ui.spell)) return null;
  return a.target;
}

function tileHelp(g: GameState, t: Tile): string {
  if (t.kind === 'mother') return t.alive ? es.tileHelp.motherAwake : es.tileHelp.mother(motherCost(g), motherTrees(g));
  if (t.kind === 'tree') return t.alive ? (unrootedTrees(g).includes(t) ? es.tileHelp.treeUnrooted : es.tileHelp.treeAlive) : t.faded ? es.tileHelp.treeFaded : t.fading ? es.tileHelp.treeFading : es.tileHelp.tree;
  if (t.blighted) return t.net ? es.tileHelp.plague : es.tileHelp.plagueWithered;
  if (t.kind === 'soil') return t.net ? es.tileHelp.soilNet : es.tileHelp.soil;
  return es.tileHelp[t.kind];
}

/**
 * Estado inicial. `title`: empieza en la portada (y "Nueva partida" abre la intro);
 * `intro`: empieza directo en la intro.
 */
export function initialState(game: GameState = newGame(), seen: readonly SpeciesId[] = [], opts: { title?: boolean; intro?: boolean; player?: string | null } | boolean = {}): AppState {
  const o = typeof opts === 'boolean' ? { intro: opts } : opts;
  return {
    game,
    ui: {
      selected: null,
      spell: null,
      sheet: null,
      story: o.intro && !o.title ? { kind: 'intro', step: 0 } : null,
      screen: o.title ? { kind: 'title' } : null,
      result: null,
      notice: idleHint(game),
      seen,
      player: o.player ?? null,
      submission: null,
      board: null,
    },
  };
}

/**
 * ¿Corre el cronómetro? (015 · Cronómetro) Desde la primera acción aceptada, mientras la partida sigue y no hay
 * hoja, carta ni pantalla encima del tablero. La pestaña oculta la decide quien llama (`visible`).
 */
export function clockShouldRun(state: AppState, visible: boolean): boolean {
  const { game, ui } = state;
  return visible && game.status === 'playing' && game.log.length > 0 && !ui.sheet && !ui.story && !ui.screen;
}

/** Pantalla a la que se vuelve al cerrar "Cómo jugar" o "El gremio". */
const backFrom = (screen: Screen | null): Screen | null =>
  screen && (screen.kind === 'level' || (screen.kind !== 'title' && screen.back === 'title')) ? { kind: 'title' } : null;

/** ¿Quedó suelto algún árbol que antes no lo estaba? (044) */
function newlyLoose(prev: GameState, next: GameState): boolean {
  const before = new Set(unrootedTrees(prev).map((t) => `${t.x},${t.y}`));
  return unrootedTrees(next).some((t) => !before.has(`${t.x},${t.y}`));
}

/**
 * Carta que abre un cambio del juego: final al ganar o al acabar el invierno; presentación al llegar la maga;
 * aviso al empezar las temporadas frías (028), después de la de la maga si llegan juntas; y la del primer árbol
 * suelto de la partida (044), al final de las que coincidan.
 */
function storyFor(prev: GameState, next: GameState, looseShown = false): Story | null {
  if (prev.status === 'playing' && next.status === 'won') return { kind: 'won' };
  if (prev.status === 'playing' && next.status === 'lost') return { kind: 'lost' };
  if (next.status !== 'playing') return null;
  const mages = (g: GameState) => g.members.filter((m) => m.species === 'mago').length;
  const loose: Story | null = !looseShown && newlyLoose(prev, next) ? { kind: 'loose' } : null;
  const isColdStart = next.month > prev.month && isCold(next) && !isCold(prev);
  const cold: Story | null = isColdStart ? (loose ? { kind: 'cold', then: loose } : { kind: 'cold' }) : loose;
  if (mages(next) > mages(prev)) return cold ? { kind: 'mage', then: cold } : { kind: 'mage' };
  return cold;
}

/** ¿Hay una carta «Un árbol suelto» en la cadena? */
const hasLoose = (st: Story | null): boolean => !!st && (st.kind === 'loose' || ('then' in st && hasLoose(st.then ?? null)));

/** Aplica un nuevo estado del juego y abre la carta de historia que corresponda. */
function advance(game: GameState, next: GameState, ui: UiState): UiState {
  const story = storyFor(game, next, ui.looseShown);
  return story ? { ...ui, story, ...(hasLoose(story) ? { looseShown: true } : {}) } : ui;
}

/** Especie cuya ficha muestra una hoja (de miembro o de criatura), para marcarla como vista. */
function sheetSpecies(game: GameState, sheet: Sheet): SpeciesId | null {
  if (sheet.kind === 'creature') return sheet.species;
  if (sheet.kind === 'member') return member(game, sheet.id)?.species ?? null;
  return null;
}

/** Pista al seleccionar un miembro con casillas: la de la ★ si es el sugerido. */
const pickHint = (state: AppState, id: number, name: string): string =>
  suggestedMember(state) === id ? es.advice.pickTile(name) : es.hints.pickTile(name);

/** Maestra Bruma y Pompón (040) eligen primero (hechizo o cambio) y después la casilla. */
export const choosesFirst = (species?: string): boolean => species === 'mago' || species === 'lycoperdon';
const pickChoice = (m: { species: string; name: string }) => (m.species === 'mago' ? es.hints.pickSpell(m.name) : es.hints.pickPuff(m.name));

/** ¿Está abierta la ficha de Maestra Bruma (o Pompón) seleccionada, todavía sin elegir? */
function mageCardOpen(state: AppState): boolean {
  const { game, ui } = state;
  return ui.sheet?.kind === 'member' && ui.selected === ui.sheet.id && !ui.spell && choosesFirst(member(game, ui.sheet.id)?.species);
}

/** Al cerrar una hoja: la del hechizo cancela la selección; la ficha dla maga da paso a elegir el hechizo. */
function afterSheet(state: AppState): AppState {
  const { game, ui } = state;
  const sheet = ui.sheet;
  if (sheet?.kind === 'spell') return { game, ui: { ...ui, sheet: null, selected: null } };
  if (sheet?.kind === 'member' && ui.selected === sheet.id) {
    const m = member(game, sheet.id);
    if (choosesFirst(m?.species) && !ui.spell && !idleReason(game, m!.id)) return { game, ui: { ...ui, sheet: { kind: 'spell' } } };
  }
  return { game, ui: { ...ui, sheet: null } };
}

/** Casillas a resaltar: las válidas del miembro seleccionado (para la maga, solo con hechizo elegido). */
export function highlighted(state: AppState): Tile[] {
  const { selected, spell } = state.ui;
  if (selected === null) return [];
  const m = member(state.game, selected);
  if (!m || (choosesFirst(m.species) && !spell)) return [];
  return validTargets(state.game, selected, spell ?? undefined);
}

const cleared = (ui: UiState, notice: Notice): UiState => ({ ...ui, selected: null, spell: null, sheet: null, notice });
/** Interfaz de una partida nueva: sin selección, hojas, cartas ni pantallas (se conservan las fichas vistas). */
const fresh = (ui: UiState, game: GameState): UiState => ({
  selected: null, spell: null, sheet: null, story: null, screen: null, result: null, notice: idleHint(game), seen: ui.seen,
  player: ui.player, submission: null, board: ui.board,
});

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
      // La ficha nunca se abre sola (022): la primera vez, la bitácora invita a tocar "Ficha" (que lleva un punto).
      const pick = ui.seen.includes(m.species) ? pickHint(state, m.id, m.name) : es.hints.meetCard(m.name);
      if (idle) return { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: warn(es.idleLine(m.name, es.idle[idle]), idleShort(idle)) } };
      if (choosesFirst(m.species)) return { game, ui: { ...ui, selected: m.id, spell: null, sheet: { kind: 'spell' }, notice: info(pickChoice(m)) } };
      return { game, ui: { ...ui, selected: m.id, spell: null, sheet: null, notice: info(pick) } };
    }
    case 'chooseSpell': {
      const m = ui.selected === null ? undefined : member(game, ui.selected);
      if (!m || !choosesFirst(m.species)) return state;
      return { game, ui: { ...ui, spell: action.spell, sheet: null, notice: info(es.hints.pickTile(m.name)) } };
    }
    case 'tapTile': {
      if (game.status !== 'playing') return state;
      // Un toque en el tablero con la ficha de un miembro abierta la cierra y cuenta como toque (022).
      if (ui.sheet?.kind === 'member') return reduce({ game, ui: { ...ui, sheet: null } }, action);
      if (ui.selected === null) {
        const t = game.tiles.find((tt) => tt.x === action.x && tt.y === action.y);
        return t ? { game, ui: { ...ui, notice: info(tileHelp(game, t)) } } : state;
      }
      const m = member(game, ui.selected);
      if (!m) return state;
      if (choosesFirst(m.species) && !ui.spell) {
        return { game, ui: { ...ui, sheet: { kind: 'spell' }, notice: info(pickChoice(m)) } };
      }
      const c = check(game, m.id, action.x, action.y, ui.spell ?? undefined);
      if (!c.ok) return { game, ui: { ...ui, notice: warn(c.reason, c.short) } };
      const r = act(game, m.id, action.x, action.y, ui.spell ?? undefined);
      return { game: r.state, ui: advance(game, r.state, cleared(ui, info(r.message))) };
    }
    case 'recruit': {
      try {
        const r = recruit(game, action.species);
        return { game: r.state, ui: cleared(ui, info(withEmptyMonth(r.state, r.message))) };
      } catch (e) {
        if (e instanceof RuleError) return { game, ui: { ...ui, notice: warn(e.message, e.short) } };
        throw e;
      }
    }
    case 'endMonth': {
      const r = endMonth(game);
      if (r.state === game) return state;
      return { game: r.state, ui: advance(game, r.state, cleared(ui, info(withEmptyMonth(r.state, r.message)))) };
    }
    case 'cancel':
      // Esc o «atrás» sobre la ficha de Maestra Bruma la cierran del todo (022): solo "Entendido" pide el hechizo.
      if (mageCardOpen(state)) return { game, ui: cleared(ui, idleHint(game)) };
      if (ui.sheet) return afterSheet(state);
      // El ranking abierto desde una carta de final está encima de ella: se cierra primero (036).
      if (ui.screen?.kind === 'ranking') return { game, ui: { ...ui, screen: backFrom(ui.screen) } };
      if (ui.story) return { game, ui: { ...ui, story: nextStory(ui.story) } };
      if (ui.screen && ui.screen.kind !== 'title') return { game, ui: { ...ui, screen: backFrom(ui.screen) } };
      if (ui.screen) return state;
      return { game, ui: cleared(ui, ui.selected === null ? ui.notice : idleHint(game)) };
    case 'openSheet': {
      const sp = sheetSpecies(game, action.sheet);
      if (!sp || ui.seen.includes(sp)) return { game, ui: { ...ui, sheet: action.sheet } };
      // Ya conoció a la especie: la invitación a "Ficha" de la bitácora vuelve a ser la pista de siempre.
      const s = action.sheet;
      const m = s.kind === 'member' && ui.selected === s.id ? member(game, s.id) : undefined;
      const notice = m && m.species !== 'mago' && ui.notice.text === es.hints.meetCard(m.name) ? info(pickHint(state, m.id, m.name)) : ui.notice;
      return { game, ui: { ...ui, sheet: s, seen: [...ui.seen, sp], notice } };
    }
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
      return { game, ui: { ...ui, sheet: null, screen: { kind: 'level' } } };
    case 'start':
      return { game: action.game, ui: { ...fresh(ui, action.game), story: action.intro ? { kind: 'intro', step: 0 } : null } };
    case 'storyNext': {
      const st = ui.story;
      if (st?.kind !== 'intro' || st.step + 1 >= INTRO_STEPS) return { game, ui: { ...ui, story: null } };
      return { game, ui: { ...ui, story: { kind: 'intro', step: st.step + 1 } } };
    }
    case 'closeStory':
      return ui.story ? { game, ui: { ...ui, story: nextStory(ui.story) } } : state;
    case 'showEnd':
      return game.status === 'playing' || ui.story ? state : { game, ui: { ...cleared(ui, ui.notice), story: { kind: game.status } } };
    case 'restart':
      return { game: action.game, ui: fresh(ui, action.game) };
    case 'scored':
      return game.status === 'won' ? { game, ui: { ...ui, result: { score: action.score, newRecord: action.newRecord } } } : state;
    case 'player':
      return { game, ui: { ...ui, player: action.alias, sheet: ui.sheet?.kind === 'alias' ? null : ui.sheet } };
    case 'submission':
      return { game, ui: { ...ui, submission: action.submission } };
    case 'board':
      return { game, ui: { ...ui, board: action.board } };
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
