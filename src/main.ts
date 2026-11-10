import * as Phaser from 'phaser';
import { es } from './copy/es';
import { tileSize } from './layout';
import { GameScene } from './scenes/GameScene';
import { aliasFor, LEVEL_IDS, newRandomGame, randomSeed, scoreResult, thresholds, type Level, type ScoreResult, type SpeciesId } from './rules';
import { createLeaderboardClient } from './leaderboard';
import { formatClock, newClock, read, sync } from './clock';
import { saveIfBest } from './records';
import { clockShouldRun, createStore, initialState, type AppState } from './store';
import { applyTheme, BOARD_HEADROOM, renderResolution } from './theme';
import { mountAmbient } from './ui/ambient';
import { mountBoardOverlay } from './ui/board';
import { mountDock } from './ui/dock';
import { mountHud } from './ui/hud';
import { mountSheet } from './ui/sheet';
import { mountStory } from './ui/story';
import { mountScreens } from './ui/screens';
import { mountFlyers } from './ui/flyers';
import { debugGame } from './debug';
import './styles.css';

applyTheme();
document.title = es.title;

const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;
// localStorage es solo una comodidad por visitante: puede fallar o venir vacío.
const storage = {
  get: (k: string) => { try { return localStorage.getItem(k); } catch { return null; } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* sin almacenamiento */ } },
};
const readList = <T>(key: string): T[] => { try { return JSON.parse(storage.get(key) ?? '[]') as T[]; } catch { return []; } };
const SEEN = 'gremio.seenSpecies';
const seen = readList<SpeciesId>(SEEN);
// Niveles (019): el último elegido (foco en "Elige tu dificultad") y los ya jugados (la intro sale solo la primera vez).
const LAST_LEVEL = 'gremio.lastLevel';
const PLAYED_LEVELS = 'gremio.playedLevels';
const isLevel = (v: string | null): v is Level => LEVEL_IDS.includes(v as Level);
const lastLevel = (): Level => { const v = storage.get(LAST_LEVEL); return isLevel(v) ? v : 'brote'; };
// Claro de la partida: aleatorio por defecto; `?seed=N` repite un mapa, `?map=clasico` usa el del Capítulo 1
// y `?nivel=brote|bosque|ancestral` elige el nivel.
const params = new URLSearchParams(location.search);
const levelParam = params.get('nivel');
const level: Level = isLevel(levelParam) ? levelParam : 'brote';
const seedParam = Number(params.get('seed'));
const clasico = params.get('map') === 'clasico';
/** Partida nueva en un nivel: el clásico con `?map=clasico`, la semilla de la URL o una al azar. */
const gameFor = (lv: Level, seed?: number) => newRandomGame(clasico ? 0 : (seed ?? randomSeed(lv, Date.now())), lv);
const debug = debugGame();
const firstGame = debug ?? gameFor(level, Number.isFinite(seedParam) && seedParam > 0 ? seedParam : undefined);
// La portada ("Nueva partida" → "Elige tu dificultad" → intro) abre el juego normal; con `?map`, `?seed`, `?nivel`
// o `?debugState` se entra directo al tablero (pruebas y playtests).
const title = !debug && !params.has('map') && !params.has('seed') && !params.has('nivel');
// Ranking (036): el jugador de este dispositivo. Solo cuentan las partidas que empiezan desde la portada
// («Nueva partida» y «Jugar de nuevo» después); `?seed`, `?nivel`, `?map` y `?debugState` no envían nada.
const leaderboard = createLeaderboardClient();
const ranked = title;
const store = createStore(initialState(firstGame, seen, { title, player: leaderboard.readPlayer()?.alias ?? null }));
/** "Jugar de nuevo": mismo nivel, con el mapa clásico o un claro aleatorio nuevo. */
const restart = () => store.dispatch({ type: 'restart', game: gameFor(store.getState().game.level) });
/** Nivel elegido en "Elige tu dificultad": se recuerda, y la intro sale solo la primera vez en ese nivel. */
const startLevel = (lv: Level) => {
  const played = readList<Level>(PLAYED_LEVELS);
  storage.set(LAST_LEVEL, lv);
  if (!played.includes(lv)) storage.set(PLAYED_LEVELS, JSON.stringify([...played, lv]));
  store.dispatch({ type: 'start', game: gameFor(lv), intro: !played.includes(lv) });
};
store.subscribe((state, prev) => {
  if (state.ui.seen !== prev.ui.seen) storage.set(SEEN, JSON.stringify(state.ui.seen));
});

