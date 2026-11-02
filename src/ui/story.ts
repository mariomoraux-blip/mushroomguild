import { es } from '../copy/es';
import { LEVELS, revivedCount, SCORE_KEYS, seasonIndex, treeTotal, type SpeciesId } from '../rules';
import { formatClock } from '../clock';
import { INTRO_STEPS, type AppState, type Story, type Store } from '../store';
import { el, portrait } from './dom';

/** Fondo pintado de cada carta (se descarga solo cuando la carta se muestra). */
const BACKGROUND: Record<Story['kind'], 'intro' | 'victory'> = { intro: 'intro', mage: 'intro', won: 'victory', lost: 'intro' };
const GUILD: SpeciesId[] = ['lactarius', 'champi', 'amanita'];

/**
 * Cartas de historia (003): intro de 3 cartas con "Saltar", llegada de Maestra Bruma y los dos finales.
 * Modal accesible: el foco va al botón principal y vuelve al juego al cerrar; Esc cierra (main.ts › cancel).
 */
export function mountStory(root: HTMLElement, store: Store, onRestart: () => void) {
  let shown = '';
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const { action } = b.dataset;
    if (action === 'next') store.dispatch({ type: 'storyNext' });
    if (action === 'close') store.dispatch({ type: 'closeStory' });
    if (action === 'again') onRestart();
  });

  const button = (action: string, label: string, primary = false) =>
    el('button', { class: `btn story__btn${primary ? ' story__btn--primary' : ''}`, type: 'button', 'data-action': action }, label);

  function card(state: AppState, story: Story): HTMLElement {
    const g = state.game;
    const season = seasonIndex(g.month);
    const id = 'story-title';
    let title = '';
    const body: Node[] = [];
    const actions: HTMLElement[] = [];
    let art: Node | null = null;
    switch (story.kind) {
      case 'intro': {
        const page = es.story.intro[story.step]!;
        title = page.title;
        body.push(el('p', { class: 'story__text' }, page.text));
        if (story.step === 1) art = el('div', { class: 'story__cast' }, ...GUILD.map((sp) => portrait(sp, 'feliz', season, 'md')));
        body.push(
          el('div', { class: 'story__dots', role: 'img', 'aria-label': es.story.step(story.step + 1, INTRO_STEPS) },
            ...Array.from({ length: INTRO_STEPS }, (_, i) => el('span', { class: `story__dot${i === story.step ? ' is-active' : ''}` }))),
        );
        const last = story.step + 1 >= INTRO_STEPS;
        if (!last) actions.push(button('close', es.story.skip));
        actions.push(button('next', last ? es.story.start : es.story.next, true));
        break;
      }
      case 'mage':
        title = es.story.mageTitle;
        art = el('div', { class: 'story__cast' }, portrait('mago', 'feliz', season, 'md'));
        body.push(
          el('p', { class: 'story__text' }, es.story.mageText),
          el('p', { class: 'story__note' }, es.story.mageSpells),
          el('ul', { class: 'story__spells' },
            ...(['sprout', 'rain'] as const).map((sp) => el('li', {}, el('strong', {}, es.spells[sp]), ` · ${es.spellHelp[sp]}`))),
        );
        actions.push(button('close', es.story.mageOk, true));
        break;
      case 'won':
      case 'lost': {
        const won = story.kind === 'won';
        title = won ? es.story.wonTitle : es.story.lostTitle;
        body.push(el('p', { class: 'story__text' }, won ? es.story.wonText(g.wonMonth ?? g.month) : es.story.lostText));
        const result = won ? state.ui.result : null;
        if (result) {
          // Puntaje (015): estrellas legibles sin color, total, tiempo, desglose y récord.
          const { score, newRecord } = result;
          body.push(
            el('div', { class: 'score__stars', role: 'img', 'aria-label': es.scoring.stars(score.stars) },
              ...[1, 2, 3].map((n) => el('span', { class: `score__star${n <= score.stars ? ' is-on' : ''}`, 'aria-hidden': 'true' }))),
            el('p', { class: 'score__total' },
              el('strong', {}, String(score.total)), ` ${es.scoring.total}`,
              el('span', { class: 'score__time' }, ` · ${es.scoring.time} ${formatClock(score.timeMs)}`)),
            ...(newRecord ? [el('p', { class: 'score__record' }, es.scoring.newRecord)] : []),
            el('ul', { class: 'score__list', 'aria-label': es.scoring.title },
              ...SCORE_KEYS.map((k) =>
                el('li', { class: `score__row${score.breakdown[k] ? '' : ' is-zero'}` },
                  el('span', {}, es.scoring.breakdown[k]), el('strong', {}, String(score.breakdown[k])))),
              // Fila del nivel (019): el desglose suma el subtotal; el total ya va multiplicado.
              ...(LEVELS[score.level].multiplier !== 1
                ? [el('li', { class: 'score__row score__row--level' }, el('span', {}, es.scoring.level(es.levels.names[score.level])), el('strong', {}, es.scoring.multiplier(LEVELS[score.level].multiplier)))]
                : [])),
          );
        } else {
          if (!won) body.push(el('p', { class: 'story__note' }, es.story.lostTip));
          const stat = (value: string, label: string) => el('li', { class: 'story__stat' }, el('strong', {}, value), el('span', {}, label));
          body.push(
            el('h3', { class: 'story__sub' }, es.story.summary),
            el('ul', { class: 'story__stats' },
              stat(String(g.month), es.story.stats.month),
              stat(`${revivedCount(g)}/${treeTotal(g)}`, es.story.stats.trees),
              stat(String(g.nutrients), es.story.stats.nutrients),
              stat(String(g.spores), es.story.stats.spores)),
          );
        }
        actions.push(button('close', es.story.viewBoard), button('again', es.story.again, true));
        break;
      }
    }
    return el(
      'div',
      { class: 'story__card', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id },
      ...(art ? [art] : []),
      el('h2', { id, class: 'story__title' }, title),
      el('div', { class: 'story__body' }, ...body),
      el('div', { class: 'story__actions' }, ...actions),
    );
  }

  return (state: AppState) => {
    const story = state.ui.story;
    // El puntaje llega justo después de la carta de victoria: también redibuja.
    const key = story ? JSON.stringify(story) + (state.ui.result ? `|${state.ui.result.score.total}|${state.ui.result.newRecord}` : '') : '';
    if (key === shown) return;
    if (!shown && story) opener = document.activeElement as HTMLElement | null;
    shown = key;
    if (!story) {
      root.hidden = true;
      root.replaceChildren();
      opener?.focus?.();
      opener = null;
      return;
    }
    root.hidden = false;
    root.dataset.kind = story.kind;
    root.dataset.bg = BACKGROUND[story.kind];
    root.replaceChildren(card(state, story));
    root.querySelector<HTMLButtonElement>('.story__btn--primary')?.focus();
  };
}
