import { es } from '../copy/es';
import { canRecruit, hasSpecies, LEADERBOARD, MAX_GUILD, motherCost, motherTrees, RECRUITABLE, STARTING_GUILD, recruitCost, seasonIndex, member, validTargets, type Choice, type SpeciesId } from '../rules';
import type { AppState, Sheet, Store } from '../store';
import { SEASON_SLUGS } from '../theme';
import { el, portrait } from './dom';
import { recipesFor, RECIPE_STAGGER } from './recipe';
import { hideLayer, showLayer } from './motion';

/** Las ocho especies (039): las del inicio, las que solo llegan reclutando y Maestra Bruma. */
const SPECIES: readonly SpeciesId[] = [...STARTING_GUILD, ...RECRUITABLE, 'mago'];

/**
 * Lo que la hoja «Tu nombre en el gremio» (036, 038) pide a quien la monta: sortear otro alias, pasar a escribir el
 * nombre (o volver a los alias) y registrarlo. `typed`: lo escrito en el campo, si la hoja está en modo escribir.
 */
export interface AliasActions {
  roll(): void;
  write(on: boolean): void;
  confirm(typed: string | null): void;
}

/**
 * Hoja inferior: reclutar (con fichas), ficha de criatura, elegir hechizo o «Tu nombre en el gremio» (036).
 * `tapBoard`: un toque en el fondo, sobre una casilla visible, con la ficha de un miembro abierta (022).
 */
