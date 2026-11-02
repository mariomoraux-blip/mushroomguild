import * as Phaser from 'phaser';
import { es } from './copy/es';
import { tileSize } from './layout';
import { GameScene } from './scenes/GameScene';
import { newGame, newRandomGame, type SpeciesId } from './rules';
import { createStore, initialState } from './store';
import { applyTheme, BOARD_HEADROOM, renderResolution } from './theme';
import { mountAmbient } from './ui/ambient';
import { tornPaper } from './ui/art';
import { mountBoardOverlay } from './ui/board';
import { mountDock } from './ui/dock';
import { mountHud } from './ui/hud';
import { mountSheet } from './ui/sheet';
import { mountStory } from './ui/story';
import { mountScreens } from './ui/screens';
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
const SEEN = 'gremio.seenSpecies';
const seen = (() => { try { return JSON.parse(storage.get(SEEN) ?? '[]') as SpeciesId[]; } catch { return []; } })();
// Claro de la partida: aleatorio por defecto; `?seed=N` repite un mapa y `?map=clasico` usa el del Capítulo 1.
const params = new URLSearchParams(location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : (Date.now() % 2147483647) + 1;
const clasico = params.get('map') === 'clasico';
const debug = debugGame();
const firstGame = debug ?? (clasico ? newGame() : newRandomGame(seed));
// La portada (y tras "Nueva partida", la intro) abre el juego normal; con `?map`, `?seed` o `?debugState`
// se entra directo al tablero (pruebas y playtests).
const title = !debug && !params.has('map') && !params.has('seed');
const store = createStore(initialState(firstGame, seen, { title }));
/** "Jugar de nuevo": mismo mapa clásico, o un claro aleatorio nuevo. */
const restart = () => store.dispatch({ type: 'restart', game: clasico ? newGame() : newRandomGame((Date.now() % 2147483647) + 1) });
store.subscribe((state, prev) => {
  if (state.ui.seen !== prev.ui.seen) storage.set(SEEN, JSON.stringify(state.ui.seen));
});

const renderHud = mountHud($('hud'), store);
const renderDock = mountDock($('dock'), store);
const overlay = mountBoardOverlay($('overlay'), store);
const renderSheet = mountSheet($('sheet'), store);
const renderStory = mountStory($('story'), store, restart);
const renderScreens = mountScreens($('screen'), store);
const notice = $('notice');
mountAmbient($<HTMLCanvasElement>('ambient'));
$('notice-bar').prepend(tornPaper());
const noticeBar = $('notice-bar');
const cardBtn = $<HTMLButtonElement>('card-btn');
cardBtn.textContent = es.card.open;
cardBtn.addEventListener('click', () => {
  const id = store.getState().ui.selected;
  if (id !== null) store.dispatch({ type: 'openSheet', sheet: { kind: 'member', id } });
});

const renderDom = () => {
  const state = store.getState();
  renderHud(state);
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
const BOARD_BORDER = 24; // marco de raíces de 12 px por lado (styles.css › .board)
function resize() {
  const tile = tileSize(area.clientWidth - BOARD_BORDER, area.clientHeight - BOARD_BORDER);
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
// Safari ignora user-scalable=no al pellizcar.
document.addEventListener('gesturestart', (e) => e.preventDefault());

// Pausar al ocultar la pestaña.
document.addEventListener('visibilitychange', () => {
  if (document.hidden) game.loop.sleep();
  else game.loop.wake();
});

if (import.meta.env.DEV) Object.assign(window, { game, store });
