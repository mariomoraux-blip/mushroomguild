import { es } from '../copy/es';
import { LEVELS, revivedCount, SCORE_KEYS, seasonIndex, treeTotal, type SpeciesId } from '../rules';
import { formatClock } from '../clock';
import type { Submission } from '../leaderboard';
import { INTRO_STEPS, type AppState, type Story, type Store } from '../store';
import { reducedMotion } from '../scenes/fx';
import { MOTION } from '../theme';
import { el, portrait } from './dom';
import { hideLayer, showLayer, turnCard } from './motion';

/** Fondo pintado de cada carta (se descarga solo cuando la carta se muestra). */
const BACKGROUND: Record<Story['kind'], 'intro' | 'victory'> = { intro: 'intro', mage: 'intro', cold: 'intro', won: 'victory', lost: 'intro' };
const GUILD: SpeciesId[] = ['lactarius', 'champi', 'amanita'];

/**
 * Cartas de historia (003): intro de 3 cartas con "Saltar", llegada de Maestra Bruma, el frío (028) y los dos finales.
 * Modal accesible: el foco va al botón principal y vuelve al juego al cerrar; Esc cierra (main.ts › cancel).
 */
/** Lo que las cartas de final piden para el ranking (036): registrar el puntaje y abrir la pantalla. */
export interface RankingActions {
  register(): void;
  open(): void;
}