export function mountSheet(root: HTMLElement, store: Store, tapBoard: (x: number, y: number) => void, alias: AliasActions) {
  let shown: Sheet | null = null;
  let currentSeason = 0;
  let opener: HTMLElement | null = null;
  /** Lo escrito en el campo del nombre (038): se conserva al volver a los alias y al reabrir el campo. */
  let draft = '';
  const typed = () => root.querySelector<HTMLInputElement>('.alias__input')?.value ?? null;

  // Enter en el campo del nombre registra (038).
  root.addEventListener('submit', (e) => {
    e.preventDefault();
    alias.confirm(typed());
  });
  root.addEventListener('input', (e) => {
    const t = e.target as HTMLElement;
    if (!(t instanceof HTMLInputElement) || !t.classList.contains('alias__input')) return;
    draft = t.value;
    const sheet = store.getState().ui.sheet;
    if (sheet?.kind === 'alias' && sheet.problem) store.dispatch({ type: 'openSheet', sheet: { ...sheet, problem: null } });
  });

  root.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === root) {
      // Tocar fuera del panel la cierra; si cae sobre una casilla y la hoja es la ficha de un miembro, también juega.
      const cell = shown?.kind === 'member' ? document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.classList.contains('cell')) : undefined;
      if (cell instanceof HTMLElement) return tapBoard(Number(cell.dataset.x), Number(cell.dataset.y));
      return store.dispatch({ type: 'closeSheet' });
    }
    const b = t.closest('button');
    if (!b) return;
    const { action, species, spell } = b.dataset;
    if (action === 'close') store.dispatch({ type: 'closeSheet' });
    if (action === 'recruit') store.dispatch({ type: 'recruit', species: species as (typeof RECRUITABLE)[number] });
    if (action === 'info') store.dispatch({ type: 'openSheet', sheet: { kind: 'creature', species: species as SpeciesId } });
    if (action === 'spell') store.dispatch({ type: 'chooseSpell', spell: spell as Choice });
    if (action === 'aliasRoll') alias.roll();
    if (action === 'aliasWrite') alias.write(true);
    if (action === 'aliasPick') alias.write(false);
    if (action === 'aliasConfirm' && b.type !== 'submit') alias.confirm(typed());
    const id = store.getState().ui.selected;
    if (action === 'member' && id !== null) store.dispatch({ type: 'openSheet', sheet: { kind: 'member', id } });
  });

  const panel = (title: string, ...body: Node[]) => {
    const id = 'sheet-title';
    return el(
      'div',
      { class: 'sheet__panel', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': id },
      el('div', { class: 'sheet__head' },
        el('h2', { id, class: 'sheet__title' }, title),
        el('button', { class: 'round-btn round-btn--close', type: 'button', 'data-action': 'close', 'aria-label': es.sheet.close })),
      ...body,
    );
  };

  function recruitSheet(state: AppState) {
    const season = currentSeason;
    const g = state.game;
    const can = g.status === 'playing' && canRecruit(g);
    const rows = [...RECRUITABLE, 'mago' as const].map((sp) => {
      const info = es.species[sp];
      // 039: una de cada especie; la que ya está en el gremio queda deshabilitada.
      const taken = sp !== 'mago' && hasSpecies(g, sp);
      const action =
        sp === 'mago'
          ? el('span', { class: 'row__note' }, es.sheet.mageArrives)
          : taken
            ? el('span', { class: 'row__note' }, es.sheet.inGuild)
            : el('button', { class: 'btn btn--primary', type: 'button', 'data-action': 'recruit', 'data-species': sp, disabled: !can }, es.sheet.recruitAction);
      return el(
        'li',
        { class: `row${taken ? ' is-taken' : ''}`, 'aria-disabled': taken ? 'true' : undefined },
        el('span', { class: 'medal' }, portrait(sp, 'reposo', season)),
        el('span', { class: 'row__text' },
          el('strong', {}, info.name), el('span', { class: 'row__role' }, ` · ${info.role}`),
          el('span', { class: 'row__verb' }, info.verb)),
        el('button', { class: 'btn btn--icon', type: 'button', 'data-action': 'info', 'data-species': sp, 'aria-label': es.sheet.info(info.name) }, 'i'),
        action,
      );
    });
    return panel(es.sheet.recruitTitle, el('p', { class: 'sheet__help' }, es.sheet.recruitHelp(recruitCost(g), MAX_GUILD)), el('ul', { class: 'rows' }, ...rows));
  }

  /** Ficha de una especie (y de un miembro concreto, si se abrió al seleccionarlo). */
  function cardSheet(species: SpeciesId, memberName?: string) {
    const season = currentSeason;
    const info = es.species[species];
    const g = es.guide[species];
    const S = es.card.sections;
    const name = species === 'mago' ? es.mageName : info.name;
    const title = memberName && memberName !== name ? es.card.title(memberName, info.name) : species === 'mago' ? es.card.title(name, info.name) : name;
    const section = (heading: string, text?: string) => (text ? [el('h3', {}, heading), el('p', {}, text)] : []);
    return panel(
      title,
      el('div', { class: 'creature' },
        el('div', { class: 'creature__head' }, el('span', { class: 'medal medal--lg' }, portrait(species, 'feliz', season, 'lg')), el('p', {}, el('em', {}, info.scientific), el('br'), el('span', { class: 'creature__role' }, info.role))),
        el('p', {}, g.context),
        el('p', { class: 'creature__quip' }, es.quote(info.quip)),
        ...section(S.ability, g.ability),
        // Cómo usarlo (026): la receta visual de la especie sobre el texto.
        el('h3', {}, S.howTo), ...recipesFor(species, season), el('p', {}, g.howTo),
        ...section(S.movement, g.movement),
        ...section(S.nutrients, g.nutrients),
        ...section(S.heals, 'heals' in g ? g.heals : undefined),
        ...section(S.messenger, 'messenger' in g ? g.messenger : undefined),
        ...section(S.powers, 'powers' in g ? g.powers : undefined),
        el('button', { class: 'btn btn--wide', type: 'button', 'data-action': 'close' }, es.card.understood)),
    );
  }

  /** «Ver el mes» (045): lo que pasó al empezar el mes, una línea con su ícono por cada cosa. */
  function monthSheet(state: AppState) {
    const report = state.ui.month;
    const season = SEASON_SLUGS[seasonIndex(state.game.month)] ?? 'spring';
    return panel(
      es.month.title(report?.month ?? state.game.month),
      el('ul', { class: 'month' },
        ...(report?.lines ?? []).map((l) =>
          el('li', { class: 'month__row', 'data-kind': l.kind, 'data-season': season },
            el('span', { class: 'month__icon', 'aria-hidden': 'true' }), el('span', {}, l.text)))),
      el('button', { class: 'btn btn--wide', type: 'button', 'data-action': 'close' }, es.card.understood),
    );
  }

  function helpSheet() {
    const season = currentSeason;
    const h = es.help;
    const mother = motherCost(store.getState().game);
    const trees = motherTrees(store.getState().game);
    const tiles = [es.tileHelp.mother(mother, trees), es.tileHelp.home, es.tileHelp.soil, es.tileHelp.log, es.tileHelp.tree, es.tileHelp.treeFading, es.tileHelp.treeFaded, es.tileHelp.treeAlive, es.tileHelp.rock];
    return panel(
      h.title,
      el('div', { class: 'help' },
        el('h3', {}, h.goalTitle),
        el('p', {}, h.goal(mother, trees)),
        el('h3', {}, h.howTitle),
        el('ol', {}, ...h.how.map((step) => el('li', {}, step))),
        el('h3', {}, h.guildTitle),
        // El gremio (026): cada especie con su receta visual, escalonadas al abrir.
        el('ul', { class: 'rows' },
          ...SPECIES.map((sp, i) =>
            el('li', { class: 'row row--recipe' }, el('span', { class: 'medal' }, portrait(sp, 'reposo', season)),
              el('span', { class: 'row__text' },
                el('strong', {}, sp === 'mago' ? es.mageName : es.species[sp].short), el('span', { class: 'row__role' }, ` · ${es.species[sp].role}`),
                el('span', { class: 'row__verb' }, es.species[sp].verb)),
              ...recipesFor(sp, season, i * RECIPE_STAGGER)))),
        el('h3', {}, h.tilesTitle),
        el('ul', { class: 'help__tiles' }, ...tiles.map((t) => el('li', {}, t))),
        el('h3', {}, h.levelsTitle),
        el('p', {}, h.levels),
        el('p', { class: 'help__tip' }, h.tip),
        el('button', { class: 'btn btn--wide', type: 'button', 'data-action': 'close' }, h.start)),
    );
  }

  /** Hoja de elección: los hechizos de Maestra Bruma o los dos cambios de Pompón (040), cada uno deshabilitado si no se puede. */
  function spellSheet(state: AppState) {
    const id = state.ui.selected!;
    const m = member(state.game, id);
    const puff = m?.species === 'lycoperdon';
    const options: { choice: Choice; name: string; help: string }[] = puff
      ? (['spores', 'nutrients'] as const).map((p) => ({ choice: p, name: es.puffs[p], help: es.puffHelp[p] }))
      : (['sprout', 'rain'] as const).map((sp) => ({ choice: sp, name: es.spells[sp], help: es.spellHelp[sp] }));
    // La ficha (022) se abre desde aquí: la hoja tapa el botón "Ficha" de la bitácora.
    const isNew = !state.ui.seen.includes(puff ? 'lycoperdon' : 'mago');
    return panel(
      puff ? es.sheet.puffTitle(m!.name) : es.sheet.spellTitle,
      el('div', { class: 'spells' },
        ...options.map((o) =>
          el('button', { class: 'btn btn--spell', type: 'button', 'data-action': 'spell', 'data-spell': o.choice, disabled: !validTargets(state.game, id, o.choice).length },
            el('strong', {}, o.name),
            el('span', {}, o.help)))),
      el('button', { class: `btn btn--card${isNew ? ' is-new' : ''}`, type: 'button', 'data-action': 'member' }, es.card.openLabel(puff ? m!.name : es.mageName)),
    );
  }

  /**
   * «Tu nombre en el gremio» (036, 038). Con alias: el propuesto, «Otro nombre», «Escribir el mío», «Registrar» (o
   * «Guardar») y «Ahora no». Escribiendo: el campo con su ayuda o el problema, «Elegir uno del gremio» y «Registrar».
   */
  function aliasSheet(sheet: Extract<Sheet, { kind: 'alias' }>) {
    const t = es.leaderboard.sheet;
    const confirm = sheet.purpose === 'register' ? t.confirm : t.save;
    const later = el('button', { class: 'btn alias__later', type: 'button', 'data-action': 'close' }, t.later);
    if (!sheet.writing)
      return panel(
        t.title,
        el('div', { class: 'alias' },
          el('p', { class: 'sheet__help' }, t.help),
          el('p', { class: 'alias__name', 'aria-live': 'polite' }, sheet.alias),
          el('div', { class: 'alias__actions' },
            el('button', { class: 'btn', type: 'button', 'data-action': 'aliasRoll' }, t.roll),
            el('button', { class: 'btn', type: 'button', 'data-action': 'aliasWrite' }, t.write)),
          el('button', { class: 'btn btn--primary alias__confirm', type: 'button', 'data-action': 'aliasConfirm' }, confirm),
          later),
      );
    const input = el('input', {
      id: 'alias-input',
      class: 'alias__input',
      type: 'text',
      name: 'alias',
      maxlength: String(LEADERBOARD.name.max + 4),
      autocomplete: 'off',
      autocapitalize: 'words',
      spellcheck: 'false',
      enterkeyhint: 'done',
      placeholder: sheet.alias,
      'aria-describedby': 'alias-hint',
      ...(sheet.problem ? { 'aria-invalid': 'true' } : {}),
    });
    input.value = draft;
    return panel(
      t.title,
      el('form', { class: 'alias', novalidate: '' },
        el('p', { class: 'sheet__help' }, t.help),
        el('label', { class: 'alias__label', for: 'alias-input' }, t.label),
        input,
        el('p', { id: 'alias-hint', class: `alias__hint${sheet.problem ? ' is-error' : ''}`, 'aria-live': 'polite' }, sheet.problem ? t.problems[sheet.problem] : t.hint),
        el('button', { class: 'btn alias__pick', type: 'button', 'data-action': 'aliasPick' }, t.pick),
        el('button', { class: 'btn btn--primary alias__confirm', type: 'submit', 'data-action': 'aliasConfirm' }, confirm),
        later),
    );
  }

  return (state: AppState) => {
    currentSeason = seasonIndex(state.game.month);
    const sheet = state.ui.sheet;
    if (JSON.stringify(sheet) === JSON.stringify(shown)) return;
    const wasOpen = shown !== null;
    const prevKind = shown?.kind;
    const prevWriting = shown?.kind === 'alias' ? shown.writing : undefined;
    shown = sheet;
    if (!sheet) {
      hideLayer(root);
      if (wasOpen) opener?.focus();
      return;
    }
    if (!wasOpen) opener = document.activeElement as HTMLElement | null;
    const views = {
      recruit: () => recruitSheet(state),
      creature: () => cardSheet((sheet as { species: SpeciesId }).species),
      member: () => {
        const m = state.game.members.find((mm) => mm.id === (sheet as { id: number }).id);
        return m ? cardSheet(m.species, m.name) : el('div');
      },
      spell: () => spellSheet(state),
      help: () => helpSheet(),
      month: () => monthSheet(state),
      alias: () => aliasSheet(sheet as Extract<Sheet, { kind: 'alias' }>),
    };
    // «Otro nombre» (036) y el problema de lo escrito (038): cambian en el lugar, sin volver a abrir la hoja, sin
    // mover el foco ni borrar lo escrito.
    if (prevKind === 'alias' && sheet.kind === 'alias' && Boolean(prevWriting) === Boolean(sheet.writing)) {
      const name = root.querySelector('.alias__name');
      if (name) name.textContent = sheet.alias;
      const hint = root.querySelector('.alias__hint');
      const input = root.querySelector('.alias__input');
      if (hint && input) {
        const t = es.leaderboard.sheet;
        hint.textContent = sheet.problem ? t.problems[sheet.problem] : t.hint;
        hint.classList.toggle('is-error', Boolean(sheet.problem));
        // Con un problema, el foco vuelve al campo para corregirlo.
        if (sheet.problem) input.setAttribute('aria-invalid', 'true');
        else input.removeAttribute('aria-invalid');
        if (sheet.problem && input instanceof HTMLElement) input.focus();
      }
      return;
    }
    if (sheet.kind === 'alias' && prevKind !== 'alias') draft = '';
    root.replaceChildren(views[sheet.kind]());
    showLayer(root);
    const focus = sheet.kind === 'alias' ? (sheet.writing ? '.alias__input' : '[data-action="aliasConfirm"]') : '.sheet__panel button:not([disabled])';
    root.querySelector<HTMLElement>(focus)?.focus();
  };
}
