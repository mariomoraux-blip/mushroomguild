import { es } from '../copy/es';
import { revivedCount, treeTotal } from '../rules';
import { INTRO_PAGES, type AppState, type Store, type Story } from '../store';
import { uiArtUrl } from '../theme';
import { el, portrait } from './dom';

/** Fondo pintado de cada carta (la de la maga va sobre el tablero, sin fondo propio). */
const BACKDROP: Record<Story['kind'], string | null> = { intro: 'fondo-intro', mage: null, won: 'fondo-victoria', lost: 'fondo-intro' };

/**
 * Cartas de historia (003): globo de papel en un diálogo modal. Mientras hay una abierta, el resto
 * de la app queda `inert`; el foco empieza en el botón principal, Tab no sale de la carta y, al
 * cerrar, vuelve a donde estaba. Esc la cierra (main.ts › `cancel`).
 */
export function mountStory(root: HTMLElement, app: HTMLElement, store: Store, playAgain: () => void) {
  let shown: Story | null = null;
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (e) => {
    const action = (e.target as HTMLElement).closest('button')?.dataset.action;
    if (action === 'next') store.dispatch({ type: 'storyNext' });
    if (action === 'close') store.dispatch({ type: 'storyClose' });
    if (action === 'again') playAgain();
  });
  // Tab y Shift+Tab dan la vuelta dentro de la carta.
  root.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const buttons = [...root.querySelectorAll<HTMLButtonElement>('button')];
    const first = buttons[0];
    const last = buttons[buttons.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  const button = (label: string, action: string, primary = false) =>
    el('button', { class: primary ? 'btn btn--wide story__primary' : 'btn story__secondary', type: 'button', 'data-action': action }, label);

  function card(state: AppState, story: Story): HTMLElement {
    const body: Node[] = [];
    let title: string;
    let text: string;
    const actions: HTMLElement[] = [];
    switch (story.kind) {
      case 'intro': {
        const page = es.story.intro[story.page] ?? es.story.intro[0];
        const lastPage = story.page >= INTRO_PAGES - 1;
        title = page.title;
        text = page.text;
        body.push(
          el('p', { class: 'story__progress' },
            el('span', { class: 'sr-only' }, es.story.progress(story.page + 1, INTRO_PAGES)),
            ...Array.from({ length: INTRO_PAGES }, (_, i) => el('span', { class: 'story__dot', 'data-on': i === story.page, 'aria-hidden': 'true' }))),
        );
        actions.push(button(lastPage ? es.story.start : es.story.next, 'next', true));
        if (!lastPage) actions.push(button(es.story.skip, 'close'));
        break;
      }
      case 'mage':
        title = es.story.mage.title;
        text = es.story.mage.text;
        body.push(el('ul', { class: 'story__list' }, ...es.story.mage.spells.map((line) => el('li', {}, line))));
        actions.push(button(es.story.mage.ok, 'close', true));
        break;
      case 'won':
        title = es.story.won.title;
        text = es.story.won.text(state.game.wonDay ?? state.game.day);
        body.push(el('p', { class: 'story__note' }, es.story.won.trees(revivedCount(state.game), treeTotal(state.game))));
        actions.push(button(es.story.playAgain, 'again', true), button(es.story.viewBoard, 'close'));
        break;
      case 'lost':
        title = es.story.lost.title;
        text = es.story.lost.text;
        body.push(el('p', { class: 'story__note' }, es.story.lost.tip));
        actions.push(button(es.story.playAgain, 'again', true), button(es.story.viewBoard, 'close'));
        break;
    }
    return el(
      'div',
      { class: 'story__card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'story-title', 'aria-describedby': 'story-text' },
      story.kind === 'mage' ? el('span', { class: 'story__portrait' }, portrait('mago', 'feliz', 0, 'lg')) : '',
      el('h2', { id: 'story-title', class: 'story__title' }, title),
      el('p', { id: 'story-text', class: 'story__text' }, text),
      ...body,
      el('div', { class: 'story__actions' }, ...actions),
    );
  }

  return (state: AppState) => {
    const story = state.ui.story;
    if (JSON.stringify(story) === JSON.stringify(shown)) return;
    const wasOpen = shown !== null;
    shown = story;
    if (!story) {
      root.hidden = true;
      root.replaceChildren();
      app.inert = false;
      // El foco vuelve a donde estaba; si no queda nada, al primer miembro del gremio.
      const back = opener?.isConnected && opener !== document.body ? opener : document.querySelector<HTMLElement>('#dock button');
      if (wasOpen) back?.focus();
      return;
    }
    if (!wasOpen) opener = document.activeElement as HTMLElement | null;
    const bg = BACKDROP[story.kind];
    root.dataset.kind = story.kind;
    root.style.setProperty('--story-bg', bg ? `url("${uiArtUrl(bg)}")` : 'none');
    root.replaceChildren(card(state, story));
    root.hidden = false;
    app.inert = true;
    root.querySelector<HTMLElement>('.story__primary')?.focus();
  };
}