export function mountStory(root: HTMLElement, store: Store, onRestart: () => void, ranking: RankingActions) {
  let shown = '';
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const { action } = b.dataset;
    if (action === 'next') store.dispatch({ type: 'storyNext' });
    if (action === 'close') store.dispatch({ type: 'closeStory' });
    if (action === 'again') onRestart();
    if (action === 'register') ranking.register();
    if (action === 'ranking') ranking.open();
  });

  const button = (action: string, label: string, primary = false) =>
    el('button', { class: `btn story__btn${primary ? ' story__btn--primary' : ''}`, type: 'button', 'data-action': action }, label);

  /**
   * Caja del ranking en la carta de final (036, 037): el estado del envío y sus dos botones, «Registra tu puntaje»
   * (principal) y «Ver ranking» (secundario). «Jugar de nuevo» va fuera de la carta.
   */
  function rankingBlock(submission: Submission | null): HTMLElement {
    const L = es.leaderboard;
    const line = (() => {
      switch (submission?.kind) {
        case 'sending':
          return el('p', { class: 'story__rank' }, L.sending);
        case 'ok':
          return el('p', { class: 'story__rank' }, el('strong', {}, L.rank(submission.rank, submission.players)), ...(submission.improved ? [] : [` · ${L.best(submission.best)}`]));
        case 'offline':
          return el('p', { class: 'story__note' }, L.offline);
        case 'rejected':
          return el('p', { class: 'story__note' }, L.rejected);
        default:
          return null;
      }
    })();
    const register = submission?.kind === 'unregistered'
      ? [el('button', { class: 'btn story__btn is-primary', type: 'button', 'data-action': 'register', 'data-autofocus': '' }, L.register)]
      : [];
    return el('div', { class: 'story__ranking', 'aria-live': 'polite' },
      ...(line ? [line] : []),
      el('div', { class: 'story__actions' }, ...register, button('ranking', L.open)));
  }

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
      case 'cold':
        // Llega el frío (028): el gremio inicial, cansado, y las reglas de las temporadas frías.
        title = es.story.coldTitle;
        art = el('div', { class: 'story__cast' }, ...GUILD.map((sp) => portrait(sp, 'reposo', season, 'md')));
        body.push(
          el('p', { class: 'story__text' }, es.story.coldText),
          el('ul', { class: 'story__spells' }, ...[...es.story.coldRules, ...(LEVELS[g.level].plague.length ? [es.story.coldPlague] : [])].map((r) => el('li', {}, r))),
        );
        actions.push(button('close', es.story.coldOk, true));
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
            boardLink(),
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
            boardLink(),
          );
        }
        body.push(rankingBlock(won ? state.ui.submission : null));
        break;
      }
    }
    const ending = story.kind === 'won' || story.kind === 'lost';
    const dialog = { role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id };
    const panel = el(
      'div',
      { class: 'story__card', ...(ending ? {} : dialog) },
      ...(art ? [art] : []),
      el('h2', { id, class: 'story__title' }, title),
      el('div', { class: 'story__body' }, ...body),
      ...(actions.length ? [el('div', { class: 'story__actions' }, ...actions)] : []),
    );
    if (!ending) return panel;
    // Finales (037): «Jugar de nuevo» va fuera de la carta, grande y con icono, como «Nueva partida» en la portada.
    return el('div', { class: 'story__stack', ...dialog },
      panel,
      el('button', { class: 'menu-btn menu-btn--primary story__again', type: 'button', 'data-action': 'again', 'data-autofocus': '' },
        el('span', { class: 'menu-btn__icon menu-btn__icon--play', 'aria-hidden': 'true' }), es.story.again));
  }

  /** «Ver tablero» (037): enlace bajo el puntaje que cierra la carta y deja ver el claro terminado. */
  const boardLink = () => el('button', { class: 'story__link story__board', type: 'button', 'data-action': 'close' }, es.story.viewBoard);

  /**
   * Al terminar la partida (022), la carta espera: al ganar, `narrative` para que se vean el anillo, el halo y la ola
   * dorada; al perder, `standard` mientras el claro baja la luz. Un toque o una tecla la traen antes (y no hacen nada
   * más). Con movimiento reducido, `standard` y `fast`.
   */
  let held: { timer: number; state: AppState } | null = null;
  let lastStatus = '';
  const skip = (e: Event) => {
    e.stopPropagation();
    e.preventDefault();
    release();
  };
  const stopHold = () => {
    if (!held) return;
    window.clearTimeout(held.timer);
    window.removeEventListener('click', skip, true);
    window.removeEventListener('keydown', skip, true);
    held = null;
  };
  const release = () => {
    const state = held?.state;
    stopHold();
    if (state) show(state);
  };
  const hold = (state: AppState, won: boolean) => {
    const reduce = reducedMotion();
    const ms = won ? (reduce ? MOTION.ms.standard : MOTION.ms.narrative) : reduce ? MOTION.ms.fast : MOTION.ms.standard;
    held = { timer: window.setTimeout(release, ms), state };
    window.addEventListener('click', skip, true);
    window.addEventListener('keydown', skip, true);
  };

  return (state: AppState) => {
    const story = state.ui.story;
    const ending = story?.kind === 'won' || story?.kind === 'lost';
    const ended = lastStatus === 'playing' && state.game.status !== 'playing';
    lastStatus = state.game.status;
    // El fin del invierno sin ganar deja el claro en penumbra (022).
    document.documentElement.classList.toggle('is-dusk', state.game.status === 'lost');
    if (held) {
      if (ending) return void (held.state = state); // el puntaje llega durante la espera
      stopHold();
    }
    if (ended && ending) return hold(state, story.kind === 'won');
    show(state);
  };

  function show(state: AppState) {
    const story = state.ui.story;
    // El puntaje llega justo después de la carta de victoria: también redibuja.
    const key = story ? JSON.stringify(story) + (state.ui.result ? `|${state.ui.result.score.total}|${state.ui.result.newRecord}` : '') + `|${JSON.stringify(state.ui.submission)}` : '';
    if (key === shown) return;
    if (!shown && story) opener = document.activeElement as HTMLElement | null;
    const before = shown;
    shown = key;
    if (!story) {
      hideLayer(root);
      opener?.focus?.();
      opener = null;
      return;
    }
    // Entrada (022): la carta sube y se funde (la de Maestra Bruma, solemne); en la intro, cada carta nueva
    // entra desde la derecha sobre la anterior. El puntaje que llega después redibuja sin volver a entrar.
    const next = card(state, story);
    const old = root.querySelector<HTMLElement>('.story__card:not(.is-out)');
    const turning = old && before.startsWith('{"kind":"intro"') && story.kind === 'intro';
    if (turning) turnCard(root, old, next);
    else root.replaceChildren(next);
    if (old && !turning && root.dataset.kind === story.kind) next.classList.add('is-still');
    root.dataset.kind = story.kind;
    root.dataset.bg = BACKGROUND[story.kind];
    showLayer(root);
    // Foco: el botón principal; en los finales, «Registra tu puntaje» si está y si no «Jugar de nuevo» (037).
    next.querySelector<HTMLButtonElement>('[data-autofocus], .story__btn--primary')?.focus();
  }
}
