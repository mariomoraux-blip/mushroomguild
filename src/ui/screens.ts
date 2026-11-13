import { es } from '../copy/es';
import type { Row } from '../api-types';
import { LEVELS, PLAY_LEVELS, RECRUITABLE, STARTING_GUILD, seasonIndex, type Level, type SpeciesId } from '../rules';
import type { AppState, Screen, Store } from '../store';
import { assetUrl, SCREEN_ART } from '../theme';
import { el, portrait } from './dom';
import { hideLayer, showLayer } from './motion';

/** Las ocho especies (039): las del inicio, las que solo llegan reclutando y Maestra Bruma. */
const SPECIES: readonly SpeciesId[] = [...STARTING_GUILD, ...RECRUITABLE, 'mago'];
const img = (key: string, cls: string) => el('img', { class: cls, src: assetUrl(key), alt: '', draggable: 'false', decoding: 'async' });
const nameOf = (sp: SpeciesId) => (sp === 'mago' ? es.mageName : es.species[sp].short);
/** Control que recibe el foco al entrar a cada pantalla (en niveles, el último elegido). */
const FOCUS: Readonly<Record<Screen['kind'], (last: Level) => string>> = {
  title: () => '.menu-btn--primary',
  level: (last) => `[data-level="${last}"]`,
  guild: () => '.guild__row',
  ranking: () => '.round-btn--back',
};

/** Lo que la pantalla de niveles pide a quien la monta: crear la partida (el store no usa azar) y el último nivel. */
export interface LevelPicker {
  pickLevel(level: Level): void;
  lastLevel(): Level;
  /** 048: el tutorial («Cómo jugar») aparece en los niveles hasta completarlo o saltarlo. */
  tutorialPending(): boolean;
}

/** Lo que el ranking (036) pide a quien lo monta: abrirlo (y cargarlo), volver a cargarlo y cambiar el alias. */
export interface RankingScreen {
  open(back: 'title' | 'game'): void;
  retry(): void;
  rename(): void;
}

/**
 * Pantallas fuera de la partida (012): portada (Nueva partida, Cómo jugar, El gremio, Ranking), "Elige tu dificultad"
 * (019), "El gremio" (las especies; abre su ficha) y el ranking (036). «Cómo jugar» empieza el tutorial (048).
 * Solo dibuja `ui.screen` y despacha acciones; Esc vuelve (main.ts › cancel).
 */
