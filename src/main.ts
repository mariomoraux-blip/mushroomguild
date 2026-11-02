import * as Phaser from 'phaser';
import { es } from './copy/es';
import { tileSize } from './layout';
import { GameScene } from './scenes/GameScene';
import { newGame, newRandomGame, type SpeciesId } from './rules';
import { grade, sameGrade, stageLight, type Grade } from './scenes/light';
import { createStore, initialState } from './store';
import { applyTheme, BOARD_HEADROOM, renderResolution } from './theme';
import { mountAmbient } from './ui/ambient';
import { tornPaper, vine } from './ui/art';
import { mountBoardOverlay } from './ui/board';
import { mountDock } from './ui/dock';
import { mountHud } from './ui/hud';
import { mountSheet } from './ui/sheet';
import { mountStory } from './ui/story';
import { debugStart } from './debug';
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
const INTRO_SEEN = 'gremio.introSeen';
const seen = (() => { try { return JSON.parse(storage.get(SEEN) ?? '[]') as SpeciesId[]; } catch { return []; } })();
// Claro de la partida: aleatorio por defecto; `?seed=N` repite un mapa y `?map=clasico` usa el del Capítulo 1.
const params = new URLSearchParams(location.search);
const seedParam = Number(params.get('seed'));
const seed = Number.isFinite(seedParam) && seedParam > 0 ? seedParam : (Date.now() % 2147483647) + 1;
const fixedSeed = Number.isFinite(seedParam) && seedParam > 0;
/** Claro de una partida nueva: el mismo con `?map=clasico` o `?seed=N`; si no, uno aleatorio. */
const makeGame = (s: number) => (params.get('map') === 'clasico' ? newGame() : newRandomGame(s));
const debug = debugStart();
// La intro sale la primera vez que se abre el juego (no en los estados de prueba ni al jugar otra vez).
const intro = !debug && storage.get(INTRO_SEEN) !== '1';
const start = initialState(debug?.game ?? makeGame(seed), seen, intro);
const store = createStore(debug?.story ? { ...start, ui: { ...start.ui, story: debug.story } } : start);
store.subscribe((state, prev) => {
  if (state.ui.seen !== prev.ui.seen) storage.set(SEEN, JSON.stringify(state.ui.seen));
  if (prev.ui.story?.kind === 'intro' && state.ui.story?.kind !== 'intro') storage.set(INTRO_SEEN, '1');
});
const playAgain = () =>
  store.dispatch({ type: 'playAgain', game: makeGame(fixedSeed ? seed : (Date.now() % 2147483647) + 1) });

const renderHud = mountHud($('hud'), store);
const renderDock = mountDock($('dock'), store);
const overlay = mountBoardOverlay($('overlay'), store);
const renderSheet = mountSheet($('sheet'), store);
const renderStory = mountStory($('story'), document.querySelector<HTMLElement>('.app')!, store, playAgain);
const notice = $('notice');
const setAmbient = mountAmbient($<HTMLCanvasElement>('ambient'));
let ambientGrade: Grade | null = null;
$('notice-bar').prepend(tornPaper());
$('board').append(vine(), vine(true));
const noticeBar = $('notice-bar');
const cardBtn = $<HTMLButtonElement>('card-btn');
cardBtn.textContent = es.card.open;
cardBtn.addEventListener('click', () => {
  const id = store.getState().ui.selected;
  if (id !== null) store.dispatch({ type: 'openSheet', sheet: { kind: 'member', id } });
});
// Tras «Ver el claro», la bitácora ofrece jugar otra vez.
const againBtn = $<HTMLButtonElement>('again-btn');
againBtn.textContent = es.story.playAgain;
againBtn.addEventListener('click', playAgain);

const renderDom = () => {
  const state = store.getState();
  renderHud(state);
  renderDock(state);
  overlay.render(state);
  renderSheet(state);
  renderStory(state);
  // El fondo vivo es parte del escenario: sigue la luz de la estación y el progreso.
  const g = grade(stageLight(state.game));
  if (!ambientGrade || !sameGrade(ambientGrade, g)) setAmbient((ambientGrade = g));
  notice.textContent = state.ui.notice.text;
  noticeBar.dataset.tone = state.ui.notice.tone;
  // Botón "Ficha" del miembro seleccionado.
  const selected = state.ui.selected === null ? undefined : state.game.members.find((m) => m.id === state.ui.selected);
  cardBtn.hidden = !selected;
  againBtn.hidden = state.game.status === 'playing' || state.ui.story !== null;
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
const BOARD_BORDER = 24; // borde 2 px + marco de madera 4 px + contorno 6 px por lado (styles.css › .board)
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