// ─── Puntaje (015): umbrales por claro, cronómetro de juego activo y récord local ──────────
let thresholdsNow = thresholds(firstGame);
let clock = newClock();
const now = () => performance.now();
const syncClock = () => (clock = sync(clock, clockShouldRun(store.getState(), !document.hidden), now()));
store.subscribe((state, prev) => {
  if (state.game !== prev.game && (state.game.mapId !== prev.game.mapId || state.game.level !== prev.game.level || state.game.log.length < prev.game.log.length)) {
    // Partida nueva ("Jugar de nuevo"): cronómetro en cero y umbrales del claro nuevo.
    clock = newClock();
    thresholdsNow = thresholds(state.game);
  }
  syncClock();
  if (prev.game.status === 'playing' && state.game.status === 'won') {
    const score = scoreResult(state.game, read(clock, now()), thresholdsNow);
    const { newRecord } = saveIfBest(score);
    queueMicrotask(() => {
      store.dispatch({ type: 'scored', score, newRecord });
      if (ranked) void sendScore(score);
    });
  }
});

// ─── Ranking (036) ────────────────────────────────────────────────────────────
/** Envía la victoria si hay jugador; si no, la carta ofrece registrarse (si el dispositivo puede guardar la clave). */
async function sendScore(score: ScoreResult) {
  if (!store.getState().ui.player) {
    if (leaderboard.ensureToken()) store.dispatch({ type: 'submission', submission: { kind: 'unregistered' } });
    return;
  }
  store.dispatch({ type: 'submission', submission: { kind: 'sending' } });
  await leaderboard.flush();
  const submission = await leaderboard.submit(score);
  if (store.getState().ui.result?.score === score) store.dispatch({ type: 'submission', submission });
}
/** Abre «Tu nombre en el gremio» con el siguiente alias de este dispositivo. */
function openAlias(purpose: 'register' | 'rename') {
  const token = leaderboard.ensureToken();
  if (!token) return;
  const current = store.getState().ui.player;
  let n = 0;
  while (aliasFor(token, n) === current) n++;
  store.dispatch({ type: 'openSheet', sheet: { kind: 'alias', alias: aliasFor(token, n), n, purpose } });
}
const aliasActions = {
  roll() {
    const sheet = store.getState().ui.sheet;
    const token = leaderboard.readPlayer()?.token;
    if (sheet?.kind !== 'alias' || !token) return;
    let n = sheet.n + 1;
    while (aliasFor(token, n) === sheet.alias) n++;
    store.dispatch({ type: 'openSheet', sheet: { ...sheet, alias: aliasFor(token, n), n } });
  },
  async confirm() {
    const sheet = store.getState().ui.sheet;
    if (sheet?.kind !== 'alias' || !(await leaderboard.saveAlias(sheet.alias))) return;
    store.dispatch({ type: 'player', alias: sheet.alias });
    const result = store.getState().ui.result;
    if (sheet.purpose === 'register' && result && store.getState().ui.submission?.kind === 'unregistered') void sendScore(result.score);
    if (store.getState().ui.screen?.kind === 'ranking') void loadBoard();
  },
};
async function loadBoard() {
  store.dispatch({ type: 'board', board: { kind: 'loading' } });
  await leaderboard.flush();
  store.dispatch({ type: 'board', board: await leaderboard.board() });
}
const rankingScreen = {
  open(back: 'title' | 'game') {
    store.dispatch({ type: 'openScreen', screen: { kind: 'ranking', back } });
    void loadBoard();
  },
  retry: () => void loadBoard(),
  rename: () => openAlias('rename'),
};
document.addEventListener('visibilitychange', syncClock);
setInterval(() => hud.setTime(formatClock(read(clock, now()))), 250);

const hud = mountHud($('hud'), store);
const renderDock = mountDock($('dock'), store);
const overlay = mountBoardOverlay($('overlay'), store);
const renderSheet = mountSheet($('sheet'), store, (x, y) => overlay.tap(x, y), aliasActions);
const renderStory = mountStory($('story'), store, restart, { register: () => openAlias('register'), open: () => rankingScreen.open('game') });
const renderScreens = mountScreens($('screen'), store, { pickLevel: startLevel, lastLevel }, rankingScreen);
const notice = $('notice');
mountAmbient($<HTMLCanvasElement>('ambient'));
const noticeBar = $('notice-bar');
const cardBtn = $<HTMLButtonElement>('card-btn');
cardBtn.textContent = es.card.open;
cardBtn.addEventListener('click', () => {
  const id = store.getState().ui.selected;
  if (id !== null) store.dispatch({ type: 'openSheet', sheet: { kind: 'member', id } });
});

