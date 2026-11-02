import { es } from '../copy/es';
import { RECRUITABLE, seasonIndex, type SpeciesId } from '../rules';
import { HOWTO_STEPS, type AppState, type Screen, type Store } from '../store';
import { assetUrl, SCREEN_ART } from '../theme';
import { el, portrait } from './dom';

const SPECIES: readonly SpeciesId[] = [...RECRUITABLE, 'mago'];
const img = (key: string, cls: string) => el('img', { class: cls, src: assetUrl(key), alt: '', draggable: 'false', decoding: 'async' });
const nameOf = (sp: SpeciesId) => (sp === 'mago' ? es.mageName : es.species[sp].short);

/**
 * Pantallas fuera de la partida (012): portada (Nueva partida, Cómo jugar, El gremio), "Cómo jugar"
 * (carrusel de 5 pasos con ‹ ›, puntos y deslizar) y "El gremio" (las cinco especies; abre su ficha).
 * Solo dibuja `ui.screen` y despacha acciones; Esc vuelve (main.ts › cancel).
 */
export function mountScreens(root: HTMLElement, store: Store) {
  let shown = '';

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const screen = store.getState().ui.screen;
    const { action, step, species } = b.dataset;
    if (action === 'play') store.dispatch({ type: 'play' });
    if (action === 'howto') store.dispatch({ type: 'openScreen', screen: { kind: 'howto', step: 0, back: 'title' } });
    if (action === 'guild') store.dispatch({ type: 'openScreen', screen: { kind: 'guild', back: 'title' } });
    if (action === 'back') store.dispatch({ type: 'closeScreen' });
    if (action === 'step') store.dispatch({ type: 'howtoStep', step: Number(step) });
    if (action === 'notebook') store.dispatch({ type: 'openSheet', sheet: { kind: 'help' } });
    if (action === 'creature') store.dispatch({ type: 'openSheet', sheet: { kind: 'creature', species: species as SpeciesId } });
    // "¡A jugar!": desde la portada empieza la partida (intro); desde la partida, vuelve al tablero.
    if (action === 'done') store.dispatch(screen?.kind === 'howto' && screen.back === 'title' ? { type: 'play' } : { type: 'closeScreen' });
  });

  // Carrusel: flechas del teclado y deslizar con el dedo.
  const go = (delta: number) => {
    const s = store.getState().ui.screen;
    if (s?.kind === 'howto') store.dispatch({ type: 'howtoStep', step: s.step + delta });
  };
  root.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') go(1);
    if (e.key === 'ArrowLeft') go(-1);
  });
  let startX: number | null = null;
  root.addEventListener('pointerdown', (e) => (startX = e.clientX));
  root.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) > 48) go(dx < 0 ? 1 : -1);
  });

  const header = (title: string) =>
    el('header', { class: 'screen__head' },
      el('button', { class: 'round-btn round-btn--back', type: 'button', 'data-action': 'back', 'aria-label': es.howto.back }),
      el('h1', { class: 'screen__title', id: 'screen-title' }, title));

  // Portada limpia (018): solo el logo y el menú; el gremio se presenta en la intro y en "El gremio".
  function title() {
    return el('div', { class: 'title' },
      el('h1', { class: 'title__logo' }, img(SCREEN_ART.logo, 'title__logo-img'), el('span', { class: 'sr-only' }, es.title)),
      el('nav', { class: 'title__menu', 'aria-label': es.titleScreen.label },
        el('button', { class: 'menu-btn menu-btn--primary', type: 'button', 'data-action': 'play' }, el('span', { class: 'menu-btn__icon menu-btn__icon--play', 'aria-hidden': 'true' }), es.titleScreen.play),
        el('button', { class: 'menu-btn', type: 'button', 'data-action': 'howto' }, el('span', { class: 'menu-btn__icon menu-btn__icon--book', 'aria-hidden': 'true' }), es.titleScreen.howto),
        el('button', { class: 'menu-btn', type: 'button', 'data-action': 'guild' }, el('span', { class: 'menu-btn__icon menu-btn__icon--guild', 'aria-hidden': 'true' }), es.titleScreen.guild)));
  }

  function howto(screen: Extract<Screen, { kind: 'howto' }>) {
    const page = es.howto.steps[screen.step]!;
    const last = screen.step === HOWTO_STEPS - 1;
    const art = SCREEN_ART.howto[screen.step] ?? [];
    return el('div', { class: 'screen__panel' },
      header(es.howto.title),
      el('section', { class: 'howto', 'aria-roledescription': 'carrusel', 'aria-labelledby': 'screen-title' },
        el('div', { class: 'howto__card', 'aria-live': 'polite' },
          el('p', { class: 'howto__count' }, es.howto.step(screen.step + 1, HOWTO_STEPS)),
          el('div', { class: `howto__art howto__art--${art.length}`, 'aria-hidden': 'true' }, ...art.map((k) => img(k, 'howto__img'))),
          el('h2', { class: 'howto__title' }, page.title),
          el('p', { class: 'howto__text' }, page.text)),
        el('div', { class: 'howto__nav' },
          el('button', { class: 'round-btn round-btn--prev', type: 'button', 'data-action': 'step', 'data-step': screen.step - 1, 'aria-label': es.howto.prev, disabled: screen.step === 0 }),
          el('div', { class: 'howto__dots' },
            ...Array.from({ length: HOWTO_STEPS }, (_, i) =>
              el('button', { class: `howto__dot${i === screen.step ? ' is-active' : ''}`, type: 'button', 'data-action': 'step', 'data-step': i, 'aria-label': es.howto.goTo(i + 1), 'aria-current': i === screen.step ? 'step' : undefined }))),
          el('button', { class: 'round-btn round-btn--next', type: 'button', 'data-action': 'step', 'data-step': screen.step + 1, 'aria-label': es.howto.next, disabled: last })),
        el('div', { class: 'screen__actions' },
          el('button', { class: 'menu-btn', type: 'button', 'data-action': 'notebook' }, es.howto.notebook),
          el('button', { class: 'menu-btn menu-btn--primary', type: 'button', 'data-action': 'done' }, es.howto.play))));
  }

  function guild(state: AppState) {
    const season = seasonIndex(state.game.month);
    return el('div', { class: 'screen__panel' },
      header(es.guild.title),
      el('p', { class: 'guild__intro' }, es.guild.intro),
      el('ul', { class: 'guild__list' },
        ...SPECIES.map((sp) =>
          el('li', {},
            el('button', { class: 'guild__row', type: 'button', 'data-action': 'creature', 'data-species': sp, 'aria-label': es.guild.open(nameOf(sp)) },
              el('span', { class: 'guild__medal' }, portrait(sp, 'reposo', season)),
              el('span', { class: 'guild__text' },
                el('strong', {}, nameOf(sp), el('span', { class: 'guild__role' }, ` · ${es.species[sp].role}`)),
                el('span', { class: 'guild__verb' }, es.species[sp].verb)),
              el('span', { class: 'guild__chev', 'aria-hidden': 'true' }, '›'))))));
  }

  return (state: AppState) => {
    const screen = state.ui.screen;
    const key = screen ? JSON.stringify(screen) : '';
    if (key === shown) return;
    const kindChanged = (shown ? (JSON.parse(shown) as Screen).kind : '') !== (screen?.kind ?? '');
    shown = key;
    if (!screen) {
      root.hidden = true;
      root.replaceChildren();
      return;
    }
    root.hidden = false;
    root.dataset.kind = screen.kind;
    const focused = (document.activeElement as HTMLElement | null)?.dataset;
    const refocus = focused?.action === 'step' ? `[data-action="step"][data-step="${focused.step}"]` : null;
    root.replaceChildren(screen.kind === 'title' ? title() : screen.kind === 'howto' ? howto(screen) : guild(state));
    // Foco: el botón principal al entrar; en el carrusel, se mantiene en el control que se usó.
    const target =
      (!kindChanged && refocus && root.querySelector<HTMLElement>(refocus)) ||
      (kindChanged && root.querySelector<HTMLElement>(screen.kind === 'title' ? '.menu-btn--primary' : screen.kind === 'howto' ? '.round-btn--next' : '.guild__row')) ||
      null;
    target?.focus();
  };
}