export function mountScreens(root: HTMLElement, store: Store, levels: LevelPicker, ranking: RankingScreen) {
  let shown = '';
  let shownKind = '';
  let opener: HTMLElement | null = null;

  root.addEventListener('click', (e) => {
    const b = (e.target as HTMLElement).closest('button');
    if (!b) return;
    const { action, species, level } = b.dataset;
    if (action === 'play') store.dispatch({ type: 'play' });
    if (action === 'level') levels.pickLevel(level as Level);
    // 048: «Cómo jugar» es el tutorial, también si ya se completó (así se repite).
    if (action === 'howto') levels.pickLevel('tutorial');
    if (action === 'guild') store.dispatch({ type: 'openScreen', screen: { kind: 'guild', back: 'title' } });
    if (action === 'ranking') ranking.open('title');
    if (action === 'rankingRetry') ranking.retry();
    if (action === 'rename') ranking.rename();
    if (action === 'back') store.dispatch({ type: 'closeScreen' });
    if (action === 'creature') store.dispatch({ type: 'openSheet', sheet: { kind: 'creature', species: species as SpeciesId } });
  });

  const header = (title: string) =>
    el('header', { class: 'screen__head' },
      el('button', { class: 'round-btn round-btn--back', type: 'button', 'data-action': 'back', 'aria-label': es.screens.back }),
      el('h1', { class: 'screen__title', id: 'screen-title' }, title));

  // Portada limpia (018): solo el logo, el menú y la firma (020); el gremio se presenta en la intro y en "El gremio".
  function title(state: AppState) {
    const player = state.ui.player;
    return el('div', { class: 'title' },
      el('h1', { class: 'title__logo' }, img(SCREEN_ART.logo, 'title__logo-img'), el('span', { class: 'sr-only' }, es.title)),
      el('nav', { class: 'title__menu', 'aria-label': es.titleScreen.label },
        // Jugador que vuelve (036): un saludo que no es un control.
        ...(player ? [el('p', { class: 'title__hello' }, es.titleScreen.hello(player))] : []),
        el('button', { class: 'menu-btn menu-btn--primary', type: 'button', 'data-action': 'play' }, el('span', { class: 'menu-btn__icon menu-btn__icon--play', 'aria-hidden': 'true' }), es.titleScreen.play),
        el('button', { class: 'menu-btn', type: 'button', 'data-action': 'howto' }, el('span', { class: 'menu-btn__icon menu-btn__icon--book', 'aria-hidden': 'true' }), es.titleScreen.howto),
        el('button', { class: 'menu-btn', type: 'button', 'data-action': 'guild' }, el('span', { class: 'menu-btn__icon menu-btn__icon--guild', 'aria-hidden': 'true' }), es.titleScreen.guild),
        el('button', { class: 'menu-btn', type: 'button', 'data-action': 'ranking' }, el('span', { class: 'menu-btn__icon menu-btn__icon--star', 'aria-hidden': 'true' }), es.titleScreen.ranking)),
      el('p', { class: 'title__credit', lang: 'en' }, es.titleScreen.credit));
  }

  // Elige tu dificultad (019): botones grandes con el nombre, qué cambia y el multiplicador del puntaje. 048: «Cómo
  // jugar» (el tutorial) va primero, sin multiplicador, solo mientras no se haya completado ni saltado.
  function levelScreen() {
    const shown = PLAY_LEVELS.filter((lv) => lv !== 'tutorial' || levels.tutorialPending());
    const tag = (lv: Level) => (lv === 'tutorial' ? [] : [el('span', { class: 'level__mult' }, es.levels.multiplier(LEVELS[lv].multiplier))]);
    return el('div', { class: 'screen__panel' },
      header(es.levels.title),
      el('ul', { class: 'levels', 'aria-label': es.levels.label },
        ...shown.map((lv) =>
          el('li', {},
            el('button', { class: `level level--${lv}`, type: 'button', 'data-action': 'level', 'data-level': lv },
              el('span', { class: 'level__text' },
                el('strong', { class: 'level__name' }, es.levels.names[lv]),
                el('span', { class: 'level__line' }, es.levels.lines[lv])),
              ...tag(lv))))));
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
                el('span', { class: 'guild__verb' }, es.species[sp].verb),
                ...((RECRUITABLE as readonly SpeciesId[]).includes(sp) ? [el('span', { class: 'guild__tag' }, es.guild.recruitOnly)] : [])),
              el('span', { class: 'guild__chev', 'aria-hidden': 'true' }, '›'))))));
  }

  /** Ranking (036): temporada, jugadores, los primeros y la fila propia; la lista se desplaza dentro de su panel. */
  function rankingScreen(state: AppState) {
    const L = es.leaderboard;
    const view = state.ui.board ?? { kind: 'loading' as const };
    const starsOf = (n: number) => el('span', { class: 'ranking__stars', 'aria-hidden': 'true' }, ...[1, 2, 3].map((i) => el('span', { class: `score__star${i <= n ? ' is-on' : ''}` })));
    const row = (r: Row, pinned = false) =>
      el('li', { class: `ranking__row${r.me ? ' is-me' : ''}${pinned ? ' is-pinned' : ''}`, 'aria-label': L.row(r.rank, r.alias, r.total, es.levels.names[r.level], es.scoring.stars(r.stars), r.me) },
        el('span', { class: 'ranking__rank', 'aria-hidden': 'true' }, String(r.rank)),
        el('span', { class: 'ranking__who', 'aria-hidden': 'true' },
          el('strong', { class: 'ranking__alias' }, r.alias, ...(r.me ? [el('span', { class: 'ranking__you' }, ` ${L.you}`)] : [])),
          el('span', { class: `ranking__level ranking__level--${r.level}` }, es.levels.names[r.level])),
        el('span', { class: 'ranking__score', 'aria-hidden': 'true' }, el('strong', {}, String(r.total)), starsOf(r.stars)));
    let body: Node[];
    if (view.kind === 'loading') body = [el('p', { class: 'ranking__state' }, L.loading)];
    else if (view.kind === 'offline')
      body = [el('p', { class: 'ranking__state' }, L.offlineBoard), el('button', { class: 'menu-btn ranking__retry', type: 'button', 'data-action': 'rankingRetry' }, L.retry)];
    else {
      const { data } = view;
      const mine = data.me && !data.top.some((r) => r.me) ? data.me : null;
      body = [
        el('p', { class: 'ranking__meta' }, `${L.season(data.season)} · ${L.players(data.players)}`),
        data.top.length
          ? el('ol', { class: 'ranking__list', 'aria-label': L.list }, ...data.top.map((r) => row(r)), ...(mine ? [row(mine, true)] : []))
          : el('p', { class: 'ranking__state' }, L.empty),
      ];
    }
    return el('div', { class: 'screen__panel ranking' },
      header(L.title),
      ...body,
      el('div', { class: 'ranking__foot' },
        el('p', { class: 'ranking__privacy' }, L.privacy),
        ...(state.ui.player ? [el('button', { class: 'menu-btn ranking__rename', type: 'button', 'data-action': 'rename' }, L.rename)] : [])));
  }

  const views = (screen: Screen, state: AppState): HTMLElement => {
    switch (screen.kind) {
      case 'title':
        return title(state);
      case 'level':
        return levelScreen();
      case 'guild':
        return guild(state);
      case 'ranking':
        return rankingScreen(state);
    }
  };

  return (state: AppState) => {
    const screen = state.ui.screen;
    // La portada saluda por el alias y el ranking cambia al cargar: también redibujan.
    const key = screen ? JSON.stringify(screen) + (screen.kind === 'title' ? `|${state.ui.player}` : screen.kind === 'ranking' ? `|${state.ui.player}|${JSON.stringify(state.ui.board)}` : '') : '';
    if (key === shown) return;
    const kindChanged = shownKind !== (screen?.kind ?? '');
    const fromRanking = shownKind === 'ranking';
    shown = key;
    shownKind = screen?.kind ?? '';
    if (!screen) {
      hideLayer(root);
      // Al cerrar el ranking abierto desde una carta de final, el foco vuelve a «Ver ranking».
      if (opener?.isConnected) opener.focus();
      opener = null;
      return;
    }
    if (kindChanged && screen.kind === 'ranking' && screen.back === 'game') opener = document.activeElement as HTMLElement | null;
    showLayer(root);
    root.dataset.kind = screen.kind;
    const keep = !kindChanged && (document.activeElement as HTMLElement | null)?.dataset.action;
    root.replaceChildren(views(screen, state));
    // Entrada (022): el panel sube al cambiar de pantalla, no al redibujar la misma.
    if (kindChanged) root.querySelector('.screen__panel')?.classList.add('is-entering');
    // Foco: el botón principal al entrar; al redibujar, se mantiene en el control que se usó.
    const target =
      (keep && (root.querySelector<HTMLElement>(`[data-action="${keep}"]`) ?? root.querySelector<HTMLElement>('.round-btn--back'))) ||
      // Al volver del ranking, el foco queda en «Ranking» (036).
      (kindChanged && fromRanking && root.querySelector<HTMLElement>('[data-action="ranking"]')) ||
      (kindChanged && root.querySelector<HTMLElement>(FOCUS[screen.kind](levels.lastLevel()))) ||
      null;
    target?.focus();
  };
}