const renderDom = () => {
  const state = store.getState();
  hud.render(state);
  renderDock(state);
  overlay.render(state);
  renderSheet(state);
  renderStory(state);
  renderScreens(state);
  // Con una pantalla o una carta encima, la partida no recibe foco ni lectores de pantalla.
  $('app').inert = Boolean(state.ui.screen || state.ui.story);
  notice.textContent = state.ui.notice.text;
  noticeBar.dataset.tone = state.ui.notice.tone;
  // Botón "Ficha" del miembro seleccionado.
  const selected = state.ui.selected === null ? undefined : state.game.members.find((m) => m.id === state.ui.selected);
  cardBtn.hidden = !selected;
  // Especie que todavía no conoció (022): punto «nuevo» y un latido en "Ficha".
  cardBtn.classList.toggle('is-new', Boolean(selected && !state.ui.seen.includes(selected.species)));
  if (selected) cardBtn.setAttribute('aria-label', es.card.openLabel(selected.name));
};
store.subscribe((state, prev) => {
  renderDom();
  // Teclado: al elegir un miembro (o un hechizo), el foco salta a la primera casilla válida.
  const picked = state.ui.selected !== null && (state.ui.selected !== prev.ui.selected || state.ui.spell !== prev.ui.spell);
  if (picked && document.body.dataset.input === 'keyboard') overlay.focusFirstValid();
});
renderDom();

// ─── Phaser: solo el tablero ──────────────────────────────────────────────────
const scene = new GameScene(store);
const game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  transparent: true, // el claro se pinta entero; el margen de arriba (copa del Árbol Padre) deja ver el marco
  width: 1,
  height: 1,
  scale: { mode: Phaser.Scale.NONE },
  input: false,
  scene: [scene],
});

// ─── Tamaño: casillas que caben en el área del tablero (≤ 96 px), canvas a ≤ 2× ───────
const area = $('board-area');
const board = $('board');
let currentTile = 0;
mountFlyers(store, board, () => currentTile);
const BOARD_BORDER = 24; // marco de raíces de 12 px por lado (styles.css › .board)
function resize() {
  const tile = tileSize(area.clientWidth - BOARD_BORDER, area.clientHeight - BOARD_BORDER);
  currentTile = tile;
  const w = tile * 5;
  const h = tile * 8;
  board.style.width = `${w}px`;
  board.style.height = `${h}px`;
  document.documentElement.style.setProperty('--tile', `${tile}px`);
  const headroom = Math.round(BOARD_HEADROOM * tile);
  document.documentElement.style.setProperty('--headroom', `${headroom}px`);
  const r = renderResolution();
  game.scale.resize(w * r, (h + headroom) * r);
  game.scale.setZoom(1 / r);
  overlay.place(tile);
  scene.setTile(tile);
}
new ResizeObserver(resize).observe(area);
game.events.once(Phaser.Core.Events.READY, resize);

// ─── Teclado y gestos ─────────────────────────────────────────────────────────
document.addEventListener('keydown', (e) => {
  document.body.dataset.input = 'keyboard';
  if (e.key === 'Escape') {
    const selected = store.getState().ui.selected;
    store.dispatch({ type: 'cancel' });
    if (selected !== null) document.querySelector<HTMLElement>(`[data-id="${selected}"]`)?.focus();
  }
});
document.addEventListener('pointerdown', () => (document.body.dataset.input = 'pointer'));

// «Atrás» del teléfono (022): cada capa abierta (hoja, carta o pantalla que no es la portada) deja una sola entrada
// en el historial, y «atrás» la cierra como Esc, sin salir del juego. Al cerrarla de otro modo, se consume la entrada.
const hasLayer = ({ ui }: AppState) => Boolean(ui.sheet || ui.story || (ui.screen && ui.screen.kind !== 'title'));
let pushed = false;
let skipPop = false;
const syncHistory = () => {
  const open = hasLayer(store.getState());
  if (open && !pushed) {
    history.pushState({ layer: true }, '');
    pushed = true;
  } else if (!open && pushed) {
    pushed = false;
    skipPop = true;
    history.back();
  }
};
window.addEventListener('popstate', () => {
  if (skipPop) return void (skipPop = false);
  if (!pushed) return;
  pushed = false;
  store.dispatch({ type: 'cancel' }); // si queda otra capa abierta, `syncHistory` deja una entrada nueva
});
store.subscribe(syncHistory);
syncHistory();
// Safari ignora user-scalable=no al pellizcar.
document.addEventListener('gesturestart', (e) => e.preventDefault());

// Pausar al ocultar la pestaña.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.loop.sleep();
  else game.loop.wake();
});

if (import.meta.env.DEV) Object.assign(window, { game, store });
